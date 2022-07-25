import { MiddlewareFn } from "type-graphql";
import jwt from 'jsonwebtoken';

export const AuthGuard: MiddlewareFn = async ({ context }: any, next) => {
  if (!context.req.headers.authorization) {
    throw new Error("Not authorized");
  }
  try {
    const token = context.req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET)
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Tooken expired");
    }
    throw new Error("Not authorized");
  }
  return next();
};