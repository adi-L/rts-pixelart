---
phase: 02-citizen-economy-structures
plan: 04
subsystem: game-systems
tags: [phaser3, typescript, npc-management, structure-management, game-over]

# Dependency graph
requires:
  - phase: 02-citizen-economy-structures (plans 01-03)
    provides: EconomyManager, BaseNPC/Vagrant/Citizen, BaseStructure/Wall/Tower/Farm/BuilderHut, BuildPoint, constants
provides:
  - MainBase entity with 4 upgrade tiers and destruction sequence
  - StructureManager for build-point-to-structure lifecycle
  - NPCManager for vagrant spawning, recruitment, and citizen conversion
  - Updated GameOver scene with correct copy and ENTER restart
affects: [02-05-game-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [manager-singleton-with-eventbus-cleanup, multi-part-entity-with-wings, destruction-sequence-with-camera-effects]

key-files:
  created:
    - src/entities/structures/MainBase.ts
    - src/systems/StructureManager.ts
    - src/systems/NPCManager.ts
  modified:
    - src/scenes/GameOver.ts

key-decisions:
  - "MainBase tracks baseTier separately from BaseStructure.tier for independent upgrade control"
  - "StructureManager consumes base upgrade cost from coinsDeposited, keeping remainder for next tier"
  - "NPCManager takes EconomyManager and StructureManager as constructor deps for future role assignment"

patterns-established:
  - "Manager cleanup: store EventBus listener references and remove in destroy()"
  - "NPC conversion lifecycle: remove from old list, create new entity, destroy old sprite"
  - "Destruction sequence: physics pause -> shake -> debris -> flash -> fade -> scene transition"

requirements-completed: [STRC-03, NPC-01, NPC-04]

# Metrics
duration: 3min
completed: 2026-04-17
---

# Phase 2 Plan 4: MainBase + StructureManager + NPCManager Summary

**Multi-part upgradeable MainBase with destruction-to-GameOver sequence, plus StructureManager and NPCManager system singletons for build-point lifecycle and NPC spawn/recruit/convert pipeline**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-17T17:23:01Z
- **Completed:** 2026-04-17T17:26:12Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- MainBase renders as multi-part structure with 4 upgrade tiers (growing wings, crown indicator at max)
- MainBase destruction triggers shake, debris collapse, red flash, fade to black, then GameOver scene
- StructureManager orchestrates full build-point-to-structure pipeline with base upgrade handling and build point unlocking
- NPCManager handles vagrant spawning (4 initial + periodic respawn), recruitment via coin drop, and vagrant-to-citizen conversion
- GameOver scene updated with "YOUR CITY HAS FALLEN" copy and ENTER-to-restart

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MainBase entity and update GameOver scene** - `f74871f` (feat)
2. **Task 2: Create StructureManager and NPCManager** - `8ec5639` (feat)

## Files Created/Modified
- `src/entities/structures/MainBase.ts` - Multi-part base with 4 upgrade tiers, wings, crown, destruction sequence
- `src/systems/StructureManager.ts` - Build point initialization, coin deposit handling, construction completion, proximity updates
- `src/systems/NPCManager.ts` - Vagrant spawn/respawn, recruitment, vagrant-to-citizen conversion, NPC update loop
- `src/scenes/GameOver.ts` - Updated with black background, correct copy, ENTER key restart

## Decisions Made
- MainBase tracks `baseTier` separately from inherited `tier` to allow independent upgrade control without conflicting with BaseStructure's `upgradeVisual()` tier increment
- StructureManager consumes base upgrade cost from `coinsDeposited` and keeps the remainder, allowing coin accumulation toward the next tier
- NPCManager stores `structures` reference as public for Plan 05 role assignment extension
- Removed unused `baseBuildPoint` private field from StructureManager (base build point accessible via buildPoints array)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused variable TypeScript errors**
- **Found during:** Task 2 (StructureManager + NPCManager)
- **Issue:** `baseBuildPoint` in StructureManager and `structures` in NPCManager triggered TS6133 (declared but never read) under strict mode
- **Fix:** Removed `baseBuildPoint` field (not needed as stored field), made `structures` public in NPCManager for Plan 05 access
- **Files modified:** src/systems/StructureManager.ts, src/systems/NPCManager.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 8ec5639 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Minor fix for TypeScript strict mode compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- MainBase, StructureManager, and NPCManager ready for Game.ts integration in Plan 05
- All EventBus events wired: `coin:deposited`, `base:upgraded`, `npc:arrived-at-base`, `structure:funded`, `structure:built`
- Clean destroy() methods on all managers for scene restart support

---
*Phase: 02-citizen-economy-structures*
*Completed: 2026-04-17*
