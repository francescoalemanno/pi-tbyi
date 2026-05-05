# Deepening Modules

A deepening refactor moves complexity behind a simpler, more stable interface.

## Signs a module is shallow

- Its interface exposes nearly every implementation choice.
- Callers must coordinate multiple calls in a precise order.
- Callers repeat the same validation, branching, or transformation logic.
- Tests must mock several internal collaborators to verify one behavior.
- Understanding one behavior requires reading many tiny pass-through files.

## Signs a module is deep

- Callers express intent in domain language.
- The module enforces invariants internally.
- Tests verify behavior through one public interface.
- Changes to implementation do not ripple through callers.
- The module name maps to a real domain or architectural concept.

## Deepening moves

- Collapse pass-through layers.
- Move repeated caller logic behind one interface.
- Introduce a domain-specific input or result type.
- Make invalid states unrepresentable.
- Replace orchestration spread across callers with one module that owns the workflow.
- Create an adapter only when the seam is real.

## Not every refactor is deepening

Avoid changes that merely rearrange files, rename classes, or extract tiny helpers without increasing locality or leverage.
