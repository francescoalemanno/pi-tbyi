# CONTEXT.md Format

`CONTEXT.md` captures the project's domain language. It helps agents use the same words as the team and avoid verbose, invented terminology.

Keep it short and durable. Do not turn it into implementation documentation.

## Template

```markdown
# Project Context

## Language

**Canonical Term**:
A concise definition in domain language.
_Avoid_: near-synonym, overloaded word, implementation-only name

## Relationships

- A **Canonical Term** belongs to another **Canonical Term**
- A **Canonical Term** transitions through these states: X, Y, Z

## Flagged ambiguities

- "ambiguous term" may mean X or Y. Resolved: use **Canonical Term** for X and **Other Term** for Y.
```

## Rules

- Define domain concepts, not files/classes/functions.
- Prefer terms users and domain experts would recognize.
- Include explicit “Avoid” synonyms when they prevent drift.
- Record relationships when they clarify the model.
- Record resolved ambiguities so future sessions do not re-litigate them.
- Keep entries concise; link to ADRs for hard architectural decisions.
