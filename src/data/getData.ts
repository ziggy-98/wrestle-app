import puppeteer from "puppeteer";
import * as helpers from "./helpers";
import {Match, Promotion, Title, Wrestler} from "./types";

const BASE_URL = "https://www.cagematch.net/"

export async function getData(){
    const browser = await puppeteer.launch({
        headless: true
    });
    const wrestlers = await helpers.wrestler.getAll(browser);
    let wrestlersWithDetails: Wrestler[] = [];
    let allWrestlingMatches: Match[] = [];
    let allTitles: Title[] = [];
    let allPromotions: Promotion[] = [];
    for(const wrestler of wrestlers){
        const wrestlerUrl = `${BASE_URL}${wrestler.url}`;
        const wrestlerInfo = await helpers.wrestler.getDetail(browser, wrestlerUrl);
        if(!wrestlerInfo?.roles?.find((role) => role.toLowerCase().indexOf("wrestler") > -1)){
            continue;
        }
        wrestlersWithDetails.push({
            ...wrestler,
            ...wrestlerInfo
        });
        const matchUrl = wrestlerUrl+"&page=4";
        const newWrestlerMatches = await helpers.match.getAllForWrestler(browser, matchUrl, allWrestlingMatches);
        allWrestlingMatches = allWrestlingMatches.concat(newWrestlerMatches);
        const newWrestlingPromotions = await helpers.promotion.getAllForMatches(browser, newWrestlerMatches, allPromotions);
        const titleUrl = wrestlerUrl+"&page=11";
        const newTitleReigns = await helpers.title.getAllForWrestler(browser, titleUrl, wrestler.name);
        allTitles = await helpers.title.merge(browser, allTitles, newTitleReigns);
    }
    await browser.close();
    return {
        wrestlers: wrestlersWithDetails,
        matches: allWrestlingMatches,
        titles: allTitles
    }
}

(async () => {
    getData().then((data) => {
        // console.log("list of wrestlers:");
        // wrestlers.forEach(wrestler => {
        //     console.log(wrestler);
        // })
        const { wrestlers, matches, titles } = data;
        console.log("Final wrestler count: ", wrestlers.length);
        console.log("Final match count: ", matches.length);
        console.log("Final titles count: ", titles.length);
        console.log("All data extracted successfully");
        return;
    })
})()