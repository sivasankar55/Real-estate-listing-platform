import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type AccessPayload = { sub: string; tokenVersion: number };
type RefreshPayload = AccessPayload & { sessionId: string };

export function signAccessToken(userId: string, tokenVersion: number) {
  return jwt.sign({ sub: userId, tokenVersion }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"]
  });
}

export function signRefreshToken(userId: string, tokenVersion: number, sessionId: string) {
  return jwt.sign({ sub: userId, tokenVersion, sessionId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshPayload;
}
