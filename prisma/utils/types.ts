import { Event, Promotion, Title, Wrestler } from "../generated/prisma";

export type ParsedModel<T> = {
  [K in keyof T]: T[K] extends bigint ? number : T[K];
};
export type WrestlerMap = Record<string, ParsedModel<Wrestler>>;
export type PromotionMap = Record<string, ParsedModel<Promotion>>;
export type TitleMap = Record<string, ParsedModel<Title>>;
export type EventMap = Record<string, ParsedModel<Event>>;
export type EventWrestlerMap = Record<string, number[]>;
export type PromotionStint = {
  start: number;
  end?: number;
};
export type WrestlerCareerStint = {
  wrestlerId: number;
  promotionId: number;
  stints: PromotionStint[];
};
