import Stripe from "stripe";
import AppError from "../utils/appError";
import { STRIPE_SECRET_KEY } from "./env";

if (!STRIPE_SECRET_KEY) {
  throw new AppError("STRIPE_SECRET_KEY", 500);
}

export const stripe = new Stripe(STRIPE_SECRET_KEY);
