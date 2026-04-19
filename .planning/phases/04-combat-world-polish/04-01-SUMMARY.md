---
phase: 04-combat-world-polish
plan: 01
subsystem: entities-constants
tags: [bullet, gunner, armory, world-expansion, constants]
dependency_graph:
  requires: [phase-03-complete]
  provides: [bullet-pool, gunner-npc, armory-structure, phase4-constants, expanded-world]
  affects: [Game.ts, NPCManager, StructureManager, WaveManager]
tech_stack:
  added: []
  patterns: [object-pool, base-class-extension, projectile-system]
key_files:
  created:
    - src/entities/Bullet.ts
    - src/entities/npc/Gunner.ts
    - src/entities/structures/Armory.ts
  modified:
    - src/constants.ts
    - src/scenes/Preloader.ts
decisions:
  - "Armory constructor uses 7-param BaseStructure (no type param) matching existing pattern"
  - "Gunner reuses ARCHER_HUNT_COIN_INTERVAL, ARCHER_WANDER_DISTANCE, ARCHER_RETURN_SPEED constants (values unchanged)"
  - "BUILD_POINT_POSITIONS updated to [10000] to match new world center"
  - "Bullet pool sized at 40 (up from 15 arrow pool) per T-04-02 mitigation"
metrics:
  duration: "3m 15s"
  completed: "2026-04-19T05:15:05Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 2
---

# Phase 4 Plan 01: Entity & Constant Foundation Summary

Unified bullet projectile system, Gunner NPC, Armory structure, and 20,000px world layout with exploration zones

## What Was Done

### Task 1: Add all Phase 4 constants and expand world to 20,000px
- Updated `WORLD_WIDTH` from 6000 to 20000, `HERO_START_X` from 3000 to 10000
- Added hero combat constants (HP, invincibility, fire rate, ammo clip, restock cost)
- Added bullet constants replacing arrow system (speed, damage, range, pool size, sprite key)
- Added gun sprite, armory, zombie knockback, and gunner constants
- Extended `BuildPointType` with `'armory' | 'ruin'`
- Replaced `BUILD_POINT_LAYOUT` with expanded symmetric layout: inner/mid/outer defense rings plus exploration zone ruins (24 build points total)
- Added `FLAG_COLORS` entries for armory and ruin
- Added exploration zone configs: `COIN_CACHES` (6 entries), `VAGRANT_CAMPS` (4 entries)
- Added ruin repair constants

### Task 2: Create Bullet.ts, Gunner.ts, Armory.ts and update Preloader
- Created `Bullet.ts` as direct refactor of Arrow.ts with bullet constants, unified projectile pool (40 size), and null-return on pool exhaustion
- Created `Gunner.ts` as direct refactor of Archer.ts using `fireBullet` instead of `fireArrow`, with `GUNNER_RANGE`/`GUNNER_FIRE_RATE` constants
- Created `Armory.ts` as minimal structure extending BaseStructure
- Updated `Preloader.ts` to generate bullet texture (gray 6x3px rectangle) instead of arrow texture
- Arrow.ts and Archer.ts preserved for Plan 03 migration

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 2586309 | feat(04-01): add Phase 4 constants and expand world to 20,000px |
| 2 | 8f6b3e6 | feat(04-01): create Bullet, Gunner, Armory entities and update Preloader |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Armory constructor signature corrected**
- **Found during:** Task 2
- **Issue:** Plan specified 8-param constructor call with `'armory'` type string, but BaseStructure only accepts 7 params (no type parameter)
- **Fix:** Used 7-param constructor matching existing Tower.ts pattern
- **Files modified:** src/entities/structures/Armory.ts

**2. [Rule 2 - Missing] BUILD_POINT_POSITIONS not in plan**
- **Found during:** Task 1
- **Issue:** Plan did not mention updating `BUILD_POINT_POSITIONS` from [3000] to [10000], but it references the old world center
- **Fix:** Updated to [10000] to match new HERO_START_X
- **Files modified:** src/constants.ts

## Verification

- `npx tsc --noEmit` passes with zero errors
- All 3 new files exist and compile
- Arrow.ts and Archer.ts preserved (not deleted)
- Preloader generates bullet texture, not arrow texture
- BUILD_POINT_LAYOUT spans 2500-17500 range within 20,000px world

## Self-Check: PASSED
