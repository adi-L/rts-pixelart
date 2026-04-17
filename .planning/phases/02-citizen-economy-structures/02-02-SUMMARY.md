---
phase: 02-citizen-economy-structures
plan: 02
subsystem: entities
tags: [phaser3, npc, state-machine, arcade-physics, rectangle-sprite]

requires:
  - phase: 01-foundation-hero-loop
    provides: "Hero entity pattern, constants.ts, EventBus, BuildPoint destroy pattern"
provides:
  - "BaseNPC abstract class with rectangle sprite, physics body, moveToward, destroy"
  - "Vagrant NPC with wander/recruit/run-to-base state machine"
  - "Citizen NPC with idle/wander state machine near main base"
  - "npc:arrived-at-base event for NPCManager integration"
affects: [02-03-NPCManager, 02-05-Builder-Farmer-roles]

tech-stack:
  added: []
  patterns: [rectangle-as-physics-body, npc-state-machine, event-driven-conversion]

key-files:
  created:
    - src/entities/npc/BaseNPC.ts
    - src/entities/npc/Vagrant.ts
    - src/entities/npc/Citizen.ts
  modified:
    - src/constants.ts

key-decisions:
  - "Used scene.physics.add.existing(rect) to give Rectangle an Arcade body directly -- no invisible sprite needed"
  - "Vagrant state transitions to RunToBase immediately on recruit to prevent double-fire of Recruited block"
  - "Citizen wanders with 2s idle pause between movements for natural feel"

patterns-established:
  - "NPC state machine: enum-based states with switch in update(), state transitions guarded by destroyed flag"
  - "Rectangle-as-entity: scene.add.rectangle() + physics.add.existing() for placeholder NPCs"
  - "Event-driven lifecycle: NPC emits event on arrival, manager handles conversion externally"

requirements-completed: [NPC-02]

duration: 2min
completed: 2026-04-17
---

# Phase 02 Plan 02: NPC Entity Foundation Summary

**BaseNPC/Vagrant/Citizen class hierarchy with rectangle sprites, Arcade physics, state machines, and coin-recruitment mechanic**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-17T17:14:54Z
- **Completed:** 2026-04-17T17:16:39Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- BaseNPC abstract class providing reusable rectangle sprite with Arcade body, moveToward helper, and destroy cleanup
- Vagrant NPC with 3-state machine (Wander/Recruited/RunToBase) -- wanders near spawn, recruitable by external call, flashes white then runs to base emitting arrival event
- Citizen NPC with 2-state machine (Idle/Wander) -- idles near main base with 2s pauses, wanders within configurable range

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BaseNPC class** - `f30be50` (feat)
2. **Task 2: Create Vagrant and Citizen NPC subclasses** - `063f390` (feat)

## Files Created/Modified
- `src/entities/npc/BaseNPC.ts` - Abstract base class for all NPCs with rectangle sprite, physics body, moveToward, destroy
- `src/entities/npc/Vagrant.ts` - Vagrant NPC that wanders at map edges, recruitable by coin drop, runs to base on recruitment
- `src/entities/npc/Citizen.ts` - Citizen NPC that idles and wanders near main base, awaiting role assignment
- `src/constants.ts` - Added NPC constants (dimensions, colors, speeds, ranges, flash duration)

## Decisions Made
- Used `scene.physics.add.existing(rect)` to attach Arcade body directly to Rectangle game object -- avoids invisible sprite workaround
- Vagrant Recruited state transitions to RunToBase immediately (same frame) to prevent the Recruited case from executing multiple times
- Citizen wander pause is 2000ms for natural idle behavior between movements

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added NPC constants to constants.ts**
- **Found during:** Task 1 (BaseNPC class creation)
- **Issue:** Plan 02-01 adds NPC constants but runs in parallel worktree; constants not available in this worktree
- **Fix:** Added all required NPC constants (NPC_WIDTH, NPC_HEIGHT, COLOR_VAGRANT, COLOR_CITIZEN, speeds, ranges, FLASH_TINT_DURATION) to constants.ts
- **Files modified:** src/constants.ts
- **Verification:** TypeScript compilation passes cleanly
- **Committed in:** f30be50 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Constants addition was necessary to unblock compilation. Plan 02-01 will add these same constants in its worktree; merge resolution will deduplicate.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- NPC entity classes ready for NPCManager to instantiate and manage (Plan 02-03)
- Vagrant recruit() method ready for coin-drop proximity detection
- npc:arrived-at-base event ready for NPCManager to listen and convert Vagrant to Citizen
- Builder/Farmer role extensions will subclass or modify Citizen (Plan 02-05)

---
*Phase: 02-citizen-economy-structures*
*Completed: 2026-04-17*
