# Phase 2: Citizen Economy & Structures - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

The indirect-control loop is complete — citizens generate coins (via farms), builders construct structures when coins are dropped, and the main base exists as a lose condition. The HUD shows coin count and day number. NPCs act autonomously; the player's only tools are movement and coin drops.

</domain>

<decisions>
## Implementation Decisions

### NPC Spawning & Recruitment
- **D-01:** Vagrant-to-citizen conversion — idle vagrants wander near map edges. Hero drops a coin near a vagrant to recruit them. Kingdom Two Crowns style.
- **D-02:** 3-5 vagrants at game start, scattered across the map. New vagrants slowly respawn at map edges (approximately one every 60 seconds).
- **D-03:** Recruited citizens run toward the main base, then idle/wander slowly near it until assigned a role.
- **D-04:** Role assignment via buildings — drop coins at a builder hut to assign a citizen as a builder, at an archer tower for archer, at a farm for farmer. Citizens near a farm also auto-become farmers (proximity-based).

### NPC Economy & Income
- **D-05:** Farm-only income — citizens do NOT generate passive coins by wandering. Coins come exclusively from farm structures.
- **D-06:** Farms are buildable structures at build points. Citizens near a farm auto-become farmers and produce coins at a rate higher than exploration/collection.

### Main Base & Unlock Progression
- **D-07:** Main base upgrade progression unlocks role buildings:
  - **Upgrade 1 (5 coins):** Unlocks builder hut + archer tower build points
  - **Upgrade 2 (15 coins):** Unlocks farm build points
  - **Upgrade 3 (30 coins):** Further upgrade (Claude's discretion — visual/HP increase)
- **D-08:** Main base is a multi-part structure — connected rectangles that grow with each upgrade level (main building + side sections added per upgrade).
- **D-09:** Main base destruction triggers a dramatic collapse animation (brief tween/crumble), short delay, then transition to GameOver scene.
- **D-10:** Health bar appears on the main base only when it has taken damage. Hidden at full health for a cleaner default view.

### Structures
- **D-11:** Walls — one wall segment per build point. Drop more coins to upgrade (wood → stone). Walls block zombies and take damage.
- **D-12:** Towers — can be placed on any build point. Provide archer positions for night defense (Phase 3). Flexible placement, no positional constraint relative to walls.
- **D-13:** Build point layout across the 6000px world — Claude's discretion. Symmetric placement on both sides of the main base, with enough points for walls, towers, and farms.

### HUD
- **D-14:** HUD position: top-left, replacing the existing debug coin count text.
- **D-15:** HUD scope: coin count + day number only. Minimal display. No NPC counts or structure status.
- **D-16:** Day counter visual style — Claude's discretion (consistent with placeholder aesthetic).

### Visual Style
- **D-17:** All structures rendered as colored rectangles — consistent with Phase 1's placeholder art style. Walls are brown/gray, towers are taller, base is multi-part. Sprites can be swapped later via config.

### Claude's Discretion
- Build point count and exact positions across the 6000px world
- Day counter visual style (text, icon, etc.)
- Main base upgrade 3 effect (visual growth, HP increase, or both)
- Vagrant respawn timing and exact behavior patterns
- Coin generation rate from farms
- Structure costs (walls, towers, farms) — balanced against the escalating base upgrade economy
- Builder construction speed and animation

### Folded Todos
None.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value (coin-drop mechanic), constraints, key decisions
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: COIN-03, COIN-04, NPC-01, NPC-02, NPC-04, STRC-01, STRC-02, STRC-03, STRC-04
- `.planning/ROADMAP.md` — Phase 2 success criteria, dependency on Phase 1
- `CLAUDE.md` — Technology stack, Phaser 3 patterns, architecture guidance

### Phase 1 Foundation
- `.planning/phases/01-foundation-hero-loop/01-CONTEXT.md` — Prior decisions: flat ground, 6000px world, programmatic generation, coin mechanics, EventBus, object pooling

### Existing Code (Phase 1 output)
- `src/constants.ts` — All game constants, world dimensions, coin/build point config
- `src/entities/Hero.ts` — Hero movement, sprite, input handling
- `src/entities/Coin.ts` — Coin pool, spawn, collect, magnetic pickup
- `src/entities/BuildPoint.ts` — Build point with coin deposit events via EventBus
- `src/events/EventBus.ts` — Phaser EventEmitter singleton for cross-system communication
- `src/scenes/Game.ts` — Main game scene with all Phase 1 systems wired together

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **EventBus** (`src/events/EventBus.ts`): Already emits `coin:deposited` events with buildPointId and total — Phase 2 builders can listen for this to start construction.
- **Coin pool** (`src/entities/Coin.ts`): Object pool with spawn/collect/magnetic pickup. Can be extended for farm-produced coins.
- **BuildPoint** (`src/entities/BuildPoint.ts`): Has `coinsDeposited` counter, proximity detection, and pulse animation. Needs to be extended to support structure types and upgrade thresholds.
- **Constants** (`src/constants.ts`): Centralized config — new NPC, structure, and HUD constants should follow this pattern.

### Established Patterns
- Entity pattern: class with `sprite` property, constructor takes scene + position, `destroy()` for cleanup
- Physics: Arcade Physics with `physics.add.overlap` for collision detection
- Object pooling via `Phaser.Physics.Arcade.Group` with `createMultiple`
- Tweens for animations (coin spin, collection, build point pulse)
- Scene shutdown cleanup via `events.once('shutdown', ...)` — all new entities must follow this

### Integration Points
- `Game.ts create()` — New entities (NPCs, structures, HUD) initialized here
- `Game.ts update()` — NPC AI update loops, proximity checks
- `BuildPoint.addCoin()` → `EventBus.emit('coin:deposited')` — Builder listens for this event
- `BUILD_POINT_POSITIONS` array in constants — expand with new build point locations
- `coinCount` in Game.ts — needs to become a shared economy system (citizens earn, hero spends)

</code_context>

<specifics>
## Specific Ideas

- Kingdom Two Crowns is the direct reference for vagrant recruitment — the coin toss to convert a wanderer into a citizen
- The main base should feel like the heart of the settlement — multi-part, visually growing with upgrades
- The progression unlock (base upgrade 1 → builders/archers, upgrade 2 → farms) creates a natural gameplay arc: defend first, then grow economy
- Dramatic base destruction should feel impactful — this is the lose condition moment

</specifics>

<deferred>
## Deferred Ideas

- **Rescue vagrants from random buildings on the map** — explore buildings to find and recruit vagrants. Adds exploration purpose. Future phase candidate.

</deferred>

---

*Phase: 02-citizen-economy-structures*
*Context gathered: 2026-04-17*
