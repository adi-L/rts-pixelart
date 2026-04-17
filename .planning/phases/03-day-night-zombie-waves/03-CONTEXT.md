# Phase 3: Day/Night & Zombie Waves - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

The survival loop is active — the world transitions between day and night, zombies attack from both map edges at night, and the archer NPC defends from towers. Day is building time, night is survival time. Zombies die at dawn, giving the player guaranteed recovery. Difficulty escalates each night by zombie count only (no stat changes for MVP).

</domain>

<decisions>
## Implementation Decisions

### Day/Night Cycle
- **D-01:** Day duration is 10 minutes, night duration is 8 minutes (18-minute total cycle). Deliberate, strategic pacing.
- **D-02:** Gradual tint overlay transition — dark blue/purple rectangle fades in over ~10-15 seconds. Smooth, atmospheric.
- **D-03:** Visual warning ~15-30 seconds before nightfall — screen-edge effect or HUD indicator so the player can retreat behind walls.
- **D-04:** EconomyManager already tracks `day` number — increment day counter at each dawn transition.

### Zombie Behavior
- **D-05:** Straight march — zombies walk in a straight line from map edge toward the nearest structure. No complex pathfinding.
- **D-06:** Stop and attack — zombie stops at the first structure it contacts and attacks repeatedly (~2s interval). Only moves on when structure is destroyed.
- **D-07:** Colored rectangles — green/dark-green rectangle NPCs, same size as citizens (NPC_WIDTH x NPC_HEIGHT). Consistent with Phase 1-2 placeholder style.
- **D-08:** Zombies kill NPCs — if a zombie reaches an unprotected citizen/builder/farmer, it kills them. Real stakes: lost farmers = lost income, lost builders = slower construction.
- **D-09:** Zombies die at dawn — all surviving zombies disintegrate (fade out) when day begins. Clean slate each day. Kingdom Two Crowns style relief at sunrise.
- **D-10:** Zombie object pool — pre-allocate zombie sprites and reuse them. No runtime create/destroy. Consistent with INFRA-02 coin pooling pattern.

### Zombie Spawning
- **D-11:** Staggered spawning throughout the night — zombies trickle in from both map edges over the 8-minute night duration. Sustained pressure, not one burst.
- **D-12:** Spawn from BOTH map edges (x=0 and x=WORLD_WIDTH). Zombies approach from left and right simultaneously.

### Archer NPC
- **D-13:** Role assignment via coin drop at built tower — same pattern as builder hut (Phase 2 D-04). Drop coins at a tower to convert nearest citizen into an archer.
- **D-14:** Day behavior: hunt for coins — archers leave their tower during the day, wander outward, and occasionally "hunt" (short animation, earn 1 coin). Return to tower before nightfall. Productive by day, defenders by night.
- **D-15:** Arrow attack: small projectile line (yellow/white) that travels from the tower to the zombie. Object-pooled like coins.

### Difficulty Escalation
- **D-16:** Linear growth — start with ~3-4 zombies on night 1, add 2-3 per night. Predictable, easy to balance.
- **D-17:** Count only for MVP — all zombies have the same HP, speed, and damage. Only the number increases each night. Different zombie types deferred to v2 (PROG-03).

### Claude's Discretion
- Zombie walk speed (balanced against the 8-minute night and world width)
- Zombie HP and damage-per-hit values (balanced against archer damage and structure HP)
- Archer fire rate, range, and damage per arrow
- Archer hunt coin generation rate and wander distance
- Exact nightfall warning visual (HUD text flash, screen-edge glow, etc.)
- Zombie spawn interval formula (how to distribute zombie count across 8 minutes)
- Arrow pool size
- Archer return-to-tower timing (how long before nightfall they head back)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value (coin-drop mechanic), constraints, key decisions
- `.planning/REQUIREMENTS.md` — Phase 3 requirements: NPC-03, WAVE-01, WAVE-02, WAVE-03, WAVE-04
- `.planning/ROADMAP.md` — Phase 3 success criteria, dependency on Phase 2
- `CLAUDE.md` — Technology stack, Phaser 3 patterns, architecture guidance

### Prior Phase Foundations
- `.planning/phases/01-foundation-hero-loop/01-CONTEXT.md` — Flat ground, 6000px world, no jumping, programmatic generation, EventBus, object pooling
- `.planning/phases/02-citizen-economy-structures/02-CONTEXT.md` — Role assignment via buildings, farm-only income, base upgrade progression, vagrant recruitment

### Existing Code (Phase 1-2 output)
- `src/constants.ts` — All game constants, world dimensions, NPC sizes, structure costs/HP
- `src/entities/npc/BaseNPC.ts` — Base NPC class (extend for Archer and Zombie)
- `src/entities/npc/Citizen.ts` — Citizen entity (conversion target for archer role)
- `src/entities/structures/BaseStructure.ts` — Structure base with `takeDamage()` and health bar
- `src/entities/structures/Tower.ts` — Tower structure (archer station)
- `src/entities/structures/Wall.ts` — Wall structure (zombie blocker)
- `src/entities/structures/MainBase.ts` — Main base with destruction/game-over
- `src/systems/EconomyManager.ts` — Economy with day tracking, `setDay()`, coin add/spend
- `src/systems/NPCManager.ts` — NPC lifecycle management, vagrant spawning pattern
- `src/systems/StructureManager.ts` — Structure creation and build point management
- `src/events/EventBus.ts` — EventEmitter singleton for cross-system communication
- `src/scenes/Game.ts` — Main game scene with all systems wired together

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **BaseNPC** (`src/entities/npc/BaseNPC.ts`): Base class for all NPCs — extend for Zombie and Archer entities
- **BaseStructure.takeDamage()** (`src/entities/structures/BaseStructure.ts`): Already handles HP reduction with red tint flash — zombies can call this directly
- **EconomyManager.setDay()** (`src/systems/EconomyManager.ts`): Already tracks day number and emits `economy:changed` — hook day/night cycle into this
- **Object pool pattern** (Coin.ts): `createMultiple` + activate/deactivate pattern — reuse for zombie and arrow pools
- **NPCManager** (`src/systems/NPCManager.ts`): Manages NPC lifecycle with `update()` loop — extend to handle zombie and archer updates
- **EventBus**: Can emit `night:start`, `night:end`, `day:start` events for cross-system coordination

### Established Patterns
- Entity pattern: class with `sprite` property, constructor takes scene + position, `destroy()` for cleanup
- Physics: Arcade Physics with `physics.add.overlap` for collision detection
- Object pooling via `Phaser.Physics.Arcade.Group` with `createMultiple`
- Scene shutdown cleanup via `events.once('shutdown', ...)` — all new entities must follow this
- Role conversion: remove citizen from array, create new role NPC, add to role array (see `assignCitizenAsBuilder`)

### Integration Points
- `Game.ts create()` — New systems (DayNightCycle, ZombieManager/WaveManager) initialized here
- `Game.ts update()` — Zombie AI update, archer targeting, day/night cycle tick
- `StructureManager` — Zombies need to query nearest structure for targeting
- `NPCManager` — Archer lifecycle, zombie-NPC collision detection
- `EventBus` — Day/night events coordinate all systems (archers return, zombies spawn, tint changes)

</code_context>

<specifics>
## Specific Ideas

- Kingdom Two Crowns is the direct reference for the day/night feel — sunrise as relief, nightfall as dread
- The 10-min day / 8-min night pacing is intentionally long — the player should have time to think, build, and explore during the day
- Archers hunting by day and defending by night creates a dual-purpose NPC that feels alive
- Zombies killing NPCs raises real stakes — losing a farmer isn't just a setback, it's lost income permanently until you recruit and assign another

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-day-night-zombie-waves*
*Context gathered: 2026-04-17*
