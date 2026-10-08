import express from "express";
import errorMiddleware from "./middleware/errorMiddleware";
import authRoute from "./modules/auth/auth.routes";
import paymentRoute from "./modules/payment/payment.routes";
import webhookController from "./modules/webhook/webhook.controller";
import asyncHandler from "./utils/asyncHandler";
import webhookPaystackController from "./modules/webhook/webhook.paystack.controller";
import webhookFlutterwaveController from "./modules/webhook/webhook.flutterwave.controller";

const app = express();

app.post(
  "/api/v1/webhook/stripe",
  express.raw({ type: "application/json" }),
  asyncHandler(webhookController.handleStripeWebhook),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(
  "/api/v1/webhook/paystack",
  asyncHandler(webhookPaystackController.paystackWebhook),
);

app.post(
  "/api/v1/webhook/flutterwave",
  asyncHandler(webhookFlutterwaveController.flutterwaveWebhook),
);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/payments", paymentRoute);

app.get("/health", (req, res) => {
  res.send("Vaultly-Api is Live");
});

app.use(errorMiddleware);

export default app;
