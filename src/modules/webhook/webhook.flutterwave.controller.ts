import { Request, Response } from "express";
import { FLW_SECRET_HASH } from "../../config/env";
import AppError from "../../utils/appError";
import webhookFlutterwaveService from "./webhook.flutterwave.service";

const flutterwaveWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const secretHash = FLW_SECRET_HASH;
  console.log("Expected hash:", FLW_SECRET_HASH);
  const signature = req.headers["verif-hash"];
  console.log("Received hash:", req.headers["verif-hash"]);
  if (signature !== secretHash) {
    throw new AppError("Invalid webhook signature", 400);
  }
  const result = await webhookFlutterwaveService.handleFlutterwaveWebhook(
    req.body,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

export default { flutterwaveWebhook };
