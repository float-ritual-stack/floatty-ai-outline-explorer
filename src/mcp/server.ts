#!/usr/bin/env node
/**
 * floatty-explorer MCP server
 *
 * Exposes the 6 explorer tools over stdio transport so external
 * MCP clients (Claude Desktop, Claude Code, etc.) can query the
 * floatty knowledge graph without the Next.js app running.
 *
 * Requires FLOATTY_URL and FLOATTY_API_KEY env vars.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";

// Read version from package.json at startup
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
let version = "0.0.0";
try {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, "../../package.json"), "utf-8")
  );
  version = pkg.version ?? version;
} catch {
  // Fall through — version stays at 0.0.0
}

// Validate required env vars before starting
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    console.error(
      "Set FLOATTY_URL and FLOATTY_API_KEY to point at a running floatty-server."
    );
    process.exit(1);
  }
  return value;
}

requireEnv("FLOATTY_URL");
requireEnv("FLOATTY_API_KEY");

// Create server
const server = new McpServer({
  name: "floatty-explorer",
  version,
});

// Register all tools
registerTools(server);

// Connect via stdio
const transport = new StdioServerTransport();

async function main() {
  await server.connect(transport);
  console.error(
    `floatty-explorer MCP server v${version} running on stdio`
  );
  console.error(`  FLOATTY_URL: ${process.env.FLOATTY_URL}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});
