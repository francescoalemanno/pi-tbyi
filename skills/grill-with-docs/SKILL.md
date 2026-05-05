---
name: grill-with-docs
description: Grilling session that challenges a plan against the existing domain model, sharpens terminology, and updates local documentation such as CONTEXT.md and ADRs as decisions crystallise. Use when user wants to stress-test a plan against project language and documented decisions.
---

# Grill With Docs

Interview the user relentlessly about every aspect of the plan until you reach shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one. For each question, provide your recommended answer.

Ask questions one at a time, waiting for feedback on each question before continuing.

If a question can be answered by exploring the codebase, explore the codebase instead.

## Domain awareness

During codebase exploration, look for existing documentation:

- `CONTEXT.md` at the repo root.
- `CONTEXT-MAP.md` at the repo root. If present, use it to find relevant context-specific `CONTEXT.md` files.
- `docs/adr/` for architectural decisions relevant to the area.
- In multi-context repos, also check `src/<context>/CONTEXT.md` and `src/<context>/docs/adr/` when relevant.

If these files do not exist, proceed silently. Create files lazily only when you have something concrete to write.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with existing language in `CONTEXT.md`, call it out immediately:

> Your glossary defines "cancellation" as X, but you seem to mean Y — which is it?

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term:

> You're saying "account" — do you mean the Customer or the User? Those are different things.

### Discuss concrete scenarios

When domain relationships are discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force precision around concept boundaries.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it clearly.

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right away. Do not batch these updates. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

Do not couple `CONTEXT.md` to implementation details. Only include terms meaningful to domain experts.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing direction later is meaningful.
2. **Surprising without context** — a future reader would wonder why this choice was made.
3. **Real trade-off** — there were genuine alternatives and one was chosen for specific reasons.

If any condition is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
