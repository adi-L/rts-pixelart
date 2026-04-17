---
phase: 01-foundation-hero-loop
plan: 02
subsystem: hero-movement
tags: [hero, parallax, camera, game-scene, movement]
dependency_graph:
  requires: [constants, EventBus, arcade-physics, scene-chain, hero-spritesheet-loaded]
  provides: [Hero-class, parallax-world, camera-follow, game-scene-rewritten]
  affects: [src/entities/Hero.ts, src/scenes/Game.ts]
tech_stack:
  added: []
  patterns: [arcade-sprite-wrapper, keyboard-input-dual-scheme, manual-parallax-tileposition, camera-deadzone-follow]
key_files:
  created:
    - src/entities/Hero.ts
  modified:
    - src/scenes/Game.ts
decisions:
  - Used Rectangle instead of TileSprite for sky layer (no texture needed for solid color, avoids unnecessary GPU texture allocation)
  - Removed class-level property declarations for skyLayer/ground/groundEdge to satisfy noUnusedLocals (only midLayer needs update-loop reference)
  - Hero gravity disabled and no ground physics body (hero walks on fixed Y, no jumping per D-05)
metrics:
  duration: 136s
  completed: 2026-04-17
  tasks_completed: 2
  tasks_total: 2
  files_changed: 2
---

# Phase 01 Plan 02: Hero Entity and Parallax World Summary

Hero entity class with dual keyboard input (WASD + arrows), idle/walk animations, and direction flip. Game scene rewritten from scratch with 3-layer parallax world (sky rectangle, mid-ground TileSprite, ground), camera follow with deadzone, and clean EventBus shutdown.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Hero entity class | aba8d8a | src/entities/Hero.ts (CREATE) |
| 2 | Rewrite Game.ts with parallax world | 23dc6a5 | src/scenes/Game.ts (REWRITE) |

## Key Implementation Details

### Hero.ts (81 lines)
- Wraps `Phaser.Physics.Arcade.Sprite` with public `sprite` property
- Dual input: arrow keys via `createCursorKeys()` + WASD via `addKeys()`
- Two animations: `hero-idle` (frames 0-3 at 8fps) and `hero-walk` (frames 0-5 at 10fps)
- `setFlipX(true/false)` for direction facing
- `setCollideWorldBounds(true)` keeps hero within 0-6000px
- `setAllowGravity(false)` -- no jumping, hero stays at fixed Y

### Game.ts (65 lines, full rewrite)
- Physics world bounds: 6000x768
- Sky: solid `COLOR_SKY` rectangle at depth 0, fixed to camera
- Mid-ground: `background` TileSprite at depth 1, tinted `COLOR_MID`, parallax at 0.3x camera scroll
- Ground: `GROUND_COLOR` rectangle at depth 2, full world width, with 2px `GROUND_EDGE_COLOR` highlight
- Hero at depth 3, positioned at (3000, 576) -- center of world, bottom-aligned with ground top
- Camera: bounds match world, follows hero with lerp 0.1, deadzone width 100px
- Shutdown: `EventBus.removeAllListeners()` via `this.events.once('shutdown', ...)`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused class properties to fix noUnusedLocals**
- **Found during:** Task 2
- **Issue:** `noUnusedLocals: true` in tsconfig caused TS6133 errors for skyLayer, ground, groundEdge properties that were assigned but never read after creation
- **Fix:** Removed class-level declarations; only midLayer (used in update loop) kept as class property
- **Files modified:** src/scenes/Game.ts
- **Commit:** 23dc6a5

## Known Stubs

None -- all functionality is fully wired.

## Self-Check: PASSED
