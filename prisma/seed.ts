import { PrismaClient } from "./generated/prisma";
import fs from "node:fs";
import path from "node:path";
import { Wrestler, Promotion, Title, Match } from "../src/data/types";

const client = new PrismaClient();

async function addWrestlers(wrestlers: Wrestler[]) {}

async function addPromotions(promotions: Promotion[]) {}

async function addTitles(titles: Title[]) {}

async function getEventsFromMatches(matches: Match[]) {}

async function addEvents(events) {}

async function buildWrestlerEventRelationships(wrestlers: Wrestler[], events) {}

async function buildWrestlerPromotionRelationships(
  wrestlers: Wrestler[],
  promotions: Promotion[]
) {}

async function buildWrestlerTitleRelationships(
  wrestlers: Wrestler[],
  titles: Title[]
) {}

async function main() {
  const files = fs.readdirSync(path.join(__dirname, "src", "data", "extracts"));
  files.sort((fileA, fileB) => {
    const fileADate = fileA.replace("wrestler-data-", "").replace(".json", "");
    const fileBDate = fileB.replace("wrestler-data-", "").replace(".json", "");
    return new Date(fileADate).getTime() - new Date(fileBDate).getTime();
  });
  const latestFile = files.at(files.length - 1);
  if (!latestFile) {
    throw new Error("Could not seed db: data extract could not be found");
  }
  const data = JSON.parse(
    fs
      .readFileSync(path.join(__dirname, "src", "data", "extracts", latestFile))
      .toString()
  );
}
