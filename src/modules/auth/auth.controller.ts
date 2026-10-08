import { Request, Response } from "express";
import authService from "./auth.service";
import { SafeUser } from "../../types";

const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const { user, token } = await authService.register({ name, email, password });

  res.status(201).json({
    success: true,
    message: "Created successful",
    data: user,
    token,
  });
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const { user, token } = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: user,
    token,
  });
};

const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: user,
  });
};

export default { register, login, getMe };
