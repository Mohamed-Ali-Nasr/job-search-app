import { RequestHandler } from "express";
import { ValidationResult } from "joi";

const reqKeys = ["body", "params", "query", "headers"];

export const validationMiddleware = (schema: any): RequestHandler => {
  return (req, res, next) => {
    let validationError = [];

    for (const key of reqKeys) {
      const validationResult: ValidationResult = schema[key]?.validate(
        req[key as keyof RequestHandler],
        {
          abortEarly: false,
        }
      );

      if (validationResult?.error) {
        validationError.push(...validationResult.error.details);
      }
    }

    validationError.length ? res.status(400).json(validationError) : next();
  };
};
