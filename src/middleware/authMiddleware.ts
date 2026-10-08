import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import jwt from "../utils/jwt";
import authRepository from "../modules/auth/auth.repository";
import { TokenPayload } from "../types";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }
    const token = authHeader.split(" ")[1];

    const payload = (await jwt.verifyToken(token)) as TokenPayload;
    if (!payload) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await authRepository.getUserById(payload.id);
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    req.user = user;

    next();
  } catch (error: any) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new AppError("Unauthorized", 401));
    }
    next(error);
  }
};

export default authMiddleware;
