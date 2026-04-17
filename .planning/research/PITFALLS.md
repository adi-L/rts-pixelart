# Pitfalls Research

**Domain:** 2D RTS game — browser-based, Phaser 3, TypeScript, tile maps, ~100 unit types, fog of war, AI opponents, eventual multiplayer
**Researched:** 2026-04-16
**Confidence:** HIGH (critical pitfalls), MEDIUM (multiplayer/AI pitfalls), HIGH (Phaser-specific)

---

## Critical Pitfalls

### Pitfall 1: No Object Pooling From Day One

**What goes wrong:**
Units are created with `new` and destroyed with `destroy()` constantly during combat. As unit count grows (50-200 units in active combat), garbage collection pauses cause visible stutters — frames that take 16ms spike to 80-150ms. On mobile this is unplayable. The problem doesn't show up with 10 units in a prototype; it shows up in the first real battle scenario.

**Why it happens:**
Object creation and destruction looks clean and works fine at prototype scale. Developers add pooling "later" — but the codebase by then has dozens of callsites that assume fresh object construction.

**How to avoid:**
Implement `UnitPool` and `ProjectilePool` before writing any combat code. Phaser's `Group.get()` / `Group.killAndHide()` pattern is the right abstraction. Pre-warm pools at scene startup (not lazily). Every unit "creation" is actually activation; every unit "death" is deactivation + return to pool.

**Warning signs:**
- `update()` frame time spikes in Chrome DevTools during combat
- JavaScript heap allocation rate (Memory tab) shows sawtooth pattern instead of steady line
- Performance degrades noticeably when 30+ units engage simultaneously

**Phase to address:**
Unit system phase (Phase 2). Pool infrastructure must exist before combat is implemented — retrofitting is painful.

---

### Pitfall 2: Too Many Tilemap Layers

**What goes wrong:**
Adding terrain layers for ground, decorations, overlay effects, fog, and pathfinding-blocked zones each as a separate `TilemapLayer` collapses FPS. Measured data: 4 layers = 52 FPS, 6 layers = 42 FPS, 8 layers = 34 FPS. A "rich" map with 8 layers runs poorly even before any units are added.

**Why it happens:**
Tiled map editor makes it easy to add layers. The rendering cost per layer in Phaser is independent of how many tiles are actually used on that layer — even sparse layers cost the same.

**How to avoid:**
Hard cap: 3-4 visible tile layers max (base terrain, terrain detail, structures/overlays). Fog of war must NOT be a tilemap layer — use a `RenderTexture` sized to the screen viewport, not the full map. For pathfinding data, store in a parallel array, not a rendered layer.

**Warning signs:**
- Tiled file has more than 4 tile layers
- FPS drops on empty map with no units
- Someone added a "fog" or "shadow" tilemap layer

**Phase to address:**
Map system phase (before fog of war implementation). Establish layer budget in the tilemap spec.

---

### Pitfall 3: Fog of War as Full-Map RenderTexture

**What goes wrong:**
Fog of war is implemented as a `RenderTexture` the size of the entire tilemap (e.g., 3000×2000 px). On every frame, the entire texture is redrawn to update unit vision radii. Performance tanks as map size or unit count increases.

**Why it happens:**
The natural implementation is "one texture covers the whole map." It works in small tests.

**How to avoid:**
RenderTexture must be screen-sized (viewport), not map-sized. Move the mask position based on camera scroll offset — the texture stays fixed on screen and the mask moves relative to it. Additionally, use a fog grid with cell resolution lower than a tile (e.g., 8px cells). Skip fog recalculation entirely when no units have moved to a new fog cell that frame. Only update fog cells within vision range of units that actually moved.

**Warning signs:**
- `RenderTexture` dimensions match tilemap dimensions in code
- Fog update runs unconditionally every frame regardless of unit movement
- FPS drops proportionally to map size, not unit count

**Phase to address:**
Fog of war phase. Must be in the spec before implementation begins.

---

### Pitfall 4: Treating Each Unit as an Independent Pathfinding Agent

**What goes wrong:**
Units individually run A* on every move command. Under 20 units this is fine. With 50 units simultaneously ordered to the same location, you get a "pathfinding storm" — hundreds of A* calls per second. Additionally, units stack on identical optimal paths, creating traffic jams that look broken. Units get stuck when others block their path with no collision resolution.

**Why it happens:**
Single-unit pathfinding is the obvious first implementation. Group movement is treated as "just run pathfinding for each unit."

**How to avoid:**
Two-layer movement system: (1) global pathfinder computes one shared path to the destination, (2) local collision avoidance applies per-unit force/steering to maintain group cohesion and avoid live obstacles. Apply formation offsets to destination per unit so they don't all converge on the same point. Do NOT dynamically update the navmesh per frame for unit positions — use steering forces for local avoidance instead.

**Warning signs:**
- Selecting 20+ units and issuing a move command causes FPS drop
- Units visibly funnel through a single tile rather than spreading
- Moving a large group causes all units to stack on one tile at the destination

**Phase to address:**
Unit movement phase. Must be part of the initial movement system spec, not added after.

---

### Pitfall 5: Scope Explosion — Building Everything Before It Plays

**What goes wrong:**
The feature list (50 unit types per faction, campaign, multiplayer, weapon pickup, fog of war, AI, two resource types, building construction) is large enough that building them all before a real gameplay loop exists leads to a tech demo that was never actually fun. This is the #1 reason RTS hobby projects are abandoned. Over 70% of indie developers cite "scope too large" as the cause of project abandonment.

**Why it happens:**
Every feature feels necessary to make the game "feel like an RTS." The vision is clear and coherent so it seems achievable.

**How to avoid:**
Lock the build order to: (1) skirmish with two basic unit types and working combat, (2) add economy loop, (3) add building production, (4) expand unit roster, (5) fog of war, (6) AI, (7) campaign, (8) multiplayer. Each step must produce something that can be played and tested. Campaign and multiplayer are explicitly last — the game loop must be verified fun in skirmish first. The weapon pickup mechanic is core identity — implement it early in skirmish.

**Warning signs:**
- Working on multiplayer infrastructure before skirmish combat works
- Data-driving 50 unit types before any unit feels good to use
- Building campaign mission scripting before AI exists
- "Just need to finish one more system before I can actually play it"

**Phase to address:**
Every phase boundary. The roadmap must enforce playable milestones.

---

### Pitfall 6: Non-Deterministic Simulation (Multiplayer Time Bomb)

**What goes wrong:**
`Math.random()` is called in unit combat, pathfinding tiebreaks, or AI decisions without a seeded, synchronized RNG. `Date.now()` is used for timing. Floating-point arithmetic on unit positions produces subtly different results across machines. When multiplayer lockstep is added, the game immediately and constantly desyncs. Finding the source requires binary-searching through game state hashes, which is one of the most painful debugging tasks in game development.

**Why it happens:**
None of this matters for single-player. The divergence only surfaces once lockstep networking is added, at which point the codebase has hundreds of random and timing callsites.

**How to avoid:**
Establish a seeded RNG (e.g., `seedrandom` or a simple LCG implementation) from day one. All game logic that needs randomness calls `this.rng.next()` on a shared seeded instance, never `Math.random()`. All simulation timing uses a fixed-step game tick counter, never `Date.now()` or `performance.now()`. Document this rule in the architecture. Never use `Math.random()` in any game logic — only in UI/visual effects.

**Warning signs:**
- `Math.random()` called anywhere in unit combat or AI code
- Game timing based on wall clock rather than fixed tick counter
- No seeded RNG utility in the codebase by end of Phase 1

**Phase to address:**
Phase 1 (foundation). The seeded RNG and fixed-tick game loop must be established before any game logic is written.

---

### Pitfall 7: Physics Engine for Unit Combat

**What goes wrong:**
Phaser's Arcade Physics is used for unit-to-unit collision detection and combat range checks because it seems convenient. With 100+ units, physics body overlap checks per frame become a significant cost. More problematically, physics introduces non-determinism via floating-point velocity integration and continuous collision responses — breaking future multiplayer.

**Why it happens:**
Phaser has physics built in. It's the obvious tool.

**How to avoid:**
For RTS units: use simple distance-squared checks for range detection (cheap, no physics needed), use a spatial grid (or Phaser's built-in spatial hash) for broad-phase proximity queries, and reserve physics for things that actually need physics (projectile arcs, knockback effects). Unit pathfinding and combat should be pure game-logic, not physics-driven.

**Warning signs:**
- Every unit has an Arcade Physics body enabled
- Combat range detection uses `this.physics.overlap()`
- Unit velocity is set via physics body instead of manual position updates

**Phase to address:**
Unit combat phase. Document the "no physics for unit AI" rule in the architecture doc.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode unit stats in class files | Fast to prototype one unit | Adding 50 unit types requires editing N files, can't hot-reload | Never — use data config from Phase 1 |
| `Math.random()` for combat RNG | Zero setup cost | Breaks lockstep multiplayer, untestable | Never in game logic; acceptable in visual effects only |
| Tilemap layer per visual concept | Clean Tiled organization | FPS degradation, 4+ layers is measurable cost | 3 layers max; merge or use alternative for extras |
| Sprite atlas per unit type | Simpler asset pipeline | Dozens of draw calls per frame at scale | Acceptable for prototype; atlas packing required before ship |
| Physics overlap for proximity checks | Leverages engine features | Non-deterministic, expensive at scale | Never for unit AI; acceptable for one-off physics objects |
| Full-map RenderTexture for fog | Simple code, correct result | Proportional cost to map size | Screen-sized only; never full-map |
| Anonymous event listeners | Slightly less code | Impossible to remove, causes memory leaks on scene restart | Never; always keep a reference for cleanup |
| Updating all 100 units every frame | Correct behavior | Unnecessary CPU work; sleeping/idle units don't need updates | Active units only; skip dead/idle units in update loop |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No unit object pool | Frame stutters during combat; heap allocation sawtooth | Pool from Phase 2; `Group.get()` / `killAndHide()` | ~30+ units entering/leaving combat simultaneously |
| Independent A* per unit on group move | FPS drop on large move commands | Shared path + local steering avoidance | ~20+ units issued same move order |
| Per-frame fog update (full scan) | FPS drops proportional to map size | Cell-dirty tracking; skip unchanged cells | 64×64 tile maps with 20+ moving units |
| Too many tilemap layers | FPS floor degraded even with no units | 3-layer hard budget | 6+ layers regardless of tile density |
| Full-map RenderTexture for fog | Fog update cost proportional to map width×height | Screen-sized texture only | Maps larger than 512×512px |
| Iterating all units for every combat check | O(n²) range checks each frame | Spatial grid or quad-tree | ~50+ units in dense combat |
| Texture atlas fragmentation | Many draw call spikes in WebGL | Pack atlases with TexturePacker; load as single atlas | When more than ~10 different sprite sheets are loaded |
| Scene not destroyed on restart | Memory grows each game restart; duplicated event callbacks | Explicit DESTROY handler; `textures.remove()` | First scene restart |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Tiled map editor → Phaser | Exporting JSON without embedding tilesets; mismatching tile GIDs after tileset reorder | Embed tileset in Tiled export; never reorder tilesets after export |
| Phaser Tweens on pooled sprites | Old tween on recycled sprite fires after reactivation causing wrong animation | Track and stop all tweens on a sprite before returning to pool |
| Phaser Camera + RenderTexture fog | Fog texture anchored to world coordinates instead of screen | Fog RenderTexture is screen-fixed; adjust mask position by `camera.scrollX/Y` |
| Multiplayer lockstep + Phaser update loop | Using `delta` time in `update(scene, time, delta)` for game logic | Game logic runs on fixed tick count; `delta` is rendering-only |
| Seeded RNG + TypeScript modules | RNG instance created per-module (multiple instances, different sequences) | Single RNG instance exported as singleton from `rng.ts` |
| WebSocket + game loop | Network messages processed inside `update()` mid-frame | Buffer incoming messages; process at start of game tick only |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Unit silhouettes too similar between factions | Players can't tell Coalition from Veil at a glance in fog of war conditions | Faction-specific color tints + distinct silhouette shapes; humans are geometric, aliens are organic |
| No visual feedback on weapon pickup | Players miss the core mechanic; don't know a unit upgraded | Pickup flash effect + brief stat comparison UI on pickup |
| Minimap not implemented until late | Players lose spatial context in large maps; can't plan | Basic minimap before fog of war; fog should appear on minimap too |
| Selection box does not respect fog | Players can box-select and reveal hidden units by accident | Selection does not create visual selection ring on fogged units |
| Pathfinding "stuck" with no feedback | Units appear frozen; player re-clicks repeatedly | Units that can't reach destination after N frames should navigate to closest reachable point and signal "can't reach" |
| RTS control conventions violated | Unfamiliar controls cause immediate frustration | Right-click move, drag-select, Ctrl+number group assignment are mandatory table stakes |

---

## "Looks Done But Isn't" Checklist

- [ ] **Weapon pickup:** Unit acquires weapon visually — verify stat recalculation actually applies, weapon slot is cleared from dead unit, cross-faction weapons display correctly on both faction unit sprites
- [ ] **Fog of war:** Tiles are hidden — verify AI cannot see into fogged areas, projectiles do not appear/disappear at arbitrary points, minimap respects fog
- [ ] **Unit death:** Death animation plays — verify sprite returned to pool (not leaked), weapon dropped at death position, death registered for all systems (AI threat tracking, resource tally, win condition)
- [ ] **Scene restart:** Game can be restarted from menu — verify memory stable across 3+ restarts (no heap growth), no duplicate event listener callbacks, timers all canceled
- [ ] **Building production:** Unit emerges from building — verify it exits to accessible tile, not inside a wall, production queue clears correctly on cancel
- [ ] **Multiplayer game end:** Player disconnect during game — verify remaining player declared winner, lobby state resets, no orphaned server-side game session
- [ ] **AI fog compliance:** AI moves units to enemy base — verify AI is using fog-limited vision, not full-map omniscience, unless difficulty level explicitly grants that

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| No object pooling discovered at 50+ units | HIGH | Audit all unit creation/destruction callsites; introduce pool class; replace all `new Unit()` with `pool.get()`; test for regressions in every unit state |
| Math.random() desync discovered when adding multiplayer | HIGH | Grep entire codebase for `Math.random`; replace all game-logic uses with seeded RNG; requires full multiplayer retest |
| Too many tilemap layers after maps are built | MEDIUM | Merge compatible layers in Tiled; export new maps; update layer name constants in code |
| Full-map fog texture discovered too late | MEDIUM | Refactor fog system to screen-sized texture + scroll offset; re-test all fog edge cases |
| Physics-driven units discovered before multiplayer | HIGH | Strip physics bodies from all units; rewrite range checks as distance-squared; rewrite collision as spatial grid lookups |
| Scope explosion / incomplete game loop | HIGH | Cut all features not needed for one playable skirmish; establish working game loop; re-scope additions as phases |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| No object pooling | Phase 2: Unit System | Spawn and kill 100 units rapidly; memory stable, no FPS drop |
| Too many tilemap layers | Phase 3: Map System | FPS baseline measured on empty map; must exceed 60 FPS with max layers |
| Full-map fog RenderTexture | Phase 4: Fog of War | FPS delta with fog on vs off must be under 5 FPS at max unit count |
| Independent pathfinding per unit | Phase 2: Unit Movement | Issue move-all command to 50 units; FPS must not drop below 55 |
| Scope explosion | Every phase transition | Each phase ends with a playable, demonstrable game state |
| Non-deterministic RNG (multiplayer time bomb) | Phase 1: Foundation | No `Math.random()` in game logic; seeded RNG singleton verified in code review |
| Physics for unit combat | Phase 2: Unit Combat | No Arcade Physics bodies on regular units; confirmed in architecture review |
| Scene memory leak | Phase 5: Scene/Menu system | Restart game 5 times; Chrome heap snapshot shows flat memory across restarts |
| AI fog cheating | Phase 6: AI Opponents | AI opponent must not react to player actions that occur entirely within fogged tiles |
| Weapon pickup visual gap | Phase 3: Combat Core | Manual test: kill enemy with rare weapon; verify pickup animation, stat update, and visual change on receiving unit |

---

## Sources

- [Phaser 3 RTS feasibility discussion](https://phaser.discourse.group/t/is-possible-to-create-rts-game-with-phaser-3/3866)
- [How I optimized my Phaser 3 action game — 2025](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b) — HIGH confidence, current year
- [Lessons learned from Konkr.io in Phaser](https://phaser.discourse.group/t/lessons-learned-from-building-a-turn-based-strategy-game-in-phaser/12265) — HIGH confidence
- [Tilemap layer count performance issue](https://github.com/photonstorm/phaser/issues/839) — HIGH confidence, measured FPS data
- [Managing big maps in Phaser 3](https://phaser.io/news/2018/10/managing-big-maps-in-phaser-3) — HIGH confidence, official Phaser site
- [Group pathfinding in RTS games](https://www.gamedeveloper.com/programming/group-pathfinding-movement-in-rts-style-games) — HIGH confidence, Game Developer
- [Synchronous RTS engines and desyncs](https://www.forrestthewoods.com/blog/synchronous_rts_engines_and_a_tale_of_desyncs/) — HIGH confidence, primary source post-mortem
- [Floating point determinism](https://gafferongames.com/post/floating_point_determinism/) — HIGH confidence, canonical reference
- [Netcode architectures: Lockstep](https://www.snapnet.dev/blog/netcode-architectures-part-1-lockstep/) — MEDIUM confidence
- [Fog of war RTS implementation](https://www.jdxdev.com/blog/2022/06/08/rts-fog-of-war/) — MEDIUM confidence
- [Phaser fog of war with RenderTexture](https://blog.ourcade.co/posts/2020/phaser3-fog-of-war-field-of-view-roguelike/) — MEDIUM confidence
- [Scope creep in indie games](https://www.wayline.io/blog/scope-creep-indie-games-avoiding-development-hell) — HIGH confidence, widely corroborated
- [Phaser Performance Optimization Guide 2025](https://generalistprogrammer.com/tutorials/phaser-performance-optimization-guide) — MEDIUM confidence
- [RTS AI problems and techniques (academic)](http://www.cs.mun.ca/~dchurchill/publications/pdf/ecgg15_chapter-rts_ai.pdf) — HIGH confidence

---

*Pitfalls research for: 2D RTS game (Ashes of Contact) — Phaser 3, TypeScript, browser-based*
*Researched: 2026-04-16*
