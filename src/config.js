import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".niftycli");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

export function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null;
  }
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}

export function saveConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
  fs.chmodSync(CONFIG_PATH, 0o600);
}

export function configExists() {
  return fs.existsSync(CONFIG_PATH);
}

export function getConfigPath() {
  return CONFIG_PATH;
}
