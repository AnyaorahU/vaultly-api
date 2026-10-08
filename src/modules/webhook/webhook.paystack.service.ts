import paymentRepository from "../payment/payment.repository";
import webhookRepository from "./webhook.repository";
import { PaystackWebhookBody } from "../../types";

const handlePaystackWebhook = async (
  body: PaystackWebhookBody,
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

  if (body.event === "charge.success") {
    const reference = body.data.reference;

    await paymentRepository.updatePaymentStatus({
      providerIntentId: reference,
      status: "succeeded",
      paidAt: new Date(),
    });
  }

  if (body.event === "charge.failed") {
    const reference = body.data.reference;

    await paymentRepository.updatePaymentStatus({
      providerIntentId: reference,
      status: "failed",
    });
  }
  await webhookRepository.markWebhookProcessed(eventId);
};

export default { handlePaystackWebhook };
