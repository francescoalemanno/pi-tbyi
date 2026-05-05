# Out-of-Scope Knowledge Base

The `.out-of-scope/` directory stores persistent records of rejected feature requests.

It serves two purposes:

1. Institutional memory — why a feature was rejected.
2. Deduplication — when a new request matches a prior rejection, surface the old decision instead of re-litigating it.

## Directory structure

```text
.out-of-scope/
├── dark-mode.md
├── plugin-system.md
└── graphql-api.md
```

One file per concept, not per issue. Multiple issues requesting the same thing are grouped under one file.

## File format

Write these as short readable design notes, not database records.

```markdown
# Dark Mode

This project does not support dark mode or user-facing theming.

## Why this is out of scope

Explain the durable reason. Good reasons reference project scope, technical constraints, or strategic decisions.

## Prior requests

- `docs/issues/012-dark-mode.md` — Add dark mode support
- `docs/issues/027-night-theme.md` — Night theme for accessibility
```

## Naming

Use a short descriptive kebab-case concept name: `dark-mode.md`, `plugin-system.md`, `graphql-api.md`.

## When to check `.out-of-scope/`

During triage, read all files in `.out-of-scope/`. When evaluating a new enhancement:

- Check if the request matches an existing out-of-scope concept.
- Match by concept similarity, not just keyword.
- Surface the match to the maintainer before applying `wontfix`.

The maintainer may confirm, reconsider, or decide the request is distinct.

## When to write `.out-of-scope/`

Only when an enhancement, not a bug, is rejected as `wontfix`.

Flow:

1. Maintainer decides the feature is out of scope.
2. Check if a matching file already exists.
3. If yes, append the new issue path to `Prior requests`.
4. If no, create a new file with concept name, decision, reason, and first prior request.
5. Add a triage note to the issue referencing the `.out-of-scope/` file.
6. Set the issue state label to `wontfix` and `status: closed`.

## Updating or removing out-of-scope files

If the maintainer changes their mind, update or delete the relevant `.out-of-scope/` file. Historical closed issues do not need to be reopened automatically.
