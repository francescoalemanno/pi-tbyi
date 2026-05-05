---
name: improve-codebase-architecture
description: Find deepening opportunities in a codebase, informed by domain language and ADRs. Use when user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make code more testable and agent-navigable.
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones. The aim is testability, locality, leverage, and agent-navigability.

## Glossary

Use these terms exactly in suggestions. Full definitions are in [LANGUAGE.md](./LANGUAGE.md).

- **Module** — anything with an interface and implementation.
- **Interface** — everything callers must know to use a module.
- **Implementation** — the code inside.
- **Depth** — leverage at the interface: lots of behavior behind a small interface.
- **Seam** — where an interface lives; a place behavior can be altered without editing in place.
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, and knowledge concentrated in one place.

Key principles:

- Deletion test: if deleting the module makes complexity vanish, it was probably pass-through. If complexity reappears across many callers, it was earning its keep.
- The interface is the test surface.
- One adapter = hypothetical seam. Two adapters = real seam.

## Process

### 1. Explore

First look for:

- `CONTEXT.md` at the repo root.
- `CONTEXT-MAP.md` at the repo root. If present, use it to find relevant context-specific `CONTEXT.md` files.
- `docs/adr/` for architectural decisions relevant to the area.
- In multi-context repos, also check `src/<context>/CONTEXT.md` and `src/<context>/docs/adr/` when relevant.

If these files do not exist, proceed silently.

Explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules shallow — interface nearly as complex as implementation?
- Where were pure functions extracted just for testability, while real bugs hide in orchestration?
- Where do tightly-coupled modules leak across seams?
- Which parts are untested or hard to test through the current interface?

Apply the deletion test to suspected shallow modules.

### 2. Present candidates

Present a numbered list of deepening opportunities. For each candidate:

- **Files/modules** — which areas are involved.
- **Problem** — why current architecture causes friction.
- **Solution** — plain English description of what would change.
- **Benefits** — explain in terms of locality, leverage, and testability.
- **ADR/domain notes** — any relevant glossary term or ADR conflict.

Use `CONTEXT.md` vocabulary for the domain and [LANGUAGE.md](./LANGUAGE.md) vocabulary for architecture.

Do not propose detailed interfaces yet. Ask: “Which of these would you like to explore?”

### 3. Grilling loop

Once the user picks a candidate, walk the design tree with them:

- constraints
- dependencies
- module shape
- what sits behind the seam
- what tests survive
- what adapters are real vs hypothetical

Side effects happen inline as decisions crystallize:

- If a deepened module needs a domain concept not in `CONTEXT.md`, add it using [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md).
- If fuzzy language is sharpened, update `CONTEXT.md` immediately.
- If the user rejects a candidate for a durable architectural reason, offer an ADR using [ADR-FORMAT.md](../grill-with-docs/ADR-FORMAT.md).
- If exploring interface shapes, use [INTERFACE-DESIGN.md](./INTERFACE-DESIGN.md).

### 4. Output

End with one of:

- a concrete refactor plan approved by the user
- local Markdown issue files via `/skill:to-issues`
- a PRD via `/skill:to-prd`
- an ADR documenting why no change should happen
