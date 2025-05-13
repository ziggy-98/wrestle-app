import {Title} from "../types";
import {Browser} from "puppeteer";
import config from "config";

type WrestlerTitlesReturnType = Record<string, Partial<Title>>;
export async function getAllForWrestler(browser: Browser, url: string, wrestlerName: string): Promise<WrestlerTitlesReturnType>{
    const BASE_URL = config.get<string>("data.baseUrl");
    const page = await browser.newPage();
    await page.goto(url);
    let titles: WrestlerTitlesReturnType= {};
    const reignTableEl = await page.$(".Table");
    if(!reignTableEl){
        console.warn(`No reign table found for wrestler ${wrestlerName}, skipping`);
        return titles;
    }
    const rows = await reignTableEl.$$(".TRow1,.TRow2");
    if(!rows){
        console.warn(`No rows found in reigns table for wrestler ${wrestlerName}, skipping`);
        return titles;
    }
    for(const row of rows){
        const timeframeEl = await row.$(".TCol:nth-child(1)");
        const titleNameEl = await row.$(".TCol:nth-child(2)");
        if(!titleNameEl){
            continue;
        }
        const {name, url} = await titleNameEl.evaluate((el) => {
            const name = el.textContent?.split("(")[0].trim();
            const cellAttributes = el.firstElementChild.attributes;
            let url = "";
            for(const attribute of cellAttributes){
                if(attribute.name === "href"){
                    url = attribute.value;
                }
            }
            return {
                name,
                url
            }
        });
        if(!timeframeEl){
            console.warn(`Could not find time frame for title reign with title ${name} for wrestler ${wrestlerName}`);
            continue;
        }
        const timeframe = await timeframeEl.evaluate((el) => {
            const timeframeString = el.textContent;
            return timeframeString?.replaceAll("&nbsp", "").split("-");
        });
        const [heldFrom, heldTo] = timeframe.map((date: string) => {
            const [day, month, year] = date.split(".").map((datePart) => datePart.trim());
            const dateToReturn = new Date(`${year}-${month}-${day}`);
            if(isNaN(dateToReturn.getTime())){
                return;
            }
            return dateToReturn;
        });
        if(!titles[name]){
            titles[name] = {
                name,
                url: `${BASE_URL}${url}`,
                reigns: []
            }
        }
        const newReign = {
            champion: wrestlerName,
            heldFrom,
            heldTo
        }
        titles[name].reigns?.push(newReign);
    }
    return titles;
}

export async function merge(browser: Browser, allTitles: Title[], newReigns: WrestlerTitlesReturnType): Promise<Title[]>{
    let titlesToReturn = allTitles.slice(0);
    for(const [currentTitleName, currentTitleInfo] of Object.entries(newReigns)){
        let existingTitleIndex = titlesToReturn.findIndex(title => title.name === currentTitleName);
        if(existingTitleIndex === -1){
            const enrichedTitle = await getDetail(browser, currentTitleInfo);
            if(!enrichedTitle){
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

async function getDetail(browser: Browser, titleInfo: Partial<Title>): Promise<Title | undefined>{
    const page = await browser.newPage();
    const { url, name, reigns } = titleInfo;
    if(!url){
        console.warn(`No url found for title ${name}, skipping`);
        return;
    }
    await page.goto(url);
    const allPromotionsEl = await page.$(".InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Promotions) + .InformationBoxContents");
    if(!allPromotionsEl){
        console.warn(`No promotions found for title ${name}, skipping`);
        return;
    }
    const { promotion, activeFrom, activeTo } = await allPromotionsEl.evaluate((el) => {
        const text = el.textContent
        const promotionEl = el.firstElementChild;
        let promotion = "";
        if(promotionEl){
            promotion = promotionEl.textContent.trim();
        }
        if(!promotion){
            promotion = text.split("(")[0].trim();
        }
        const allDates = text?.matchAll(/\([a-zA-Z0-9\- .]+\)/g);
        let activeFrom = "";
        let activeTo = "";
        for(const dateString in allDates){
            const [startDate, endDate] = dateString.substring(1,dateString.length - 2).split("-");
            const startDateSplit = startDate.split(".");
            activeFrom = startDateSplit.at(startDateSplit.length -1)?.trim() ?? "";
            if(activeTo !== ""){
                const endDateSplit = endDate.split(".");
                activeTo = endDateSplit.at(endDateSplit.length -1)?.trim() ?? "";
            }
        }
        return {
            promotion,
            activeFrom,
            activeTo: activeTo !== "today" ? activeTo : undefined
        }
    });
    const isActive = activeTo === undefined;
    const titleToReturn: Partial<Title> = {
        name,
        url,
        reigns,
        promotion,
        isActive,
        activeFrom
    }
    if(activeTo){
        titleToReturn.activeTo = activeTo;
    }
    return titleToReturn as Title;
}