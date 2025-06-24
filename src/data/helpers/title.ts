import { Title } from "../types";
import { Browser } from "puppeteer";
import config from "config";

type WrestlerTitlesReturnType = Record<string, Partial<Title>>;

/**
 * Used to get all titles for a wrestler.
 * @param browser the puppeteer browser instance
 * @param url the url of the titles page for a wrestler
 * @param wrestlerName the name of the wrestler
 * @returns A map of titles keyed by their names
 */
export async function getAllForWrestler(
  browser: Browser,
  url: string,
  wrestlerName: string,
  wrestlerId: number
): Promise<WrestlerTitlesReturnType> {
  const BASE_URL = config.get<string>("data.baseUrl");
  const page = await browser.newPage();
  await page.goto(url);

  let titles: WrestlerTitlesReturnType = {};

  const reignTableEl = await page.$(".Table");
  if (!reignTableEl) {
    console.warn(`No reign table found for wrestler ${wrestlerName}, skipping`);
    return titles;
  }
  const rows = await reignTableEl.$$(".TRow1,.TRow2");
  if (!rows) {
    console.warn(`No rows found in reigns table for wrestler ${wrestlerName}, skipping`);
    return titles;
  }

  for (const row of rows) {
    const timeframeEl = await row.$(".TCol:nth-child(1)");
    const titleNameHandle = await row.$(".TCol:nth-child(2)");
    if (!titleNameHandle) {
      continue;
    }

    const { name, url } = await titleNameHandle.evaluate((el) => ({
      name: el.textContent?.split("(")[0].trim(),
      url: el.firstElementChild?.attributes.getNamedItem("href")?.value,
    }));

    if (!name || !url) {
      continue;
    }
    if (!timeframeEl) {
      console.warn(`Could not find time frame for title reign with title ${name} for wrestler ${wrestlerName}`);
      continue;
    }

    const timeframe = await timeframeEl.evaluate((el) => {
      const timeframeString = el.textContent;
      return timeframeString?.replaceAll("&nbsp", "").split("-");
    });
    if (!timeframe) {
      continue;
    }
    const [heldFrom, heldTo] = timeframe.map((date: string) => {
      const [day, month, year] = date.split(".").map((datePart) => datePart.trim());
      const dateToReturn = new Date(`${year}-${month}-${day}`);
      if (isNaN(dateToReturn.getTime())) {
        return;
      }
      return dateToReturn;
    });

    if (!heldFrom) {
      continue;
    }

    if (!titles[name]) {
      const titleId = url.match(/nr=([0-9]+)/)?.[1];
      if (!titleId) {
        console.warn(`No id found for title ${name}, skipping`);
        continue;
      }
      titles[name] = {
        id: parseInt(titleId),
        name,
        url: `${BASE_URL}${url}`,
        reigns: [],
      };
    }

    const newReign = {
      champion: wrestlerId,
      heldFrom,
      heldTo,
    };
    titles[name].reigns?.push(newReign);
  }
  await page.close();
  return titles;
}

export async function merge(
  browser: Browser,
  allTitles: Title[],
  newReigns: WrestlerTitlesReturnType
): Promise<Title[]> {
  let titlesToReturn = allTitles.slice(0);
  for (const [currentTitleName, currentTitleInfo] of Object.entries(newReigns)) {
    let existingTitleIndex = titlesToReturn.findIndex((title) => title.name === currentTitleName);
    if (existingTitleIndex > -1) {
      continue;
    }
    if (existingTitleIndex === -1) {
      const enrichedTitle = await getDetail(browser, currentTitleInfo);
      if (!enrichedTitle) {
        continue;
      }
      titlesToReturn.push(enrichedTitle);
      existingTitleIndex = titlesToReturn.length - 1;
    }
    let existingTitle = titlesToReturn[existingTitleIndex];
    existingTitle.reigns = existingTitle.reigns.concat(currentTitleInfo.reigns ?? []);
  }
  return titlesToReturn;
}

async function getDetail(browser: Browser, titleInfo: Partial<Title>): Promise<Title | undefined> {
  const page = await browser.newPage();
  const { url, name, reigns, id } = titleInfo;
  if (!url) {
    console.warn(`No url found for title ${name}, skipping`);
    return;
  }
  await page.goto(url);
  const allPromotionsEl = await page.$(
    ".InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Promotions) + .InformationBoxContents"
  );
  if (!allPromotionsEl) {
    console.warn(`No promotions found for title ${name}, skipping`);
    return;
  }
  const { promotion, activeFrom, activeTo } = await allPromotionsEl.evaluate((el) => {
    const text = el.textContent;
    const promotionEl = el.firstElementChild;
    const promotion = promotionEl?.textContent?.trim() ?? text?.split("(")[0].trim();
    const allDates = text?.matchAll(/\([a-zA-Z0-9\- .]+\)/g);
    let activeFrom = "";
    let activeTo = "";
    for (const dateString in allDates) {
      const [startDate, endDate] = dateString.substring(1, dateString.length - 2).split("-");
      const startDateSplit = startDate.split(".");
      activeFrom = startDateSplit.at(startDateSplit.length - 1)?.trim() ?? "";
      if (activeTo !== "") {
        const endDateSplit = endDate.split(".");
        activeTo = endDateSplit.at(endDateSplit.length - 1)?.trim() ?? "";
      }
    }
    return {
      promotion,
      activeFrom,
      activeTo: activeTo !== "today" ? activeTo : undefined,
    };
  });
  const isActive = activeTo === undefined;
  const titleToReturn: Partial<Title> = {
    id,
    name,
    url,
    reigns,
    promotion,
    isActive,
    activeFrom,
  };
  if (activeTo) {
    titleToReturn.activeTo = activeTo;
  }
  await page.close();
  return titleToReturn as Title;
}
