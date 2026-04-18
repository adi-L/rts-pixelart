---
phase: 03-day-night-zombie-waves
plan: 01
subsystem: day-night-cycle
tags: [day-night, cycle, overlay, events, constants, textures]
dependency_graph:
  requires: [EconomyManager, EventBus, HUD, Preloader]
  provides: [DayNightCycleManager, Phase3Constants, ZombieTexture, ArrowTexture]
  affects: [HUD]
tech_stack:
  added: []
  patterns: [EventBus-driven-lifecycle, overlay-tween-transition, graphics-texture-generation]
key_files:
  created:
    - src/systems/DayNightCycleManager.ts
  modified:
    - src/constants.ts
    - src/scenes/Preloader.ts
    - src/ui/HUD.ts
decisions:
  - "Overlay positioned at camera center with setScrollFactor(0) for consistent full-screen coverage"
  - "Day counter incremented at dawn (transitionToDay) via EconomyManager.setDay()"
  - "Zombie and arrow textures generated inline in Preloader rather than separate utility file"
metrics:
  duration: 96s
  completed: "2026-04-18T04:17:20Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 3
---

# Phase 03 Plan 01: Day/Night Cycle Foundation Summary

Day/night cycle state machine with 10min day / 8min night, overlay alpha tweens, EventBus lifecycle events, HUD nightfall warning, and Phase 3 constants for zombies/archers.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add Phase 3 constants and zombie/arrow texture generation | 184c276 | src/constants.ts, src/scenes/Preloader.ts |
| 2 | Create DayNightCycleManager and add HUD nightfall warning | c2692ed | src/systems/DayNightCycleManager.ts, src/ui/HUD.ts |

## What Was Built

### Phase 3 Constants (Task 1)
- Day/night cycle timing: DAY_DURATION (10min), NIGHT_DURATION (8min), TRANSITION_DURATION (12s), NIGHTFALL_WARNING_TIME (20s)
- Overlay visual: OVERLAY_NIGHT_COLOR (dark blue-purple), OVERLAY_MAX_ALPHA (0.55), OVERLAY_DEPTH (50)
- Zombie stats: speed (40), HP (30), damage (10), attack interval (2s), pool size (40), base count (4), growth per night (2)
- Archer stats: range (300), fire rate (1.5s), arrow speed (400), arrow damage (10), pool size (15)
- Sprite keys and texture dimensions for zombie and arrow

### Texture Generation (Task 1)
- Zombie texture: green NPC_WIDTH x NPC_HEIGHT rectangle generated in Preloader
- Arrow texture: yellow ARROW_WIDTH x ARROW_HEIGHT rectangle generated in Preloader

### DayNightCycleManager (Task 2)
- State machine tracking elapsed time per phase (day/night)
- Full-screen Rectangle overlay at OVERLAY_DEPTH with setScrollFactor(0)
- Tween-based transitions: Sine.easeInOut alpha fade over 12s
- EventBus events emitted at lifecycle boundaries: night:warning, night:start, night:end, day:start
- Day counter incremented via economy.setDay() at each dawn
- Proper cleanup: killTweensOf(overlay) and overlay.destroy() in destroy()

### HUD Nightfall Warning (Task 2)
- "NIGHT APPROACHES" text centered at top of screen, hidden by default
- Flashes 3 times over 3 seconds when night:warning event received
- Proper EventBus listener cleanup in destroy()

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all systems are fully wired. DayNightCycleManager is ready to be instantiated in the Game scene (integration is handled by Plan 04).

## Verification

- TypeScript compilation passes with zero errors on both tasks
- All acceptance criteria met for both tasks
