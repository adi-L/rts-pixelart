---
phase: 04-combat-world-polish
plan: 03
subsystem: game-integration
tags: [integration, bullet, gunner, armory, exploration, game-over]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [full-phase4-integration, playable-skirmish]
  affects: [Game.ts, NPCManager.ts, StructureManager.ts, BuildPoint.ts]
tech_stack:
  added: []
  patterns: [bullet-pool-wiring, mouse-aim-shooting, hero-damage-overlap, armory-restock]
key_files:
  created: []
  modified:
    - src/scenes/Game.ts
    - src/systems/NPCManager.ts
    - src/systems/StructureManager.ts
    - src/entities/BuildPoint.ts
  deleted:
    - src/entities/Arrow.ts
    - src/entities/npc/Archer.ts
decisions:
  - "ARMORY_COST and RUIN_REPAIR_COST imported only in BuildPoint.ts (not StructureManager) since cost getter lives on BuildPoint"
  - "Armory restock check placed as Priority 1.5 in handleDrop before build point deposit"
metrics:
  duration: "4m 4s"
  completed: "2026-04-19T05:26:48Z"
  tasks_completed: 1
  tasks_total: 2
  files_modified: 4
  files_deleted: 2
---

# Phase 4 Plan 03: Game.ts Integration & Cleanup Summary

Full Phase 4 wiring: bullet pool, mouse shooting, zombie-hero damage, armory interaction, gunner NPCs, exploration zones, and Arrow/Archer deletion

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update NPCManager, StructureManager, and fully integrate Game.ts | cc469e1 | src/scenes/Game.ts, src/systems/NPCManager.ts, src/systems/StructureManager.ts, src/entities/BuildPoint.ts, src/entities/Arrow.ts (deleted), src/entities/npc/Archer.ts (deleted) |
| 2 | Visual checkpoint -- complete Phase 4 skirmish gameplay | PENDING | -- |

## What Was Built

### Game.ts Integration (Task 1)
- Replaced all arrow/archer imports and references with bullet/gunner equivalents
- Created bulletPool via `createBulletPool()` replacing arrowPool
- Added bullet-zombie overlap passing `bullet.x` for directional knockback
- Added zombie-hero overlap calling `hero.takeDamage(ZOMBIE_DAMAGE_TO_HERO)`
- Added `hero:died` EventBus listener that triggers GameOver scene
- Added mouse click handler (`pointerdown`) for hero shooting
- Added armory handling in `onStructureBuilt` -- calls `hero.grantGun()`
- Added ammo restock logic in `handleDrop()` at Priority 1.5 (before build point deposit)
- Renamed `assignCitizenAsArcher` to `assignCitizenAsGunner` using Gunner class with bulletPool
- Spawns exploration zone coin caches from `COIN_CACHES` config
- Calls `npcManager.spawnVagrantCamps()` for exploration zone vagrant camps
- Updated shutdown to destroy bulletPool and hero

### NPCManager Updates
- Renamed `archers` array to `gunners` with updated iteration and cleanup
- Changed `baseX` from hardcoded 3000 to `HERO_START_X` (10000)
- Updated initial vagrant spawn positions for 20,000px world
- Added `spawnVagrantCamps()` method using `VAGRANT_CAMPS` config

### StructureManager Updates
- Added Armory import and `'armory'` case in `completeConstruction`
- Changed mainBase position from hardcoded 3000 to `HERO_START_X`

### BuildPoint Updates
- Added `'armory'` and `'ruin'` cases to cost getter returning `ARMORY_COST` and `RUIN_REPAIR_COST`

### File Deletions
- Deleted `src/entities/Arrow.ts` (fully replaced by Bullet.ts)
- Deleted `src/entities/npc/Archer.ts` (fully replaced by Gunner.ts)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Unused ARMORY_COST/RUIN_REPAIR_COST imports in StructureManager**
- **Found during:** Task 1
- **Issue:** Plan suggested importing ARMORY_COST and RUIN_REPAIR_COST in StructureManager.ts, but cost logic lives in BuildPoint.ts cost getter, not StructureManager
- **Fix:** Imported in BuildPoint.ts instead; removed unused imports from StructureManager.ts
- **Files modified:** src/entities/BuildPoint.ts, src/systems/StructureManager.ts
- **Commit:** cc469e1

## Verification

- `npx tsc --noEmit` passes with zero errors
- `npm run build` succeeds
- Arrow.ts and Archer.ts deleted from filesystem
- Game.ts has no references to Arrow, Archer, arrowPool, fireArrow, deactivateArrow, updateArrows
- Game.ts references Bullet, Gunner, bulletPool, deactivateBullet, updateBullets
- BuildPoint.ts handles armory and ruin costs

## Known Stubs

None -- all systems fully wired.

## Self-Check: PASSED
