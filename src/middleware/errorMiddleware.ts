import { Request, Response, NextFunction } from "express";

const errorMiddleware = (
  err: Error & { statusCode: number },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error caught by errorMiddleware:", err);
  const statusCode = err.statusCode ?? 500;
  const isOperational = (err as any).isOperational;
  const message = isOperational ? err.message : "Something went wrong";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
