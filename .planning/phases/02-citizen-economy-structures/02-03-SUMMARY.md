---
phase: 02-citizen-economy-structures
plan: 03
subsystem: entities
tags: [phaser, gameobjects, structures, state-machine, health-bar]

# Dependency graph
requires:
  - phase: 01-foundation-hero-loop
    provides: BuildPoint class, constants, Game scene
provides:
  - BaseStructure base class with HP, health bar, upgrade, destroy
  - Wall structure with wood/stone tier upgrade
  - Tower structure with platform indicator
  - Farm structure with active pulse toggle
  - BuilderHut structure
  - BuildPoint extended with type, unlockTier, state machine, cost getter
affects: [02-04-structure-manager, 02-05-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [structure-entity-hierarchy, build-point-state-machine, health-bar-pattern]

key-files:
  created:
    - src/entities/structures/BaseStructure.ts
    - src/entities/structures/Wall.ts
    - src/entities/structures/Tower.ts
    - src/entities/structures/Farm.ts
    - src/entities/structures/BuilderHut.ts
  modified:
    - src/entities/BuildPoint.ts
    - src/constants.ts
    - src/scenes/Game.ts

key-decisions:
  - "BaseStructure stores originalColor for damage flash restore"
  - "Farm and BuilderHut use 9999 HP (not damageable in Phase 2 scope)"
  - "BuildPoint marker depth changed from 2 to 4 per UI-SPEC depth layering"

patterns-established:
  - "Structure hierarchy: BaseStructure -> Wall/Tower/Farm/BuilderHut with shared HP/health bar"
  - "BuildPoint state machine: Locked -> Empty -> Funded -> Building -> Complete -> Upgradeable"
  - "Health bar visibility: hidden at full HP, shown when damaged"

requirements-completed: [STRC-01, STRC-02, STRC-04]

# Metrics
duration: 3min
completed: 2026-04-17
---

# Phase 02 Plan 03: Structure Entities Summary

**Structure entity hierarchy (Wall, Tower, Farm, BuilderHut) with HP/health bars and BuildPoint state machine for build lifecycle**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-17T17:13:26Z
- **Completed:** 2026-04-17T17:16:42Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created BaseStructure base class with HP system, health bar (hidden at full HP), takeDamage with red flash, and upgradeVisual with scale pulse
- Wall with wood-to-stone upgrade path, Tower with platform indicator, Farm with active pulse toggle, BuilderHut
- Extended BuildPoint with BuildPointState enum, type/unlockTier fields, cost getter, checkUnlock, hideMarker/showMarker

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BaseStructure and structure subclasses** - `1134e32` (feat)
2. **Task 2: Extend BuildPoint with type, unlockTier, and state machine** - `085d6bd` (feat)

## Files Created/Modified
- `src/entities/structures/BaseStructure.ts` - Base class with HP, health bar, takeDamage, upgradeVisual, destroy
- `src/entities/structures/Wall.ts` - Wall with wood/stone tier upgrade
- `src/entities/structures/Tower.ts` - Tower with platform indicator rectangle
- `src/entities/structures/Farm.ts` - Farm with active pulse tween toggle
- `src/entities/structures/BuilderHut.ts` - Builder hut for role assignment
- `src/entities/BuildPoint.ts` - Extended with state machine, type, unlockTier, cost getter
- `src/constants.ts` - Added Phase 2 structure constants (dimensions, colors, HP, costs)
- `src/scenes/Game.ts` - Updated BuildPoint construction to use BuildPointConfig

## Decisions Made
- BaseStructure stores `originalColor` field so takeDamage can restore correct color after red flash (plan omitted color restore)
- Farm and BuilderHut given 9999 HP rather than implementing a "no HP" path, keeping the hierarchy uniform
- BuildPoint marker depth set to 4 (up from 2) per UI-SPEC depth layering

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Phase 2 constants to constants.ts**
- **Found during:** Task 1
- **Issue:** Plan 02-01 (which adds all Phase 2 constants) runs in parallel; constants not yet available
- **Fix:** Added structure-related Phase 2 constants (dimensions, colors, HP, costs, BuildPointType, BuildPointConfig, BUILD_POINT_LAYOUT) directly
- **Files modified:** src/constants.ts
- **Verification:** tsc --noEmit passes
- **Committed in:** 1134e32 (Task 1 commit)

**2. [Rule 3 - Blocking] Updated Game.ts BuildPoint constructor call**
- **Found during:** Task 2
- **Issue:** Game.ts used old BuildPoint constructor signature `(scene, x, id)` which no longer exists
- **Fix:** Updated to use `BUILD_POINT_LAYOUT` with new `BuildPointConfig`-based constructor, removed unused `BUILD_POINT_POSITIONS` import
- **Files modified:** src/scenes/Game.ts
- **Verification:** tsc --noEmit passes
- **Committed in:** 085d6bd (Task 2 commit)

**3. [Rule 1 - Bug] Fixed takeDamage color restore**
- **Found during:** Task 1
- **Issue:** Plan's BaseStructure.takeDamage had a comment "subclass must set this.rect.fillColor correctly" with no actual restore logic
- **Fix:** Added `originalColor` field to BaseStructure, used in takeDamage to restore color after flash; also updated in upgradeVisual
- **Files modified:** src/entities/structures/BaseStructure.ts
- **Verification:** Code review confirms color restores correctly
- **Committed in:** 1134e32 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for compilation and correctness. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All structure entities ready for StructureManager (Plan 04) to instantiate
- BuildPoint state machine ready for construction pipeline integration
- Health bar pattern established for reuse on Main Base

---
*Phase: 02-citizen-economy-structures*
*Completed: 2026-04-17*
