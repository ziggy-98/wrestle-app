import { Browser, Page, ElementHandle } from "puppeteer";

export const stubPuppeteer = {
    launch() {
        return Promise.resolve(stubBrowser);
    }
} as unknown as any;

export const stubBrowser = {
    newPage() {
        return Promise.resolve(stubPage);
    },
    close() {
        return Promise.resolve();
    }
} as unknown as Browser;

export const stubPage = {
    goto(_url: string) {
        return Promise.resolve();
    },
    $$(_selector: string): Promise<ElementHandle[]> {
        return Promise.resolve([]);
    },
    $(_selector: string) {
        return Promise.resolve(stubElementHandle);
    },
    $eval(_selector: string, _pageFunction: any) {
        return Promise.resolve();
    }
} as unknown as Page;

export const stubElementHandle = {
    $eval() {
        return Promise.resolve();
    }
} as unknown as ElementHandle;