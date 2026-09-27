import { AppError } from "./app-error.js";

type Cursor = { sort: string; value: string; id: string };

export function encodeCursor(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(value: string): Cursor {
  try {
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Cursor;
    if (!cursor || typeof cursor.value !== "string" || typeof cursor.id !== "string") throw new Error();
    return cursor;
  } catch {
    throw new AppError(422, "INVALID_CURSOR", "The pagination cursor is invalid.");
  }
}
