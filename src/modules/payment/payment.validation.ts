import z from "zod";

export const paymentSchema = z.object({
  amount: z.number().positive().min(100, "Strip rejects amount below that"),
  currency: z.string().default("NGN"),
  description: z.string().optional(),
  provider: z.enum(["stripe", "paystack", "flutterwave"]).default("stripe"),
});
