import axios from "axios";
import { FLW_SECRET_KEY } from "./env";
import AppError from "../utils/appError";

if (!FLW_SECRET_KEY) {
  throw new AppError("FLW_SECRET_KEY is not defined", 500);
}

export const flutterwaveClient = axios.create({
  baseURL: "https://api.flutterwave.com/v3",
  headers: {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});
