import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { sanitizeForLog } from "../src/logSanitizer.js";

describe("sanitizeForLog", () => {
  test("leaves normal text untouched", () => {
    assert.equal(sanitizeForLog("connection failed"), "connection failed");
  });

  test("replaces control characters with spaces", () => {
    assert.equal(sanitizeForLog("line1\nline2\rline3\ttab"), "line1 line2 line3 tab");
  });

  test("coerces non-string input", () => {
    assert.equal(sanitizeForLog(404), "404");
  });
});
