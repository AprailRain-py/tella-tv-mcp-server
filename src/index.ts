#!/usr/bin/env node
/**
 * Tella TV MCP Server
 * Provides AI assistants with tools to interact with Tella TV:
 *  - List & search videos
 *  - Get video details
 *  - List playlists
 *  - Manage webhooks
 *  - Annotate zoom / focus points for product recordings
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TellaClient } from "./tellaClient.js";
import { tools, handleTool } from "./tools.js";

const API_KEY = process.env.TELLA_API_KEY;

if (!API_KEY) {
  console.error("[tella-mcp] ERROR: TELLA_API_KEY environment variable is required.");
  process.exit(1);
}

const client = new TellaClient(API_KEY);

const server = new Server(
  {
    name: "tella-tv-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ── List tools ──────────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// ── Call tool ───────────────────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const result = await handleTool(name, args ?? {}, client);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err: any) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[tella-mcp] Server running on stdio.");
}

main().catch((err) => {
  console.error("[tella-mcp] Fatal error:", err);
  process.exit(1);
});
