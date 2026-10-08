import { Router } from "express";
import authMiddleware from "../../middleware/authMiddleware";
import asyncHandler from "../../utils/asyncHandler";
import paymentController from "./payment.controller";
import validation from "../../middleware/validation";
import { paymentSchema } from "./payment.validation";
import webhookPaystackController from "../webhook/webhook.paystack.controller";

const paymentRoute = Router();

paymentRoute.post(
  "/create-intent",
  authMiddleware,
  validation(paymentSchema),
  asyncHandler(paymentController.createPayments),
);

paymentRoute.get(
  "/:id",
  authMiddleware,
  asyncHandler(paymentController.getPaymentById),
);

paymentRoute.get(
  "/",
  authMiddleware,
  asyncHandler(paymentController.getPaymentByUserId),
);

paymentRoute.post(
  "/paystack/initialize",
  authMiddleware,
  validation(paymentSchema),
  asyncHandler(paymentController.createPaystackPayment),
);

paymentRoute.get(
  "/paystack/verify/:reference",
  authMiddleware,
  validation(paymentSchema),
  asyncHandler(paymentController.verifyPaystackPayment),
);

paymentRoute.post(
  "/flutterwave/initialize",
  authMiddleware,
  validation(paymentSchema),
  asyncHandler(paymentController.createFlutterwavePayment),
);

export default paymentRoute;
