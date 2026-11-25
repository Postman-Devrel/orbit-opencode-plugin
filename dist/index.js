import { applyOrbitConfig } from "./config.js";
// NOTE: OpenCode treats every export of this module as a plugin function and throws on
// anything else, so this file may only export plugin functions.
export const OrbitPlugin = async () => ({
    config: async (config) => {
        applyOrbitConfig(config);
    },
});
export default OrbitPlugin;
