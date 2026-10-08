import { pool } from "../../config/database";
import { CreatePaymentInput, Payments, UpdatePaymentInput } from "../../types";

const createPayments = async ({
  userId,
  amount,
  currency,
  description,
  provider,
  providerIntentId,
}: CreatePaymentInput): Promise<Payments> => {
  const result = await pool.query(
    `INSERT INTO payments (user_id, amount, currency, description, provider, provider_intent_id) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`,
    [userId, amount, currency, description ?? null, provider, providerIntentId],
  );

  return result.rows[0];
};

const updatePaymentStatus = async ({
  providerIntentId,
  status,
  paidAt,
}: UpdatePaymentInput): Promise<Payments> => {
  const result = await pool.query(
    `UPDATE payments 
    SET status = $1, paid_at = $2, updated_at = NOW()
    WHERE provider_intent_id = $3
    RETURNING *`,
    [status, paidAt, providerIntentId],
  );

  return result.rows[0];
};

const getPaymentById = async (id: string): Promise<Payments | null> => {
  const result = await pool.query(`SELECT * FROM payments WHERE id = $1`, [id]);

  return result.rows[0] || null;
};

const getPaymentByUserId = async (userId: string): Promise<Payments[]> => {
  const result = await pool.query(
    `SELECT * FROM payments 
    WHERE user_id = $1
    ORDER BY created_at DESC `,
    [userId],
  );

  return result.rows;
};

export default {
  createPayments,
  updatePaymentStatus,
  getPaymentById,
  getPaymentByUserId,
};
