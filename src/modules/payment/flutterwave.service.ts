import crypto from "crypto";
import { flutterwaveClient } from "../../config/flutterwave";
import {
  FlutterwaveInitializeInput,
  FlutterwaveInitializeResponse,
} from "../../types";
import paymentRepository from "./payment.repository";

const initializeFlutterwavePayment = async ({
  userId,
  email,
  name,
  amount,
  currency,
  description,
}: FlutterwaveInitializeInput): Promise<FlutterwaveInitializeResponse> => {
  const uuid = crypto.randomUUID();
  const response = await flutterwaveClient.post("/payments", {
    tx_ref: uuid,
    amount,
    currency,
    redirect_url: "http://localhost:5000/api/v1/payments/flutterwave/callback",
    customer: { email, name },
    metadata: { userId, description: description ?? "" },
  });

  const { link } = response.data.data;

  const payment = await paymentRepository.createPayments({
    userId,
    amount,
    currency,
    description,
    provider: "flutterwave",
    providerIntentId: uuid,
  });

  return { payment, authUrl: link };
};

export default { initializeFlutterwavePayment };
