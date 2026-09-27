import bcrypt from "bcrypt";
import { createHash, randomUUID } from "node:crypto";
import { refreshTokenTtlMs } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import type { z } from "zod";
import type { loginSchema, registerSchema } from "./validation.js";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

const userSelect = { id: true, name: true, email: true, phone: true, tokenVersion: true } as const;
export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new AppError(409, "EMAIL_IN_USE", "An account with this email already exists.");
  }

  const { password, ...userData } = input;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { ...userData, passwordHash },
    select: userSelect
  });

  return createSession(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...userSelect, passwordHash: true }
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return createSession(safeUser);
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: userSelect });
  const session = await prisma.authSession.findUnique({ where: { id: payload.sessionId } });
  if (
    !user ||
    !session ||
    session.userId !== payload.sub ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    user.tokenVersion !== payload.tokenVersion ||
    session.tokenHash !== hashToken(refreshToken)
  ) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
  }

  return rotateSession(user, session.id);
}

export async function logout(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.$transaction([
      prisma.authSession.updateMany({ where: { id: payload.sessionId, revokedAt: null }, data: { revokedAt: new Date() } }),
      prisma.user.update({ where: { id: payload.sub }, data: { tokenVersion: { increment: 1 } } })
    ]);
  } catch {
    // Logout remains idempotent when the cookie is stale or malformed.
  }
}

export async function currentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true }
  });
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found.");
  return user;
}

async function createSession(user: { id: string; name: string; email: string; phone: string | null; tokenVersion: number }) {
  const sessionId = randomUUID();
  const refreshToken = signRefreshToken(user.id, user.tokenVersion, sessionId);
  await prisma.authSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTokenTtlMs)
    }
  });
  return {
    accessToken: signAccessToken(user.id, user.tokenVersion),
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
  };
}

async function rotateSession(
  user: { id: string; name: string; email: string; phone: string | null; tokenVersion: number },
  previousSessionId: string
) {
  const sessionId = randomUUID();
  const refreshToken = signRefreshToken(user.id, user.tokenVersion, sessionId);
  await prisma.$transaction(async (transaction) => {
    const revoked = await transaction.authSession.updateMany({
      where: { id: previousSessionId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    if (revoked.count !== 1) throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
    await transaction.authSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTokenTtlMs)
      }
    });
  });
  return {
    accessToken: signAccessToken(user.id, user.tokenVersion),
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
  };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
