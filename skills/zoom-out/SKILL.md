---
name: zoom-out
description: Ask for a broader map of an unfamiliar section of code and how it fits into the larger system. Use when you need higher-level context before planning or implementing.
disable-model-invocation: true
---

I don't know this area of code well. Go up a layer of abstraction.

First look for `CONTEXT.md`, `CONTEXT-MAP.md`, and relevant ADRs under `docs/adr/` or `src/<context>/docs/adr/`. If they do not exist, proceed silently.

Give me a concise map of:

- the relevant domain concepts, using the project's glossary vocabulary
- the relevant modules and their responsibilities
- the important callers/callees and data flow
- the seams where behavior can be changed or tested
- any ADRs or constraints that shape this area
- what I should understand before changing this code
