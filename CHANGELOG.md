# Changelog

All notable changes to this plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Add your changes under `[Unreleased]` in every PR that touches the shipped surface. A maintainer moves that
section into a dated, versioned entry when cutting a release; see [RELEASING.md](RELEASING.md).

## [Unreleased]

## [1.0.0] - 2026-10-26

### Added

- OpenCode plugin (`@postman/opencode-orbit`) whose `config` hook registers Orbit's remote MCP server
  (`https://mcp.buildwithorbit.ai/mcp`, authless) as `mcp.orbit` and adds the `/orbit-discover` command.
  Existing user `mcp.orbit` and `orbit-discover` entries are never overwritten.
- `discover` Agent Skill (`skills/discover/`) with the REST fallback reference, for users who prefer a skill
  over the command. Ported from the Orbit Claude Code plugin with OpenCode tool names (`orbit_search`,
  `orbit_integrate`) and `clientName: "opencode/orbit-plugin"`.
- Tests, including a guard that keeps the command template and `SKILL.md` in sync.
