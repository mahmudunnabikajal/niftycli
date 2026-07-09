import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { checkForUpdate } from "../src/updateNotifier.js";

describe("checkForUpdate", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("returns the latest version when it is newer than current", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ version: "2.0.0" }),
    });
    const result = await checkForUpdate("niftycli", "1.3.0");
    assert.equal(result, "2.0.0");
  });

  test("returns null when the latest version is not newer", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ version: "1.3.0" }),
    });
    const result = await checkForUpdate("niftycli", "1.3.0");
    assert.equal(result, null);
  });

  test("returns null when the registry request fails", async () => {
    global.fetch = async () => ({ ok: false });
    const result = await checkForUpdate("niftycli", "1.3.0");
    assert.equal(result, null);
  });

  test("returns null when fetch rejects", async () => {
    global.fetch = async () => {
      throw new Error("network error");
    };
    const result = await checkForUpdate("niftycli", "1.3.0");
    assert.equal(result, null);
  });
});
