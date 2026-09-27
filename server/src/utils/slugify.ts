import { randomBytes } from "node:crypto";

export function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

  return `${base || "property"}-${randomBytes(3).toString("hex")}`;
}

