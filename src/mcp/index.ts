import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { version } from "../../package.json"
import "./search"
import type { CliOptions } from ".."
import { registerSearchTool } from "./search"

export function getServer(options: CliOptions) {
  const server = new McpServer(
    {
      title: "SearXNG MCP Server",
      name: "SearXNG MCP Server",
      version,
      description: `
  The SearXNG MCP Server provides tool to search the web using google, bing, brave, etc.
  `.trim(),
    },
    {
      capabilities: {
        logging: {},
      },
    }
  )

  registerSearchTool(server, options)

  return server
}

/*
The GitHub MCP Server provides tools to interact with GitHub platform.

Tool selection guidance:
	1. Use 'list_*' tools for broad, simple retrieval and pagination of all items of a type (e.g., all issues, all PRs, all branches) with basic filtering.
	2. Use 'search_*' tools for targeted queries with specific criteria, keywords, or complex filters (e.g., issues with certain text, PRs by author, code containing functions).

Context management:
	1. Use pagination whenever possible with batches of 5-10 items.
	2. Use minimal_output parameter set to true if the full information is not needed to accomplish a task.

Tool usage guidance:
	1. For 'search_*' tools: Use separate 'sort' and 'order' parameters if available for sorting results - do not include 'sort:' syntax in query strings. Query strings should contain only search criteria (e.g., 'org:google language:python'), not sorting instructions. Always call 'get_me' first to understand current user permissions and context. ## Issues

Check 'list_issue_types' first for organizations to use proper issue types. Use 'search_issues' before creating new issues to avoid duplicates. Always set 'state_reason' when closing issues. ## Pull Requests

PR review workflow: Always use 'pull_request_review_write' with method 'create' to create a pending review, then 'add_comment_to_pending_review' to add comments, and finally 'pull_request_review_write' with method 'submit_pending' to submit the review for complex reviews with line-specific comments.

Before creating a pull request, search for pull request templates in the repository. Template files are called pull_request_template.md or they're located in '.github/PULL_REQUEST_TEMPLATE' directory. Use the template content to structure the PR description and then call create_pull_request tool.

Here are common scenarios you may encounter, followed by a description of the steps to follow and the tools to use. Match these to user requests:
If the user is bootstrapping a new project, you MUST always follow this workflow:
- STEP 1: Set up a repository for the project unless one has already been set up by the user.
- STEP 2: If a repository for the project exists, use issues tools to create at least one tracking issue for the project.
When the user requests to search for issues in a repository using natural language, use the semantic_issues_search tool over search_issues.
*/
