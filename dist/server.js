import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ORBIT_MCP_URL } from "./config.js";
const SKILL_FILE = fileURLToPath(new URL("../skills/discover/SKILL.md", import.meta.url));
function readSkill() {
    const raw = readFileSync(SKILL_FILE, "utf8");
    const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
    const description = match?.[1].match(/^description:\s*(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, "");
    return { description, content: match ? match[2] : raw };
}
export default {
    id: "postman.orbit",
    setup: async (ctx) => {
        await ctx.mcp.transform((mcp) => {
            if (!mcp.get("orbit"))
                mcp.set("orbit", { type: "remote", url: ORBIT_MCP_URL });
        });
        const skill = readSkill();
        await ctx.skill.transform((skills) => {
            if (skills.get("orbit-discover"))
                return;
            skills.add({
                id: "orbit-discover",
                name: "orbit-discover",
                description: skill.description,
                path: SKILL_FILE,
                content: skill.content,
            });
        });
    },
};
