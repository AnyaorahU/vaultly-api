import { Request, Response } from "express";
import crypto from "crypto";
import { PAYSTACK_SECRET_KEY } from "../../config/env";
import AppError from "../../utils/appError";
import webhookPaystackSrervice from "./webhook.paystack.service";
const paystackWebhook = async (req: Request, res: Response): Promise<void> => {
  if (!PAYSTACK_SECRET_KEY) {
    throw new AppError("Paystack secret not configured", 500);
  }
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    throw new AppError("Invalid webhook signature", 400);
  }

  const result = await webhookPaystackSrervice.handlePaystackWebhook(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export default { paystackWebhook };
