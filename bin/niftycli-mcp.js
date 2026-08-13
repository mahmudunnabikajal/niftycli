#!/usr/bin/env node
import { startServer } from "../src/mcp/server.js";

try {
  await startServer();
} catch (err) {
  console.error(`niftycli-mcp failed to start: ${err.message}`);
  process.exit(1);
}
