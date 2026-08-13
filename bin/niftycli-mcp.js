#!/usr/bin/env node
import { startServer } from "../src/mcp/server.js";

function sanitizeForLog(text) {
  return String(text).replace(/[\r\n\t\x00-\x1f]+/g, " ");
}

try {
  await startServer();
} catch (err) {
  console.error(`niftycli-mcp failed to start: ${sanitizeForLog(err.message)}`);
  process.exit(1);
}
