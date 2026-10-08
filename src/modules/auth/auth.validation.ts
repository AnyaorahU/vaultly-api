import z from "zod";

export const registrationSchema = z.object({
  name: z.string().trim(),
  email: z.string().email("provide a valid email").toLowerCase().trim(),
  password: z.string().min(6, "Minimum of 6 characters").trim(),
});

export const loginSchema = z.object({
  email: z.string().email("Provide a valid email").toLowerCase().trim(),
  password: z.string().trim(),
});
