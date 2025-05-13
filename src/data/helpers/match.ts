import {Browser} from "puppeteer";
import {Match} from "../types";

export async function getAllForWrestler(browser: Browser, url: string, allMatches: Match[]): Promise<Match[]>{
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
    for(let i = 0; i < lastPage; i++){
        const page = await browser.newPage();
        await page.goto(`${url}&s=${i*100}`);
        const rows = await page.$$(".TableContents .TRow1, .TableContents .TRow2");
        for(const row of rows){
            const matchDateEl = await row.$(".TCol:nth-child(2)");
            const promotionEl = await row.$(".TCol:nth-child(3) a");
            const promotionImgEl = await row.$(".TCol:nth-child(3) a img");
            const matchWrestlerEls = await row.$$(".TCol:nth-child(4) .MatchCard a");
            const matchEventEl = await row.$(".TCol:nth-child(4) .MatchEventLine a");
            const matchDateString = await matchDateEl?.evaluate((el) => {
                const dateString = el.textContent.trim();
                const [day, month, year] = dateString.split(".");
                return `${year}-${month}-${day}`;
            });
            const matchEvent = await matchEventEl?.evaluate((el) => el.textContent.trim());
            if(!matchDateString){
                console.warn(`Could not find date for event ${matchEvent}, skipping`);
                continue;
            }
            const matchDate = new Date(matchDateString);
            if(isNaN(matchDate.getTime())){
                console.warn(`Invalid date: ${matchDateString}`);
            }
            const promotionUrl = await promotionEl?.evaluate((el) => {
                const attrs = el.attributes;
                for(const attr of attrs){
                    if(attr.name === "href"){
                        return attr.value;
                    }
                }
                return "";
            });
            const promotionName = await promotionImgEl?.evaluate((el) => {
                const attrs = el.attributes;
                for(const attr of attrs){
                    if(attr.name === "title"){
                        return attr.value;
                    }
                }
                return "";
            })
            const matchWrestlers: string[] = [];
            for(const matchWrestlerEl of matchWrestlerEls){
                if(!matchWrestlerEl){
                    continue;
                }
                const wrestlerName = await matchWrestlerEl.evaluate(el => el.textContent.trim());
                matchWrestlers.push(wrestlerName);
            }
            const matchData: Match = {
                wrestlers: matchWrestlers,
                promotion: {
                    name: promotionName,
                    url: promotionUrl
                },
                date: matchDate ?? new Date(),
                event: matchEvent
            };
            const existingMatch = allMatches.find(match => match.event === matchData.event && match.wrestlers.length === matchData.wrestlers.length && match.wrestlers.every(wrestler => matchData.wrestlers.includes(wrestler)));
            if(!existingMatch){
                newMatches.push(matchData);
            }
        }
        await page.close();
    }
    return newMatches;
}