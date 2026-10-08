import { stripe } from "../../config/stripe";
import {
  CreatePaymentResponse,
  CreatePaymentServiceInput,
  IdPaymentServiceInput,
  Payments,
} from "../../types";
import AppError from "../../utils/appError";
import paymentRepository from "./payment.repository";

const createPayments = async ({
  userId,
  amount,
  currency,
  description,
  provider,
}: CreatePaymentServiceInput): Promise<CreatePaymentResponse> => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { userId, description: description ?? "" },
  });

  const payments = await paymentRepository.createPayments({
    userId,
    amount,
    currency,
    description,
    provider,
    providerIntentId: paymentIntent.id,
  });

  return { payments, clientSecret: paymentIntent.client_secret };
};

const getPaymentById = async ({
  id,
  userId,
}: IdPaymentServiceInput): Promise<Payments> => {
  const payment = await paymentRepository.getPaymentById(id);
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.user_id !== userId) {
    throw new AppError("Forbidden", 403);
  }

  return payment;
};

const getPaymentByUserId = async (userId: string): Promise<Payments[]> => {
  const payments = await paymentRepository.getPaymentByUserId(userId);

  return payments;
};
export default { createPayments, getPaymentById, getPaymentByUserId };
