import staticRouter from "./static";
import {Application} from "express";

export function configureRouting(server: Application){
    server.use(staticRouter);
}