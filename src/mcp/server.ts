#!/usr/bin/env node
/**
 * floatty-explorer MCP server
 *
 * Exposes 6 data tools + a render-ui tool over stdio transport.
 * Data tools query the floatty knowledge graph via HTTP.
 * The render-ui tool renders explorer components inside an iframe
 * in Claude Desktop, Cursor, etc.
 *
 * We wire the MCP Apps plumbing manually (instead of createMcpApp)
 * so the render-ui tool accepts the full spec without Zod stripping
 * framework-level fields (on, repeat, watch) that the catalog schema
 * doesn't declare.
 *
 * Requires FLOATTY_URL and FLOATTY_API_KEY env vars.
 * Requires `pnpm mcp:build` to have run first (builds dist/mcp/index.html).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerJsonRenderResource } from "@json-render/mcp";
import { explorerCatalog } from "../lib/catalog/explorer-catalog.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDataTools } from "./tools.js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read built iframe HTML
const htmlPath = resolve(__dirname, "../../dist/mcp/index.html");
if (!existsSync(htmlPath)) {
  console.error("Missing dist/mcp/index.html — run `pnpm mcp:build` first.");
  process.exit(1);
}
const html = readFileSync(htmlPath, "utf-8");

// Read version from package.json
let version = "0.0.0";
try {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, "../../package.json"), "utf-8")
  );
  version = pkg.version ?? version;
} catch {
  // Fall through
}

// Validate required env vars
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

async function main() {
  const server = new McpServer({
    name: "floatty-explorer",
    version,
  });

  // Register render-ui tool with permissive schema (z.any) so
  // framework fields (on, repeat, watch, visible) pass through
  // without Zod stripping them.
  const catalogPrompt = explorerCatalog.prompt();
  const resourceUri = "ui://render-ui/view.html";

  server.tool(
    "render-ui",
    `Render an interactive UI. The spec argument must be a json-render spec conforming to the catalog.\n\n${catalogPrompt}`,
    { spec: z.any().describe("json-render spec object with root, elements, and optional state") },
    async ({ spec }) => ({
      content: [{ type: "text" as const, text: JSON.stringify(spec) }],
    })
  );

  // Register the iframe HTML resource
  await registerJsonRenderResource(server, { resourceUri, html });

  // Register the 6 data tools
  registerDataTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `floatty-explorer MCP server v${version} running on stdio (with render-ui)`
  );
  console.error(`  FLOATTY_URL: ${process.env.FLOATTY_URL}`);

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
