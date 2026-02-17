import { parseArgs } from "util"
import { startHttpTransport } from "./transport/http"
import { startStdioTransport } from "./transport/stdio"
import { name, version } from "../package.json"
import { z } from "zod"
import { prettifyError } from "zod/v4/core"

Error.stackTraceLimit = Bun.env["NODE_ENV"] === "development" ? 10 : 0

const zCliOptions = z.object({
  server: z.url({
    error({ input }) {
      return `Invalid URL: "${input}". Please provide a valid SearXNG server URL at \`--server\` or SEARXNG_SERVER environment variable.`
    },
  }),
  key: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  transport: z.enum(["stdio", "http"]),
  port: z.string()
    .refine((val) => {
      const num = Number(val)
      return !isNaN(num) && num > 0 && num < 65536
    }),
  help: z.boolean(),
  version: z.boolean(),
})
export type CliOptions = z.infer<typeof zCliOptions>

export async function cli() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      server: {
        type: "string",
        short: "s",
        default: Bun.env["SEARXNG_SERVER"],
      },
      key: {
        type: "string",
        short: "k",
        default: Bun.env["SEARXNG_API_KEY"],
      },
      language: {
        type: "string",
        short: "l",
        default: Bun.env["SEARXNG_LANGUAGE"],
      },
      help: {
        type: "boolean",
        default: false,
      },
      transport: {
        type: "string",
        short: "t",
        default: Bun.env["SEARXNG_TRANSPORT"] || "stdio",
      },
      port: {
        type: "string",
        short: "p",
        default: Bun.env["SEARXNG_PORT"] || "5021",
      },
      version: {
        type: "boolean",
        short: "v",
        default: false,
      },
    },
    strict: true,
    allowPositionals: false,
  })
  const parsedOptions = zCliOptions.safeParse(values)
  if (!parsedOptions.success) {
    throw new Error("\n" + prettifyError(parsedOptions.error))
  }
  if (parsedOptions.data.help) {
    console.log(`Usage: ${Bun.argv[0]} ${Bun.argv[1]} [options]

Options:
  --server, -s    SearXNG server URL (or SEARXNG_SERVER env variable)
  --key, -k       API key for the SearXNG server (or SEARXNG_API_KEY env variable)
  --language, -l  Language code for the searches (or SEARXNG_LANGUAGE env variable)
  --transport <stdio|http>, -t <stdio|http>
    Transport method for the MCP server (default: stdio)
    (or SEARXNG_TRANSPORT env variable)
  --port <number>, -p <number>
    Port number for HTTP transport (default: 5021)
    (or SEARXNG_PORT env variable)
  --help          Show this help message
  --version, -v   Show version information
`)
    return
  }

  if (parsedOptions.data.version) {
    console.log(name, version)
    return
  }

  switch (parsedOptions.data.transport) {
    case "stdio":
      return await startStdioTransport(parsedOptions.data)
    case "http":
      return await startHttpTransport(parsedOptions.data)
  }
}
