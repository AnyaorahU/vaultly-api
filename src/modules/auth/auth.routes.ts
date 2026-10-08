import { Router } from "express";
import validation from "../../middleware/validation";
import { loginSchema, registrationSchema } from "./auth.validation";
import asyncHandler from "../../utils/asyncHandler";
import authController from "./auth.controller";
import authMiddleware from "../../middleware/authMiddleware";

const authRoute = Router();

authRoute.post(
  "/register",
  validation(registrationSchema),
  asyncHandler(authController.register),
);

authRoute.post(
  "/login",
  validation(loginSchema),
  asyncHandler(authController.login),
);

authRoute.get("/me", authMiddleware, asyncHandler(authController.getMe));

export default authRoute;
