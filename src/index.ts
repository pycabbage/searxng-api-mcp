import { parseArgs } from "util"
import { startStdioTransport } from "./transport/stdio"

Error.stackTraceLimit = Bun.env["NODE_ENV"] === "development" ? 10 : 0

function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    if (
      !["", "/"].includes(parsedUrl.pathname) ||
      parsedUrl.search !== "" ||
      parsedUrl.hash !== "" ||
      !["http:", "https:"].includes(parsedUrl.protocol)
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

export interface CliOptions {
  server: string
  key?: string
}

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
    },
    strict: true,
    allowPositionals: false,
  })
  if (values.help) {
    console.log(`Usage: ${Bun.argv[0]} ${Bun.argv[1]} [options]

Options:
  --server, -s   SearXNG server URL (or SEARXNG_SERVER env variable)
  --key, -k      API key for the SearXNG server (or SEARXNG_API_KEY env variable)
  --language, -l Language code for the searches (or SEARXNG_LANGUAGE env variable)
  --help         Show this help message
`)
    return
  }
  if (!values.server) {
    throw new Error(
      "The --server option or SEARXNG_SERVER environment variable is required"
    )
  }
  if (!isValidUrl(values.server)) {
    throw new Error("The provided server URL is not valid")
  }

  await startStdioTransport(values as CliOptions)
}
