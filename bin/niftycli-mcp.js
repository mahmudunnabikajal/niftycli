#!/usr/bin/env node
import { startServer } from "../src/mcp/server.js";

function sanitizeForLog(text) {
  return Array.from(String(text), (ch) => (ch.charCodeAt(0) < 0x20 ? " " : ch)).join("");
}

try {
  await startServer();
} catch (err) {
  console.error(`niftycli-mcp failed to start: ${sanitizeForLog(err.message)}`);
  process.exit(1);
}
