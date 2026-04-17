---
phase: 02-citizen-economy-structures
plan: 01
subsystem: economy-hud
tags: [economy, hud, constants, state-management]
dependency_graph:
  requires: [EventBus]
  provides: [EconomyManager, HUD, Phase2Constants, BuildPointLayout]
  affects: [Game.ts]
tech_stack:
  added: []
  patterns: [singleton-state-manager, event-driven-ui, camera-fixed-hud]
key_files:
  created:
    - src/systems/EconomyManager.ts
    - src/ui/HUD.ts
  modified:
    - src/constants.ts
decisions:
  - EconomyManager is a plain class (no scene dependency) communicating via EventBus
  - HUD stores listener reference for clean removal in destroy()
  - BUILD_POINT_LAYOUT uses symmetric positions around x=3000
metrics:
  duration: 2m 11s
  completed: 2026-04-17T17:15:48Z
  tasks_completed: 2
  tasks_total: 2
---

# Phase 02 Plan 01: Economy Constants, EconomyManager, and HUD Summary

All Phase 2 constants added to constants.ts, EconomyManager singleton created for centralized coin/day state with EventBus emission, and HUD class created for camera-fixed coin count and day display.

## What Was Built

### Task 1: Phase 2 Constants and EconomyManager (2403462)
- Appended ~160 lines of Phase 2 constants to `src/constants.ts` covering HUD dimensions, NPC colors/speeds/behavior, structure dimensions/colors/costs/HP, base tiers, health bars, construction timing, farm economy, tween durations, and build point layout
- Added `BuildPointType` type and `BuildPointConfig` interface for typed build point definitions
- Added `BUILD_POINT_LAYOUT` array with 10 symmetric build points around x=3000
- Created `src/systems/EconomyManager.ts` with `addCoins(amount, source)`, `spendCoins(amount): boolean`, `setDay(day)`, and `reset()` methods
- EconomyManager emits `economy:changed` via EventBus on every state change

### Task 2: HUD Class (f450b20)
- Created `src/ui/HUD.ts` with camera-fixed coin icon (gold circle), coin count text, and day number text
- All elements use `setScrollFactor(0)` and `setDepth(100)` for camera-fixed rendering
- Listens to `economy:changed` EventBus events to update display in real time
- `destroy()` method properly removes EventBus listener and destroys all game objects

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 2403462 | feat(02-01): add Phase 2 constants and create EconomyManager |
| 2 | f450b20 | feat(02-01): create HUD class with coin count and day display |

## Known Stubs

None. Both EconomyManager and HUD are fully functional. The HUD will show "0" coins and "Day 1" until wired into Game.ts (Plan 05 scope).

## Verification

- `npx tsc --noEmit` passes with zero errors
- All acceptance criteria met for both tasks
