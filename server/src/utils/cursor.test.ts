import assert from "node:assert/strict";
import test from "node:test";
import { decodeCursor, encodeCursor } from "./cursor.js";

test("cursor round-trips its sort order and position", () => {
  const encoded = encodeCursor({ sort: "price_asc", value: "1000.00", id: "property-1" });
  assert.deepEqual(decodeCursor(encoded), { sort: "price_asc", value: "1000.00", id: "property-1" });
});

test("malformed cursors are rejected as client input", () => {
  assert.throws(() => decodeCursor("not-a-cursor"), /pagination cursor is invalid/i);
});
