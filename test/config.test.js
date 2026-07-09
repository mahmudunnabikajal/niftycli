import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tmpHome;
let configModule;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "niftycli-test-"));
  process.env.HOME = tmpHome;
  configModule = await import("../src/config.js");
});

after(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

describe("config", () => {
  test("configExists is false and loadConfig is null before any save", () => {
    const { configExists, loadConfig } = configModule;
    assert.equal(configExists(), false);
    assert.equal(loadConfig(), null);
  });

  test("saveConfig persists config that loadConfig can read back", () => {
    const { saveConfig, loadConfig, configExists } = configModule;
    const config = { projects: [{ name: "Website", email: "a@b.com" }], defaultProject: "Website" };
    saveConfig(config);
    assert.equal(configExists(), true);
    assert.deepEqual(loadConfig(), config);
  });

  test("saveConfig writes the file with 0600 permissions", () => {
    const { saveConfig, getConfigPath } = configModule;
    saveConfig({ projects: [] });
    const mode = fs.statSync(getConfigPath()).mode & 0o777;
    assert.equal(mode, 0o600);
  });
});
