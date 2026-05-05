---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable local Markdown issue files using tracer-bullet vertical slices. Use when user wants to convert a plan into implementation tickets, create local issues, or break down work into issues.
---

# To Issues

Break a plan into independently-grabbable local Markdown issue files using vertical slices (tracer bullets).

Default issue location: `docs/issues/`.

## Local Markdown conventions

PRDs and issues live as Markdown files in the repository:

- PRDs live in `docs/prds/` by default.
- Implementation issues live in `docs/issues/` by default.
- Issue filenames use dependency order plus a kebab-case slug: `docs/issues/<NNN>-<slug>.md`.
- Category and triage labels are recorded in frontmatter under `labels`.
- Work state is recorded in frontmatter under `status`.
- Comments and conversation history, when needed, are appended under a `## Comments` heading.

Use these category labels:

- `bug` — something is broken.
- `enhancement` — a new feature or improvement.

Use these triage labels:

- `needs-triage` — maintainer needs to evaluate the issue.
- `needs-info` — waiting on the requester for more information.
- `ready-for-agent` — fully specified and ready for an AFK coding agent.
- `ready-for-human` — requires human implementation or judgement.
- `wontfix` — will not be actioned.

Newly created issue files should usually start with labels `enhancement` and `needs-triage`, plus `status: open`.

## Domain docs

When exploring the codebase, first look for:

- `CONTEXT.md` at the repo root.
- `CONTEXT-MAP.md` at the repo root. If present, use it to find relevant context-specific `CONTEXT.md` files.
- `docs/adr/` for architectural decisions relevant to the area.
- In multi-context repos, also check `src/<context>/CONTEXT.md` and `src/<context>/docs/adr/` when relevant.

If these files do not exist, proceed silently. Do not suggest creating them up front.

Use glossary terms from `CONTEXT.md` in issue titles, descriptions, acceptance criteria, and user-story references. If a slice contradicts an existing ADR, call that out explicitly in the issue body rather than silently overriding it.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a PRD path, issue path, Markdown file path, or other local reference as an argument, read its full contents before drafting issues.

If the source references other local files, read them when needed to understand the plan.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be `HITL` or `AFK`:

- `HITL` slices require human interaction, such as an architectural decision, design review, manual QA, or external approval.
- `AFK` slices can be implemented and verified by the coding agent without human interaction.

Prefer `AFK` over `HITL` where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer needed for the behavior, such as schema, API, UI, docs, and tests where relevant.
- A completed slice is demoable or verifiable on its own.
- Prefer many thin slices over few thick ones.
- Avoid horizontal tickets like "build database layer" or "add UI" unless that is truly the smallest independently verifiable slice.
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: `HITL` / `AFK`
- **Blocked by**: which other slices, if any, must complete first
- **User stories covered**: which user stories this addresses, if the source material has them

Ask the user:

- Does the granularity feel right? Too coarse or too fine?
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as `HITL` and `AFK`?

Iterate until the user approves the breakdown.

### 5. Write the issue Markdown files

For each approved slice, create a new Markdown issue file in `docs/issues/` unless the user specifies another directory.

Create the directory if it does not exist.

Use stable, readable filenames:

- Prefix with an ordered number that reflects dependency order, blockers first.
- Use a kebab-case slug of the title.
- Example: `docs/issues/001-add-basic-login-flow.md`

Write files in dependency order so later files can reference earlier file paths in the `Blocked by` section.

Apply the `needs-triage` triage label in each file so it enters the normal local triage flow.

Use the issue body template below.

<issue-template>
---
title: Short issue title
labels:
  - enhancement
  - needs-triage
type: AFK
status: open
---

## Parent

A local file path reference to the parent PRD, plan, or issue if the source was an existing file. Omit this section if there is no parent source file.

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. Mention any relevant ADR conflict or domain-language gap discovered while drafting the issue.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A local file path reference to each blocking issue file.

Or `None - can start immediately` if no blockers.

## User stories covered

- Reference relevant user stories from the source material, if any.

## Comments

Append comments or follow-up conversation here if needed.

</issue-template>

Do NOT close or modify any parent PRD, plan, or issue unless the user explicitly asks you to.
