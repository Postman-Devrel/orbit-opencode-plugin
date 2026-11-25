import type { Config } from "@opencode-ai/plugin";
export declare const ORBIT_MCP_URL = "https://mcp.buildwithorbit.ai/mcp";
/**
 * Adds Orbit's remote MCP server and the /orbit-discover command to the user's config.
 * Never overwrites an existing `mcp.orbit` or `command["orbit-discover"]`.
 * OpenCode calls this hook before it reads `mcp` and `command` (see README, "How it works").
 */
export declare function applyOrbitConfig(config: Config): void;
