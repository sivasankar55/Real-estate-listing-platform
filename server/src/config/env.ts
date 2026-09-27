import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().url(),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional()
});

export const env = envSchema.parse(process.env);

const durationMultipliers = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  y: 365.25 * 24 * 60 * 60 * 1000
} as const;

export function durationToMilliseconds(value: string) {
  const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w|y)$/i.exec(value.trim());
  if (!match) throw new Error(`Invalid duration: ${value}`);

  const milliseconds = Number(match[1]) * durationMultipliers[match[2].toLowerCase() as keyof typeof durationMultipliers];
  if (!Number.isSafeInteger(milliseconds) || milliseconds <= 0) throw new Error(`Invalid duration: ${value}`);
  return milliseconds;
}

export const refreshTokenTtlMs = durationToMilliseconds(env.REFRESH_TOKEN_TTL);
