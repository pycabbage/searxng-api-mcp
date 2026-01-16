import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import type { CliOptions } from ".."
import { getServer } from "../mcp"

export async function startStdioTransport(options: CliOptions) {
  const server = getServer(options)
  const transport = new StdioServerTransport()
  await server.connect(transport)
  Bun.stderr.write("MCP Server is running over stdio\n")
}
