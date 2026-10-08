import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_EXPIRES, JWT_SECRET } from "../config/env.js";

const generateToken = (id: string | object): string => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, JWT_SECRET);
};

export default { generateToken, verifyToken };
