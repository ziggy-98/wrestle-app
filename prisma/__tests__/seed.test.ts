import * as data from "./fixtures/wrestler-data.json";
import {
  buildWrestlerData,
  buildPromotionData,
  buildTitleData,
  buildTitleReignData,
  buildEventData,
  buildEventWrestlerData,
  buildWrestlerPromotionData,
  getCareerStints,
  getStintsToAdd,
} from "../seed";
import { Wrestler } from "../../src/data/types";
import { PromotionStint } from "../utils/types";

describe("buildWrestlerData", () => {
  test("Should return an array of prisma create many objects when wrestler data is passed", () => {
    const wrestlerData = data.wrestlers;
    const expected = [
      {
        name: "Kenta Kobashi",
        cagematch_correlation_id: 1,
        birthplace: "Fukuchiyama, Kyoto, Japan",
        gender: "male",
        height: "6' 1\" (186 cm)",
        weight: "253 lbs (115 kg)",
        debut: "26.02.1988",
        retired: "11.05.2013",
        nicknames: ['"Absolute Champion"', '"Iron Man"', '"Mr. Pro Wrestling"', '"Orange Crush"'],
        signature_moves: [
          "Moonsault Press",
          "Orange Crush",
          "Burning Hammer",
          "Burning Lariat",
          "Half Nelson Suplex",
          "Sleeper Suplex",
        ],
      },
    ];
    expect(buildWrestlerData(wrestlerData)).toEqual(expected);
  });
  test("Should remove any wrestlers without required fields from an array when creating prisma create many objects", () => {
    const badWrestlerData = [
      {
        name: "Fake wrestler",
      },
    ];
    expect(buildWrestlerData(badWrestlerData as Wrestler[]).length).toBe(0);
  });
});
describe("buildPromotionData", () => {
  test("Should return an array of prisma create objects when promotion data is passed", () => {
    const promotionData = data.promotions;
    const expected = [
      {
        name: "Pro Wrestling NOAH",
        cagematch_correlation_id: 2,
      },
      {
        name: "New Japan Pro Wrestling",
        cagematch_correlation_id: 3,
      },
      {
        name: "All Japan Pro Wrestling",
        cagematch_correlation_id: 1,
      },
    ];
    expect(buildPromotionData(promotionData)).toEqual(expected);
  });
});
describe("buildTitleData", () => {
  test("Should return an array of prisma create objects when title data is passed", () => {
    const promotionMap = {
      2: {
        id: 1,
        name: "Pro Wrestling NOAH",
        cagematch_correlation_id: 2,
      },
      1: {
        id: 2,
        name: "All Japan Pro Wrestling",
        cagematch_correlation_id: 1,
      },
      3: {
        id: 3,
        name: "New Japan Pro Wrestling",
        cagematch_correlation_id: 3,
      },
    };
    const titles = data.titles;
    const expected = [
      {
        cagematch_correlation_id: 141,
        name: "GHC Hardcore Openweight Champion",
        promotion_id: 1,
      },
      {
        cagematch_correlation_id: 144,
        name: "GHC Tag Team Champion",
        promotion_id: 1,
      },
      {
        cagematch_correlation_id: 140,
        name: "GHC Heavyweight Champion",
        promotion_id: 1,
      },
      {
        cagematch_correlation_id: 24,
        name: "Triple Crown Champion",
        promotion_id: 2,
      },
      {
        cagematch_correlation_id: 25,
        name: "AJPW World Tag Team Champion",
        promotion_id: 2,
      },
    ];
    expect(buildTitleData(promotionMap, titles)).toEqual(expected);
  });
  test("Should filter out any titles without associated promotions", () => {
    const promotionMap = {
      2: {
        id: 1,
        name: "Pro Wrestling NOAH",
        cagematch_correlation_id: 2,
      },
    };
    const titles = data.titles;
    const expected = [
      {
        cagematch_correlation_id: 141,
        name: "GHC Hardcore Openweight Champion",
        promotion_id: 1,
      },
      {
        cagematch_correlation_id: 144,
        name: "GHC Tag Team Champion",
        promotion_id: 1,
      },
      {
        cagematch_correlation_id: 140,
        name: "GHC Heavyweight Champion",
        promotion_id: 1,
      },
    ];
    expect(buildTitleData(promotionMap, titles)).toEqual(expected);
  });
});
describe("buildTitleReignData", () => {
  test("Should return an array of prisma create objects when title data is passed", () => {
    const titlesMap = {
      141: {
        id: 1,
        name: "GHC Hardcore Openweight Champion",
        cagematch_correlation_id: 141,
        promotion_id: 2,
      },
      144: {
        id: 2,
        name: "GHC Tag Team Champion",
        cagematch_correlation_id: 144,
        promotion_id: 2,
      },
      140: {
        id: 3,
        name: "GHC Heavyweight Champion",
        cagematch_correlation_id: 140,
        promotion_id: 2,
      },
      24: {
        id: 4,
        name: "Triple Crown Champion",
        cagematch_correlation_id: 24,
        promotion_id: 1,
      },
      25: {
        id: 5,
        name: "AJPW World Tag Team Champion",
        cagematch_correlation_id: 25,
        promotion_id: 1,
      },
    };
    const wrestlerMap = {
      1: {
        id: 1,
        cagematch_correlation_id: 1,
        name: "Kenta Kobashi",
        birthplace: "Fukuchiyama, Kyoto, Japan",
        gender: "male",
        height: "6' 1\" (186 cm)",
        weight: "253 lbs (115 kg)",
        debut: "26.02.1988",
        retired: "11.05.2013",
        nicknames: ['"Absolute Champion"', '"Iron Man"', '"Mr. Pro Wrestling"', '"Orange Crush"'],
        signature_moves: [
          "Moonsault Press",
          "Orange Crush",
          "Burning Hammer",
          "Burning Lariat",
          "Half Nelson Suplex",
          "Sleeper Suplex",
        ],
      },
    };
    const titles = data.titles;
    const expected = [
      {
        wrestler_id: 1,
        title_id: 1,
        held_from: new Date("2009-06-08T00:00:00.000Z"),
        held_to: new Date("2009-12-23T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 1,
        held_from: new Date("2009-06-08T00:00:00.000Z"),
        held_to: new Date("2009-12-23T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 2,
        held_from: new Date("2006-06-04T00:00:00.000Z"),
        held_to: new Date("2006-09-25T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 2,
        held_from: new Date("2003-06-06T00:00:00.000Z"),
        held_to: new Date("2003-11-30T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 2,
        held_from: new Date("2006-06-04T00:00:00.000Z"),
        held_to: new Date("2006-09-25T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 2,
        held_from: new Date("2003-06-06T00:00:00.000Z"),
        held_to: new Date("2003-11-30T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 3,
        held_from: new Date("2003-03-01T00:00:00.000Z"),
        held_to: new Date("2005-03-05T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 3,
        held_from: new Date("2003-03-01T00:00:00.000Z"),
        held_to: new Date("2005-03-05T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 4,
        held_from: new Date("2000-02-27T00:00:00.000Z"),
        held_to: new Date("2000-06-16T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 4,
        held_from: new Date("1998-06-12T00:00:00.000Z"),
        held_to: new Date("1998-10-31T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 4,
        held_from: new Date("1996-07-24T00:00:00.000Z"),
        held_to: new Date("1997-01-20T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 4,
        held_from: new Date("2000-02-27T00:00:00.000Z"),
        held_to: new Date("2000-06-16T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 4,
        held_from: new Date("1998-06-12T00:00:00.000Z"),
        held_to: new Date("1998-10-31T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 4,
        held_from: new Date("1996-07-24T00:00:00.000Z"),
        held_to: new Date("1997-01-20T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1999-10-23T00:00:00.000Z"),
        held_to: new Date("2000-02-20T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1999-01-07T00:00:00.000Z"),
        held_to: new Date("1999-06-09T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1997-10-04T00:00:00.000Z"),
        held_to: new Date("1998-01-25T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1997-05-27T00:00:00.000Z"),
        held_to: new Date("1997-07-25T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1994-12-10T00:00:00.000Z"),
        held_to: new Date("1995-06-09T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1993-12-03T00:00:00.000Z"),
        held_to: new Date("1994-11-19T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1999-10-23T00:00:00.000Z"),
        held_to: new Date("2000-02-20T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1999-01-07T00:00:00.000Z"),
        held_to: new Date("1999-06-09T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1997-10-04T00:00:00.000Z"),
        held_to: new Date("1998-01-25T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1997-05-27T00:00:00.000Z"),
        held_to: new Date("1997-07-25T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1994-12-10T00:00:00.000Z"),
        held_to: new Date("1995-06-09T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 5,
        held_from: new Date("1993-12-03T00:00:00.000Z"),
        held_to: new Date("1994-11-19T00:00:00.000Z"),
      },
    ];
    expect(buildTitleReignData(wrestlerMap, titlesMap, titles)).toEqual(expected);
  });
  test("Should filter out any title reigns where an associated champion is not found", () => {
    const titlesMap = {
      141: {
        id: 1,
        name: "GHC Hardcore Openweight Champion",
        cagematch_correlation_id: 141,
        promotion_id: 2,
      },
    };
    const wrestlerMap = {
      1: {
        id: 1,
        cagematch_correlation_id: 1,
        name: "Kenta Kobashi",
        birthplace: "Fukuchiyama, Kyoto, Japan",
        gender: "male",
        height: "6' 1\" (186 cm)",
        weight: "253 lbs (115 kg)",
        debut: "26.02.1988",
        retired: "11.05.2013",
        nicknames: ['"Absolute Champion"', '"Iron Man"', '"Mr. Pro Wrestling"', '"Orange Crush"'],
        signature_moves: [
          "Moonsault Press",
          "Orange Crush",
          "Burning Hammer",
          "Burning Lariat",
          "Half Nelson Suplex",
          "Sleeper Suplex",
        ],
      },
    };
    const titles = data.titles;
    const expected = [
      {
        wrestler_id: 1,
        title_id: 1,
        held_from: new Date("2009-06-08T00:00:00.000Z"),
        held_to: new Date("2009-12-23T00:00:00.000Z"),
      },
      {
        wrestler_id: 1,
        title_id: 1,
        held_from: new Date("2009-06-08T00:00:00.000Z"),
        held_to: new Date("2009-12-23T00:00:00.000Z"),
      },
    ];
    expect(buildTitleReignData(wrestlerMap, titlesMap, titles)).toEqual(expected);
  });
});
describe("buildEventData", () => {
  test("Should return an array of prisma create objects when match data is passed", () => {
    const matches = data.matches;
    const promotionMap = {
      2: {
        id: 1,
        name: "Pro Wrestling NOAH",
        cagematch_correlation_id: 2,
      },
      3: {
        id: 2,
        name: "New Japan Pro Wrestling",
        cagematch_correlation_id: 3,
      },
    };
    const expected = [
      [
        {
          name: "NOAH Final Burning In Budokan",
          date: new Date("2013-05-11T00:00:00.000Z"),
          cagematch_correlation_id: 94108,
          promotion_id: 1,
        },
        {
          name: "NJPW/AJPW/NOAH All Together 2012",
          date: new Date("2012-02-19T00:00:00.000Z"),
          cagematch_correlation_id: 75061,
          promotion_id: 2,
        },
        {
          name: "NOAH The Navigation In February 2012 - Tag 3",
          date: new Date("2012-02-14T00:00:00.000Z"),
          cagematch_correlation_id: 75506,
          promotion_id: 1,
        },
      ],
      {
        94108: [1],
        75061: [1],
        75506: [1],
      },
    ];
    expect(buildEventData(matches, promotionMap)).toEqual(expected);
  });
  test("Should only return unique events", () => {
    const matches = [
      {
        wrestlers: [1, 2],
        promotion: { id: 2, name: "Pro Wrestling NOAH", url: "?id=8&nr=8" },
        date: "2013-05-11T00:00:00.000Z",
        event: { id: 94108, name: "NOAH Final Burning In Budokan" },
      },
      {
        wrestlers: [2, 4],
        promotion: { id: 2, name: "Pro Wrestling NOAH", url: "?id=8&nr=8" },
        date: "2013-05-11T00:00:00.000Z",
        event: { id: 94108, name: "NOAH Final Burning In Budokan" },
      },
    ];
    const promotionMap = {
      2: {
        id: 1,
        name: "Pro Wrestling NOAH",
        cagematch_correlation_id: 2,
      },
    };
    const expected = [
      [
        {
          name: "NOAH Final Burning In Budokan",
          date: new Date("2013-05-11T00:00:00.000Z"),
          cagematch_correlation_id: 94108,
          promotion_id: 1,
        },
      ],
      {
        94108: [1, 2, 4],
      },
    ];
    expect(buildEventData(matches, promotionMap)).toEqual(expected);
  });
  test("Should filter out events where an associated promotion cannot be found", () => {
    const matches = data.matches;
    const promotionMap = {
      3: {
        id: 2,
        name: "New Japan Pro Wrestling",
        cagematch_correlation_id: 3,
      },
    };
    const expected = [
      [
        {
          name: "NJPW/AJPW/NOAH All Together 2012",
          date: new Date("2012-02-19T00:00:00.000Z"),
          cagematch_correlation_id: 75061,
          promotion_id: 2,
        },
      ],
      {
        75061: [1],
      },
    ];
    expect(buildEventData(matches, promotionMap)).toEqual(expected);
  });
});
describe("buildEventWrestlerData", () => {
  test("Should return an array of prisma create objects when event data is passed", () => {
    const eventWrestlerData = {
      94108: [1],
      75061: [1],
      75506: [1],
    };
    const events = {
      94108: {
        id: 1,
        name: "NOAH Final Burning In Budokan",
        date: new Date("2013-05-11T00:00:00.000Z"),
        cagematch_correlation_id: 94108,
        promotion_id: 2,
      },
      75061: {
        id: 2,
        name: "NJPW/AJPW/NOAH All Together 2012",
        date: new Date("2012-02-19T00:00:00.000Z"),
        cagematch_correlation_id: 75061,
        promotion_id: 3,
      },
      75506: {
        id: 3,
        name: "NOAH The Navigation In February 2012 - Tag 3",
        date: new Date("2012-02-14T00:00:00.000Z"),
        cagematch_correlation_id: 75506,
        promotion_id: 2,
      },
    };
    const wrestlers = {
      1: {
        id: 1,
        cagematch_correlation_id: 1,
        name: "Kenta Kobashi",
        birthplace: "Fukuchiyama, Kyoto, Japan",
        gender: "male",
        height: "6' 1\" (186 cm)",
        weight: "253 lbs (115 kg)",
        debut: "26.02.1988",
        retired: "11.05.2013",
        nicknames: ['"Absolute Champion"', '"Iron Man"', '"Mr. Pro Wrestling"', '"Orange Crush"'],
        signature_moves: [
          "Moonsault Press",
          "Orange Crush",
          "Burning Hammer",
          "Burning Lariat",
          "Half Nelson Suplex",
          "Sleeper Suplex",
        ],
      },
    };

    const expected = [
      {
        event_id: 2,
        wrestler_id: 1,
      },
      {
        event_id: 3,
        wrestler_id: 1,
      },
      {
        event_id: 1,
        wrestler_id: 1,
      },
    ];
    expect(buildEventWrestlerData(eventWrestlerData, events, wrestlers)).toEqual(expected);
  });
  test("Should filter out any relationships where an associated event id is not found", () => {
    const eventWrestlerData = {
      94108: [1],
      75061: [1],
      75506: [1],
    };
    const events = {
      75061: {
        id: 2,
        name: "NJPW/AJPW/NOAH All Together 2012",
        date: new Date("2012-02-19T00:00:00.000Z"),
        cagematch_correlation_id: 75061,
        promotion_id: 3,
      },
      75506: {
        id: 3,
        name: "NOAH The Navigation In February 2012 - Tag 3",
        date: new Date("2012-02-14T00:00:00.000Z"),
        cagematch_correlation_id: 75506,
        promotion_id: 2,
      },
    };
    const wrestlers = {
      1: {
        id: 1,
        cagematch_correlation_id: 1,
        name: "Kenta Kobashi",
        birthplace: "Fukuchiyama, Kyoto, Japan",
        gender: "male",
        height: "6' 1\" (186 cm)",
        weight: "253 lbs (115 kg)",
        debut: "26.02.1988",
        retired: "11.05.2013",
        nicknames: ['"Absolute Champion"', '"Iron Man"', '"Mr. Pro Wrestling"', '"Orange Crush"'],
        signature_moves: [
          "Moonsault Press",
          "Orange Crush",
          "Burning Hammer",
          "Burning Lariat",
          "Half Nelson Suplex",
          "Sleeper Suplex",
        ],
      },
    };

    const expected = [
      {
        event_id: 2,
        wrestler_id: 1,
      },
      {
        event_id: 3,
        wrestler_id: 1,
      },
    ];
    expect(buildEventWrestlerData(eventWrestlerData, events, wrestlers)).toEqual(expected);
  });
  test("Should filter out any relationships where an associated wrestler id is not found", () => {
    const eventWrestlerData = {
      94108: [1],
      75061: [1],
      75506: [1],
    };
    const events = {
      94108: {
        id: 1,
        name: "NOAH Final Burning In Budokan",
        date: new Date("2013-05-11T00:00:00.000Z"),
        cagematch_correlation_id: 94108,
        promotion_id: 2,
      },
      75061: {
        id: 2,
        name: "NJPW/AJPW/NOAH All Together 2012",
        date: new Date("2012-02-19T00:00:00.000Z"),
        cagematch_correlation_id: 75061,
        promotion_id: 3,
      },
      75506: {
        id: 3,
        name: "NOAH The Navigation In February 2012 - Tag 3",
        date: new Date("2012-02-14T00:00:00.000Z"),
        cagematch_correlation_id: 75506,
        promotion_id: 2,
      },
    };
    const wrestlers = {};

    expect(buildEventWrestlerData(eventWrestlerData, events, wrestlers).length).toBe(0);
  });
});
describe("getCareerMap", () => {
  test("Should return a map of stints in a promotion by a wrestler when a career timeline is passed in", () => {
    const { id, career } = data.wrestlers[0];
    const expected = [
      {
        wrestlerId: 1,
        promotionId: 1,
        stints: [
          {
            start: 1987,
            end: 2001,
          },
          {
            start: 2009,
            end: 2010,
          },
          {
            start: 2011,
            end: 2013,
          },
        ],
      },
      {
        wrestlerId: 1,
        promotionId: 2,
        stints: [
          {
            start: 2000,
            end: 2010,
          },
          {
            start: 2011,
            end: 2014,
          },
        ],
      },
      {
        wrestlerId: 1,
        promotionId: 3,
        stints: [
          {
            start: 1990,
            end: 1991,
          },
          {
            start: 2003,
            end: 2004,
          },
          {
            start: 2009,
            end: 2010,
          },
          {
            start: 2011,
            end: 2013,
          },
        ],
      },
    ];

    expect(getCareerStints(id, career)).toEqual(expected);
  });
  test("Should not add an end date if the wrestler is actively performing in that promotion", () => {
    const wrestlerId = 1;
    const wrestlerCareer = {
      2023: [1],
      2024: [1],
      2025: [1],
    };
    const expected = [
      {
        wrestlerId: 1,
        promotionId: 1,
        stints: [
          {
            start: 2023,
          },
        ],
      },
    ];
    expect(getCareerStints(wrestlerId, wrestlerCareer)).toEqual(expected);
  });
});
describe("getStintsToAdd", () => {
  const wrestlerId = 1;
  const promotionId = 1;
  test("returns an array of Promotion_Wrestler prisma objects when an array of stints is passed", () => {
    const stints = [
      {
        start: 1997,
        end: 2000,
      },
      {
        start: 2011,
        end: 2013,
      },
    ];
    const expected = [
      {
        wrestler_id: 1,
        promotion_id: 1,
        debut: 1997,
        exit: 2000,
      },
      {
        wrestler_id: 1,
        promotion_id: 1,
        debut: 2011,
        exit: 2013,
      },
    ];
    expect(getStintsToAdd(wrestlerId, promotionId, stints)).toEqual(expected);
  });
  test("filters out any stints where the start date is undefined", () => {
    const stints = [
      {
        end: 2000,
      },
      {
        start: 2011,
        end: 2013,
      },
    ];
    const expected = [
      {
        wrestler_id: 1,
        promotion_id: 1,
        debut: 2011,
        exit: 2013,
      },
    ];
    expect(getStintsToAdd(wrestlerId, promotionId, stints as unknown as PromotionStint[])).toEqual(expected);
  });
});
describe("buildWrestlerPromotionData", () => {
  test("Should return an array of prisma create objects when wrestler data is passed", () => {
    const wrestlers = data.wrestlers;
    const wrestlerMap = {
      1: {
        id: 1,
        cagematch_correlation_id: 1,
        name: "Kenta Kobashi",
        birthplace: "Fukuchiyama, Kyoto, Japan",
        gender: "male",
        height: "6' 1\" (186 cm)",
        weight: "253 lbs (115 kg)",
        debut: "26.02.1988",
        retired: "11.05.2013",
        nicknames: ['"Absolute Champion"', '"Iron Man"', '"Mr. Pro Wrestling"', '"Orange Crush"'],
        signature_moves: [
          "Moonsault Press",
          "Orange Crush",
          "Burning Hammer",
          "Burning Lariat",
          "Half Nelson Suplex",
          "Sleeper Suplex",
        ],
      },
    };
    const promotionMap = {
      2: {
        id: 2,
        name: "Pro Wrestling NOAH",
        cagematch_correlation_id: 2,
      },
      3: {
        id: 3,
        name: "New Japan Pro Wrestling",
        cagematch_correlation_id: 3,
      },
      1: {
        id: 1,
        name: "All Japan Pro Wrestling",
        cagematch_correlation_id: 1,
      },
    };
    const expected = [
      {
        wrestler_id: 1,
        promotion_id: 1,
        debut: 1987,
        exit: 2001,
      },
      {
        wrestler_id: 1,
        promotion_id: 1,
        debut: 2009,
        exit: 2010,
      },
      {
        wrestler_id: 1,
        promotion_id: 1,
        debut: 2011,
        exit: 2013,
      },
      {
        wrestler_id: 1,
        promotion_id: 2,
        debut: 2000,
        exit: 2010,
      },
      {
        wrestler_id: 1,
        promotion_id: 2,
        debut: 2011,
        exit: 2014,
      },
      {
        wrestler_id: 1,
        promotion_id: 3,
        debut: 1990,
        exit: 1991,
      },
      {
        wrestler_id: 1,
        promotion_id: 3,
        debut: 2003,
        exit: 2004,
      },
      {
        wrestler_id: 1,
        promotion_id: 3,
        debut: 2009,
        exit: 2010,
      },
      {
        wrestler_id: 1,
        promotion_id: 3,
        debut: 2011,
        exit: 2013,
      },
    ];
    expect(buildWrestlerPromotionData(wrestlerMap, promotionMap, wrestlers)).toEqual(expected);
  });
});
