//========================
// AUTH | USER
//========================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // full DB row — used internally only
  role: string;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<User, "password">; // strips password — used in responses
// export type CreateUserInput = Pick<User, "name" | "email" | "password">;

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export type LoginUserInput = Pick<CreateUserInput, "email" | "password">;

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export interface TokenPayload {
  id: string;
}

//========================
// PAYMENT
//========================

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded";

export type PaymentProvider = "stripe" | "paystack" | "flutterwave";

export interface CreatePaymentInput {
  userId: string;
  amount: number;
  currency: string;
  description?: string;
  provider: PaymentProvider;
  providerIntentId: string;
}

export type CreatePaymentServiceInput = Omit<
  CreatePaymentInput,
  "providerIntentId"
>;

export interface CreatePaymentResponse {
  payments: Payments;
  clientSecret: string | null;
}

export interface UpdatePaymentInput {
  providerIntentId: string;
  status: PaymentStatus;
  paidAt?: Date;
}

export interface Payments {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  provider_intent_id: string;
  description: string | null;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface IdPaymentServiceInput {
  id: string;
  userId: string;
}

//========================
// STRIPE WEBHOOK
//========================
export interface WebhookEvents {
  id: string;
  stripe_event_id: string;
  payment_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: Date;
}

export interface WebhookServiceInput {
  buffer: Buffer;
  signature: string;
}

export interface WebhookRepositoryInput {
  stripeEventId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

//========================
// PAYSTACK
//========================
export type PaystackInitializeInput = Omit<
  CreatePaymentServiceInput,
  "provider"
> & { email: string };

export interface PaystackInitializeResponse {
  authUrl: string;
  reference: string;
  payment: Payments;
}

// export interface PaystackWebhookBody {
//   event: string;
//   data: {
//     id: number;
//     reference: string;
//     amount: number;
//     currency: string;
//     status: string;
//     paid_at?: string;
//   };
// }

export interface PaystackWebhookBody {
  id: string;
  event: string;
  data: {
    reference: string;
    [key: string]: unknown;
  };
}

//========================
// FLUTTERWAVE
//========================
export type FlutterwaveInitializeInput = Omit<
  CreatePaymentServiceInput,
  "provider"
> & { email: string; name: string };

export interface FlutterwaveInitializeResponse {
  authUrl: string;
  payment: Payments;
}

export interface FlutterwaveWebhookBody {
  id: string;
  event: string;
  data: {
    tx_ref: string;
    status: string;
    [key: string]: unknown;
  };
}
