import axios from "axios";
import AppError from "../utils/appError";
import { PAYSTACK_SECRET_KEY } from "./env";

if (!PAYSTACK_SECRET_KEY) {
  throw new AppError("Paystack secret is not defined", 500);
}

export const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});
