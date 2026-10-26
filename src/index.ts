import type { Plugin } from "@opencode-ai/plugin";
import { applyOrbitConfig } from "./config.ts";

// NOTE: OpenCode treats every export of this module as a plugin function and throws on
// anything else, so this file may only export plugin functions.
export const OrbitPlugin: Plugin = async () => ({
  config: async (config) => {
    applyOrbitConfig(config);
  },
});

export default OrbitPlugin;
