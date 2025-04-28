import express from "express";
import {configureRouting} from "./routes";
export function createServer(){
    const server = express();
    configureRouting(server);
    return server;
}