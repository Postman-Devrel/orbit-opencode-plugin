// Renders src/discover.ts from skills/discover/SKILL.md, the single source of truth.
// Usage: node scripts/render-discover.mjs          (rewrite src/discover.ts)
//        import { render } from "./render-discover.mjs"  (used by the drift test)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);

export function parseSkill(text) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!m) throw new Error("SKILL.md has no frontmatter");
  const description = /^description:\s*"(.*)"\s*$/m.exec(m[1])?.[1];
  if (!description) throw new Error("SKILL.md frontmatter needs a double-quoted description");
  return { description: JSON.parse(`"${description}"`), body: m[2].trim() };
}

export function render() {
  const { description, body } = parseSkill(readFileSync(new URL("skills/discover/SKILL.md", root), "utf8"));
  const template = `${body}\n\n## Request\n\n$ARGUMENTS\n`;
  return (
    "// GENERATED from skills/discover/SKILL.md by scripts/render-discover.mjs. Do not edit.\n" +
    "// Run `npm run render` after changing the skill.\n" +
    `export const DISCOVER_DESCRIPTION = ${JSON.stringify(description)};\n\n` +
    `export const DISCOVER_TEMPLATE = ${JSON.stringify(template)};\n`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL("src/discover.ts", root), render());
}
