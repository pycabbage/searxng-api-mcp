# searxng-api-mcp

MCP server for SearXNG web search.

## Setup

Add to your MCP client configuration (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "searxng": {
      "command": "bunx",
      "args": ["searxng-api-mcp@latest"],
      "env": {
        "SEARXNG_SERVER": "https://your-searxng-instance.com"
      }
    }
  }
}
```

### Environment Variables

- **SEARXNG_SERVER** (required): Your SearXNG instance URL
- **SEARXNG_API_KEY** (optional): API key for your SearXNG server
- **SEARXNG_LANGUAGE** (optional): Language code (e.g., `en`, `ja`)
