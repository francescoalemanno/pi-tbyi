# pi-tbyi

Think Before You Implement: a Pi extension package bundling selected skills adapted from Matt Pocock's [`skills`](https://github.com/mattpocock/skills) repository.

Included skills:

- `grill-me`
- `grill-with-docs`
- `to-prd`
- `to-issues`
- `triage`
- `tdd`
- `diagnose`
- `zoom-out`
- `improve-codebase-architecture`

The workflow uses local Markdown files:

- PRDs are written to `docs/prds/` by default.
- Issues are written to `docs/issues/` by default.
- PRDs and issues use frontmatter labels such as `needs-triage`, `ready-for-agent`, and `wontfix`.
- Skills read `CONTEXT.md`, `CONTEXT-MAP.md`, and ADRs when present, and proceed silently when they are absent.

## Install / use

Temporary use:

```bash
pi -e ~/pi-tbyi
```

Install globally:

```bash
pi install ~/pi-tbyi
```

Then use the skills with:

```text
/skill:grill-me
/skill:grill-with-docs
/skill:to-prd
/skill:to-issues
/skill:triage
/skill:tdd
/skill:diagnose
/skill:zoom-out
/skill:improve-codebase-architecture
/tbyi-implement
```

The extension also registers:

- `/tbyi-info` to confirm the package is loaded.
- `/tbyi-implement [--all] [prd-file]` to implement the highest-priority vertical slice from a PRD Markdown file in a clean session. If no PRD path is provided, it opens a simple picker for `docs/prds/*.md` plus manual path entry.

`/tbyi-implement` derives a status file next to the PRD as `<prd-basename>.status.md`. The status file starts with a JSON object header followed by Markdown notes:

```json
{
  "status": "incomplete",
  "blocked_reason": null
}
```

Allowed statuses are `incomplete`, `blocked`, and `complete`. The agent maintains the Markdown sections for what was implemented, what is missing, and notes. If the JSON header is invalid, the command asks the agent to repair it up to three times. With `--all`, each slice runs in a fresh session until the status becomes `complete`/`blocked` or the PRD+status files are unchanged for two iterations.

## Attribution

This package is MIT licensed. The bundled skill instructions are adapted from Matt Pocock's `skills` repository: <https://github.com/mattpocock/skills>.
