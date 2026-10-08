import bcrypt from "bcrypt";
import AppError from "../../utils/appError";
import authRepository from "./auth.repository";
import {
  AuthResponse,
  CreateUserInput,
  LoginUserInput,
  SafeUser,
} from "../../types";
import jwt from "../../utils/jwt";

const register = async ({
  name,
  email,
  password,
}: CreateUserInput): Promise<AuthResponse> => {
  const exist = await authRepository.getUserByEmail(email);
  if (exist) {
    throw new AppError("Email already exist, Please login", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({
    name,
    email,
    password: passwordHash,
  });
  if (!user) {
    throw new AppError("Failed to create user", 500);
  }

  const token = await jwt.generateToken(user.id);

  return { user, token };
};

const login = async ({
  email,
  password,
}: LoginUserInput): Promise<AuthResponse> => {
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw new AppError("invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("invalid credentials", 401);
  }

  const token = await jwt.generateToken(user.id);

  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};

export default { register, login };
