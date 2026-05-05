# ADR Format

Use ADRs for durable architectural decisions that are hard to reverse, surprising without context, and the result of a real trade-off.

Create ADRs under `docs/adr/` unless a more specific context directory is clearly appropriate, such as `src/<context>/docs/adr/`.

Filename format:

```text
docs/adr/0001-short-kebab-case-title.md
```

Use the next available number.

## Template

```markdown
# ADR-0001: Short Decision Title

## Status

Accepted

## Context

What situation forced this decision? Include constraints, domain language, alternatives considered, and why the choice matters.

## Decision

What did we decide?

## Consequences

What becomes easier? What becomes harder? What trade-offs are we accepting?

## Alternatives considered

- Alternative A — why rejected.
- Alternative B — why rejected.
```

## Rules

- Do not write ADRs for obvious or easily reversible choices.
- Do not write ADRs for temporary project-management constraints.
- Prefer durable reasoning over implementation details.
- If a later plan contradicts an ADR, call out the contradiction explicitly before proceeding.
