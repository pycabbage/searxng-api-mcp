import { StreamableHTTPTransport } from "@hono/mcp"
import { Hono } from "hono"
import type { CliOptions } from ".."
import { getServer } from "../mcp"

const app = new Hono()

export async function startHttpTransport(options: CliOptions) {
  app.all("/mcp", async (c) => {
    const headers = {
      server: c.req.header("searxng-server") || options.server,
      key: c.req.header("searxng-key") || options.key,
    }
    const mcpServer = getServer({
      ...options,
      ...headers,
    })
    const transport = new StreamableHTTPTransport()
    await mcpServer.connect(transport)
    return transport.handleRequest(c)
  })

  app.all("/health", (c) => c.json({
    status: "ok",
  }))

  const httpServer = Bun.serve({
    port: Number.parseInt(options.port, 10),
    fetch: app.fetch,
  })
  Bun.stderr.write(
    `MCP Server is running over HTTP on port ${httpServer.port}\n`
  )
}
