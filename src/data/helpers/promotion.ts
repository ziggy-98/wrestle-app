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
    const matchPromotionId = match.promotion.url.match(/nr=([0-9]+)/)?.[1];
    if (!matchPromotionId) {
      continue;
    }
    const existingPromotion = promotionsToReturn.find(
      (promotion) => promotion.id === parseInt(matchPromotionId)
    );
    if (existingPromotion) {
      continue;
    }
    console.info(`Retrieving data for promotion ${match.promotion.name}`);
    const newPromotion = await getPromotionDetail(
      browser,
      match.promotion.url,
      match.promotion.name
    );
    promotionsToReturn.push(newPromotion);
  }
  return promotionsToReturn;
}

async function getPromotionDetail(
  browser: Browser,
  url: string,
  name: string
): Promise<Promotion> {
  const matchPromotionId = url.match(/nr=([0-9]+)/)?.[1] ?? "unknown";
  let promotionToReturn: Partial<Promotion> = {
    id: parseInt(matchPromotionId),
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
    const value = (
      promiseResult as PromiseFulfilledResult<ElementHandle | null>
    ).value;
    if (!value) {
      console.warn(`Could not find any element for ${elName} on ${name}`);
      continue;
    }
    if (elName === "status") {
      promotionToReturn.isActive = await value.evaluate(
        (evalEl) => evalEl.textContent === "Active"
      );
      continue;
    }
    if (elName === "location") {
      promotionToReturn.location = await value.evaluate(
        (evalEl) => evalEl.textContent
      );
      continue;
    }
    if (elName === "active") {
      const { started, finished } = await value.evaluate((evalEl) => {
        const [started, finished] = evalEl.textContent.split(" - ");
        return {
          started,
          finished: finished === "today" ? undefined : finished,
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
