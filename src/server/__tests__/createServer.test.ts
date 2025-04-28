import {createServer} from "../createServer";

describe("createServer", () => {
    test("createServer should return a server instance", () => {
        const server = createServer();
        expect(server).toHaveProperty("locals");
    })
})