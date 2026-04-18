---
phase: 03-day-night-zombie-waves
plan: 03
subsystem: archer-npc
tags: [archer, npc, arrow, combat, defense, economy]
dependency_graph:
  requires: [03-01]
  provides: [Archer, ArcherState, createArrowPool, fireArrow, deactivateArrow, updateArrows]
  affects: [NPCManager, Game.ts]
tech_stack:
  added: []
  patterns: [object-pool, state-machine, event-driven-transitions]
key_files:
  created:
    - src/entities/Arrow.ts
    - src/entities/npc/Archer.ts
  modified:
    - src/systems/NPCManager.ts
decisions:
  - Followed Coin.ts pool pattern exactly for Arrow pool -- consistent pool API across entities
  - Used FARMER_WALK_SPEED for archer hunt wandering -- archers walk casually during day, same as farmers
  - Added createArrowTexture helper for placeholder arrow sprite generation
metrics:
  duration: 85s
  completed: 2026-04-18T04:21:28Z
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
requirements: [NPC-03]
---

# Phase 03 Plan 03: Archer NPC and Arrow Pool Summary

Archer NPC with hunt/return/defend state machine driven by day/night EventBus events, firing object-pooled arrows at zombies within 300px range

## What Was Done

### Task 1: Arrow Pool Module (84e717e)
Created `src/entities/Arrow.ts` following the exact Coin.ts pool pattern:
- `createArrowPool` -- pre-allocates 15 arrow sprites with no gravity
- `fireArrow` -- activates a pooled arrow with velocity toward target using angle calculation
- `deactivateArrow` -- returns arrow to pool, disables physics body
- `updateArrows` -- deactivates arrows exceeding ARROW_MAX_RANGE (350px) or leaving world bounds
- `createArrowTexture` -- generates placeholder yellow rectangle sprite

### Task 2: Archer Entity and NPCManager Extension (121f8a4)
Created `src/entities/npc/Archer.ts` extending BaseNPC with three-state machine:
- **Hunt** (day): wanders within ARCHER_WANDER_DISTANCE (200px) of tower, generates 1 coin per 15s
- **Returning** (night:warning): moves back to tower at ARCHER_RETURN_SPEED (120)
- **Defend** (night): stays at tower, fires arrows at nearest active zombie within ARCHER_RANGE (300px) every ARCHER_FIRE_RATE (1.5s)

State transitions driven by EventBus events: `night:warning`, `night:start`, `day:start` -- all listeners cleaned up in `destroy()`.

Extended `src/systems/NPCManager.ts`:
- Added `public archers: BaseNPC[]` array
- Added archer update loop in `update()`
- Added archers to `getAllNPCSprites()` spread
- Added archer cleanup in `destroy()`

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 84e717e | feat(03-03): create Arrow pool module with fire, deactivate, and range-check functions |
| 2 | 121f8a4 | feat(03-03): create Archer NPC with hunt/return/defend states and extend NPCManager |

## Self-Check: PASSED
