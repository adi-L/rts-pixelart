# Project Research Summary

**Project:** Ashes of Contact — 2D Sci-Fi RTS
**Domain:** Browser-based Real-Time Strategy (Phaser 3 / TypeScript)
**Researched:** 2026-04-16
**Confidence:** HIGH (core patterns, features, pitfalls); MEDIUM (multiplayer specifics)

## Executive Summary

Ashes of Contact is a browser-based 2D RTS with asymmetric factions and a weapon-scavenging mechanic that distinguishes it from every major competitor in the genre. Research confirms the existing Phaser 3 + TypeScript + Vite stack is the correct foundation — Phaser 3.90 is the final v3 release and should be pinned explicitly to avoid npm resolving to the incompatible Phaser 4. Two libraries must be added before combat is implemented: `bitecs` for data-oriented entity simulation and `pathfinding` (PathFinding.js) for A*-based unit movement. All other systems — fog of war, AI, and networking — are best built in-house using well-documented Phaser patterns rather than third-party libraries.

The weapon pickup mechanic (units scavenging weapons from fallen enemies, cross-faction) is the single most important differentiator and must ship in v1 skirmish. Research strongly recommends deferring multiplayer and campaign mode — both are v2+ work — and building a complete, playable, solo skirmish loop first. The game's feature graph has clear dependencies: data-driven unit definitions unlock asymmetric factions, combat unlocks weapon pickup, and the full game loop must exist before the AI Director can operate.

The most dangerous risks are scope explosion (the #1 cause of RTS hobby-project abandonment) and a cluster of performance traps cheap to prevent at Phase 1 but expensive to fix later: no object pooling, too many tilemap layers, per-unit independent pathfinding, and `Math.random()` called in game logic. The seeded RNG and object pool patterns must be established in the foundation phase before any game logic is written.

## Key Findings

### Recommended Stack

The project's existing stack (Phaser 3.90, TypeScript 5.4, Vite 5) needs no replacement, only two additions. `bitecs` (0.4.0) is the de facto high-performance ECS for JavaScript — it is what Phaser 4 uses internally — and is required to simulate 50+ unit types efficiently using TypedArray component storage. `pathfinding` (0.4.18) provides synchronous A* with Jump Point Search and integrates cleanly with Phaser's tilemap walkability metadata. For large groups (100+ units), a custom flow-field layer built on top adds ~200 LOC and amortizes cost across all units sharing a destination.

Multiplayer infrastructure (Colyseus 0.17.9 + `@colyseus/schema` 4.0.20) is identified and validated but must not be added until the skirmish simulation is stable. The correct architecture is: build the full game loop assuming single-player, then extract the simulation into a server-side module. Avoid lockstep networking — JavaScript floating-point non-determinism makes it an extremely difficult target.

**Core technologies:**
- `phaser@^3.90.0`: Game framework — pin version; npm `latest` now resolves to incompatible Phaser 4
- `typescript@^5.4.5`: Type safety and data contracts for 50+ unit types
- `vite@^5.3.1`: Build pipeline (already configured)
- `bitecs@0.4.0`: ECS simulation layer — required for high unit counts; do not roll custom ECS
- `pathfinding@0.4.18`: Synchronous A* on tile grid; add custom flow field for group movement
- `colyseus@0.17.9` + `@colyseus/schema@4.0.20`: Multiplayer only — add at the multiplayer milestone, not before

### Expected Features

The core game loop to validate in v1 is: build → gather → produce → fight → scavenge. The weapon pickup mechanic is non-negotiable for v1 — it is the identity of the game.

**Must have for v1 skirmish:**
- Box-select + control groups + attack-move + right-click move — RTS input table stakes
- Resource gathering (worker unit, two resource types: common + rare)
- Base building (tile grid placement, 3-4 structures per faction)
- Unit production queue (2-3 unit types per faction to start)
- Combat auto-attack with unit counters (2 damage types minimum)
- Weapon pickup from fallen units — core differentiator, must ship in v1
- Fog of war (unexplored / shroud / visible)
- Minimap
- One skirmish AI opponent (scripted build order, single difficulty)
- One hand-crafted skirmish map and win condition

**Should have in v1.x iterations:**
- 6-8 unit types per faction (expand after core loop is proven)
- Tech tree / upgrade research buildings
- Multiple AI difficulty levels
- 2-3 additional maps
- Full Coalition vs Veil asymmetric differentiation

**Defer to v2+:**
- Multiplayer (requires stable simulation, networking, lobby system)
- Campaign mode (requires scripting system, art, narrative, pacing)
- Map editor
- Hero unit (Elias Vorn) as playable

### Architecture Approach

The architecture is a layered system with a typed EventBus at its center. The Game scene is an orchestrator only — it instantiates systems and calls `system.update(delta)`. All logic lives in `engine/` classes with no scene dependency. The `data/` directory contains pure TypeScript objects with no Phaser imports, enabling unit definitions to be unit-tested, shared with a server, or serialized without the game engine. The AI Director issues commands through the exact same CommandHandler pipeline as the player, making the multiplayer migration boundary explicit: EventBus command events become the network payload.

**Major components:**
1. **DataLayer** (`data/`) — Unit, weapon, building definitions as typed plain objects; no Phaser dependency
2. **EventBus** — Typed central emitter; all cross-system communication; no direct system-to-system references
3. **UnitManager + UnitAI** — Spawning, group queries; per-unit FSM (idle / move / attack / harvest / dead)
4. **CombatSystem + WeaponSystem** — Attack resolution, death events, weapon drop/pickup; the signature mechanic
5. **TileMapSystem + FogOfWar** — Tile passability, reference-counted visibility grid, screen-sized RenderTexture overlay
6. **Pathfinder** — A* with per-frame budget; shared path for group moves + local steering avoidance
7. **EconomySystem + BuildSystem** — Resource balances, structure placement, production queue
8. **AIDirector** — Strategic AI issuing commands via CommandHandler pipeline (same as player)
9. **HUD scene** — Separate Phaser scene layered on top; ResourceBar, Minimap, UnitPanel

### Critical Pitfalls

1. **No object pooling from day one** — GC stutters appear at 30+ simultaneous units. Implement `UnitPool` before writing any combat code. Retrofitting pooling across 50+ callsites is high-cost recovery.

2. **Math.random() in game logic** — Breaks future multiplayer with unrecoverable desync. Establish a seeded RNG singleton in Phase 1. All randomness in combat/AI calls `rng.next()`, never `Math.random()`.

3. **Independent A* per unit on group move** — 20+ units simultaneously requesting paths causes visible FPS drops. Shared path + formation offsets + local steering avoidance must be built into the movement system from the start.

4. **Too many tilemap layers** — Hard cap at 3-4 rendered layers. Fog of war must not be a tilemap layer (screen-sized RenderTexture only). Measured data: 6 layers = 42 FPS, 8 layers = 34 FPS on empty maps.

5. **Scope explosion** — Every phase boundary must produce a demonstrable, playable game state. Campaign and multiplayer are explicitly last milestones, not concurrent development tracks.

## Implications for Roadmap

The architecture's suggested build order maps directly to phases. Each phase must end with a playable game state — this is both a quality gate and the primary defense against scope explosion.

### Phase 1: Foundation
**Rationale:** Seeded RNG and fixed-tick game loop must exist before any game logic. Non-deterministic patterns introduced here metastasize into every later phase. Data schemas established here govern all subsequent unit additions.
**Delivers:** Runnable Phaser scene with fixed-step game loop; seeded RNG singleton; UnitDef / WeaponDef / BuildingDef TypeScript schemas with 5 sample units; EventBus; `src/data/` + `src/engine/` separation.
**Avoids:** Non-deterministic RNG pitfall; direct system-to-system coupling; hardcoded unit stats

### Phase 2: Map and Movement
**Rationale:** TileMapSystem is required by pathfinding, fog of war, and building placement. It is the load-bearing substrate for every subsequent system.
**Delivers:** Tiled JSON map loading with passability metadata; A* pathfinder with per-frame budget; unit sprites moving on the map; CameraController with pan/zoom/edge-scroll.
**Uses:** `pathfinding@0.4.18`; Phaser built-in tilemap API; Tiled 1.11
**Implements:** TileMapSystem, Pathfinder
**Avoids:** Independent A* per unit — shared path + local steering avoidance built from the start; tilemap layer budget (3 max) enforced now

### Phase 3: Units and Combat Core
**Rationale:** Combat is the prerequisite for weapon pickup. Object pooling must be implemented before combat creates any unit churn. This phase delivers the game's defining mechanic.
**Delivers:** Two unit types per faction; auto-attack with range checks; unit death + weapon drop at death position; weapon pickup by any nearby unit; visual pickup feedback; UnitPool in place.
**Uses:** `bitecs@0.4.0`; distance-squared range checks (no Arcade Physics)
**Implements:** UnitManager, UnitAI (basic FSM), CombatSystem, WeaponSystem
**Avoids:** Object pooling gap (pool built before combat, not retrofitted); Arcade Physics for unit AI (forbidden)

### Phase 4: Economy and Base Building
**Rationale:** Economy and building placement are mutually dependent and complete the core game loop: gather → spend → build → produce.
**Delivers:** Worker unit with harvest/deposit cycle; two resource counters in HUD; structure placement on tile grid; production queues; 3-4 structures per faction spawning units.
**Implements:** EconomySystem, BuildSystem, ProductionQueue

### Phase 5: Fog of War and Selection
**Rationale:** Fog of war requires a stable tile system (Phase 2) and must exist before the AI Director can be built with correct fog-limited vision. Selection UI is the last input layer.
**Delivers:** Reference-counted fog grid; screen-sized RenderTexture overlay; shroud state; SelectionManager (box-select, shift-click); CommandHandler wired to units.
**Implements:** FogOfWar, SelectionManager, CommandHandler
**Avoids:** Full-map RenderTexture fog (screen-sized only); selection revealing fogged units

### Phase 6: HUD and Minimap
**Rationale:** HUD is a separate Phaser scene — this isolation prevents UI updates from dirtying the game world display list. Minimap requires fog state to display correctly.
**Delivers:** ResourceBar, UnitPanel, Minimap (fog-aware), control groups (Ctrl+1-9), hotkeys for all common commands.
**Implements:** HUD scene, Minimap, UnitPanel

### Phase 7: Skirmish AI
**Rationale:** AIDirector is a consumer of all prior systems. It requires resource gathering, building, unit production, combat, and fog of war to all function correctly. Building it last prevents it from masking gaps in earlier systems.
**Delivers:** Single AI opponent with scripted build order; resource gathering, base expansion, unit production, and attack waves; AI uses fog-limited vision (no omniscience); one-difficulty skirmish playable start-to-finish.
**Implements:** AIDirector, UnitAI full FSM (attack-move, patrol, flee, guard)
**Avoids:** AI fog cheating (AI must not react to player actions inside fogged tiles)

### Phase 8: Polish and Skirmish v1 Launch
**Rationale:** First playable milestone. Verify the complete "looks done but isn't" checklist.
**Delivers:** Win/loss condition (destroy HQ); audio feedback; one hand-crafted balanced map; scene restart without memory leak; all pitfall verification tests passing.
**Avoids:** Scene memory leak on restart; weapon pickup visual gap; pathfinding stuck with no feedback

### Phase Ordering Rationale

- Map before pathfinding before units before combat: hard dependency chain from ARCHITECTURE.md build order.
- Object pooling in Phase 3, not Phase 8: PITFALLS.md rates this the highest-recovery-cost retrofit.
- Seeded RNG in Phase 1: `Math.random()` in game logic is categorized as "never" per PITFALLS.md.
- AIDirector in Phase 7: FEATURES.md confirms "Skirmish AI requires everything."
- Multiplayer deferred: STACK.md and FEATURES.md are explicit — multiplayer before a stable skirmish loop is an anti-pattern.
- Campaign deferred: FEATURES.md quantifies it as 3x the work of skirmish.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Weapon System):** Weapon pickup (cross-faction swapping, weapon slot, stat recalculation) has no direct Phaser reference implementation. Needs a spike/prototype during planning.
- **Phase 5 (Fog of War):** Screen-sized RenderTexture + camera scroll offset is documented but implementation details are finicky. Needs a focused spike on the Phaser RenderTexture + BitmapMask pattern before implementation starts.
- **Phase 7 (AI Director):** Hierarchical FSM for strategic AI is described conceptually but not validated with a working reference. Recommend a research spike on AI build-order scripting before writing AIDirector.

Phases with standard patterns (skip research phase):
- **Phase 1 (Foundation):** EventBus, project structure, seeded RNG — well-documented TypeScript patterns.
- **Phase 2 (Map + Movement):** Phaser Tiled integration and PathFinding.js A* both verified via Context7 (HIGH confidence).
- **Phase 4 (Economy + Building):** Standard RTS economy and tile placement — no novel patterns.
- **Phase 6 (HUD):** Separate Phaser scene for UI is documented; minimap is straightforward once fog state exists.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core libs verified via npm + Context7. Lockstep-vs-authoritative JS nuance is LOW but is a v2+ concern only. |
| Features | HIGH | Core RTS conventions are well-established. Differentiator analysis grounded in StarCraft/AoE/C&C design literature. |
| Architecture | HIGH (core), MEDIUM (Phaser specifics) | Layered system + EventBus are canonical. Phaser RenderTexture implementation details are MEDIUM. |
| Pitfalls | HIGH (critical), MEDIUM (multiplayer/AI) | Critical performance pitfalls have measured data and primary sources. |

**Overall confidence:** HIGH for v1 skirmish scope. MEDIUM for multiplayer and campaign (v2+).

### Gaps to Address

- **Flow field for large groups:** STACK.md recommends a custom flow field (~200 LOC) for 100+ units sharing a destination. Needs a spike before implementing group movement in Phase 2.
- **Lockstep vs authoritative server for JavaScript:** STACK.md rates this LOW confidence. Not a Phase 1-7 concern but must be resolved before the multiplayer milestone. Dedicate a research spike when that phase begins.
- **Tiled export workflow:** PITFALLS.md flags specific gotchas (embedded tilesets, GID ordering after tileset reorder). Establish and document an export convention before map authoring in Phase 2.
- **Audio assets:** No audio research was conducted. Unit voice/sound is table stakes. Needs sourcing (royalty-free packs or original recording) before Phase 8.

## Sources

### Primary (HIGH confidence)
- `/natethegreatt/bitecs` (Context7) — TypeScript API, query operators, TypedArray performance model
- `/qiao/pathfinding.js` (Context7) — A* API, grid configuration, JPS
- `/websites/phaser_io_phaser` (Context7) — Tilemap API, RenderTexture, BitmapMask
- https://phaser.io/news/2025/05/phaser-v390-released — Phaser 3.90 final v3 release
- https://www.redblobgames.com/blog/2024-04-27-flow-field-pathfinding/ — Flow field theory (authoritative)
- https://www.forrestthewoods.com/blog/synchronous_rts_engines_and_a_tale_of_desyncs/ — Multiplayer desync post-mortem
- https://gafferongames.com/post/floating_point_determinism/ — Floating point determinism (canonical)
- https://github.com/photonstorm/phaser/issues/839 — Tilemap layer count measured FPS data
- https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b — Phaser 3 optimization 2025
- https://howtorts.github.io/ — RTS build order: pathfinding → steering → flow fields → AI

### Secondary (MEDIUM confidence)
- https://docs.colyseus.io/learn/tutorial/phaser — Official Phaser + Colyseus tutorial
- https://github.com/ourcade/phaser3-bitecs-getting-started — Phaser 3 + bitecs integration
- https://medium.com/@galiullinnikolai/composable-state-machines-building-scalable-unit-behavior-in-rts-games — FSM pattern for RTS
- https://www.jdxdev.com/blog/2022/06/08/rts-fog-of-war/ — FOW reference-count grid
- https://blog.ourcade.co/posts/2020/phaser3-fog-of-war-field-of-view-roguelike/ — Phaser RenderTexture fog
- https://medium.com/@crimson.wheeler/scalable-architecture-for-your-games-with-an-rts-walkthrough-part-1-56b123626a4a — Unidirectional command flow

### Tertiary (LOW confidence)
- Lockstep vs authoritative server for JavaScript RTS — no authoritative 2025 source; recommendation based on engineering reasoning

---
*Research completed: 2026-04-16*
*Ready for roadmap: yes*
