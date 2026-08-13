#!/usr/bin/env node
import { startServer } from "../src/mcp/server.js";
import { sanitizeForLog } from "../src/logSanitizer.js";

try {
  await startServer();
} catch (err) {
  console.error(`niftycli-mcp failed to start: ${sanitizeForLog(err.message)}`);
  process.exit(1);
}
