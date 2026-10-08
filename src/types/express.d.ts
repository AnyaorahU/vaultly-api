import { SafeUser } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export {};
