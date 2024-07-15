import coreJoi from "joi";
import joiDate from "@joi/date";
import { objectIdRule } from "../utils/validateRule.util";
const Joi = coreJoi.extend(joiDate) as typeof coreJoi;

export const signupSchema = {
  body: Joi.object({
    firstName: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "First Name Must Start With At Least Three Alphabet Letters",
      }),

    lastName: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "Last Name Must Start With At Least Three Alphabet Letters",
      }),

    username: Joi.string().optional(),

    email: Joi.string().email().required(),

    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password Must Be At Least 8 characters long. ensures there is at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character from the set @$!%*?&.",
      }),

    DOB: Joi.date().format("YYYY-MM-DD").utc().required().messages({
      "date.format": "Invalid date format. Must be YYYY-MM-DD.",
    }),

    mobileNumber: Joi.string()
      .pattern(/^01[0-2,5]\d{1,8}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Invalid mobile number. Must be an 11-digit number.",
      }),

    role: Joi.string().valid("User", "Company_HR").required(),

    status: Joi.string().valid("online", "offline").optional(),

    recoveryEmail: Joi.string().email().required(),
  }),
};

export const signinSchema = {
  body: Joi.object({
    email: Joi.string().email().optional(),

    password: Joi.string().required(),

    mobileNumber: Joi.string().optional(),
  }),
};

export const updateAccountSchema = {
  body: Joi.object({
    firstName: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "First Name Must Start With At Least Three Alphabet Letters",
      }),

    lastName: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "Last Name Must Start With At Least Three Alphabet Letters",
      }),

    email: Joi.string().email(),

    DOB: Joi.date().format("YYYY-MM-DD").utc().messages({
      "date.format": "Invalid date format. Must be YYYY-MM-DD.",
    }),

    mobileNumber: Joi.string()
      .pattern(/^01[0-2,5]\d{1,8}$/)
      .messages({
        "string.pattern.base":
          "Invalid mobile number. Must be an 11-digit number.",
      }),

    recoveryEmail: Joi.string().email(),
  }).optional(),
};

export const getProfileDataSchema = {
  params: Joi.object({
    userId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const updatePasswordSchema = {
  body: Joi.object({
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password Must Be At Least 8 characters long. ensures there is at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character from the set @$!%*?&.",
      }),
  }),
};

export const verifyEmailSchema = {
  params: Joi.object({
    token: Joi.string().required(),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password Must Be At Least 8 characters long. ensures there is at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character from the set @$!%*?&.",
      }),

    email: Joi.string().email().required(),

    otp: Joi.string()
      .required()
      .pattern(/^\d{6}$/)
      .messages({
        "string.pattern.base": "otp Must Be 6 digits long.",
      }),
  }),
};
