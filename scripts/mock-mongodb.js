#!/usr/bin/env node
/**
 * Starts an in-memory MongoDB and launches `next dev`.
 * Usage: node scripts/mock-mongodb.js
 */
"use strict";

const { spawn } = require("child_process");

async function main() {
  // Load .env file so ADMIN_ACCOUNTS etc. are available to Next.js
  require("dotenv").config();

  console.log("[mock-mongodb] Starting in-memory MongoDB...");
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri().replace(/\/$/, "");
  console.log(`[mock-mongodb] Ready at ${uri}`);

  const env = { ...process.env, MONGODB_URI: uri };

  const child = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    env,
    shell: true,
  });

  const cleanup = () => {
    console.log("\n[mock-mongodb] Shutting down...");
    child.kill();
    mongod.stop().then(() => process.exit(0));
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  child.on("exit", (code) => {
    mongod.stop().then(() => process.exit(code ?? 0));
  });
}

main().catch((err) => {
  console.error("[mock-mongodb] Failed to start:", err);
  process.exit(1);
});
