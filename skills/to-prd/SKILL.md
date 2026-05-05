---
name: to-prd
description: Turn the current conversation context into a PRD and save it to local project files. Use when user wants to create a PRD from the current context.
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know.

Default PRD location: `docs/prds/`.

## Local Markdown conventions

PRDs and issues live as Markdown files in the repository:

- PRDs live in `docs/prds/` by default.
- Implementation issues live in `docs/issues/` by default.
- PRD filenames use a readable kebab-case slug: `docs/prds/<slug>.md`.
- Triage labels are recorded in frontmatter under `labels`.
- Work state is recorded in frontmatter under `status`.
- Comments and conversation history, when needed, are appended under a `## Comments` heading.

Use these triage labels:

- `needs-triage` — maintainer needs to evaluate the PRD or issue.
- `needs-info` — waiting on the requester for more information.
- `ready-for-agent` — fully specified and ready for an AFK coding agent.
- `ready-for-human` — requires human implementation or judgement.
- `wontfix` — will not be actioned.

Newly created PRD files should start with the `needs-triage` label and `status: open`.

## Domain docs

When exploring the codebase, first look for:

- `CONTEXT.md` at the repo root.
- `CONTEXT-MAP.md` at the repo root. If present, use it to find relevant context-specific `CONTEXT.md` files.
- `docs/adr/` for architectural decisions relevant to the area.
- In multi-context repos, also check `src/<context>/CONTEXT.md` and `src/<context>/docs/adr/` when relevant.

If these files do not exist, proceed silently. Do not suggest creating them up front.

Use glossary terms from `CONTEXT.md` in PRD titles, user stories, implementation decisions, testing decisions, and final notes. If the PRD contradicts an existing ADR, call that out explicitly in `Further Notes` rather than silently overriding it.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

3. Write the PRD using the template below, then save it to a local project file. Apply the `needs-triage` triage label in the file so it enters the normal triage flow.

<prd-template>
---
title: Short PRD title
labels:
  - needs-triage
status: open
---

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature, including ADR conflicts or domain-language gaps discovered while writing the PRD.

## Comments

Append follow-up discussion or clarifications here if needed.

</prd-template>
