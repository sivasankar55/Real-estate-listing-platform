import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const authenticate: RequestHandler = async (request, _response, next) => {
  const [scheme, token] = request.header("authorization")?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "UNAUTHORIZED", "Authentication is required."));
  }

  try {
    const payload = verifyAccessToken(token);
    if (!payload.sub || !Number.isInteger(payload.tokenVersion)) throw new Error("Invalid access token payload");
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { tokenVersion: true } });
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new Error("Access token has been revoked");
    }
    request.user = { id: payload.sub };
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Your access token is invalid or expired."));
  }
};
