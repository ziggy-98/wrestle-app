import {main} from "../index";

describe("Index file", () => {
    test(`main function emits a console log saying "it's go time"`, () => {
        const consoleLog = jest.spyOn(console, "log");
        main()
        expect(consoleLog).toHaveBeenCalledWith("It's go time");
    })
})