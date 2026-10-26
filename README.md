# Orbit for OpenCode

<!-- Maintainers: this package is not on npm yet. Publish it (see RELEASING.md) before announcing the install line below. -->

Turn any task into the right API calls. Describe your task, and [Postman Orbit](https://www.buildwithorbit.ai)
finds public API endpoints that fit, then generates instructions to call them, from auth to gotchas, so agents
can discover, evaluate, and integrate public APIs.

This plugin wires Orbit into [OpenCode](https://opencode.ai):

- registers Orbit's remote MCP server (`https://mcp.buildwithorbit.ai/mcp`) as `orbit`
- adds an `/orbit-discover` command that runs the discovery workflow

## Install

Add the plugin to your `opencode.json` (project) or `~/.config/opencode/opencode.json` (global):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@postman/opencode-orbit"]
}
```

OpenCode installs it on the next start. No API key and no account: Orbit's MCP server is authless.

Then, in OpenCode:

```
/orbit-discover payment processing for subscriptions
/orbit-discover send transactional email, geocode addresses, payment processing
```

## Tools

Orbit's MCP server exposes two read-only tools. OpenCode names MCP tools `<server key>_<tool>`, so they appear as:

| Tool | What it does |
| --- | --- |
| `orbit_search` | Finds API endpoints matching a capability. Each result carries an `evaluateGuide`: what the endpoint does, what it is for, and what it does not support. |
| `orbit_integrate` | Takes the endpoints you picked plus your task and returns a task brief: auth, base URLs, ordered request steps, parameters, gotchas. |

The `evaluateGuide` "Not supported" lines are the most useful part: they show design gaps before you write any
integration code.

## What the plugin does and does not touch

The plugin only fills gaps. If your config already has an `orbit` entry under `mcp`, or a command named
`orbit-discover`, it leaves yours alone. It never changes any other key.

## Without the plugin

You do not need the plugin to use Orbit. Add the MCP server yourself:

```bash
opencode mcp add
```

choose **Remote**, name it `orbit`, and use `https://mcp.buildwithorbit.ai/mcp`. Or edit `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "orbit": {
      "type": "remote",
      "url": "https://mcp.buildwithorbit.ai/mcp",
      "enabled": true
    }
  }
}
```

Keep the server name `orbit`, or the tool names in the command and skill (`orbit_search`, `orbit_integrate`) will not match.

## Use the skill instead of the command

The same workflow ships as an [Agent Skill](https://opencode.ai/docs/skills/), which the model loads on demand
(no slash command needed). OpenCode can't install a skill from a plugin, so copy it once:

```bash
# from a clone of this repo, or from node_modules/@postman/opencode-orbit
mkdir -p .opencode/skills
cp -R skills/discover .opencode/skills/discover
# or, for every project: ~/.config/opencode/skills/discover
```

The skill expects the `orbit` MCP server (via the plugin or the manual config above). If the tools are
unavailable, it falls back to Orbit's REST API, documented in
[`skills/discover/references/orbit-api.md`](skills/discover/references/orbit-api.md).

## How it works

OpenCode plugins can edit the loaded config in a `config` hook, before MCP servers and commands are read.
This plugin uses it to add the `mcp.orbit` and `command["orbit-discover"]` entries described above. The command
template is generated from [`skills/discover/SKILL.md`](skills/discover/SKILL.md) (`npm run render`), and a test
fails if the two drift apart.

## Development

```bash
npm ci
npm run build       # tsc -> dist/
npm run typecheck
npm test            # node:test, needs Node 24+ (runs the TypeScript tests directly)
```

To try a local build, point a project's `opencode.json` at it:

```json
{ "plugin": ["file:///absolute/path/to/orbit-opencode-plugin/dist/index.js"] }
```

then run `opencode mcp list`.

## Links

- [Orbit](https://www.buildwithorbit.ai) and its [API reference](https://www.buildwithorbit.ai/api-reference)
- [Orbit MCP server source](https://github.com/postmanlabs/orbit-mcp-server)
- [OpenCode plugins](https://opencode.ai/docs/plugins/), [MCP servers](https://opencode.ai/docs/mcp-servers/), [commands](https://opencode.ai/docs/commands/)
- Other Orbit plugins: [Claude Code](https://github.com/Postman-Devrel/orbit-claudecode-plugin), [Codex](https://github.com/Postman-Devrel/orbit-codex-plugin)
- Questions: team@buildwithorbit.ai

## License

Apache-2.0. See [LICENSE](LICENSE).
