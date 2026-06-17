import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeKeyword } from "./dki";

test("strips html, trims, and title-cases", () => {
  assert.equal(sanitizeKeyword("  life <b>coach</b>  "), "Life Coach");
});

test("rejects empty / too-short", () => {
  assert.equal(sanitizeKeyword(""), null);
  assert.equal(sanitizeKeyword("a"), null);
  assert.equal(sanitizeKeyword(null), null);
  assert.equal(sanitizeKeyword(undefined), null);
});

test("rejects overly long", () => {
  assert.equal(sanitizeKeyword("x".repeat(90)), null);
});

test("keeps allowed punctuation and collapses whitespace", () => {
  assert.equal(sanitizeKeyword("women's   shift & change"), "Women's Shift & Change");
});
