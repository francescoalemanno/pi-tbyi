# Architecture Language

Use this vocabulary consistently.

## Module

Anything with an **interface** and an **implementation**: function, class, package, subsystem, feature slice, or external integration wrapper.

Avoid using “component”, “service”, or “utility” when “module” is the clearer generic term.

## Interface

Everything a caller must know to use a module:

- types and signatures
- invariants
- ordering constraints
- error modes
- lifecycle
- configuration
- side effects

An interface is not just a type signature.

## Implementation

The code and decisions hidden behind the interface.

## Depth

Depth is leverage at the interface.

- **Deep module**: small/simple interface, substantial useful implementation.
- **Shallow module**: interface nearly as complex as the implementation.

Deep modules are easier to test, explain, and change.

## Seam

Where an interface lives; a place behavior can be changed or substituted without editing callers in place.

Use “seam”, not “boundary”, when discussing testability or replaceability.

## Adapter

A concrete thing satisfying an interface at a seam.

One adapter often means the seam is hypothetical. Two adapters usually mean the seam is real.

## Leverage

What callers get from depth: simple usage that unlocks complex behavior.

## Locality

What maintainers get from depth: related change, bugs, and knowledge concentrated in one place.

## Deletion test

Imagine deleting the module:

- If complexity vanishes, it may have been pass-through.
- If complexity reappears across many callers, it was probably earning its keep.

## Interface is the test surface

Good tests exercise the interface. If behavior cannot be tested through an interface, the design may need a better seam.
