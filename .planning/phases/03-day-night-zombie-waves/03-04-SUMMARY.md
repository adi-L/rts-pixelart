---
phase: 03-day-night-zombie-waves
plan: 04
subsystem: game-integration
tags: [integration, game-loop, phase3-wiring]
dependency_graph:
  requires: [03-01, 03-02, 03-03]
  provides: [complete-survival-loop]
  affects: [src/scenes/Game.ts]
tech_stack:
  added: []
  patterns: [system-wiring, physics-overlap, role-assignment, lifecycle-cleanup]
key_files:
  modified:
    - src/scenes/Game.ts
decisions:
  - "Arrow-zombie overlap is the only physics.add.overlap needed -- zombie-structure and zombie-NPC collisions are handled internally by WaveManager.update() via distance checks"
  - "assignCitizenAsArcher follows the same pattern as assignCitizenAsBuilder for consistency"
  - "ZOMBIE_CONTACT_DISTANCE already existed in constants.ts from Plan 01 -- no addition needed"
metrics:
  duration_seconds: 92
  completed: "2026-04-18T04:25:38Z"
  tasks_completed: 1
  tasks_total: 2
  status: checkpoint-pending
---

# Phase 03 Plan 04: Game.ts Phase 3 Integration Summary

Wire DayNightCycleManager, WaveManager, arrow pool, and archer role assignment into Game.ts to complete the survival loop

## One-liner

Full Phase 3 system integration into Game.ts: day/night cycle, zombie waves, arrow-zombie overlap, and archer role assignment on tower construction

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire all Phase 3 systems into Game.ts | a4b0af6 | src/scenes/Game.ts |

## Tasks Pending

| Task | Name | Type | Status |
|------|------|------|--------|
| 2 | Verify complete survival loop | checkpoint:human-verify | Pending human verification |

## What Was Done

### Task 1: Wire all Phase 3 systems into Game.ts

1. Added imports for DayNightCycleManager, WaveManager, Archer, Arrow functions, and ARROW_DAMAGE constant
2. Added private fields for dayNightCycle, waveManager, and arrowPool
3. Initialized all three Phase 3 systems in create() after existing Phase 2 systems
4. Registered arrow-zombie physics overlap (the only overlap needed -- zombie-structure and zombie-NPC are handled internally by WaveManager)
5. Extended onStructureBuilt listener to handle tower construction by assigning nearest citizen as archer (D-13)
6. Added assignCitizenAsArcher method following the same pattern as assignCitizenAsBuilder
7. Added Phase 3 system updates to the game loop (dayNightCycle.update, waveManager.update, updateArrows)
8. Added Phase 3 system cleanup on scene shutdown (destroy dayNightCycle, waveManager, arrowPool)

## Deviations from Plan

### Skipped Steps

**1. [Skipped] ZOMBIE_CONTACT_DISTANCE constant addition**
- **Reason:** Already present in src/constants.ts (line 242) from Plan 01
- **Impact:** None -- constant exists exactly as specified

## Verification Results

- `npx tsc --noEmit` exits 0 (zero errors)
- All 21 acceptance criteria verified passing
- No handleZombieStructureOverlap or handleZombieNPCOverlap in Game.ts (correct -- handled by WaveManager)

## Checkpoint: Human Verification Pending

Task 2 requires human visual verification of the complete survival loop. See 03-04-PLAN.md Task 2 for detailed verification steps.

## Self-Check: PASSED

- [x] src/scenes/Game.ts exists and contains all Phase 3 integration code
- [x] Commit a4b0af6 exists in git log
- [x] No unexpected file deletions
