import { StreamableHTTPTransport } from "@hono/mcp"
import { Hono } from "hono"
import type { CliOptions } from ".."
import { getServer } from "../mcp"

export async function startHttpTransport(options: CliOptions) {
  const mcpServer = getServer(options)

  const app = new Hono()
  app.all("/mcp", async (c) => {
    const transport = new StreamableHTTPTransport()
    await mcpServer.connect(transport)
    return transport.handleRequest(c)
  })

  const httpServer = Bun.serve({
    port: Number.parseInt(options.port, 10),
    fetch: app.fetch,
  })
  Bun.stderr.write(`MCP Server is running over HTTP on port ${httpServer.port}\n`)
}
