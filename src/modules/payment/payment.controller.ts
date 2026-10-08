import { Request, Response } from "express";
import paymentService from "./payment.service";
import AppError from "../../utils/appError";
import paystackService from "./paystack.service";
import flutterwaveService from "./flutterwave.service";

const createPayments = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const { id: userId } = req.user;
  const { amount, currency, description, provider } = req.body;

  const { payments, clientSecret } = await paymentService.createPayments({
    userId,
    amount,
    currency,
    description,
    provider,
  });

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    data: {
      payments,
      clientSecret,
    },
  });
};

const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const userId = req.user.id;

  const payment = await paymentService.getPaymentById({ id, userId });

  res.status(200).json({
    success: true,
    data: payment,
  });
};

const getPaymentByUserId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const { id: userId } = req.user;
  const payment = await paymentService.getPaymentByUserId(userId);

  res.status(200).json({
    success: true,
    data: payment,
  });
};

const createPaystackPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const { amount, currency, description } = req.body;
  const { id: userId, email } = req.user;

  const payment = await paystackService.initializePaystackPayment({
    userId,
    email,
    amount,
    currency,
    description,
  });

  res.status(201).json({
    success: true,
    data: payment,
  });
};

const verifyPaystackPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const reference = req.params.reference as string;

  const verify = await paystackService.verifyPaystackPayment(reference);

  res.status(200).json({
    success: true,
    message: "payment successful",
    data: verify,
  });
};

const createFlutterwavePayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const { id: userId, email, name } = req.user;
  const { amount, currency, description } = req.body;

  const payment = await flutterwaveService.initializeFlutterwavePayment({
    userId,
    email,
    name,
    amount,
    currency,
    description,
  });

  res.status(201).json({
    success: true,
    data: payment,
  });
};

export default {
  createPayments,
  getPaymentById,
  getPaymentByUserId,
  createPaystackPayment,
  verifyPaystackPayment,
  createFlutterwavePayment,
};
