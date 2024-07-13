import { NextFunction, Response } from "express";
import { IRequest } from "../types/index.type";
import createHttpError from "http-errors";

export const authorization = (allowedRoles: string[]) => {
  return (req: IRequest, res: Response, next: NextFunction) => {
    const user = req.authUser;

    if (!user) {
      next(createHttpError(401, "User Not Authenticated"));
    }

    if (!allowedRoles.includes(user!.role)) {
      next(
        createHttpError(
          403,
          "Authorization Error, You Are Not Allowed To Access This Route"
        )
      );
    }

    next();
  };
};
