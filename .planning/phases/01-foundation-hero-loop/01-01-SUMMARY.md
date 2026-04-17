---
phase: 01-foundation-hero-loop
plan: 01
subsystem: infrastructure
tags: [cleanup, constants, event-bus, physics, scene-chain]
dependency_graph:
  requires: []
  provides: [constants, EventBus, arcade-physics, scene-chain, hero-spritesheet-loaded]
  affects: [src/main.ts, src/scenes/*, src/constants.ts, src/events/EventBus.ts]
tech_stack:
  added: []
  patterns: [centralized-constants, event-emitter-singleton, arcade-physics]
key_files:
  created:
    - src/constants.ts
    - src/events/EventBus.ts
  modified:
    - src/main.ts
    - src/scenes/Boot.ts
    - src/scenes/Preloader.ts
    - src/scenes/MainMenu.ts
    - src/scenes/Game.ts
  deleted:
    - src/engine/buildings/index.ts
    - src/engine/resources/index.ts
    - src/engine/units/index.ts
    - src/scenes/Game copy.ts
decisions:
  - Rewrote Game.ts as minimal stub after deleting engine imports (Rule 3 - blocking broken imports)
metrics:
  duration: 118s
  completed: 2026-04-17
  tasks_completed: 2
  tasks_total: 2
  files_changed: 11
---

# Phase 01 Plan 01: Infrastructure Cleanup and Foundation Summary

Deleted 713 lines of RTS engine code, established centralized constants file with all tuning values, created EventBus singleton, enabled Arcade Physics, and restored full Boot-to-GameOver scene chain with hero spritesheet loading.

## Task Results

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Delete RTS engine code, create constants and EventBus | 101c640 | Deleted src/engine/, Game copy.ts; created constants.ts (57 exports), EventBus.ts; cleaned Game.ts |
| 2 | Update main.ts, Boot, Preloader, MainMenu | 75fe6c1 | Fixed canvas width to 1024, added Arcade Physics, restored scene chain, added hero spritesheet loading, Dead City branding |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cleaned Game.ts of RTS engine imports**
- **Found during:** Task 1
- **Issue:** Game.ts imported Unit, MainBase, ResourceNode from deleted src/engine/ directory, which would cause TypeScript compilation failure
- **Fix:** Rewrote Game.ts as a minimal scene stub (constructor + empty create/update) ready for Plan 02 to build upon
- **Files modified:** src/scenes/Game.ts
- **Commit:** 101c640

## Verification

- `npx tsc --noEmit` exits with 0 errors: PASS
- `src/engine/` directory does not exist: PASS
- `src/constants.ts` exports all world/hero/coin/build-point constants: PASS
- `src/events/EventBus.ts` exports EventBus singleton: PASS
- Scene chain is Boot > Preloader > MainMenu > Game > GameOver in main.ts: PASS
- Arcade Physics configured with zero gravity: PASS
- Hero spritesheet loaded in Preloader (48x32 frames): PASS
- MainMenu shows "DEAD CITY" with ENTER key handler: PASS

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| src/scenes/Game.ts | create() | Empty scene with only background color | Plan 02 will add hero, world, parallax, and camera |

## Self-Check: PASSED
