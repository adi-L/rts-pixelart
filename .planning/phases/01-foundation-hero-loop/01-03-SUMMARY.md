---
phase: 01-foundation-hero-loop
plan: 03
subsystem: coin-economy
tags: [coins, build-points, object-pooling, game-loop]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [coin-pool, build-points, coin-drop-mechanic]
  affects: [Game.ts, Preloader.ts]
tech_stack:
  added: []
  patterns: [object-pooling, magnetic-collection-tween, proximity-detection, eventbus-emission]
key_files:
  created:
    - src/entities/Coin.ts
    - src/entities/BuildPoint.ts
  modified:
    - src/scenes/Game.ts
    - src/scenes/Preloader.ts
decisions:
  - Coin texture generated procedurally in Preloader (no external asset dependency)
  - Coins use helper functions (not a class) since pool management lives in Game.ts
  - BuildPoint uses class pattern for encapsulated state and proximity logic
metrics:
  duration: 2m 41s
  completed: 2026-04-17
  tasks_completed: 3
  tasks_total: 3
  status: complete
---

# Phase 01 Plan 03: Coin Economy and Build Points Summary

Pooled coin system with magnetic auto-collection, build point proximity detection, and spacebar/down-arrow coin-drop mechanic wired into the game loop via EventBus.

## What Was Done

### Task 1: Create Coin helpers and BuildPoint class
**Commit:** b19c064

Created `src/entities/Coin.ts` with four exported helper functions:
- `createCoinTexture` -- procedural gold circle texture generation
- `createCoinPool` -- Phaser Arcade group with COIN_POOL_SIZE pre-allocated inactive sprites
- `spawnCoin` -- activates a coin from pool with spin tween, null-guard for pool exhaustion (T-01-07)
- `collectCoin` -- magnetic tween toward hero, disables physics immediately to prevent double-collect, kills spin tween on pool return (T-01-08)

Created `src/entities/BuildPoint.ts` with:
- Pulsing gold rectangle marker on the ground
- `setNearby()` switches between idle (0.3-0.7 alpha) and active (0.7-1.0 alpha) pulse
- `addCoin()` increments deposit counter and emits `coin:deposited` on EventBus
- `destroy()` for clean shutdown

### Task 2: Wire coins, build points, and drop mechanic into Game.ts
**Commit:** 39e15e1

Modified `src/scenes/Game.ts`:
- Coin pool creation and 20 coins scattered across world width
- `physics.add.overlap` for hero-coin collection with magnetic tween
- 6 build points at configured positions with proximity pulse updates in update loop
- Spacebar and Down Arrow input for coin dropping at nearby build points
- Scale bounce feedback on successful drop, red tint flash on empty drop attempt
- Build point cleanup in shutdown handler

Modified `src/scenes/Preloader.ts`:
- Added `createCoinTexture(this)` call before scene transition

### Task 3: Verify the playable coin-drop loop
**Commit:** a73a172
**Status:** PASSED -- human verified

Fixes applied during verification:
- Walk animation frames corrected (was using idle frames 0-5, now uses row 1 frames 8-15)
- Hero physics body centered on sprite via setOffset
- Coin depth set to 3 (was hidden behind ground at depth 0)
- Build point detect radius doubled to 64px for usability
- Coin physics body reliably enabled via world.enable() on pool spawn
- Single base camp build point at world center (was 6 scattered)
- Coin-fly animation from hero to build point on drop

## Deviations from Plan

- Build point count reduced from 6 to 1 (base camp only) per user direction
- Added coin-fly visual feedback on drop (not in original plan, user requested)

## Known Stubs

None -- all data sources are wired and functional.

## Self-Check: PASSED

All created files exist and both commits are present in git log.
