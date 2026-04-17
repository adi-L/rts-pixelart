# Codebase Concerns

**Analysis Date:** 2026-04-16

## Tech Debt

**Duplicate/Dead Scene File:**
- Issue: `src/scenes/Game copy.ts` is a stale copy of an earlier version of the Game scene. It exports a class also named `Game`, which could cause confusion or accidental imports.
- Files: `src/scenes/Game copy.ts`
- Impact: Clutters codebase, risk of importing wrong module, confusing for new contributors.
- Fix approach: Delete `src/scenes/Game copy.ts` entirely. It contains old prototype code (soldier/worker sprites) that is not referenced anywhere.

**Scene Pipeline Bypassed:**
- Issue: `src/main.ts` has the standard Boot -> Preloader -> MainMenu -> Game scene flow commented out and loads only `MainGame` directly. The scenes `Boot`, `Preloader`, `MainMenu`, and `GameOver` are imported but unused dead code.
- Files: `src/main.ts` (lines 21-28), `src/scenes/Boot.ts`, `src/scenes/Preloader.ts`, `src/scenes/MainMenu.ts`, `src/scenes/GameOver.ts`
- Impact: No loading screen, no main menu, no game-over flow. These scenes also reference hardcoded positions (512, 384) that assume a fixed 1024x768 canvas, but `main.ts` uses `window.innerWidth` for width.
- Fix approach: Either restore the scene pipeline and update hardcoded positions to be responsive, or delete unused scenes to reduce confusion.

**Unit State Machine Missing MOVING_TO_POSITION Handler:**
- Issue: `Unit.update()` handles IDLE, MOVING_TO_RESOURCE, HARVESTING, and RETURNING_TO_BASE states, but never handles `UnitState.MOVING_TO_POSITION`. The `moveTo()` method sets state to `MOVING_TO_POSITION`, but the switch statement in `update()` has no case for it. Units told to move via `moveTo()` will be stuck.
- Files: `src/engine/units/index.ts` (lines 162-237, specifically missing case after line 237)
- Impact: Player-commanded unit movement is completely broken. Calling `moveTo()` transitions to a state that is never processed.
- Fix approach: Add a `case UnitState.MOVING_TO_POSITION:` handler in `update()` that moves the unit toward `this.targetPosition` and transitions to IDLE on arrival.

**Empty Command Method:**
- Issue: `Unit.commands().shoot()` is an empty stub that accepts a `scene` parameter but does nothing.
- Files: `src/engine/units/index.ts` (lines 104-106)
- Impact: Dead code; calling `shoot()` silently does nothing.
- Fix approach: Either implement combat logic or remove the stub to avoid misleading API surface.

**God-Object Scene Constructor:**
- Issue: `Game` scene creates all units with hardcoded positions and sprite paths directly in the constructor. Unit definitions, resource node placements, and base position are all inline.
- Files: `src/scenes/Game.ts` (lines 26-59 for units, 85-119 for resources, line 81 for base)
- Impact: Cannot change map layout or unit roster without editing the scene. Makes it impossible to support multiple levels, saved games, or procedural generation.
- Fix approach: Extract unit/resource/base definitions into a data-driven configuration (JSON or config objects) loaded separately from the scene.

**Telemetry Script Phones Home:**
- Issue: `log.js` sends an HTTPS request to `gryzor.co` on every `dev` and `build` command, transmitting the package name and Phaser version. This is a Phaser template artifact.
- Files: `log.js`, `package.json` (scripts `dev` and `build`)
- Impact: Unnecessary network call on every dev/build. Privacy concern. Build fails silently if network is unavailable (exits with code 1).
- Fix approach: Use the `-nolog` script variants (`dev-nolog`, `build-nolog`) or remove `log.js` and the `node log.js` prefix from scripts entirely.

## Known Bugs

**Harvester Auto-Harvest Cannot Be Disabled:**
- Symptoms: Non-harvester units (like "lizzy") are not updated in the game loop, but all harvesters auto-harvest with no way to stop. The `isHarvester` flag exists but is never checked in `update()`.
- Files: `src/engine/units/index.ts` (line 50, line 162), `src/scenes/Game.ts` (lines 152-155)
- Trigger: All harvesters always auto-harvest regardless of `isHarvester` flag.
- Workaround: None; the flag is cosmetic only.

**Selection Circle Does Not Follow Unit:**
- Symptoms: The selection circle is created at the unit's initial position but never repositioned during movement.
- Files: `src/engine/units/index.ts` (lines 75-83) -- circle created at initial position; `update()` method never updates `selectionCircle.setPosition()`.
- Trigger: Select a harvester, watch it move -- the green circle stays at spawn point.
- Workaround: None currently.

**Instant Harvesting (No Harvest Duration):**
- Symptoms: When a unit reaches a resource node, it harvests the full `maxCarryCapacity` in a single frame and immediately transitions to RETURNING_TO_BASE. There is no harvest timer or animation.
- Files: `src/engine/units/index.ts` (lines 203-211)
- Trigger: Normal gameplay -- harvesting feels instantaneous.
- Workaround: None; this is the current design.

**Resource Nodes Not Removed From Array After Depletion:**
- Symptoms: When a `ResourceNode` is depleted, `destroy()` removes the visual but the object stays in the `resources` array in `Game.ts`. The `isEmpty()` check prevents crashes, but the array grows with dead references.
- Files: `src/engine/resources/index.ts` (lines 56-58), `src/scenes/Game.ts` (line 18)
- Trigger: Deplete any resource node; the array retains the empty object indefinitely.
- Workaround: `isEmpty()` guards prevent errors, but `findNearestResource()` iterates dead nodes every frame.

## Security Considerations

**No Sensitive Data Exposure Risk (Low Risk):**
- Risk: This is a client-side-only game with no authentication, no backend, and no user data. No `.env` files or secrets detected.
- Files: N/A
- Current mitigation: N/A
- Recommendations: If multiplayer or backend features are added, implement server-side validation for game state.

**Telemetry Leaks Package Metadata:**
- Risk: `log.js` sends package name and Phaser version to an external server on every build.
- Files: `log.js`
- Current mitigation: None.
- Recommendations: Remove `log.js` and the `node log.js` prefix from npm scripts.

## Performance Bottlenecks

**Every-Frame Resource Search:**
- Problem: Each harvester calls `findNearestResource()` every frame when IDLE, iterating all resource nodes (including depleted ones) with distance calculations.
- Files: `src/engine/units/index.ts` (lines 140-160, called from line 169)
- Cause: No caching, no spatial index, no throttling. With N harvesters and M resources, this is O(N*M) per frame.
- Improvement path: Cache nearest resource assignment. Only re-search when current target is depleted. Filter out empty resources from the array. For larger maps, use a spatial hash or quadtree.

**Physics Used Only for Movement:**
- Problem: Arcade physics is enabled for all harvesters (`this.physics.add.existing`) but only used for `moveTo` velocity. No collisions or physics interactions are defined.
- Files: `src/scenes/Game.ts` (line 131)
- Cause: Using full physics system as a simple velocity helper.
- Improvement path: For simple movement, use tweens or manual position updates instead of physics bodies. Or leverage the physics system for collisions if needed.

## Fragile Areas

**Unit Engine Module (`src/engine/units/index.ts`):**
- Files: `src/engine/units/index.ts`
- Why fragile: All unit logic (state machine, movement, harvesting, selection, rendering) lives in a single 248-line class with no separation of concerns. Adding combat, different unit types, or new behaviors requires modifying this one class.
- Safe modification: Keep the state machine switch/case structure. Add new states as new cases. Do not add conditional branches inside existing states.
- Test coverage: Zero -- no tests exist anywhere in the project.

**Game Scene (`src/scenes/Game.ts`):**
- Files: `src/scenes/Game.ts`
- Why fragile: Acts as both game logic coordinator and hardcoded data source. All entity creation is inline in the constructor.
- Safe modification: Extract entity definitions before adding new features. Keep `create()` and `update()` as thin orchestrators.
- Test coverage: Zero.

## Scaling Limits

**Fixed Canvas Dimensions:**
- Current capacity: Game width uses `window.innerWidth` but height is hardcoded to 768px. All entity positions are absolute pixel values.
- Limit: Breaks on screens with different aspect ratios or DPI. Resource nodes and base may be off-screen on smaller displays.
- Scaling path: Use relative positioning or a world-coordinate system with camera viewports.

**Single-File Module Pattern:**
- Current capacity: Each engine module (`units`, `buildings`, `resources`) is a single `index.ts` file.
- Limit: As unit types, building types, and resource types grow, these files will become unmanageable.
- Scaling path: Split into one file per class (e.g., `src/engine/units/Unit.ts`, `src/engine/units/Harvester.ts`).

## Dependencies at Risk

**Phaser 3 (^3.87.0):**
- Risk: Phaser 4 is in development. Major version upgrade will require significant refactoring.
- Impact: All game code depends on Phaser 3 APIs (Scene lifecycle, Physics, Sprites, Animations).
- Migration plan: Pin to Phaser 3.x for stability. Monitor Phaser 4 release notes for migration guides.

## Missing Critical Features

**No Test Infrastructure:**
- Problem: Zero test files, no test framework configured, no test scripts in `package.json`.
- Blocks: Cannot verify behavior of state machine, harvesting logic, or resource management without manual testing.

**No Linting or Formatting:**
- Problem: No ESLint, Prettier, or Biome configuration. Code style is inconsistent (mixed indentation in `Game copy.ts`, inconsistent spacing).
- Blocks: Code quality degrades as contributors are added.

**No Physics for Non-Harvester Units:**
- Problem: Only harvesters have `physics.add.existing()` called. The main unit "lizzy" has no physics body, so `moveTo` would fail with a runtime error if attempted.
- Files: `src/scenes/Game.ts` (lines 122-126 vs 128-133)
- Blocks: Cannot implement movement or combat for non-harvester units without adding physics bodies.

## Test Coverage Gaps

**Entire Codebase Untested:**
- What's not tested: Everything -- unit state machine, resource harvesting, building deposit logic, scene lifecycle.
- Files: `src/engine/units/index.ts`, `src/engine/buildings/index.ts`, `src/engine/resources/index.ts`, `src/scenes/Game.ts`
- Risk: Any refactoring could silently break core game mechanics (harvesting loop, resource counting, unit movement).
- Priority: High -- the state machine in `Unit.update()` is the most critical area to test first, especially given the existing MOVING_TO_POSITION bug.

---

*Concerns audit: 2026-04-16*
