import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "./structured-data.ts";

test("serializeJsonLd prevents script termination through listing text", () => {
  const serialized = serializeJsonLd({ title: "</script><img src=x onerror=alert(1)>&" });

  assert.doesNotMatch(serialized, /<\/script>/i);
  assert.ok(serialized.includes("\\u003c/script\\u003e"));
  assert.ok(serialized.includes("\\u0026"));
});
