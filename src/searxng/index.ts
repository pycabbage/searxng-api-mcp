import type z from "zod"
import type { CliOptions } from ".."
import type { inputSchema } from "../mcp/types"

interface SearchOptions {
  options: CliOptions
  args: z.infer<typeof inputSchema>
}
export async function search({ options, args }: SearchOptions) {
  const url = new URL("/search", options.server)
  url.searchParams.append("format", "json")
  for (const arg in args) {
    const key = arg === "query" ? "q" : arg
    // biome-ignore lint/style/noNonNullAssertion: Argument is defined in the schema
    url.searchParams.append(key, `${args[arg as keyof typeof args]!}`)
  }
  if (options.key) {
    url.searchParams.append("key", options.key)
  }
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `SearXNG search error: ${response.status} ${response.statusText}`
    )
  }

  return {
    response: await response.json(),
  }
}
