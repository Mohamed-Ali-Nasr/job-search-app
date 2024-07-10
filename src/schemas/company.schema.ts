import Joi from "joi";
import { objectIdRule } from "../utils/validateRule.util";

export const addCompanySchema = {
  body: Joi.object({
    companyName: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "Company Name Must Start With At Least Three Alphabet Letters",
      }),

    description: Joi.string().required(),

    industry: Joi.string().required(),

    address: Joi.string().required(),

    numberOfEmployees: Joi.number().max(100).min(10).optional(),

    companyEmail: Joi.string().email().required(),
  }),
};

export const updateCompanySchema = {
  body: addCompanySchema.body,

  params: Joi.object({
    companyId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const deleteCompanySchema = {
  params: updateCompanySchema.params,
};

export const searchCompanySchema = {
  query: Joi.object({
    companyName: Joi.string().required().messages({
      "any.required": " companyName Query Is Required",
    }),
  }),
};
