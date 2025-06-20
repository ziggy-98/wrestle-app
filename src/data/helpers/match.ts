import { Browser } from "puppeteer";
import { Match } from "../types";

export async function getAllForWrestler(browser: Browser, url: string, allMatches: Match[]): Promise<Match[]> {
  let newMatches: Match[] = [];
  const startPage = await browser.newPage();
  await startPage.goto(url);
  // const buttons = await startPage.$$(".Table .NavigationPart .NavigationPartPage");
  // if(!buttons){
  //     console.error("Could not find page buttons");
  //     return [];
  // }
  // const lastPage = await buttons.at(-4)?.evaluate((el) => el.textContent);
  const lastPage = 1;
  await startPage.close();
  for (let i = 0; i < lastPage; i++) {
    const page = await browser.newPage();
    await page.goto(`${url}&s=${i * 100}`);
    const rows = await page.$$(".TableContents .TRow1, .TableContents .TRow2");
    for (const row of rows) {
      const matchDateEl = await row.$(".TCol:nth-child(2)");
      const promotionHandle = await row.$(".TCol:nth-child(3) a");
      const promotionImgHandle = await row.$(".TCol:nth-child(3) a img");
      const matchWrestlerEls = await row.$$(".TCol:nth-child(4) .MatchCard a");
      const matchEventHandle = await row.$(".TCol:nth-child(4) .MatchEventLine a");

      const matchDateString = await matchDateEl?.evaluate((el) => {
        const dateString = el.textContent?.trim();
        if (!dateString) {
          return;
        }
        const [day, month, year] = dateString.split(".");
        return `${year}-${month}-${day}`;
      });

      const matchEvent = await matchEventHandle?.evaluate((el) => {
        const url = el.attributes.getNamedItem("href")?.value;
        const id = parseInt(url?.match(/nr=([0-9]+)/)?.[1] ?? "");
        return {
          id,
          name: el.textContent?.trim() as string,
        };
      });

      if (!matchEvent?.id || !matchEvent?.name) {
        continue;
      }

      if (!matchDateString) {
        console.warn(`Could not find date for event ${matchEvent.name}, skipping`);
        continue;
      }

      const matchDate = new Date(matchDateString);
      if (isNaN(matchDate.getTime())) {
        console.warn(`Invalid date: ${matchDateString}`);
      }
      if (!promotionHandle || !promotionImgHandle) {
        console.warn(`No associated promotion found for event ${matchEvent.name}, skipping`);
        continue;
      }
      const promotionUrl = await promotionHandle?.evaluate((el) => el.attributes.getNamedItem("href")?.value);
      const promotionName = await promotionImgHandle?.evaluate((el) => el.attributes.getNamedItem("title")?.value);
      if (!promotionUrl || !promotionName) {
        continue;
      }

      const matchPromotionId = parseInt(promotionUrl?.match(/nr=([0-9]+)/)?.[1] ?? "");
      if (!matchPromotionId) {
        continue;
      }

      const matchWrestlers: number[] = [];
      for (const matchWrestlerEl of matchWrestlerEls) {
        if (!matchWrestlerEl) {
          continue;
        }
        const wrestlerId = await matchWrestlerEl.evaluate((el) => {
          const url = el.attributes.getNamedItem("href")?.value;
          return parseInt(url?.match(/nr=([0-9]+)/)?.[1] ?? "");
        });
        if (wrestlerId) {
          matchWrestlers.push(wrestlerId);
        }
      }

      const matchData: Match = {
        wrestlers: matchWrestlers,
        promotion: {
          id: matchPromotionId,
          name: promotionName,
          url: promotionUrl,
        },
        date: matchDate ?? new Date(),
        event: matchEvent,
      };

      const existingMatch = allMatches.find(
        (match) =>
          match.event === matchData.event &&
          match.wrestlers.length === matchData.wrestlers.length &&
          match.wrestlers.every((wrestler) => matchData.wrestlers.includes(wrestler))
      );

      if (!existingMatch) {
        newMatches.push(matchData);
      }
    }
    await page.close();
  }
  return newMatches;
}
