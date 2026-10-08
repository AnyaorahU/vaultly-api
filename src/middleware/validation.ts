import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { ZodType } from "zod";

const validation = (schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(result.error.issues[0].message, 400);
    }

    req.body = result.data;
    next();
  };
};

export default validation;
