import { Browser, ElementHandle } from "puppeteer";
import { Match, Promotion } from "../types";
import config from "config";

export async function getAllForMatchesAndMerge(
  browser: Browser,
  matches: Match[],
  promotions: Promotion[]
): Promise<Promotion[]> {
  const promotionsToReturn = promotions.slice(0);
  for (const match of matches) {
    const existingPromotion = promotionsToReturn.find((promotion) => promotion.id === match.promotion.id);
    if (existingPromotion) {
      continue;
    }
    console.info(`Retrieving data for promotion ${match.promotion.name}`);
    const newPromotion = await getPromotionDetail(browser, match.promotion);
    promotionsToReturn.push(newPromotion);
  }
  return promotionsToReturn;
}

async function getPromotionDetail(browser: Browser, promotion: Match["promotion"]): Promise<Promotion> {
  const { name, url, id } = promotion;
  let promotionToReturn: Partial<Promotion> = {
    id,
    name,
  };
  const BASE_URL = config.get<string>("data.baseUrl");
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}${url}`);
  const statusEl = page.$(
    ".Caption::-p-text(General Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Status) + .InformationBoxContents"
  );
  const locationEl = page.$(
    ".Caption::-p-text(General Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Location) + .InformationBoxContents"
  );
  const activeEl = page.$(
    ".Caption::-p-text(General Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Active Time) + .InformationBoxContents"
  );
  const els = await Promise.allSettled([statusEl, locationEl, activeEl]);
  const elsMap = {
    status: els[0],
    location: els[1],
    active: els[2],
  };
  for (const [elName, promiseResult] of Object.entries(elsMap)) {
    const value = (promiseResult as PromiseFulfilledResult<ElementHandle | null>).value;
    if (!value) {
      console.warn(`Could not find any element for ${elName} on ${name}`);
      continue;
    }
    if (elName === "status") {
      promotionToReturn.isActive = await value.evaluate((evalEl) => evalEl.textContent === "Active");
      continue;
    }
    if (elName === "location") {
      promotionToReturn.location = await value.evaluate((evalEl) => evalEl.textContent ?? undefined);
      continue;
    }
    if (elName === "active") {
      const { started, finished } = await value.evaluate((evalEl) => {
        const [started, finished] = evalEl.textContent?.split(" - ") ?? [];
        return {
          started: new Date(started),
          finished: finished === "today" ? undefined : new Date(finished),
        };
      });
      promotionToReturn = {
        ...promotionToReturn,
        started,
        finished,
      };
    }
  }
  await page.close();
  return promotionToReturn as Promotion;
}
