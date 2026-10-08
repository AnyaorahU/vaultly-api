import { pool } from "../../config/database";
import { WebhookEvents, WebhookRepositoryInput } from "../../types";

const findStripeEventId = async (
  stripeEventId: string,
): Promise<WebhookEvents | null> => {
  const result = await pool.query<WebhookEvents>(
    `SELECT * FROM webhook_events  WHERE stripe_event_id = $1`,
    [stripeEventId],
  );

  return result.rows[0] || null;
};

const createWebhookEvent = async ({
  stripeEventId,
  eventType,
  payload,
}: WebhookRepositoryInput): Promise<WebhookEvents> => {
  const result = await pool.query(
    `INSERT INTO webhook_events (stripe_event_id, type, payload, payment_id, processed) VALUES ($1, $2, $3, $4, false) RETURNING *`,
    [stripeEventId, eventType, JSON.stringify(payload), null],
  );

  return result.rows[0];
};

const markWebhookProcessed = async (stripeEventId: string): Promise<void> => {
  const result = await pool.query(
    `UPDATE webhook_events SET processed = true WHERE stripe_event_id = $1`,
    [stripeEventId],
  );
};

export default { findStripeEventId, createWebhookEvent, markWebhookProcessed };
