import { STRIPE_WEBHOOK_SECRET } from "../../config/env";
import { stripe } from "../../config/stripe";
import { WebhookServiceInput } from "../../types";
import AppError from "../../utils/appError";
import paymentRepository from "../payment/payment.repository";
import webhookRepository from "./webhook.repository";

const handleStripeWebhook = async ({
  buffer,
  signature,
}: WebhookServiceInput): Promise<void> => {
  let event;
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new AppError("webhook secret not configured", 500);
  }
  try {
    event = stripe.webhooks.constructEvent(
      buffer,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );

    const existingEvent = await webhookRepository.findStripeEventId(event.id);
    if (existingEvent) {
      return;
    }

    await webhookRepository.createWebhookEvent({
      stripeEventId: event.id,
      eventType: event.type,
      payload: event.data.object as unknown as Record<string, unknown>,
    });
  } catch (error) {
    console.error(`Stripe webhook event error: ${error}`);
    throw new AppError("Invalid webhook", 400);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;

      await paymentRepository.updatePaymentStatus({
        providerIntentId: paymentIntent.id,
        status: "succeeded",
        paidAt: new Date(paymentIntent.created * 1000),
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;

      await paymentRepository.updatePaymentStatus({
        providerIntentId: paymentIntent.id,
        status: "failed",
      });
      break;
    }
    // case "payment_intent.canceled": {
    //   const paymentIntent = event.data.object;

    //   await paymentRepository.updatePaymentStatus({
    //     providerIntentId: paymentIntent.id,
    //     status: "canceled",
    //   });
    // }

    default:
      break;
  }

  await webhookRepository.markWebhookProcessed(event.id);
};

export default { handleStripeWebhook };
