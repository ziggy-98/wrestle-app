import puppeteer, {Browser, ElementHandle} from "puppeteer";

type Wrestler = {
    name: string,
    url: string,
    details?: {
        birthplace: string,
        gender: string,
        height: string,
        weight: string,
        careerStart: Date,
        careerEnd?: Date,
        roles?: string[],
        nicknames?: string[],
        signatureMoves?: string[]
    }
}

type Match = {
    wrestlers: string[],
    date: Date,
    promotion: string,
    event: string
}

const BASE_URL = "https://www.cagematch.net/"

export async function getData(){
    const browser = await puppeteer.launch({
        headless: true
    });
    const wrestlers = await getWrestlers(browser);
    let wrestlersWithDetails = [];
    let allWrestlingMatches: Match[] = [];
    for(const wrestler of wrestlers){
        const wrestlerUrl = `${BASE_URL}${wrestler.url}`;
        const wrestlerInfo = await getWrestlerDetail(browser, wrestlerUrl);
        if(wrestlerInfo?.roles?.find((role) => role.toLowerCase().indexOf("wrestler") > -1)){
            wrestlersWithDetails.push({
                ...wrestler,
                wrestlerInfo
            });
        }
        const matchUrl = wrestlerUrl+"&page=4";
        const newWrestlerMatches = await getWrestlerMatches(browser, matchUrl, allWrestlingMatches);
        allWrestlingMatches = allWrestlingMatches.concat(newWrestlerMatches);
    }
    await browser.close();
    return {
        wrestlers: wrestlersWithDetails,
        matches: allWrestlingMatches
    }
}

export async function getWrestlers(browser: Browser){
    const wrestlers: Wrestler[] = [];
    const startPage = await browser.newPage();
    await startPage.goto(`${BASE_URL}?id=2&view=workers&s=0`);
    // const buttons = await startPage.$$(".Table .NavigationPart .NavigationPartPage");
    // if(!buttons){
    //     console.error("Could not find page buttons");
    //     return [];
    // }
    // const lastPage = await buttons.at(-4)?.evaluate((el) => el.textContent);
    const lastPage = 1;
    await startPage.close();
    for(let i=0; i < lastPage; i++){
        let allWrestlersFound = false;
        const page = await browser.newPage();
        await page.goto(`${BASE_URL}?id=2&view=workers&s=${100 * i}&sortby=colRating&sorttype=DESC`);
        const rows = await page.$$(".TableContents .TRow1, .TableContents .TRow2");
        for(const row of rows){
            const ratingEl = await row.$(".TCol:nth-child(8)");
            if(!ratingEl){
                console.error("Could not find rating column. Exiting");
                return [];
            }
            const rating = await ratingEl.evaluate((el) => el.textContent.trim())
            if(!rating){
                console.log("All wrestlers with ratings found, exiting");
                allWrestlersFound = true;
                break;
            }
            const heightEl = await row.$(".TCol:nth-child(5)")
            if(!heightEl){
                console.error("Could not find height column, exiting");
                return [];
            }
            const height = await heightEl.evaluate((el) => el.textContent.trim());
            if(!height){
                console.info("Gimmick is not a wrestler, skipping");
                continue;
            }
            const wrestlerInfoHandles = await row.$$(".TCol");
            const wrestlerInfo = wrestlerInfoHandles[1];
            const wrestler = await wrestlerInfo.evaluate((cell) => {
                const name = cell.textContent;
                const cellAttributes = cell.firstElementChild.attributes;
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
            })
            wrestlers.push(wrestler);
        }
        await page.close();
        if(allWrestlersFound){
            break;
        }
    }
    return wrestlers;
}

async function getWrestlerDetail(browser: Browser, url: string): Promise<Wrestler["details"]>{
    const page = await browser.newPage();
    await page.goto(url);

    let detail: Wrestler["details"] = {
        birthplace: "",
        gender: "",
        height: "",
        weight: "",
        careerStart: new Date(),
        careerEnd: new Date(),
        roles: [],
        nicknames: [],
        signatureMoves: []
    }

    const birthPlaceEl = page.$(".Caption::-p-text(Personal Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Birthplace) + .InformationBoxContents");
    const genderEl = page.$(".Caption::-p-text(Personal Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Gender) + .InformationBoxContents");
    const heightEl = page.$(".Caption::-p-text(Personal Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Height) + .InformationBoxContents");
    const weightEl = page.$(".Caption::-p-text(Personal Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Weight) + .InformationBoxContents");
    const careerStartEl = page.$(".Caption::-p-text(Career Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Beginning of in-ring career) + .InformationBoxContents");
    const careerEndEl = page.$(".Caption::-p-text(Career Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(End of in-ring career) + .InformationBoxContents");
    const rolesEl = page.$(".Caption::-p-text(Career Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Roles) + .InformationBoxContents")
    const nicknamesEl = page.$(".Caption::-p-text(Career Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Nicknames) + .InformationBoxContents");
    const sigMovesEl = page.$(".Caption::-p-text(Career Data) + .InformationBoxTable .InformationBoxRow .InformationBoxTitle::-p-text(Signature moves) + .InformationBoxContents");

    const elPromises = [birthPlaceEl, genderEl, heightEl, weightEl, careerStartEl, careerEndEl, rolesEl, nicknamesEl, sigMovesEl];
    const fieldsWithMultiValues = ["roles", "nicknames", "signatureMoves"];
    const fieldsWithDates = ["careerStart, careerEnd"];

    const data = await Promise.allSettled(elPromises);
    const dataKeys = Object.keys(detail);
    for(let i = 0; i < elPromises.length; i++){
        const elHandle = (data[i] as PromiseFulfilledResult<ElementHandle | null>).value;
        if(!elHandle){
            if(dataKeys[i] === "careerEnd"){
                console.info(`Wrestler with url ${url} may be an active wrestler`);
            }else{
                console.warn(`Data missing for wrestler with url ${url}: ${dataKeys[i]}`);
            }
            continue;
        }
        if(fieldsWithMultiValues.includes(dataKeys[i])){
            //@ts-ignore
            detail[dataKeys[i]] = await elHandle.evaluate((el) => {
                const html = el.innerHTML;
                return html.split("<br>");
            });
            continue;
        }
        if(fieldsWithDates.includes(dataKeys[i])){
            //@ts-ignore
            detail[dataKeys[i]] = await elHandle.evaluate((el) => {
                return new Date(el.textContent);
            });
            continue;
        }
        //@ts-ignore
        detail[dataKeys[i]] = await elHandle.evaluate((el) => {
            return el.textContent;
        })
    }
    return detail;
}

// async function getWrestlerPromotion(browser: Browser, url: string){
//
// }
//
// async function getWrestlerTitles(browser: Browser, url: string){
//
// }
//
async function getWrestlerMatches(browser: Browser, url: string, allMatches: Match[]): Promise<Match[]>{
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
            const promotionEl = await row.$(".TCol:nth-child(3) a img");
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
            const promotion = await promotionEl?.evaluate((el) => {
                const attrs = el.attributes;
                for(const attr of attrs){
                    if(attr.name === "title"){
                        return attr.value;
                    }
                }
                return "";
            });
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
                promotion,
                date: matchDate ?? new Date(),
                event: matchEvent
            };
            const existingMatch = allMatches.find(match => match.event === matchData.event && match.wrestlers.length === matchData.wrestlers.length && match.wrestlers.every(wrestler => matchData.wrestlers.includes(wrestler)));
            if(!existingMatch){
                newMatches.push(matchData);
            }
        }
    }
    return newMatches;
}

(async () => {
    getData().then((data) => {
        // console.log("list of wrestlers:");
        // wrestlers.forEach(wrestler => {
        //     console.log(wrestler);
        // })
        const { wrestlers, matches } = data;
        console.log("Final wrestler count: ", wrestlers.length);
        console.log("Final match count: ", matches.length);
        console.log("All data extracted successfully");
        return;
    })
})()