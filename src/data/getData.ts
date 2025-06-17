import puppeteer from "puppeteer";
import * as helpers from "./helpers";
import { Match, Promotion, Title, Wrestler } from "./types";
import fs from "node:fs";
import path from "node:path";
import config from "config";

export async function getData() {
  const BASE_URL = config.get<string>("data.baseUrl");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--disable-gpu"],
  });
  const wrestlers = await helpers.wrestler.getAll(browser);
  let wrestlersWithDetails: Wrestler[] = [];
  let allWrestlingMatches: Match[] = [];
  let allTitles: Title[] = [];
  let allPromotions: Promotion[] = [];
  for (const wrestler of wrestlers) {
    const wrestlerUrl = `${BASE_URL}${wrestler.url}`;
    console.info(`Getting data for wrestler ${wrestler.name}`);
    const wrestlerInfo = await helpers.wrestler.getDetail(
      browser,
      wrestlerUrl,
      wrestler.name
    );
    if (
      !wrestlerInfo?.roles?.find(
        (role) => role.toLowerCase().indexOf("wrestler") > -1
      )
    ) {
      continue;
    }
    const careerUrl = wrestlerUrl + "&page=20";
    const wrestlerCareer = await helpers.wrestler.getCareer(
      browser,
      careerUrl,
      wrestler.name
    );
    wrestlersWithDetails.push({
      ...wrestler,
      ...wrestlerInfo,
      career: wrestlerCareer,
    });
    const matchUrl = wrestlerUrl + "&page=4";
    console.info(`Getting matches for wrestler ${wrestler.name}`);
    const newWrestlerMatches = await helpers.match.getAllForWrestler(
      browser,
      matchUrl,
      allWrestlingMatches
    );
    allWrestlingMatches = allWrestlingMatches.concat(newWrestlerMatches);
    console.info(`Getting all promotions for wrestler ${wrestler.name}`);
    allPromotions = await helpers.promotion.getAllForMatchesAndMerge(
      browser,
      newWrestlerMatches,
      allPromotions
    );
    const titleUrl = wrestlerUrl + "&page=11";
    console.info(`Getting all titles for wrestler ${wrestler.name}`);
    const newTitleReigns = await helpers.title.getAllForWrestler(
      browser,
      titleUrl,
      wrestler.name
    );
    allTitles = await helpers.title.merge(browser, allTitles, newTitleReigns);
    console.info(`All data retrieved for wrestler ${wrestler.name}`);
  }
  browser.close();
  return {
    wrestlers: wrestlersWithDetails,
    matches: allWrestlingMatches,
    titles: allTitles,
    promotions: allPromotions,
  };
}

(async () => {
  getData().then((data) => {
    const { wrestlers, matches, titles, promotions } = data;
    console.log("Final wrestler count: ", wrestlers.length);
    console.log("Final match count: ", matches.length);
    console.log("Final titles count: ", titles.length);
    console.log("Final promotions count: ", promotions.length);
    const filename = `wrestler-data-${new Date().toISOString()}.json`;
    fs.writeFileSync(
      path.resolve(__dirname, "extracts", filename),
      JSON.stringify(data)
    );
    console.log("All data extracted successfully");
    process.exit(0);
  });
})();
