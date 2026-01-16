import type z from "zod";
import { outputSchema, type inputSchema } from "../mcp/types";
import type { CliOptions } from "..";

interface SearchOptions {
  options: CliOptions
  args: z.infer<typeof inputSchema>
}
export async function search({ options, args }: SearchOptions) {
  const url = new URL("/search", options.server)
  url.searchParams.append("format", "json")
  for (const arg in args) {
    const key = arg === "query" ? "q" : arg
    url.searchParams.append(key, `${args[arg as keyof typeof args]!}`)
  }
  if (options.key) {
    url.searchParams.append("key", options.key)
  }
  console.debug("[DEBUG] SearXNG search URL:", url.toString())
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`SearXNG search error: ${response.status} ${response.statusText}`)
  }

  return {
    response: await response.json()
  }
}
