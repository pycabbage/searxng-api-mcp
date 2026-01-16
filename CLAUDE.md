# Agent Guidelines for searxng-mcp

This document provides guidelines for AI coding agents working on the searxng-mcp project.

## Project Overview

This is a Model Context Protocol (MCP) server that provides web search capabilities using SearXNG. The project uses **Bun** as the runtime and **Biome** for linting/formatting.

## Build & Development Commands

### Installation
```bash
bun install
```

### Development
```bash
bun run dev          # Run the MCP server
bun run src          # Alternative way to run
```

### Linting & Formatting
```bash
bun run lint         # Run Biome linter and formatter checks
biome check          # Same as above
biome check --write  # Auto-fix issues
biome format --write # Format only
```

### Testing
```bash
bun test                    # Run all tests
bun test <file>             # Run a specific test file
bun test --watch            # Run tests in watch mode
bun test --coverage         # Run with coverage
```

**Note**: Currently no test files exist in this project, but when adding tests, use the `bun:test` framework.

### Debugging
```bash
bun run inspect:stdio  # Inspect MCP server with stdio transport
```

## Runtime: Bun

**IMPORTANT**: Always use Bun, not Node.js or npm.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install`
- Use `bun run <script>` instead of `npm run <script>`
- Bun automatically loads `.env`, so don't use `dotenv` package
- Prefer `Bun.file` over `node:fs` readFile/writeFile

## Code Style Guidelines

### Formatter Configuration (Biome)
- **Indentation**: 2 spaces
- **Quote style**: Double quotes (`"`)
- **Semicolons**: As needed (minimal)
- **Trailing commas**: ES5 style
- **Line endings**: LF (Unix-style)
- **Charset**: UTF-8
- **Final newline**: Required

### TypeScript Configuration
- **Target**: ESNext
- **Module**: Preserve (ESM)
- **Strict mode**: Enabled
- **No unchecked indexed access**: Enabled
- **No fallthrough cases**: Enabled
- **No implicit override**: Enabled

### Imports
- Use ES modules (`import`/`export`)
- Use `.js` extension for SDK imports: `@modelcontextprotocol/sdk/server/mcp.js`
- Use `type` keyword for type-only imports: `import type { McpServer } from ...`
- Organize imports automatically (Biome handles this)
- No Node.js protocol prefix required (e.g., use `util` not `node:util`)

### Naming Conventions
- **Files**: camelCase for modules (e.g., `index.ts`, `types.ts`)
- **Interfaces**: PascalCase with descriptive names (e.g., `CliOptions`, `SearchOptions`)
- **Functions**: camelCase with verb prefix (e.g., `isValidUrl`, `registerSearchTool`)
- **Constants**: camelCase (not SCREAMING_SNAKE_CASE)
- **Types**: PascalCase

### Type Safety
- Always use explicit return types for exported functions
- Prefer `interface` over `type` for object shapes
- Use `z.infer<typeof schema>` for Zod schema types
- Use strict mode in Zod schemas (`.strict()`)
- Use `unknown` over `any` where possible
- Handle nullable/optional values explicitly: use `nullable()`, `nullish()`, `optional()`

### Error Handling
- Use `try-catch` blocks for async operations
- Return `false` from validation functions on error (see `isValidUrl`)
- Throw descriptive errors with context:
  ```typescript
  throw new Error(`SearXNG search error: ${response.status} ${response.statusText}`)
  ```
- Check response status with `response.ok`
- Use `Error.stackTraceLimit` for environment-based stack traces

### Comments & Documentation
- Use Biome ignore comments sparingly and with justification:
  ```typescript
  // biome-ignore lint/style/noNonNullAssertion: Argument is defined in the schema
  ```
- Use `console.debug()` for debug logging with descriptive prefixes:
  ```typescript
  console.debug("[DEBUG] SearXNG search URL:", url.toString())
  ```
- Document function parameters and return types with TypeScript
- Use JSDoc for complex functions if needed

### Zod Schema Patterns
- Define input and output schemas separately
- Use `.describe()` for all schema fields
- Use `.min(1)` for required strings
- Use `.default()` for optional fields with sensible defaults
- Use `.enum()` for limited string values
- Use `.url()` for URL validation
- Use `.strict()` for object schemas to catch unexpected fields

### Async/Await
- Always use `async/await` for async operations (no raw Promises)
- Use `await` for fetch calls
- Handle response parsing: `await response.json()`

### Environment Variables
- Access via `Bun.env["VAR_NAME"]`
- Provide defaults in CLI argument parsing
- Document all expected env vars in help text

## Project Structure

```
src/
├── index.ts           # CLI entry point
├── mcp/
│   ├── index.ts       # MCP server setup
│   ├── search.ts      # Search tool registration
│   └── types.ts       # Zod schemas
├── searxng/
│   └── index.ts       # SearXNG API client
└── transport/
    └── stdio.ts       # Stdio transport layer
```

## Configuration Files

- `biome.json` - Linting and formatting rules
- `tsconfig.json` - TypeScript compiler options
- `.editorconfig` - Editor configuration
- `package.json` - Dependencies and scripts

## Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK
- `zod` - Schema validation (v4.x)
- `@biomejs/biome` - Linting and formatting
- `@types/bun` - TypeScript types for Bun

## Testing Guidelines

When adding tests:
```typescript
import { test, expect } from "bun:test"

test("descriptive test name", () => {
  expect(actual).toBe(expected)
})

test("async test", async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})
```

## Common Tasks

### Adding a new MCP tool
1. Create schema in `src/mcp/types.ts` using Zod
2. Create tool registration function in `src/mcp/<tool>.ts`
3. Register tool in `src/mcp/index.ts`
4. Use `.strict()` on object schemas
5. Add comprehensive descriptions to all schema fields

### Adding a new search parameter
1. Update `inputSchema` in `src/mcp/types.ts`
2. Handle parameter in `src/searxng/index.ts`
3. Update CLI help text in `src/index.ts` if needed
