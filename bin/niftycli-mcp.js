#!/usr/bin/env node
import { startServer } from "../src/mcp/server.js";

startServer().catch((err) => {
  console.error(`niftycli-mcp failed to start: ${err.message}`);
  process.exit(1);
});
