import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGhlPayload } from "./integrations";

test("builds a GHL contact payload from a lead", () => {
  const p = buildGhlPayload({
    name: "A B",
    email: "a@b.com",
    phone: "5551212",
    message: "hi",
    source: "doctor",
    affiliateRef: null,
  });
  assert.equal(p.email, "a@b.com");
  assert.equal(p.firstName, "A");
  assert.equal(p.lastName, "B");
  assert.equal(p.phone, "5551212");
  assert.deepEqual(p.tags, ["shyft-lead", "source:doctor"]);
});

test("handles single-word names and missing source", () => {
  const p = buildGhlPayload({ name: "Cher", email: "c@x.com" });
  assert.equal(p.firstName, "Cher");
  assert.equal(p.lastName, "");
  assert.equal(p.phone, undefined);
  assert.deepEqual(p.tags, ["shyft-lead", "source:unknown"]);
});
