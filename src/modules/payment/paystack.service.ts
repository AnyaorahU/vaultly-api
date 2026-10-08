import axios from "axios";
import { paystackClient } from "../../config/paystack";
import {
  Payments,
  PaystackInitializeInput,
  PaystackInitializeResponse,
} from "../../types";
import paymentRepository from "./payment.repository";
import AppError from "../../utils/appError";

const initializePaystackPayment = async ({
  userId,
  email,
  amount,
  currency,
  description,
}: PaystackInitializeInput): Promise<PaystackInitializeResponse> => {
  const response = await paystackClient.post("/transaction/initialize", {
    email,
    amount,
    currency,
    metadata: { userId, description: description ?? "" },
  });

  const { authorization_url, reference } = response.data.data;

  const payment = await paymentRepository.createPayments({
    userId,
    amount,
    currency,
    description,
    provider: "paystack",
    providerIntentId: reference,
  });

  return { payment, authUrl: authorization_url, reference };
};

const verifyPaystackPayment = async (reference: string): Promise<Payments> => {
  const response = await paystackClient.get(`/transaction/verify/${reference}`);

  const { status, paid_at } = response.data.data;

  const paymentStatus = status === "success" ? "succeeded" : "failed";

  const payment = await paymentRepository.updatePaymentStatus({
    providerIntentId: reference,
    status: paymentStatus,
    paidAt: paid_at ? new Date(paid_at) : undefined,
  });
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  return payment;
};

export default { initializePaystackPayment, verifyPaystackPayment };
