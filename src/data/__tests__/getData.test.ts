import {getData} from "../getData";
import {stubBrowser, stubPage} from "./puppeteerStub";

jest.mock('puppeteer', () => ({
    launch() {
        return stubBrowser;
    }
}));

describe("getData", () => {
    test("Should make a puppeteer request to cagematch", async () => {
        const stubPageSpy = jest.spyOn(stubPage, "goto");
        await getData();
        expect(stubPageSpy).toHaveBeenCalledWith("https://cagematch.net");
    })
})