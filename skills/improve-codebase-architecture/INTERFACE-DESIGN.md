# Interface Design

Use this when exploring a deepened module's shape.

## Good interface questions

- What behavior should callers get without knowing implementation details?
- What invariants can the module enforce internally?
- What parameters can be removed, grouped, or made more domain-specific?
- What errors can be made explicit?
- What ordering/lifecycle rules can be hidden?
- What should be impossible to misuse?

## Compare alternatives

For each candidate interface, evaluate:

- **Caller simplicity** — what does the caller need to know?
- **Depth** — how much behavior sits behind the interface?
- **Locality** — where will future changes concentrate?
- **Test surface** — can important behavior be verified through this interface?
- **Adapters** — is there more than one real implementation, or is the seam hypothetical?

## Avoid

- Pass-through wrappers.
- Generic bags of options that expose implementation details.
- Interfaces designed only around current file structure.
- Testing-only seams that production code does not naturally need.
- Premature abstraction before two concrete call sites or adapters reveal a stable shape.
