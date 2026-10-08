import { Request, Response } from "express";
import AppError from "../../utils/appError";
import webhookService from "./webhook.service";

const handleStripeWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const buffer = req.body;
  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    throw new AppError("Missing stripe signature", 400);
  }

  const webhook = await webhookService.handleStripeWebhook({
    buffer,
    signature,
  });

  res.status(200).json({
    success: true,
    message: "Webhook recieved successful",
    data: webhook,
  });
};

export default { handleStripeWebhook };
