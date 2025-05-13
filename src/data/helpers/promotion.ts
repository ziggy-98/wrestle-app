import {Browser} from "puppeteer";
import {Match, Promotion} from "../types";

export async function getAllForMatches(browser: Browser, matches: Match[], promotions: Promotion[]): Promise<Promotion[]>{
    let promotionsToReturn = promotions.slice(0);
    for(const match of matches){
        const matchPromotion = match.promotion.name;
        const existingPromotion = promotionsToReturn.find((promotion) => promotion.name === matchPromotion);
        if(!existingPromotion){
            const newPromotion = await getPromotionDetail(browser, match.promotion.url);
        }
    }
}

async function getPromotionDetail(browser: Browser, url: string): Promise<Promotion[]>{

}