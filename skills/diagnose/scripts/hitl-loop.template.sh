#!/usr/bin/env bash
set -euo pipefail

# HITL loop template for diagnosis when a human must perform part of the repro.
# Copy this file into the project, edit the instructions/checks, and run it.

ITERATIONS="${ITERATIONS:-10}"

for i in $(seq 1 "$ITERATIONS"); do
  echo "=== HITL repro iteration $i/$ITERATIONS ==="
  echo "Human step: perform the manual action that triggers the bug."
  echo "Then press Enter to continue, or Ctrl-C to stop."
  read -r _

  echo "Collecting observable output..."
  # Add commands here, for example:
  # curl -s http://localhost:3000/debug/state
  # npm test -- --runInBand path/to/relevant.test.ts

  echo "Record whether the bug reproduced in this iteration."
done
