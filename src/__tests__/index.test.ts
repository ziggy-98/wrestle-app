import {startServer, stopServer} from "../index";
import * as createServer from "../server/createServer"
import express from "express"

describe("Index file", () => {
    test(`startServer function creates a server and listens to the result`, () => {
        const createServerSpy = jest.spyOn(createServer, "createServer");
        const serverListenSpy = jest.spyOn(express.application, "listen");
        const server = startServer()
        expect(createServerSpy).toHaveBeenCalled();
        expect(serverListenSpy).toHaveBeenCalled();
        stopServer(server);
    })
})