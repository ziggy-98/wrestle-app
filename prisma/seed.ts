import fs from "node:fs";
import path from "node:path";
import {
  Prisma,
  Wrestler as WrestlerModel,
  Promotion as PromotionModel,
  Title as TitleModel,
  Event as EventModel,
} from "./generated/prisma";
import { Wrestler, Promotion, Title, Match } from "../src/data/types";
import _ from "lodash";
import client from "./client";
import {
  EventMap,
  EventWrestlerMap,
  ParsedModel,
  PromotionMap,
  PromotionStint,
  TitleMap,
  WrestlerCareerStint,
  WrestlerMap,
} from "./utils/types";
import { parseModel } from "./utils/parseModel";

export function buildWrestlerData(wrestlers: Wrestler[]): Prisma.WrestlerCreateManyInput[] {
  return wrestlers
    .map((wrestler) => {
      if (!wrestler.details) {
        console.warn(`No details for wrestler ${wrestler.name}`);
        return;
      }
      const { careerStart, careerEnd, roles, signatureMoves, nicknames, ...rest } = wrestler.details;
      return {
        cagematch_correlation_id: wrestler.id,
        name: wrestler.name,
        ...rest,
        nicknames: (nicknames as Prisma.JsonArray) ?? null,
        signature_moves: (signatureMoves as Prisma.JsonArray) ?? null,
        debut: careerStart,
        retired: careerEnd ?? "active",
      };
    })
    .filter((wrestler) => wrestler !== undefined);
}

async function addWrestlers(wrestlersToAdd: Prisma.WrestlerCreateManyInput[]): Promise<WrestlerMap> {
  const wrestlersToReturn = await client.wrestler.createManyAndReturn({
    data: wrestlersToAdd,
  });
  return wrestlersToReturn.reduce<WrestlerMap>((acc, currentWrestler) => {
    const { cagematch_correlation_id } = currentWrestler;
    const parsedCagematchId = parseInt(cagematch_correlation_id.toString());
    return {
      ...acc,
      [parsedCagematchId]: parseModel<ParsedModel<WrestlerModel>>(currentWrestler),
    };
  }, {});
}

export function buildPromotionData(promotions: Promotion[]): Prisma.PromotionCreateManyInput[] {
  return promotions.map((promotion) => ({
    name: promotion.name,
    cagematch_correlation_id: promotion.id,
  }));
}

async function addPromotions(promotionsToAdd: Prisma.PromotionCreateManyInput[]): Promise<PromotionMap> {
  const promotionsToReturn = await client.promotion.createManyAndReturn({
    data: promotionsToAdd,
  });
  return promotionsToReturn.reduce((acc, currentPromotion) => {
    const { cagematch_correlation_id } = currentPromotion;
    const parsedCagematchId = parseInt(cagematch_correlation_id.toString());
    return {
      ...acc,
      [parsedCagematchId]: parseModel<ParsedModel<PromotionModel>>(currentPromotion),
    };
  }, {});
}

export function buildTitleData(promotions: PromotionMap, titles: Title[]): Prisma.TitleCreateManyInput[] {
  return titles
    .map((title) => {
      const promotionId = promotions[title.promotion]?.id;
      if (!promotionId) {
        console.warn(`No promotion ID found for title ${title.name} in promotion ${title.promotion}`);
        return;
      }
      return {
        name: title.name,
        cagematch_correlation_id: title.id,
        promotion_id: promotionId,
      };
    })
    .filter((title) => title !== undefined);
}

async function addTitles(titlesToAdd: Prisma.TitleCreateManyInput[]): Promise<TitleMap> {
  const titles = await client.title.createManyAndReturn({
    data: titlesToAdd,
  });

  return titles.reduce<TitleMap>((acc, currentTitle) => {
    const { cagematch_correlation_id } = currentTitle;
    const parsedCagematchId = parseInt(cagematch_correlation_id.toString());
    return {
      ...acc,
      [parsedCagematchId]: parseModel<ParsedModel<TitleModel>>(currentTitle),
    };
  }, {});
}

export function buildTitleReignData(
  wrestlers: WrestlerMap,
  titles: TitleMap,
  titleData: Title[]
): Prisma.Wrestler_TitlesCreateManyInput[] {
  return titleData.reduce<Prisma.Wrestler_TitlesCreateManyInput[]>((acc, currentTitle) => {
    const reignsForTitle = currentTitle.reigns;
    const titleReignsToAdd = reignsForTitle
      .map((reign) => {
        const { champion } = reign;
        const championId = wrestlers[champion]?.id;
        if (!championId) {
          return;
        }
        const titleId = titles[currentTitle.id]?.id;
        if (!titleId) {
          return;
        }
        return {
          wrestler_id: championId,
          title_id: titleId,
          held_from: new Date(reign.heldFrom),
          held_to: reign.heldTo ? new Date(reign.heldTo) : null,
        };
      })
      .filter((reign) => reign !== undefined);
    return acc.concat(titleReignsToAdd);
  }, []);
}

export function buildEventData(
  matches: Match[],
  promotions: PromotionMap
): [Prisma.EventCreateManyInput[], EventWrestlerMap] {
  const eventsToAdd: Prisma.EventCreateManyInput[] = [];
  const eventWrestlers: EventWrestlerMap = {};
  for (const match of matches) {
    const { promotion, event, date } = match;

    const promotionId = promotions[promotion.id]?.id;
    if (!promotionId) {
      console.warn(`No promotion id found for event ${event.name} for promotion ${promotion.name}`);
      continue;
    }

    if (!eventWrestlers[event.id]) {
      eventWrestlers[event.id] = [];
    }
    eventWrestlers[event.id] = Array.from(new Set(eventWrestlers[event.id].concat(match.wrestlers)));

    const eventExists =
      eventsToAdd.find((existingEvent) => existingEvent.cagematch_correlation_id === event.id) !== undefined;
    if (eventExists) {
      continue;
    }
    const eventToAdd = {
      name: event.name,
      date: new Date(date),
      cagematch_correlation_id: event.id,
      promotion_id: promotionId,
    };
    eventsToAdd.push(eventToAdd);
  }
  return [eventsToAdd, eventWrestlers];
}

async function addEvents(events: Prisma.EventCreateManyInput[]): Promise<EventMap> {
  const eventModels = await client.event.createManyAndReturn({
    data: events,
  });
  return eventModels.reduce<EventMap>((acc, currentEvent) => {
    const { cagematch_correlation_id } = currentEvent;
    const parsedCagematchId = parseInt(cagematch_correlation_id.toString());
    return {
      ...acc,
      [parsedCagematchId]: parseModel<ParsedModel<EventModel>>(currentEvent),
    };
  }, {});
}

export function buildEventWrestlerData(
  eventWrestlerData: EventWrestlerMap,
  events: EventMap,
  wrestlers: WrestlerMap
): Prisma.Event_WrestlerCreateManyInput[] {
  return Object.entries(eventWrestlerData).reduce<Prisma.Event_WrestlerCreateManyInput[]>(
    (acc, [eventCorrelationId, eventWrestlers]) => {
      const event_id = events[eventCorrelationId]?.id;
      const wrestlerIds = eventWrestlers.map((wrestler) => wrestlers[wrestler]?.id).filter((id) => id);
      if (!event_id) {
        return acc;
      }
      return [
        ...acc,
        ...wrestlerIds.map((wrestler_id) => ({
          event_id,
          wrestler_id,
        })),
      ];
    },
    []
  );
}

export function getCareerStints(wrestlerId: number, career: Record<number, number[]>) {
  const allPromotionYearsMap = Object.entries(career).reduce<Record<number, number[]>>((acc, [year, promotionIds]) => {
    for (const promotionId of promotionIds) {
      if (!acc[promotionId]) {
        acc[promotionId] = [];
      }
      acc[promotionId].push(parseInt(year));
    }
    return acc;
  }, {});

  console.info("Map so far: ", allPromotionYearsMap);

  return Object.entries(allPromotionYearsMap).map(([promotionId, allYearsInPromotion]) => {
    let stoppingPoints: number[] = [];
    for (const year of allYearsInPromotion) {
      const isStartOfStint = !allYearsInPromotion.includes(year - 1);
      const isEndOfStint = !allYearsInPromotion.includes(year + 1);
      const stintOnlyLastedAYear = isStartOfStint && isEndOfStint;
      if (stintOnlyLastedAYear) {
        stoppingPoints.push(year, year + 1);
        continue;
      }
      if (stoppingPoints.length === 0) {
        stoppingPoints.push(year);
        continue;
      }
      const yearIsInThePast = year !== new Date().getFullYear();
      if (isEndOfStint && yearIsInThePast) {
        stoppingPoints.push(year + 1);
        continue;
      }
      if (isStartOfStint && yearIsInThePast) {
        stoppingPoints.push(year);
      }
    }

    console.info("Promotion id: ", promotionId);
    console.info("Stopping points: ", stoppingPoints);

    const stints = _.chunk(stoppingPoints, 2).map(([start, end]) => ({
      start,
      end,
    }));

    return {
      wrestlerId,
      promotionId: parseInt(promotionId),
      stints,
    };
  });
}

export function getStintsToAdd(wrestlerId: number, promotionId: number, stints: PromotionStint[]) {
  return stints
    .map((stint) => {
      if (!stint.start) {
        return;
      }
      return {
        wrestler_id: wrestlerId,
        promotion_id: promotionId,
        debut: stint.start,
        exit: stint.end ?? null,
      };
    })
    .filter((stint) => stint !== undefined);
}

export function buildWrestlerPromotionData(
  wrestlerMap: WrestlerMap,
  promotions: PromotionMap,
  wrestlers: Wrestler[]
): Prisma.Promotion_WrestlersCreateManyInput[] {
  const wrestlerCareerStints: WrestlerCareerStint[] = wrestlers
    .map((wrestler) => {
      const { id, career } = wrestler;
      const wrestlerId = wrestlerMap[id]?.id;
      if (!wrestlerId || !career) {
        return;
      }
      return getCareerStints(parseInt(wrestlerId.toString()), career);
    })
    .filter((stint) => stint !== undefined)
    .flat(1);

  const promotionWrestlerData: Prisma.Promotion_WrestlersCreateManyInput[] = wrestlerCareerStints
    .map(({ wrestlerId, promotionId, stints }) => {
      const promotion = promotions[promotionId]?.id;
      if (!promotion) {
        return;
      }
      return getStintsToAdd(wrestlerId, promotion, stints);
    })
    .filter((stint) => stint !== undefined)
    .flat(1);

  return promotionWrestlerData;
}

function getData() {
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
  return JSON.parse(fs.readFileSync(path.join(__dirname, "src", "data", "extracts", latestFile)).toString());
}

export async function main() {
  await client.$connect();
  const data = getData();

  const wrestlerData: Wrestler[] = data.wrestlers;
  const wrestlersToAdd = buildWrestlerData(wrestlerData);
  const wrestlers = await addWrestlers(wrestlersToAdd);

  const promotionData: Promotion[] = data.promotions;
  const promotionsToAdd = buildPromotionData(promotionData);
  const promotions = await addPromotions(promotionsToAdd);

  const titleData: Title[] = data.titles;
  const titlesToAdd = buildTitleData(promotions, titleData);
  const titles = await addTitles(titlesToAdd);
  const titleReigns = buildTitleReignData(wrestlers, titles, titleData);
  await client.wrestler_Titles.createMany({
    data: titleReigns,
  });

  const matchData: Match[] = data.matches;
  const [eventData, eventWrestlerData] = buildEventData(matchData, promotions);
  const events = await addEvents(eventData);

  const eventWrestlersToAdd = buildEventWrestlerData(eventWrestlerData, events, wrestlers);
  await client.event_Wrestler.createMany({
    data: eventWrestlersToAdd,
  });

  const promotionWrestlerData = buildWrestlerPromotionData(wrestlers, promotions, wrestlerData);
  await client.promotion_Wrestlers.createMany({
    data: promotionWrestlerData,
  });
}
