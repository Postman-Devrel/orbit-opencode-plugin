---
name: discover
description: "Discover APIs using Orbit's agent-friendly search. Returns endpoints with evaluateGuide fields showing what each API can and can't do, and can generate an integration task brief for the ones you pick."
license: Apache-2.0
---

# Orbit: discover APIs

Search Orbit for APIs matching a capability query, then generate an
integration task brief for the endpoints you select.

This uses Orbit's MCP server (`https://mcp.buildwithorbit.ai/mcp`, no authentication),
registered in OpenCode under the key `orbit`. OpenCode names MCP tools
`<server key>_<tool name>`, so the two tools are `orbit_search` and `orbit_integrate`.
If you registered the server under another key, use that key as the prefix instead.

## Input

A capability description: what you need the API to do.
Multiple capabilities: comma-separated or as separate arguments.

## Steps

1. **Decompose.** Break the request into one focused capability query per intent. Run
   each as a separate `orbit_search` call. Do not cram intents into one query.

2. **Search.** Call `orbit_search` for each capability:
   - `q`: the query (required, max 512 chars)
   - `limit`: results per page (default 10, max 25)
   - `clientName`: pass `"opencode/orbit-plugin"` for anonymous usage analytics

   Query style matters. Include the product or provider name alongside the endpoint
   detail: `"PayPal create invoice"` or `"PayPal API to create an invoice"`. Avoid
   jumbled keyword piles (`"paypal invoice payment delivery ordering"`) and avoid
   `OR`-separated queries. Run separate calls instead.

3. **Extract.** For each result in `data`, keep:
   - `id`: the `urn:orbit:endpoint:v1:...` identifier. Preserve it verbatim; step 5
     needs it. Never parse, edit, or construct one.
   - `resourceType`: needed as `type` in step 5
   - `name`, `method`, `url`, `provider`
   - `evaluateGuide`: the three-part breakdown: summary, `Use for:`, `Not supported:`

4. **Paginate if needed.** If `meta.nextCursor` is present, call `orbit_search` again with
   `cursor` set to that value. `nextCursor` is *absent* on the last page, not null.
   Pagination caps at 40 results per query.

5. **Integrate.** When the user has a concrete task and the endpoint set looks right,
   call `orbit_integrate`:
   - `task`: what they're building (required, max 512 chars)
   - `resources`: entries of `{id, type}`, where `id` and `type` come from a search
     result's `id` and `resourceType`. The schema allows up to 10, but **keep calls
     narrow: 2 or 3 related endpoints**. Wide calls have been observed to return a
     one-line restatement instead of a real brief. To cover more endpoints, make
     several focused calls grouped by sub-task rather than one wide call.

   The returned `taskBrief` covers auth requirements, base URLs, ordered request steps,
   parameters, inter-step dependencies, and gotchas.

6. **Summarize.** Present the top matches to the user, leading with the
   `Not supported:` lines. Those are the design gaps worth acting on.

## Output format

For each API result:

```
### <name> (<provider>)
- **Method:** <method>
- **URL:** <url>
- **ID:** <id>
- **Evaluate Guide:** <evaluateGuide summary>
```

Group results under `## <capability query>` headings when multiple queries are run.

## Notes

- If a query returns zero results, say so. Don't fabricate endpoints.
- Never construct or edit an `id`. Pass search `id`s to `orbit_integrate` byte-for-byte.
- The `evaluateGuide` field is the key value: it tells you what an API is good for and
  what it can't do, saving trial-and-error.
- Both tools are read-only and safe to retry. On a rate-limit error, back off and retry.
- Orbit is designed for agent consumption (compact payloads, structured guidance) vs
  human browsing of an API catalog in a web UI.

## Fallback

If the MCP tools are unavailable (the server is unreachable, or the `orbit` server is not
configured), call the equivalent REST endpoints with curl, and ask the user to approve each
command. The request and response shapes are identical:
`POST https://api.buildwithorbit.ai/v1/search` and `POST https://api.buildwithorbit.ai/v1/integrate`.
Full reference: https://www.buildwithorbit.ai/api-reference. When this skill is installed
from its folder, `references/orbit-api.md` next to this file has the same details.
