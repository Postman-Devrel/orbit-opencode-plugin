import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ORBIT_MCP_URL } from "./config.ts";

// OpenCode V2 server entry (resolved through `exports["./server"]`). V2 requires a default export
// of `{ id, setup }`; the V1 entry (`./index.ts`) must keep exporting only plugin functions, so the
// two live in separate modules. The V2 types ship in a newer @opencode-ai/plugin than the one this
// repo builds against, so the few members used here are typed structurally.
interface McpEditor {
  get(name: string): unknown;
  set(name: string, config: { type: "remote"; url: string }): void;
}
interface SkillEditor {
  get(id: string): unknown;
  add(skill: { id: string; name: string; description?: string; path: string; content: string }): void;
}
interface Transformable<Editor> {
  transform(callback: (editor: Editor) => void): Promise<unknown>;
}
interface Context {
  mcp: Transformable<McpEditor>;
  skill: Transformable<SkillEditor>;
}

const SKILL_FILE = fileURLToPath(new URL("../skills/discover/SKILL.md", import.meta.url));

function readSkill(): { description?: string; content: string } {
  const raw = readFileSync(SKILL_FILE, "utf8");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  const description = match?.[1].match(/^description:\s*(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, "");
  return { description, content: match ? match[2] : raw };
}

export default {
  id: "postman.orbit",
  setup: async (ctx: Context) => {
    await ctx.mcp.transform((mcp) => {
      if (!mcp.get("orbit")) mcp.set("orbit", { type: "remote", url: ORBIT_MCP_URL });
    });

    const skill = readSkill();
    await ctx.skill.transform((skills) => {
      if (skills.get("orbit-discover")) return;
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
