import { config } from "dotenv";
import { SignOptions } from "jsonwebtoken";

config({ path: ".env", override: false });

export const PORT = Number(process.env.PORT);
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES = process.env.JWT_EXPIRES as SignOptions["expiresIn"];
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT);
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env
  .STRIPE_WEBHOOK_SECRET as string;
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
export const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
export const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH;
