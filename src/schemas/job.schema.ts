import Joi from "joi";
import { objectIdRule } from "../utils/validateRule.util";

export const addJobSchema = {
  body: Joi.object({
    jobTitle: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "Company Name Must Start With At Least Three Alphabet Letters",
      }),

    jobLocation: Joi.string().valid("onsite", "remotely", "hybrid").required(),

    workingTime: Joi.string().valid("part-time", "full-time").required(),

    seniorityLevel: Joi.string()
      .valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO")
      .required(),

    jobDescription: Joi.string().optional(),

    technicalSkills: Joi.array().items(Joi.string()).required(),

    softSkills: Joi.array().items(Joi.string()).required(),
  }),

  params: Joi.object({
    companyId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const updateJobSchema = {
  body: addJobSchema.body,

  params: Joi.object({
    jobId: Joi.string().custom(objectIdRule).required(),
    companyId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const deleteJobSchema = {
  params: updateJobSchema.params,
};

export const filterJobsSchema = {
  query: Joi.object({
    jobTitle: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "Company Name Must Start With At Least Three Alphabet Letters",
      }),

    jobLocation: Joi.string().valid("onsite", "remotely", "hybrid"),

    seniorityLevel: Joi.string().valid(
      "Junior",
      "Mid-Level",
      "Senior",
      "Team-Lead",
      "CTO"
    ),
    workingTime: Joi.string().valid("part-time", "full-time"),

    technicalSkills: Joi.string(),
  }).optional(),
};

export const applyJobSchema = {
  body: Joi.object({
    userTechSkills: Joi.array().items(Joi.string()).required(),

    userSoftSkills: Joi.array().items(Joi.string()).required(),

    userResume: Joi.string()
      .pattern(/^[A-Za-z0-9_()\-\[\]]+\.pdf$/)
      .required()
      .messages({
        "string.pattern.base": "User Resume Must Be A Valid (.pdf) File",
      }),
  }),

  params: updateJobSchema.params,
};
