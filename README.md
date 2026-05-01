# pi-tbyi

Think Before You Implement: a Pi extension package bundling selected skills adapted from Matt Pocock's [`skills`](https://github.com/mattpocock/skills) repository.

Included skills:

- `grill-me`
- `to-prd`
- `to-issues`
- `tdd`

The GitHub / remote issue-tracker workflows in `to-prd` and `to-issues` have been adapted to use local project files instead:

- PRDs are written to `docs/prds/` by default.
- Issues are written to `docs/issues/` by default.
- `needs-triage` is represented in YAML frontmatter.
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
/skill:to-issues
/skill:tdd
```

The extension also registers `/tbyi-info` to confirm the package is loaded.

## Attribution

This package is MIT licensed. The bundled skill instructions are adapted from Matt Pocock's `skills` repository: <https://github.com/mattpocock/skills>.
