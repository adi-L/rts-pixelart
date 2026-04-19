# Phase 4: Combat & World Polish - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

The hero gains combat agency through a ranged weapon system, the world expands to 20,000px with exploration zones and progressive city expansion, and archers are rethemed as gunners to fit the futuristic setting. The result is a complete, playable skirmish map.

</domain>

<decisions>
## Implementation Decisions

### Weapon System
- **D-01:** Armory structure — a new buildable structure unlocked at main base level 3. Hero drops coins at the armory build point to construct it. Same coin-drop build pattern as all other structures.
- **D-02:** Ranged only — one gun weapon for MVP. No melee weapons.
- **D-03:** Limited ammo — hero gets a clip of ammo from the armory. Must return to restock. Each restock costs coins (ongoing economy pressure).
- **D-04:** Mouse aim + click to shoot — keyboard controls movement (WASD/arrows), mouse cursor controls aim direction, left-click fires. Coin drop stays on spacebar/down arrow (no conflict).
- **D-05:** Gun sprite rotates toward mouse cursor. Hero body stays in normal idle/walk animation — only the gun visual rotates.
- **D-06:** Bullet is a small colored rectangle, consistent with placeholder art style. Object-pooled like coins (INFRA-02 pattern).
- **D-07:** Bullets stop on first hit — each bullet damages one zombie, no piercing.
- **D-08:** Damage + knockback on hit — zombie takes HP damage AND gets pushed back a few pixels. Hero has crowd control ability.

### Futuristic Retheme (Archer → Gunner)
- **D-09:** Archers become gunners — rename throughout. Towers become gun positions. Arrows are removed entirely (no arrows in a futuristic setting).
- **D-10:** Gunners and hero share the same bullet pool. Unified projectile system.
- **D-11:** Gunner behavior stays the same as Phase 3 archer behavior (hunt by day, defend tower at night) — only the weapon type and naming changes.

### Hero Vulnerability
- **D-12:** Hero has HP — zombies deal damage to the hero on contact.
- **D-13:** Hero death = game over — same consequence as main base destruction. Two lose conditions: base destroyed OR hero killed.
- **D-14:** Hero health bar displayed in the HUD (top of screen), always visible. Consistent with coin/day display.
- **D-15:** Hero HP value, zombie damage to hero — Claude's discretion, balanced against zombie speed and night duration.

### Skirmish Map Layout
- **D-16:** World expands to 20,000px (from 6000px). ~65 seconds to cross at hero speed. Significant exploration space on both sides of the city.
- **D-17:** Many more build points — scaled up proportionally for 20,000px. Multiple layers of walls, towers, farms. City can grow outward as the player expands defenses.
- **D-18:** Exploration zones beyond the defensive perimeter contain:
  - Coin caches — piles of coins scattered as risk/reward for daytime exploration
  - Abandoned structures — pre-built ruins repairable with coins (head start on outer defenses)
  - Vagrant camps — groups of vagrants further from base (more recruits for explorers)
  - Resource buildings — special structures (old armory, ruined farm) with unique bonuses when repaired

### Claude's Discretion
- Armory construction cost and ammo restock cost
- Ammo clip size, fire rate, bullet damage, bullet speed
- Hero HP value and zombie damage-to-hero value
- Bullet pool size (shared between hero and gunners)
- Gun sprite visual (size, color, rotation anchor point)
- Exact build point layout across 20,000px world (symmetric, progressive unlock tiers)
- Exploration zone placement, coin cache amounts, abandoned structure types
- Vagrant camp sizes and locations
- Resource building bonus types
- Hero knockback distance when hit by zombie (if any)
- Armory build point position relative to main base

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value (coin-drop mechanic), constraints, key decisions
- `.planning/REQUIREMENTS.md` — Phase 4 requirements: HERO-03, HERO-04, MAP-03
- `.planning/ROADMAP.md` — Phase 4 success criteria, dependency on Phase 3
- `CLAUDE.md` — Technology stack, Phaser 3 patterns, architecture guidance

### Prior Phase Foundations
- `.planning/phases/01-foundation-hero-loop/01-CONTEXT.md` — Flat ground, no jumping, programmatic generation, EventBus, object pooling
- `.planning/phases/02-citizen-economy-structures/02-CONTEXT.md` — Role assignment via buildings, farm-only income, base upgrade progression (level 3 unlocks armory), vagrant recruitment
- `.planning/phases/03-day-night-zombie-waves/03-CONTEXT.md` — Day/night cycle, zombie behavior, archer (now gunner) NPC, difficulty escalation, zombie pool

### Existing Code (Phase 1-3 output)
- `src/constants.ts` — All game constants including world dimensions (WORLD_WIDTH to be updated), NPC sizes, structure costs, zombie/archer stats
- `src/entities/Hero.ts` — Hero movement with keyboard input. Must be extended with mouse aim, gun sprite, shooting, HP
- `src/entities/npc/BaseNPC.ts` — Base NPC class
- `src/entities/npc/Archer.ts` — Archer entity to be renamed/reworked as Gunner
- `src/entities/npc/Zombie.ts` — Zombie state enum (March/Attack/Dying)
- `src/entities/structures/BaseStructure.ts` — Structure base with takeDamage() and health bar
- `src/entities/structures/Tower.ts` — Tower structure (gunner position)
- `src/entities/structures/MainBase.ts` — Main base with upgrade tiers and destruction
- `src/entities/Arrow.ts` — Arrow entity to be replaced with Bullet entity
- `src/systems/WaveManager.ts` — Zombie spawning and wave management
- `src/systems/EconomyManager.ts` — Economy with day tracking, coin add/spend
- `src/systems/NPCManager.ts` — NPC lifecycle, role assignment
- `src/systems/StructureManager.ts` — Structure creation and build point management
- `src/events/EventBus.ts` — EventEmitter singleton
- `src/scenes/Game.ts` — Main game scene with all systems

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Object pool pattern** (Coin.ts, WaveManager zombie pool): `createMultiple` + activate/deactivate — reuse for bullet pool
- **Arrow entity** (Arrow.ts): Projectile pattern with velocity, range, and pool management — refactor into Bullet entity
- **BaseStructure** (BaseStructure.ts): `takeDamage()` with health bar and red tint flash — reuse for hero HP
- **BuildPoint system**: Coin deposit + EventBus pattern — extend for armory build point
- **Health bar pattern** (BaseStructure.ts): `HEALTH_BAR_*` constants and rendering — adapt for HUD hero health bar

### Established Patterns
- Entity pattern: class with `sprite` property, constructor takes scene + position, `destroy()` for cleanup
- Physics: Arcade Physics with `physics.add.overlap` for collision detection
- Object pooling via `Phaser.Physics.Arcade.Group` with `createMultiple`
- Role conversion: remove from one array, create new entity, add to role array
- Scene shutdown cleanup via `events.once('shutdown', ...)`
- Constants centralized in `src/constants.ts`

### Integration Points
- `Game.ts create()` — Armory structure, bullet pool, hero combat system initialized here
- `Game.ts update()` — Mouse aim tracking, hero shooting cooldown, bullet-zombie collision
- `Hero.ts` — Must be extended with: mouse input, gun sprite child, shoot method, HP system
- `Archer.ts` → `Gunner.ts` — Rename and change projectile from arrow to bullet
- `constants.ts` — WORLD_WIDTH update from 6000→20000, new armory/bullet/hero-HP constants, expanded BUILD_POINT_LAYOUT
- `StructureManager` — Armory structure type registration
- `NPCManager` — Gunner rename, bullet pool reference

</code_context>

<specifics>
## Specific Ideas

- The futuristic zombie setting means no medieval weapons — guns, bullets, tech structures
- Mouse aim adds a skill element to combat — the player actively participates in defense, not just building and watching
- The 20,000px world makes exploration a core activity during the day: find coins, recruit vagrants, discover and repair structures
- Limited ammo creates tension: do you stay and fight, or run back to the armory to restock mid-wave?
- Abandoned structures in exploration zones reward early exploration with a defensive head start

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-combat-world-polish*
*Context gathered: 2026-04-18*
