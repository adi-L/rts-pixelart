# Pitfalls Research

**Domain:** 2D side-scrolling survival strategy game (Phaser 3, Kingdom Two Crowns-style)
**Researched:** 2026-04-16
**Confidence:** HIGH (Phaser-specific), MEDIUM (game design patterns)

---

## Critical Pitfalls

### Pitfall 1: Physics World Bounds Not Set for Scrolling World

**What goes wrong:**
Phaser's Arcade Physics world bounds default to the canvas viewport size. In a side-scrolling game, all physics bodies outside the visible canvas appear to "teleport" or get clamped, NPCs stop moving when they walk off-screen, and zombies despawn at the camera edge rather than approaching from the world edge.

**Why it happens:**
Developers prototype with the camera filling the screen, never test off-screen physics, and only discover the problem when adding camera follow or a large world.

**How to avoid:**
Set physics world bounds immediately when building the world, before any NPCs exist. Use `this.physics.world.setBounds(0, 0, worldWidth, worldHeight)` with the full map width. Separately set `this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)`. Never rely on defaults.

**Warning signs:**
- NPCs freeze or disappear when scrolling past them
- Zombies never reach the base from off-screen
- Objects appear to "snap back" when the camera moves

**Phase to address:**
Core loop / hero movement phase — set world bounds before anything else moves.

---

### Pitfall 2: Creating and Destroying Enemies/Coins Every Frame (No Object Pooling)

**What goes wrong:**
Spawning new Phaser `Sprite` or `Image` objects for every zombie wave, coin drop, and projectile, then calling `.destroy()` when done. As waves escalate, garbage collection pauses create visible frame stutter at the worst possible moment — during combat.

**Why it happens:**
`this.add.sprite(x, y, 'zombie')` is the obvious pattern. The cost is invisible in prototyping with 3–5 enemies but catastrophic at wave 10+ with 30+ simultaneous entities.

**How to avoid:**
Use `this.add.group({ classType: Zombie, maxSize: 50, runChildUpdate: true })` and recycle via `group.get()` / `setActive(false)`. Apply the same pattern to coins, projectiles, and floating damage numbers. Pre-warm pools at scene start.

**Warning signs:**
- FPS drops specifically during wave spawning
- Chrome DevTools shows frequent GC spikes in the performance timeline
- `create()` is called more than once per entity type per wave

**Phase to address:**
NPC / zombie wave phase — establish pooling architecture before wave scaling is tested.

---

### Pitfall 3: Running Update Logic on Every Entity Every Frame

**What goes wrong:**
Every NPC, zombie, builder, and citizen runs its full AI `update()` call every frame regardless of whether it is visible, active, or relevant. With 20+ autonomous entities, this saturates the CPU update budget even when entities are idle.

**Why it happens:**
Calling `super.update()` in a loop is the natural pattern. Off-screen entities feel "free" because they don't draw — but their logic still runs.

**How to avoid:**
Gate update calls: only iterate entities where `body.enable === true` and camera bounds intersect. Use `getMatching('active', true)` on groups. For off-screen autonomous citizens, reduce tick rate to every 500ms via a timer rather than per-frame. Throttle path recalculation; don't re-path every frame.

**Warning signs:**
- CPU usage climbs linearly with number of spawned entities
- Profiling shows update loop as the dominant cost, not rendering
- Performance degrades even with no entities on-screen

**Phase to address:**
NPC behavior phase and zombie wave phase — design the entity update architecture with culling from day one.

---

### Pitfall 4: TileSprite Parallax Backgrounds at World Width

**What goes wrong:**
Developers create a `TileSprite` the full width of the scrolling world (e.g. 10,000px) for each parallax background layer. Phaser allocates a GPU texture for the full dimensions. A 10,000×400px TileSprite at 3 layers consumes enormous VRAM and causes mobile/low-end devices to crash or stall.

**Why it happens:**
The Phaser docs show TileSprite as the easy parallax solution. The viewport-size constraint is not prominently documented.

**How to avoid:**
Create TileSprites at canvas viewport size only (e.g. 1280×400), not world size. Scroll them by updating `tilePositionX` relative to camera position and each layer's parallax factor. This is the correct pattern: the TileSprite tiles within the viewport, not across the world.

**Warning signs:**
- Initial load is slow despite few assets
- Memory usage spikes immediately at scene start
- The game crashes on mobile but not desktop

**Phase to address:**
Visual polish / parallax phase — enforce the viewport-size constraint in the first parallax implementation before adding more layers.

---

### Pitfall 5: Scene Event Listeners Not Cleaned Up on Shutdown

**What goes wrong:**
Event listeners registered with `this.input.on()`, `this.events.on()`, `this.physics.world.on()`, or DOM `window.addEventListener()` are not removed when a scene shuts down. On restart (e.g., retry after death), the listeners from the previous scene run again, doubling callbacks. Coin drop triggers fire twice. Zombie wave timers stack.

**Why it happens:**
Phaser Scene `shutdown` and `destroy` events are not well-publicized. Developers assume Phaser cleans up automatically — it cleans up game objects but not custom event listeners.

**How to avoid:**
Always implement a `shutdown()` method that calls `.off()` for every listener registered in `create()`. Prefer named functions over arrow functions so they can be referenced in cleanup. Use `this.events.once('shutdown', this.cleanup, this)` as a safety net.

**Warning signs:**
- Bugs appear only on the second playthrough, not the first
- Coin drops trigger multiple actions simultaneously
- Timer callbacks fire more frequently over time

**Phase to address:**
Core loop phase — establish the shutdown/cleanup pattern before any restart mechanic is implemented.

---

### Pitfall 6: Day/Night Cycle Tied to Real Time Instead of Delta Time

**What goes wrong:**
The day/night transition is implemented as a fixed-time interval (`setInterval`) or a frame counter, not delta-time-based. The cycle speed varies with framerate. On a fast machine, night arrives in 20 seconds. On a slow one, day lasts 5 minutes.

**Why it happens:**
`setInterval` is the obvious JavaScript timer. Frame counting is tempting because it's simple. Neither accounts for framerate variation.

**How to avoid:**
Track elapsed time using Phaser's `this.time.now` or accumulate `delta` passed into `update(scene, time, delta)`. Express day length in real milliseconds (e.g., 120,000ms = 2 minute day). Derive all cycle state — ambient color, spawn windows, NPC schedules — from the normalized `[0, 1]` time-of-day value.

**Warning signs:**
- Day length feels different in dev (60fps) vs. production (30fps)
- Zombie waves arrive inconsistently
- Fast machines make the game trivially easy

**Phase to address:**
Day/night cycle phase — use delta time from the first line of implementation.

---

### Pitfall 7: Coin Economy Immediately Solvable (No Tension)

**What goes wrong:**
The coin generation rate is tuned so players always have surplus coins. Defenses get built instantly, the base feels safe early, and there is no spending pressure. Nights become trivial because the player over-built on day 2. The game loop collapses — the tension of "should I build a wall or hire another citizen?" never exists.

**Why it happens:**
Developers err toward generosity to avoid frustrating players during early testing. Playtesters report "not having enough coins" as a bug rather than intended tension.

**How to avoid:**
Design coin flow around scarcity, not abundance. The generation rate should leave players consistently a few coins short of what they want. Apply Kingdom Two Crowns' lesson: gold as health (losing it hurts) is more motivating than gold as currency (spending it is neutral). Start with a strict budget and relax only if playtests show genuine frustration rather than satisfying tension.

**Warning signs:**
- Players build all available structures before day 3
- No decisions need to be made — build everything
- Zombies destroy defenses faster than the economy can recover

**Phase to address:**
Economy tuning phase — define coin generation and cost ratios with explicit tension targets before implementing upgrade tiers.

---

### Pitfall 8: Coin Drop Interaction Ambiguity

**What goes wrong:**
The coin-drop-to-trigger mechanic (walk to location, drop coins) becomes confusing when multiple triggers are spatially close. Players accidentally build a wall when trying to hire a citizen, or vice versa. The most common Kingdom Two Crowns complaint is players not understanding why a coin drop did (or didn't) do anything.

**Why it happens:**
The mechanic is elegant at a distance but requires precise spatial design. When build zones, citizen spawn zones, and upgrade zones overlap, input intent becomes ambiguous.

**How to avoid:**
Define clear, non-overlapping activation radii for each interactable. Implement visual feedback showing which trigger is "active" when the hero is nearby (a highlight, icon, or coin cursor change). Prioritize the closest trigger by distance when multiple are in range. Test spatial layouts before adding more interactables — add one type at a time.

**Warning signs:**
- Playtests require verbal explanation of which mechanic activates where
- Players drop coins repeatedly in frustration when nothing happens
- Build points and citizen points are within 64px of each other

**Phase to address:**
Core loop phase (coin drop mechanic) — build the priority/disambiguation system before adding more than two interactive points.

---

### Pitfall 9: RTS Codebase Assumptions Polluting the Scrolling Game

**What goes wrong:**
The existing codebase was built for a top-down RTS. Its `Unit` class, `Building` class, and `ResourceNode` likely assume a top-down coordinate system, direct player unit selection, and possibly grid-based movement. Reusing these directly causes mismatched behavior: units "select" when clicked even though there's no selection mechanic, physics bodies are sized for top-down collision, camera assumptions are wrong.

**Why it happens:**
Refactoring feels like wasted effort. Developers patch the old classes rather than redesigning for the new perspective and control scheme.

**How to avoid:**
Treat the existing classes as reference implementations, not reusable code. Extract the state machine pattern and event infrastructure if they are solid. Rewrite `Unit` as a side-scrolling `Character` with horizontal-only velocity semantics from the start. Build the coin interaction system fresh — it has no RTS analogue.

**Warning signs:**
- Adding a click/selection behavior that the design explicitly forbids
- Physics bodies are squares optimized for top-down, not rectangles for side-view
- `update()` logic checks for target positions that are never set in the new game

**Phase to address:**
First phase (codebase cleanup / scaffolding reset) — explicit decision of what to keep vs. rewrite before any new feature work.

---

### Pitfall 10: Zombie Waves All Spawning at the Same Point

**What goes wrong:**
All zombies spawn at a single map edge point. Players build one wall at that point, everything behind it is trivially safe, and the game is effectively solved. Wave difficulty increases feel like "more of the same" rather than strategic pressure.

**Why it happens:**
Single-edge spawning is the simplest implementation. The threat direction problem only becomes apparent during actual play.

**How to avoid:**
Implement bi-directional spawning (left and right edges) from the beginning, even in MVP. Stagger zombie spawn points along a vertical band at the edge, not a single pixel. Reserve specific spawn-point-variation mechanics (cliff gaps, underground routes) for later milestones. The key constraint: the player must be forced to defend in multiple directions.

**Warning signs:**
- Players build one wall and never interact with the other side of the map
- Night phase has no positional tension — it's just a timer to wait out
- Difficulty only increases by zombie count, not by attack direction variety

**Phase to address:**
Zombie wave phase — implement bi-directional spawning in the MVP wave, not as a later enhancement.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded wave configurations | Faster MVP | Can't tune balance without code changes | MVP only — move to data config before wave scaling |
| Single `update()` loop for all entities | Simple code | Drowns in per-entity overhead past ~20 entities | Never — architect groups with culling from the start |
| Individual sprite files (no atlas) | Easier to iterate on art | Draw calls scale with entity count, kills mobile perf | Prototype only — atlas before any performance testing |
| Inline magic numbers for coin costs | Faster to write | Balance tuning requires code changes, easy to miss one | Never — put all economy constants in a single config object |
| Anonymous arrow functions for event handlers | Less ceremony | Cannot be removed in shutdown, causes multiplying callbacks | Never — named functions always |
| Canvas renderer instead of WebGL | May be faster on low-end hardware | Misses batching benefits for sprite-heavy scenes | Only if profiling shows WebGL is slower on target hardware |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Physics on all bodies always enabled | FPS drops proportional to entity count | Disable physics bodies when off-screen; re-enable on camera enter | ~15+ simultaneous physics bodies with complex collision |
| Per-frame pathfinding recalculation | Hitching every few frames | Recalculate path only on state change or obstacle change, not every tick | 5+ NPCs simultaneously re-pathing |
| World-width TileSprite layers | Immediate VRAM spike, mobile crash | Viewport-size TileSprites with `tilePositionX` scroll offset | Any TileSprite over ~2000px wide |
| Texture atlas not used | Draw calls = entity count | Pack all sprites into a single atlas at build time | More than ~20 unique sprites in active scene |
| RTree spatial index with many bodies | Performance degrades at ~5000 bodies | Disable RTree (`useTree: false`) if body count is high and bodies are simple | ~5000 dynamic physics bodies |
| Collision between large groups without filtering | All-vs-all collision check | Use `collider` only between specific groups; never all-vs-all | Two groups totaling 50+ bodies each |
| Event emitter subscriptions accumulating across restarts | Callbacks fire N times after N restarts | Explicit shutdown cleanup for every listener | Second playthrough |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback for coin drop trigger | Players drop coins repeatedly, unsure if it worked | Show activation zone highlight when hero is in range; show coin-absorbed animation |
| Day/night transition too abrupt | Disorienting; players get caught outside unprepared | Gradual tint change over 10–15 seconds; ambient audio shift as warning |
| Wallet capacity not communicated | Coins spill and are lost silently | Visual indicator when purse is near capacity; coins physically bounce off if full |
| Zombie spawning with no warning | Players have no time to react or position | Brief audio/visual cue 3–5 seconds before wave starts; distant groaning |
| Camera follows hero with no lookahead | Hard to see what's ahead when moving | Offset camera slightly in the direction of movement (camera lead) |
| Parallax layers moving at same speed as foreground | No depth perception; disorienting when reversing direction | Strict parallax multipliers: background 0.1x, midground 0.4x, foreground 1.0x |

---

## "Looks Done But Isn't" Checklist

- [ ] **Day/Night Cycle:** Often missing delta-time accumulation — verify cycle duration is consistent at 30fps and 60fps
- [ ] **Coin Drop:** Often missing disambiguation when multiple triggers are nearby — verify with two adjacent interactables
- [ ] **Zombie Waves:** Often missing off-screen spawning — verify zombies spawn outside camera bounds, not at camera edge
- [ ] **NPC Autonomy:** Often missing idle-state throttling — verify CPU usage with 10 idle citizens on-screen vs. off-screen
- [ ] **Parallax Backgrounds:** Often sized to world width — verify TileSprite dimensions match canvas, not world
- [ ] **Scene Restart:** Often breaks on second play — verify all timers and listeners are clean after restart
- [ ] **Object Pooling:** Often added late — verify zombie group uses pool from first wave implementation, not `.destroy()`
- [ ] **Physics World Bounds:** Often left at default — verify zombie can walk from off-screen left edge to center of map

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Physics world bounds wrong | LOW | One-line fix, but requires re-testing all entity boundary behaviors |
| No object pooling, needs retrofit | HIGH | Requires refactoring every entity creation site; high risk of regression |
| TileSprite world-width (memory issue) | LOW | Replace with viewport-size TileSprite + tilePositionX scroll logic |
| Event listener accumulation | MEDIUM | Audit all `on()` calls, add shutdown cleanup, test restart N times |
| Economy unbalanced (too easy) | LOW | Tune constants in config; requires multiple playtests to feel right |
| RTS code contamination | HIGH | Requires architectural rewrite of entity hierarchy; do this early |
| No bi-directional spawning | MEDIUM | Add second spawn group; requires re-testing wave balance and base placement |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Physics world bounds not set | Phase 1: Core scaffolding | Scroll hero to map edge; NPC still pathfinds correctly |
| No object pooling | Phase 2: NPC/zombie entities | Profile wave 1 spawn in Chrome DevTools; no GC spike |
| All-entity per-frame updates | Phase 2: NPC behavior | CPU flat when 10 citizens are off-screen |
| TileSprite world-width | Phase 3: Parallax/visuals | Check TileSprite dimensions in scene create; must be ≤ canvas width |
| Scene listener cleanup | Phase 1: Core loop | Restart game 3 times; no double-trigger behavior |
| Delta-time day/night | Phase 1: Day/night cycle | Day length identical at 30fps and 60fps |
| Coin economy no tension | Phase 2: Economy tuning | Playtest: does player ever wish they had more coins? |
| Coin drop ambiguity | Phase 1: Coin mechanic | Two adjacent triggers; player can activate each independently |
| RTS code assumptions | Phase 0: Codebase reset | No selection mechanic exists; no grid-movement assumption in Unit |
| Single-edge zombie spawning | Phase 2: Wave system | Zombies arrive from both left and right on wave 1 |

---

## Sources

- Phaser 3 performance optimization (2025): https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b
- Phaser performance guide (object pooling, atlases): https://generalistprogrammer.com/tutorials/phaser-performance-optimization-guide
- Phaser arcade physics world: https://docs.phaser.io/phaser/concepts/physics/arcade
- Phaser scene/memory troubleshooting: https://www.mindfulchase.com/explore/troubleshooting-tips/game-development-tools/troubleshooting-phaser-performance-and-memory-issues-in-large-scale-games.html
- Parallax scrolling pitfalls: https://www.wayline.io/blog/parallax-scrolling-game-development-pitfalls
- Camera design for 2D side-scrollers: https://gamedesignskills.com/game-design/camera-design-2d-side-scroller-games/
- Kingdom Two Crowns coin mechanics (community analysis): https://steamcommunity.com/sharedfiles/filedetails/?id=1588497381
- Kingdom Two Crowns design intersection: https://www.gamedeveloper.com/design/-i-kingdom-two-crowns-i-and-the-practical-intersection-of-pixel-art-and-roguelike-design
- Survival game economy balance: https://gameanatomy.blog/2025/10/20/balancing-the-economy-in-games/
- NPC update performance (polling vs. event): https://www.gamedev.net/forums/topic/410534-npc-movement-and-script-implementation2d-game/
- Day/night cycle clock speed considerations: https://www.resetera.com/threads/dev-psa-day-night-cycle-in-your-game-please-consider-clock-speed-options.90481/

---
*Pitfalls research for: 2D side-scrolling survival strategy game (Dead City / Phaser 3)*
*Researched: 2026-04-16*
