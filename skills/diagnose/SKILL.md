---
name: diagnose
description: Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test. Use when user says diagnose/debug, reports a bug, says something is broken/throwing/failing, or describes a performance regression.
---

# Diagnose

A discipline for hard bugs. Skip phases only when explicitly justified.

When exploring the codebase, first look for `CONTEXT.md`, `CONTEXT-MAP.md`, and relevant ADRs under `docs/adr/` or `src/<context>/docs/adr/`. If they do not exist, proceed silently. Use glossary vocabulary and call out ADR conflicts.

## Phase 1 — Build a feedback loop

This is the skill. If you have a fast, deterministic, agent-runnable pass/fail signal for the bug, you can find the cause. Without one, you are guessing.

Try to construct a loop in roughly this order:

1. Failing test at the seam that reaches the bug: unit, integration, or e2e.
2. HTTP/scripted request against a running dev server.
3. CLI invocation with fixture input and expected output.
4. Headless browser script for UI bugs.
5. Replay a captured trace, payload, request, or event log.
6. Throwaway harness that exercises the bug path in isolation.
7. Property/fuzz loop for “sometimes wrong output” bugs.
8. Bisection harness if the bug appeared between known versions.
9. Differential loop comparing old vs new behavior or config.
10. HITL loop only as a last resort; structure the human steps using [hitl-loop.template.sh](./scripts/hitl-loop.template.sh).

Once you have a loop, improve it:

- make it faster
- make the signal sharper
- make it deterministic

For non-deterministic bugs, raise the reproduction rate. Loop, parallelise, add stress, narrow timing windows, seed randomness, or freeze time where appropriate.

If you genuinely cannot build a loop, stop. List what you tried and ask for the missing artifact or access. Do not proceed to hypothesise without a loop.

## Phase 2 — Reproduce

Run the loop and watch the bug appear.

Confirm:

- [ ] The loop produces the failure mode the user described, not a nearby failure.
- [ ] The failure is reproducible across runs, or frequent enough to debug.
- [ ] The exact symptom is captured.

Do not proceed until the bug is reproduced.

## Phase 3 — Hypothesise

Generate 3–5 ranked hypotheses before testing any of them. Each hypothesis must be falsifiable.

Format:

> If <X> is the cause, then <changing Y> will make the bug disappear / <checking Z> will show <specific observation>.

Show the ranked list to the user before testing when practical. If the user is AFK, continue with your ranking.

## Phase 4 — Instrument

Each probe must map to a prediction from Phase 3. Change one variable at a time.

Prefer:

1. Debugger or REPL inspection.
2. Targeted logs at boundaries that distinguish hypotheses.
3. Never “log everything and search”.

Tag every temporary debug log with a unique prefix such as `[DEBUG-a4f2]` so cleanup is easy.

For performance regressions, measure first: baseline timing, profiler, query plan, flamegraph, or bisection. Fix second.

## Phase 5 — Fix + regression test

Write the regression test before the fix, but only if there is a correct seam for it.

A correct seam exercises the real bug pattern as it occurs at the call site. If the only seam is too shallow, note that architecture is preventing the bug from being locked down.

If a correct seam exists:

1. Turn the minimized repro into a failing test.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the original feedback loop.

## Phase 6 — Cleanup + post-mortem

Before declaring done:

- [ ] Original repro no longer reproduces.
- [ ] Regression test passes, or absence of a correct seam is documented.
- [ ] Temporary `[DEBUG-...]` instrumentation is removed.
- [ ] Throwaway prototypes are deleted or clearly marked.
- [ ] The winning hypothesis is stated in the final response.

Then ask: what would have prevented this bug? If the answer is architectural, recommend using `/skill:improve-codebase-architecture` with the specifics learned.
