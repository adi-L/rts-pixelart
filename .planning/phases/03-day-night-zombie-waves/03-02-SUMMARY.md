---
phase: 03-day-night-zombie-waves
plan: 02
subsystem: zombie-waves
tags: [zombies, wave-manager, object-pool, combat, ai]
dependency_graph:
  requires: [03-01]
  provides: [WaveManager, ZombieState]
  affects: [Game.ts]
tech_stack:
  added: []
  patterns: [object-pool, sprite-data-state-machine, distance-check-collision, eventbus-lifecycle]
key_files:
  created:
    - src/entities/npc/Zombie.ts
    - src/systems/WaveManager.ts
  modified:
    - src/constants.ts
decisions:
  - "Zombies use sprite.setData state machine (March/Attack/Dying) rather than class instances -- pooled sprites cannot extend BaseNPC"
  - "Structure and NPC collisions use distance checks, not physics.add.overlap, because structures lack physics bodies"
  - "Added missing ZOMBIE_CONTACT_DISTANCE constant (20px) to constants.ts"
metrics:
  duration: 99s
  completed: 2026-04-18T04:21:32Z
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 03 Plan 02: Zombie Wave System Summary

Object-pooled zombie wave system with WaveManager controlling spawn timing, march/attack AI via distance checks, NPC contact kills, and dawn kill-all lifecycle tied to EventBus night:start/night:end events.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Zombie state enum module | ff021ff | src/entities/npc/Zombie.ts, src/constants.ts |
| 2 | Create WaveManager with zombie pool, spawning, AI, and dawn kill | e6e1ff6 | src/systems/WaveManager.ts |

## Key Implementation Details

### ZombieState enum (Zombie.ts)
- Three states: March (0), Attack (1), Dying (2)
- Stored on pooled sprites via `setData`/`getData` -- no class instances

### WaveManager (WaveManager.ts)
- **Pool**: Pre-allocates 40 sprites via `Phaser.Physics.Arcade.Group` with `createMultiple`
- **Spawning**: Staggered timer spreads spawns across 80% of night duration, alternating left/right edges
- **Difficulty**: `ZOMBIE_BASE_COUNT + (night - 1) * ZOMBIE_GROWTH_PER_NIGHT` (4, 6, 8, 10...)
- **March AI**: Zombies walk toward nearest alive structure at ZOMBIE_SPEED
- **Attack**: Stop within ZOMBIE_CONTACT_DISTANCE, deal ZOMBIE_DAMAGE every 2 seconds
- **NPC kills**: Distance check kills unprotected NPCs on contact (spliced from manager arrays)
- **Dawn**: All zombies fade out (300ms tween) and return to pool on `night:end`
- **Public API**: `pool` getter for arrow-zombie overlap, `damageZombie()` for arrow hits

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing ZOMBIE_CONTACT_DISTANCE constant**
- **Found during:** Task 1 (pre-flight check)
- **Issue:** Plan references `ZOMBIE_CONTACT_DISTANCE` but it was not in constants.ts
- **Fix:** Added `export const ZOMBIE_CONTACT_DISTANCE = 20` to constants.ts zombie section
- **Files modified:** src/constants.ts
- **Commit:** ff021ff

## Verification

- TypeScript compilation passes with zero errors
- All acceptance criteria verified via grep checks
- Pool creation uses correct ZOMBIE_POOL_SIZE constant
- EventBus listeners registered and cleaned up in destroy()

## Self-Check: PASSED
