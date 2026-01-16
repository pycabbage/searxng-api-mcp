import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { CliOptions } from ".."
import { inputSchema, outputSchema } from "./types"
import { search } from "../searxng"

export function registerSearchTool(server: McpServer, options: CliOptions) {
  server.registerTool(
    "search_web",
    {
      title: "Search the web",
      description: "Search the web using SearXNG search engine",
      inputSchema,
      outputSchema,
    },
    async (args) => {
      const searchResult = await search({ options, args })
      const structuredContent = outputSchema.parse(searchResult.response)

      return {
        isError: false,
        content: [
          {
            type: "resource",
            resource: {
              uri: "mcp://search_web/results.json",
              mimeType: "application/json",
              text: JSON.stringify(structuredContent),
            },
            annotations: {
              audience: ["assistant", "user"],
              priority: 0.9,
              lastModified: new Date().toISOString(),
            }
          }
        ],
        structuredContent,
      }
    }
  )
}
