import type { Config } from "@opencode-ai/plugin";
import { DISCOVER_DESCRIPTION, DISCOVER_TEMPLATE } from "./discover.ts";

export const ORBIT_MCP_URL = "https://mcp.buildwithorbit.ai/mcp";

/**
 * Adds Orbit's remote MCP server and the /orbit-discover command to the user's config.
 * Never overwrites an existing `mcp.orbit` or `command["orbit-discover"]`.
 * OpenCode calls this hook before it reads `mcp` and `command` (see README, "How it works").
 */
export function applyOrbitConfig(config: Config): void {
  config.mcp ??= {};
  if (!("orbit" in config.mcp)) {
    config.mcp.orbit = { type: "remote", url: ORBIT_MCP_URL, enabled: true };
  }

  config.command ??= {};
  if (!("orbit-discover" in config.command)) {
    config.command["orbit-discover"] = {
      description: DISCOVER_DESCRIPTION,
      template: DISCOVER_TEMPLATE,
    };
  }
}
