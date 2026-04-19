---
phase: 04-combat-world-polish
plan: 02
subsystem: hero-combat-hud
tags: [combat, hero, hud, knockback, eventbus]
dependency_graph:
  requires: [04-01]
  provides: [hero-combat-api, hud-health-ammo, zombie-knockback]
  affects: [Game.ts integration in 04-03]
tech_stack:
  added: []
  patterns: [eventbus-driven-hud, invincibility-frames, gun-aim-tracking]
key_files:
  created: []
  modified:
    - src/entities/Hero.ts
    - src/ui/HUD.ts
    - src/systems/WaveManager.ts
decisions:
  - "Used negative scaleY instead of setFlipY for Rectangle gun sprite (Rectangle lacks setFlipY)"
  - "Removed unused HERO_HP import from HUD.ts (health bar uses ratio, not raw HP constant)"
metrics:
  duration_seconds: 142
  completed: "2026-04-19T05:20:28Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 4 Plan 02: Hero Combat & HUD Summary

Hero combat API with mouse-aimed gun, HP with invincibility frames, ammo tracking, HUD health bar + ammo counter, and zombie knockback on bullet hits.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend Hero with gun sprite, HP, mouse aim, shooting, and damage | 48423a0 | src/entities/Hero.ts |
| 2 | Extend HUD with health bar and ammo counter, add knockback to WaveManager | 4e3e11a | src/ui/HUD.ts, src/systems/WaveManager.ts |

## What Was Built

### Hero Combat (Task 1)
- Gun sprite (Rectangle) tracks mouse cursor angle via `Phaser.Math.Angle.Between`
- Gun flips vertically (via negative scaleY) when aiming left to prevent inversion
- `shoot()` fires bullets from shared pool, decrements ammo, emits `hero:ammo-changed`
- `takeDamage()` with 1000ms invincibility frames, red flash + alpha blink feedback
- `grantGun()` and `restockAmmo()` for armory integration
- Public getters: `currentHp`, `currentAmmo`, `isAlive`, `armed`
- `destroy()` cleans up gun sprite
- Gun initially hidden (`hasGun = false`, `ammo = 0`) until armory grants weapon

### HUD Health & Ammo (Task 2A)
- Health bar at top-center: green (>50%), yellow (>25%), red (<=25%)
- Ammo counter text to the right of health bar
- Both use `setScrollFactor(0)` and `HUD_DEPTH` for fixed-screen positioning
- EventBus listeners for `hero:hp-changed` and `hero:ammo-changed`
- Full cleanup in `destroy()`

### Zombie Knockback (Task 2B)
- `damageZombie()` now accepts optional `bulletX` parameter
- When provided and zombie survives, applies directional knockback at `ZOMBIE_KNOCKBACK_SPEED`
- `delayedCall` restores march velocity after `ZOMBIE_KNOCKBACK_DURATION` (200ms)
- Knockback skipped if zombie is dying

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Rectangle lacks setFlipY method**
- **Found during:** Task 1
- **Issue:** Plan specified `this.gunSprite.setFlipY(true)` but `Phaser.GameObjects.Rectangle` does not have `setFlipY`
- **Fix:** Used `this.gunSprite.setScale(1, -1)` for the same visual effect
- **Files modified:** src/entities/Hero.ts
- **Commit:** 48423a0

**2. [Rule 1 - Bug] Unused HERO_HP import in HUD.ts**
- **Found during:** Task 2
- **Issue:** Plan listed `HERO_HP` in imports but the health bar uses ratio (hp/maxHp), not the constant directly
- **Fix:** Removed unused import to pass TypeScript strict checks
- **Files modified:** src/ui/HUD.ts
- **Commit:** 4e3e11a

## Verification

- `npx tsc --noEmit` passes with zero errors after both tasks
- Hero.ts has complete combat API: shoot(), takeDamage(), grantGun(), restockAmmo()
- HUD.ts has health bar + ammo display with EventBus listeners
- WaveManager.ts damageZombie accepts optional bulletX for knockback
- All new EventBus listeners have matching cleanup in destroy()
