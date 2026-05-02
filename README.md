# pi-tbyi

Think Before You Implement: a Pi extension package bundling selected skills adapted from Matt Pocock's [`skills`](https://github.com/mattpocock/skills) repository.

Included skills:

- `grill-me`
- `to-prd`
- `tdd`

The GitHub / remote issue-tracker workflow in `to-prd` has been adapted to use local project files instead:

- PRDs are written to `docs/prds/` by default.
- Remote tracker references should be replaced by local file paths or pasted content.

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
/skill:to-prd
/skill:tdd
/tbyi-implement
```

The extension also registers:

- `question-tool`, a structured user-question tool with 2-4 options plus automatic `Other` input. It does not persist answers to files.
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
