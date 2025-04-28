import {startServer, stopServer} from "../index";
import request from "supertest";

describe("Index file", () => {
    test(`startServer function creates a server and health check route is accessible`, async () => {
        const server = startServer()
        const response = await request(server).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "OK"
        });
        stopServer(server);
    })
})