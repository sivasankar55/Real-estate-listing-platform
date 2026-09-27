import type { RequestHandler } from "express";
import { env, refreshTokenTtlMs } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { loginSchema, registerSchema } from "./validation.js";
import * as authService from "./service.js";

const refreshCookie = "refreshToken";
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: refreshTokenTtlMs,
  path: "/api/auth"
};

export const register: RequestHandler = async (request, response) => {
  const input = registerSchema.safeParse(request.body);
  if (!input.success) throw new AppError(422, "VALIDATION_ERROR", "Invalid registration details.", input.error.flatten());

  const session = await authService.register(input.data);
  response.cookie(refreshCookie, session.refreshToken, cookieOptions).status(201).json({
    accessToken: session.accessToken,
    user: session.user
  });
};

export const login: RequestHandler = async (request, response) => {
  const input = loginSchema.safeParse(request.body);
  if (!input.success) throw new AppError(422, "VALIDATION_ERROR", "Invalid login details.", input.error.flatten());

  const session = await authService.login(input.data);
  response.cookie(refreshCookie, session.refreshToken, cookieOptions).json({
    accessToken: session.accessToken,
    user: session.user
  });
};

export const refresh: RequestHandler = async (request, response) => {
  const token = request.cookies[refreshCookie];
  if (!token) throw new AppError(401, "MISSING_REFRESH_TOKEN", "Please sign in again.");

  const session = await authService.refresh(token);
  response.cookie(refreshCookie, session.refreshToken, cookieOptions).json({
    accessToken: session.accessToken,
    user: session.user
  });
};

export const logout: RequestHandler = async (request, response) => {
  const token = request.cookies[refreshCookie];
  if (token) await authService.logout(token);

  response.clearCookie(refreshCookie, cookieOptions).status(204).send();
};

export const me: RequestHandler = async (request, response) => {
  if (!request.user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  response.json(await authService.currentUser(request.user.id));
};
