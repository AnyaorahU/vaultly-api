import { FlutterwaveWebhookBody } from "../../types";
import paymentRepository from "../payment/payment.repository";
import webhookRepository from "./webhook.repository";

const handleFlutterwaveWebhook = async (
  body: FlutterwaveWebhookBody,
): Promise<void> => {
  const eventId = body.id;

  const existingEvent = await webhookRepository.findStripeEventId(eventId);
  if (existingEvent) {
    return;
  }

  await webhookRepository.createWebhookEvent({
    stripeEventId: eventId,
    eventType: body.event,
    payload: body.data as Record<string, unknown>,
  });

  if (body.event === "charge.completed") {
    const txRef = body.data.tx_ref;

    await paymentRepository.updatePaymentStatus({
      providerIntentId: txRef,
      status: "succeeded",
      paidAt: new Date(),
    });
  }

  if (body.event === "charge.failed") {
    const txRef = body.data.tx_ref;

    await paymentRepository.updatePaymentStatus({
      providerIntentId: txRef,
      status: "failed",
    });
  }

  await webhookRepository.markWebhookProcessed(eventId);
};

export default { handleFlutterwaveWebhook };
