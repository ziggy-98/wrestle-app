import joi from "joi";

const wrestlerSchema = joi.object({
  id: joi.number().required(),
  name: joi.string().required(),
  details: joi
    .object({
      birthplace: joi.string().required(),
      gender: joi.string().required().allow("male", "female"),
      height: joi.string().optional().default("Unknown"),
      weight: joi.string().optional().default("Unknown"),
      careerStart: joi.string().required(),
      careerEnd: joi.string().optional(),
      nicknames: joi.array().items(joi.string()).optional().default([]),
      signatureMoves: joi.array().items(joi.string()).optional().default([]),
    })
    .required(),
  career: joi.object().pattern(joi.string(), joi.array().items(joi.number())).required(),
});

const promotionSchema = joi.object({
  id: joi.number().required(),
  name: joi.string().required(),
});

const titleReignSchema = joi.object({
  champion: joi.number().required(),
  heldFrom: joi.string().required(),
  heldTo: joi.string().optional(),
});

const titleSchema = joi.object({
  id: joi.number().required(),
  name: joi.string().required(),
  promotion: joi.number().required(),
  reigns: joi.array().items(titleReignSchema),
});

const matchSchema = joi.object({
  wrestlers: joi.array().items(joi.number()).min(1),
  promotion: joi.object({
    id: joi.number(),
    name: joi.string(),
  }),
  date: joi.string(),
  event: joi.object({
    id: joi.number(),
    name: joi.string(),
  }),
});

export const inputSchema = joi.object({
  wrestlers: joi.array().items(wrestlerSchema),
  matches: joi.array().items(matchSchema),
  titles: joi.array().items(titleSchema),
  promotions: joi.array().items(promotionSchema),
});
