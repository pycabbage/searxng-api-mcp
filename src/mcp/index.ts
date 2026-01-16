import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { version } from "../../package.json" with { type: "json" }
import type { CliOptions } from ".."
import { registerSearchTool } from "./search"

export function getServer(options: CliOptions) {
  const server = new McpServer(
    {
      title: "SearXNG MCP Server",
      name: "SearXNG MCP Server",
      version,
      description: `
  The SearXNG MCP Server provides tool to search the web using google, bing, brave, etc.
  `.trim(),
    },
    {
      capabilities: {
        logging: {},
      },
    }
  )

  registerSearchTool(server, options)

  return server
}
