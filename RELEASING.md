# Releasing

This plugin is published to npm as `@postman/opencode-orbit` and the source lives at
`github.com/Postman-Devrel/orbit-opencode-plugin`. A release is a version bump, a git tag, a GitHub Release and
an `npm publish`. A maintainer does all of it by hand; there is deliberately no automated publish workflow.

## Versioning

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`, tagged with the bare version (no `v`
prefix). The version lives in [`package.json`](package.json).

| Bump  | When |
| ----- | ---- |
| MAJOR | Breaking changes: renamed/removed command or skill, a changed MCP server key, or anything that breaks existing installs. |
| MINOR | New command, skill, or an additive capability. |
| PATCH | Fixes, doc/README tweaks, prompt refinements with no new surface. |

## Day-to-day: every PR

When your PR changes the shipped surface (`src/`, `skills/`, `scripts/`, `package.json`), add an entry under
`## [Unreleased]` in [`CHANGELOG.md`](CHANGELOG.md), grouped as `Added` / `Changed` / `Fixed` / `Removed`. Do not
bump `package.json` yourself. If you edit `skills/discover/SKILL.md`, run `npm run render` and commit the updated
`src/discover.ts`. The `PR Check` workflow fails on a missing changelog entry, a stale `src/discover.ts`,
type errors or failing tests.

## Cutting a release

You need npm publish rights on the `@postman` scope and push rights on the repo.

1. On an up-to-date `main`, check that `[Unreleased]` reflects everything to ship.
2. Bump the version without tagging: `npm version <patch|minor|major> --no-git-tag-version`.
3. In `CHANGELOG.md`, rename `## [Unreleased]` to `## [X.Y.Z] - <date>` and add a fresh empty `## [Unreleased]` above it.
4. Verify from a clean tree:
   ```bash
   npm ci && npm run build && npm run typecheck && npm test
   npm pack --dry-run        # check the file list: dist, skills, assets, README, CHANGELOG, LICENSE
   ```
5. Commit `chore(release): X.Y.Z`, tag it, and push both:
   ```bash
   git commit -am "chore(release): X.Y.Z"
   git tag -a X.Y.Z -m "X.Y.Z"
   git push origin main X.Y.Z
   ```
6. Publish to npm: `npm publish --access public` (the `prepublishOnly` script rebuilds `dist/`).
7. Create the GitHub Release from the tag, using that version's changelog section as the notes:
   `gh release create X.Y.Z --title X.Y.Z --notes-file <(awk '/^## \[X.Y.Z\]/{f=1;next} /^## /{f=0} f' CHANGELOG.md)`
8. Smoke test: in a scratch project with `"plugin": ["@postman/opencode-orbit"]`, run `opencode mcp list` and
   confirm `orbit` is connected.

The first release (`1.0.0`) is already versioned and changelogged; start at step 4.
