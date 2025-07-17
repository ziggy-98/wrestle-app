import express from "express";
import { configureRouting } from "./routes";
import nunjucks from "nunjucks";

export function createServer() {
  const server = express();
  server.use("/assets", express.static("dist/assets"));
  nunjucks.configure("dist/views", {
    autoescape: true,
    express: server,
  });
  configureRouting(server);

  return server;
}
