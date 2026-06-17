import { test } from "node:test";
import assert from "node:assert/strict";
import { masterPathToDoctorUrl } from "./site-status";

test("maps a master deep path to the doctor origin", () => {
  assert.equal(masterPathToDoctorUrl("/book?x=1"), "https://shyftdoctor.com/book?x=1");
});

test("maps root to doctor origin root", () => {
  assert.equal(masterPathToDoctorUrl("/"), "https://shyftdoctor.com/");
});

test("normalizes a path missing its leading slash", () => {
  assert.equal(masterPathToDoctorUrl("book"), "https://shyftdoctor.com/book");
});
