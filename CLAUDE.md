# Agent Guidelines for searxng-api-mcp

MCP server providing web search via SearXNG. Runtime: **Bun**. Linter/formatter: **Biome**.

## Build & Development Commands

```bash
bun install              # Install dependencies
bun run dev              # Run MCP server (src/cli.ts)
bun run lint             # Biome lint + format check
biome check --write      # Auto-fix lint/format issues
bun run inspect:stdio    # Debug MCP server via inspector
```

### Testing

```bash
bun test                 # Run all tests
bun test src/foo.test.ts # Run a single test file
bun test --watch         # Watch mode
bun test --coverage      # With coverage
```

Use the `bun:test` framework (`import { test, expect, describe } from "bun:test"`).

## Runtime: Bun (not Node.js)

- `bun <file>` not `node <file>`, `bun install` not `npm install`, `bun test` not `jest`
- Bun auto-loads `.env` — do NOT use `dotenv`
- Use `Bun.env["VAR_NAME"]` for environment variables
- Use `Bun.stderr.write()` for logging — **never** `console.log/warn/error` (stdio transport captures stdout/stderr and will break the MCP protocol)
- Use `Bun.serve()` for HTTP servers, `Bun.file()` over `node:fs`

## Project Structure

```
src/
├── cli.ts               # Shebang entry point (#!/usr/bin/env bun)
├── index.ts             # CLI argument parsing, option validation
├── mcp/
│   ├── index.ts         # McpServer setup, tool registration
│   ├── search.ts        # search_web tool handler
│   └── types.ts         # Zod input/output schemas
├── searxng/
│   └── index.ts         # SearXNG HTTP API client
└── transport/
    ├── stdio.ts         # Stdio transport (StdioServerTransport)
    └── http.ts          # HTTP transport (Hono + StreamableHTTPTransport)
```

## Code Style

### Formatting (Biome)

- 2-space indentation, double quotes, semicolons as-needed, trailing commas ES5
- LF line endings, UTF-8, final newline required
- Biome organizes imports automatically

### Imports

- ES modules only (`import`/`export`)
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports:
  ```typescript
  import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
  import type z from "zod"
  ```
- Use `.js` extension for MCP SDK deep imports: `@modelcontextprotocol/sdk/server/mcp.js`
- Node.js import protocol prefix is optional (`"util"` not `"node:util"` — Biome rule `useNodejsImportProtocol` is off)
- JSON imports use `with` assertion: `import { version } from "../../package.json" with { type: "json" }`

### Naming Conventions

- **Files**: camelCase (`index.ts`, `types.ts`)
- **Types/Interfaces**: PascalCase (`CliOptions`, `SearchOptions`)
- **Functions**: camelCase, verb prefix (`registerSearchTool`, `isValidUrl`, `getServer`)
- **Constants**: camelCase (not SCREAMING_SNAKE_CASE)
- **Zod schemas**: camelCase with descriptive prefix (`inputSchema`, `outputSchema`, `zCliOptions`)

### Type Safety

- `strict: true` in tsconfig with `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`, `noImplicitOverride`
- Explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Use `z.infer<typeof schema>` to derive types from Zod schemas
- Use `unknown` over `any`

### Zod (v4)

This project uses **Zod v4** (`zod@^4.3.5`). Key patterns:

```typescript
import z from "zod"                           // default import
import { z } from "zod"                       // also valid
import { prettifyError } from "zod/v4/core"   // v4 error formatting

// Schema conventions
z.object({ ... }).strict()    // .strict() on object schemas
z.string().min(1).describe()  // .describe() on all fields
z.string().optional()         // explicit optional/nullable
z.url()                       // URL validation (v4 native)
z.enum(["a", "b"])            // enums for fixed values
```

- Define `inputSchema` and `outputSchema` separately
- Use `.safeParse()` for validation with error handling, `.parse()` when errors should throw

### Error Handling

- `try-catch` for async operations
- Check `response.ok` before consuming fetch responses
- Throw descriptive errors with context:
  ```typescript
  throw new Error(`SearXNG search error: ${response.status} ${response.statusText}`)
  ```
- Use `Error.stackTraceLimit` (0 in production, 10 in development)
- Return `false` from validation functions on error

### Console / Logging

**CRITICAL**: Do NOT use `console.log()`, `console.error()`, etc. in runtime code. The stdio transport captures stdout, so console output will corrupt MCP protocol communication. Use `Bun.stderr.write("message\n")` for operational messages. The only exceptions are the `--help` and `--version` CLI flags which print and exit.

### Biome Ignore

Use sparingly, always with justification:
```typescript
// biome-ignore lint/style/noNonNullAssertion: Argument is defined in the schema
```

## Dependencies

- `@modelcontextprotocol/sdk` — MCP protocol SDK
- `zod` (v4) — schema validation
- `hono` — HTTP framework (for HTTP transport)
- `@hono/mcp` — Hono MCP transport adapter
- `@biomejs/biome` — linter/formatter (devDep)
- `@types/bun` — Bun type definitions (devDep)

## Adding a New MCP Tool

1. Define input/output Zod schemas in `src/mcp/types.ts` (use `.strict()`, `.describe()`)
2. Create `src/mcp/<tool>.ts` with a `register<Tool>Tool(server, options)` function
3. Call `server.registerTool(name, metadata, handler)` with `inputSchema` and `outputSchema`
4. Register the tool in `src/mcp/index.ts` inside `getServer()`

## Adding a Search Parameter

1. Add field to `inputSchema` in `src/mcp/types.ts`
2. It auto-propagates to `src/searxng/index.ts` (iterates `args` dynamically)
3. Update `--help` text in `src/index.ts` if CLI-relevant

## Environment Variables

| Variable | CLI Flag | Description |
|---|---|---|
| `SEARXNG_SERVER` | `--server, -s` | SearXNG instance URL (required) |
| `SEARXNG_API_KEY` | `--key, -k` | API key (optional) |
| `SEARXNG_LANGUAGE` | `--language, -l` | Language code (optional) |
| `SEARXNG_TRANSPORT` | `--transport, -t` | `stdio` (default) or `http` |
| `SEARXNG_PORT` | `--port, -p` | HTTP port (default: 5021) |
| `NODE_ENV` | — | Set `development` for stack traces |
