import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { Config } from "@opencode-ai/plugin";
import * as entry from "../src/index.ts";
import OrbitPlugin from "../src/index.ts";
import { DISCOVER_DESCRIPTION, DISCOVER_TEMPLATE } from "../src/discover.ts";
// @ts-expect-error plain .mjs helper without types
import { parseSkill, render } from "../scripts/render-discover.mjs";

const skillPath = new URL("../skills/discover/SKILL.md", import.meta.url);
const generatedPath = new URL("../src/discover.ts", import.meta.url);

async function run(config: Config): Promise<Config> {
  const hooks = await OrbitPlugin({} as never);
  await hooks.config!(config);
  return config;
}

test("adds the orbit MCP server and /orbit-discover on an empty config", async () => {
  const config = await run({});
  assert.deepEqual(config.mcp?.orbit, {
    type: "remote",
    url: "https://mcp.buildwithorbit.ai/mcp",
    enabled: true,
  });
  assert.equal(config.command?.["orbit-discover"]?.template, DISCOVER_TEMPLATE);
  assert.equal(config.command?.["orbit-discover"]?.description, DISCOVER_DESCRIPTION);
});

test("preserves an existing mcp.orbit entry", async () => {
  const mine = { type: "remote", url: "https://example.test/mcp", enabled: false } as const;
  const config = await run({ mcp: { orbit: mine } });
  assert.deepEqual(config.mcp?.orbit, mine);
});

test("preserves an existing orbit-discover command", async () => {
  const mine = { template: "mine", description: "mine" };
  const config = await run({ command: { "orbit-discover": mine } });
  assert.deepEqual(config.command?.["orbit-discover"], mine);
  assert.equal(config.mcp?.orbit?.type, "remote");
});

test("leaves unrelated keys alone", async () => {
  const config = await run({
    model: "x/y",
    mcp: { other: { type: "local", command: ["echo"] } },
    command: { other: { template: "t" } },
  });
  assert.equal(config.model, "x/y");
  assert.deepEqual(config.mcp?.other, { type: "local", command: ["echo"] });
  assert.deepEqual(config.command?.other, { template: "t" });
});

test("is idempotent", async () => {
  const once = await run({});
  const snapshot = structuredClone(once);
  await run(once);
  assert.deepEqual(once, snapshot);
});

test("every export of the entry module is a function (OpenCode's loader requires it)", () => {
  for (const [name, value] of Object.entries(entry)) {
    assert.equal(typeof value, "function", `export ${name} must be a function`);
  }
  assert.equal(entry.default, entry.OrbitPlugin);
});

test("drift guard: src/discover.ts is generated from skills/discover/SKILL.md", () => {
  assert.equal(
    readFileSync(generatedPath, "utf8"),
    render(),
    "src/discover.ts is stale. Run `npm run render`.",
  );
  const { description, body } = parseSkill(readFileSync(skillPath, "utf8"));
  assert.equal(DISCOVER_DESCRIPTION, description);
  assert.ok(DISCOVER_TEMPLATE.startsWith(body));
  assert.ok(DISCOVER_TEMPLATE.includes("$ARGUMENTS"));
});

test("template is safe for OpenCode's command expansion", () => {
  assert.ok(!/\$\d/.test(DISCOVER_TEMPLATE), "positional $N placeholders would be substituted");
  assert.ok(!/!`[^`]+`/.test(DISCOVER_TEMPLATE), "!`cmd` would be executed as a shell command");
  assert.ok(!/(?<![\w`])@\S/.test(DISCOVER_TEMPLATE), "@name would be resolved as a file reference");
});

test("skill uses OpenCode tool names and clientName", () => {
  const text = readFileSync(skillPath, "utf8");
  assert.match(text, /^name: discover$/m);
  assert.ok(text.includes("orbit_search") && text.includes("orbit_integrate"));
  assert.ok(text.includes('"opencode/orbit-plugin"'));
  assert.ok(!text.includes("mcp__plugin_orbit") && !text.includes("allowed-tools"));
});
