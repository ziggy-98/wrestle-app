import {Browser, ElementHandle} from "puppeteer";
import {Wrestler} from "../types";
import config from "config";

export async function getAll(browser: Browser){
    const BASE_URL = config.get<string>("data.baseUrl");
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

export async function getDetail(browser: Browser, url: string): Promise<Wrestler["details"]>{
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
    await page.close();
    return detail;
}