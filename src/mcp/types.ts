import z from "zod"

export const searchInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "The search query. This string is passed to external search services. Thus, SearXNG supports syntax of each search service. For example, site:github.com SearXNG is a valid query for Google. However, if simply the query above is passed to any search engine which does not filter its results based on this syntax, you might not get the results you wanted."
    ),
  categories: z
    .string()
    .default("general")
    .optional()
    .describe(
      "Comma separated list, specifies the active search categories. Default: general"
    ),
  engines: z
    .string()
    .optional()
    .describe(
      "Comma separated list, specifies the active search engines. Default: empty (all engines)."
    ),
  language: z.string().optional().describe("Code of the language."),
  pageno: z
    .number()
    .min(1)
    .default(1)
    .optional()
    .describe("Search page number."),
  time_range: z
    .enum(["day", "month", "year"])
    .optional()
    .describe(
      "Time range of search for engines which support it. See if an engine supports time range search in the preferences page of an instance. Default: empty (no time range)."
    ),
})

export const searchOutputSchema = z.object({
  query: z.string().describe("The search query that was executed."),
  number_of_results: z.number().describe("Total number of results returned."),
  results: z
    .array(
      z
        .object({
          template: z.string(),
          url: z.url(),
          title: z.string(),
          content: z.string(),
          publishedDate: z.string().nullable(),
          pubdate: z.string().nullish().optional(),
          thumbnail: z.string(),
          engine: z.string(),
          parsed_url: z.array(z.string()).length(6),
          img_src: z.string(),
          priority: z.string(),
          engines: z.array(z.string()),
          positions: z.array(z.number()),
          score: z.number(),
          category: z.string(),
        })
        .strict()
    )
    .describe("Array of search results."),
  answers: z.array(z.unknown()).describe("Direct answers to the query."),
  corrections: z
    .array(z.unknown())
    .describe("Spelling corrections or suggestions."),
  infoboxes: z
    .array(
      z
        .object({
          infobox: z.string(),
          id: z.string(),
          content: z.string(),
          img_src: z.string().nullable(),
          urls: z.array(
            z.object({
              title: z.string(),
              url: z.url(),
              official: z.boolean().optional(),
            })
          ),
          engine: z.string(),
          url: z.string().nullable(),
          template: z.string(),
          parsed_url: z.null(),
          title: z.string(),
          thumbnail: z.string(),
          priority: z.string(),
          engines: z.array(z.string()),
          positions: z.string(),
          score: z.number(),
          category: z.string(),
          publishedDate: z.string().nullable(),
          pubdate: z.string().nullish().optional(),
          attributes: z.array(
            z.object({
              label: z.string(),
              value: z.string(),
              entity: z.string(),
            })
          ),
        })
        .strict()
    )
    .describe("Information boxes with structured data."),
  suggestions: z.array(z.string()).describe("Search suggestions."),
  unresponsive_engines: z
    .array(z.tuple([z.string(), z.string()]))
    .describe("Engines that failed to respond with their error messages."),
})

export const autocompleteInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe("The partial query for which the completion is requested."),
  provider: z
    .enum([
      "360search",
      "baidu",
      "brave",
      "dbpedia",
      "duckduckgo",
      "google",
      "mwmbl",
      "naver",
      "quark",
      "qwant",
      "seznam",
      "sogou",
      "startpage",
      "stract",
      "swisscows",
      "wikipedia",
      "yandex",
    ])
    .default("google")
    .optional()
    .describe(
      "The search engine for which the completion is requested. If not specified, the default autocomplete provider of the SearXNG instance will be used."
    ),
  categories: z
    .string()
    .default("general")
    .optional()
    .describe(
      "Comma separated list, specifies the active search categories. Default: general"
    ),
})

export const autocompleteOutputSchema = z.tuple([
  z
    .string()
    .describe(
      "The original input query for which autocomplete suggestions are generated."
    ),
  z
    .array(z.string())
    .describe(
      "An array of autocomplete suggestions based on the input query. Each suggestion is a string that represents a possible completion or extension of the original query."
    ),
])
