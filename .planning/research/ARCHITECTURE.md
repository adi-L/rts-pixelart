# Architecture Research

**Domain:** 2D side-scrolling survival strategy game (Kingdom Two Crowns-style)
**Researched:** 2026-04-16
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PHASER SCENE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  GameScene   │  │   UIScene    │  │  BootScene   │               │
│  │ (main loop)  │  │ (HUD/coins)  │  │  (assets)    │               │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘               │
│         │ owns             │ reads                                    │
├─────────┴─────────────────┴──────────────────────────────────────────┤
│                         MANAGER LAYER                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  World   │ │  NPC /   │ │ Economy  │ │Day/Night │ │  Wave    │  │
│  │ Manager  │ │ Entity   │ │ Manager  │ │ Manager  │ │ Spawner  │  │
│  └────┬─────┘ │ Manager  │ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │       └────┬─────┘      │             │             │        │
│       │            │            │             │             │        │
├───────┴────────────┴────────────┴─────────────┴─────────────┴────────┤
│                        EVENT BUS (Phaser EventEmitter)                │
│  coin:dropped  npc:hired  structure:built  day:start  night:start    │
│  wave:spawned  hero:died  zombie:killed    vehicle:mounted            │
├───────────────────────────────────────────────────────────────────────┤
│                         ENTITY LAYER                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Hero   │ │ Citizens │ │ Builders │ │ Zombies  │ │Structures│  │
│  │(player)  │ │  (NPCs)  │ │  (NPCs)  │ │ (pooled) │ │(Wall/Twr)│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├───────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                                    │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐            │
│  │  GameState   │  │  WorldConfig  │  │  ObjectPools   │            │
│  │  (runtime)   │  │  (static map) │  │ (zombies/coins)│            │
│  └──────────────┘  └───────────────┘  └────────────────┘            │
└───────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communication |
|-----------|----------------|---------------|
| **GameScene** | Main update loop, physics, camera, input | Owns all managers; reads GameState |
| **UIScene** | Coin counter, day counter, HUD | Listens to EventBus; runs in parallel with GameScene |
| **WorldManager** | Camera bounds, parallax layers, world width, map zones | Tells Hero/camera where they are |
| **EntityManager** | Spawning, despawning, tracking all live entities | Emits entity lifecycle events |
| **Hero** | Player movement, coin carry/drop, weapon, vehicle mount | Emits `coin:dropped`, reads input |
| **Citizen** | Autonomous wander, coin generation over time | State machine; listens to `day:start`/`night:start` |
| **Builder** | Walks to build point, constructs structure over time | Listens to `coin:dropped` at build point |
| **Structure (Wall/Tower)** | Static defense; Tower attacks nearest zombie | Listens to proximity/overlap events |
| **EconomyManager** | Hero's coin purse, coin pickup radius, drop validation | Source of truth for coin count |
| **DayNightManager** | Authoritative game clock, phase transitions, visual tint | Emits `day:start`, `night:start`, `dawn:start` |
| **WaveSpawner** | Listens for `night:start`; escalates zombie count by day | Pulls from zombie ObjectPool; emits `wave:complete` |
| **ObjectPool** | Pre-allocated zombie sprites, coin pickups | Used by WaveSpawner and EconomyManager |
| **GameState** | Serialisable runtime snapshot (coins, day, structures, hero HP) | Read/write by all managers; no direct coupling |

## Recommended Project Structure

```
src/
├── scenes/
│   ├── Boot.ts             # asset loading
│   ├── Preloader.ts        # progress bar
│   ├── MainMenu.ts         # title screen
│   ├── Game.ts             # primary game scene
│   ├── UI.ts               # HUD overlay (parallel scene)
│   └── GameOver.ts         # death / lose state
│
├── systems/                # stateless managers (no Phaser.Scene extends)
│   ├── DayNightManager.ts  # clock, phase, visual tint
│   ├── WaveSpawner.ts      # zombie waves, escalation table
│   ├── EconomyManager.ts   # coin purse, drop/pickup logic
│   ├── BuildManager.ts     # build point registry, builder dispatch
│   └── WorldManager.ts     # camera bounds, parallax, zones
│
├── entities/               # Phaser.GameObjects wrappers with state machines
│   ├── Hero.ts             # player character
│   ├── Citizen.ts          # autonomous wanderer / coin generator
│   ├── Builder.ts          # autonomous constructor NPC
│   ├── Zombie.ts           # enemy (poolable)
│   ├── structures/
│   │   ├── Wall.ts         # static barrier
│   │   └── Tower.ts        # auto-attacking defense
│   └── Vehicle.ts          # bike/car with fuel mechanic
│
├── pools/
│   ├── ZombiePool.ts       # Phaser.Group-based object pool
│   └── CoinPool.ts         # pooled coin pickup sprites
│
├── world/
│   ├── WorldConfig.ts      # static map layout (zones, build points, spawners)
│   └── ParallaxLayer.ts    # scrolling background layer helper
│
├── state/
│   └── GameState.ts        # serialisable runtime state (coins, day, structures)
│
├── events/
│   └── EventBus.ts         # singleton Phaser.Events.EventEmitter
│
└── main.ts                 # Phaser.Game config
```

### Structure Rationale

- **systems/:** Managers own logic but not sprites — they are plain classes that receive the scene reference. Keeps testable logic separate from Phaser lifecycle.
- **entities/:** Each entity is a self-contained class with a state machine and its own `update()` method — mirrors how the existing `Unit` class works, but adapted for side-scrolling.
- **pools/:** Isolated so the WaveSpawner never calls `new Zombie()` — it always gets from the pool. Prevents GC spikes during wave peaks.
- **events/:** One shared EventBus prevents manager-to-manager direct imports and circular dependencies.
- **state/:** GameState is the only object that gets serialised for save/load or death-reset. Keeping it isolated makes partial loss-on-death straightforward.

## Architectural Patterns

### Pattern 1: Event Bus for Cross-System Communication

**What:** A singleton `Phaser.Events.EventEmitter` that any system can emit to or subscribe from without holding a reference to the emitting system.

**When to use:** Anytime two systems need to react to each other's state changes — e.g., DayNightManager does not need to know WaveSpawner exists; it emits `night:start` and WaveSpawner listens.

**Trade-offs:** Easy decoupling; harder to trace flow when debugging. Mitigate by namespacing events and logging in dev builds.

**Example:**
```typescript
// events/EventBus.ts
import Phaser from 'phaser'
export const EventBus = new Phaser.Events.EventEmitter()

// DayNightManager.ts — emitter
EventBus.emit('night:start', { day: this.dayCount })

// WaveSpawner.ts — listener
EventBus.on('night:start', ({ day }) => this.beginWave(day))

// Hero.ts — emitter
EventBus.emit('coin:dropped', { x: this.sprite.x, amount: this.holding })
```

### Pattern 2: State Machine per Entity

**What:** Each NPC and enemy holds an explicit `state` enum and a `update()` method that switches on it. Transitions happen by setting `this.state = NewState`. This is already proven in the existing `Unit` class.

**When to use:** Any entity with more than 2 behaviours — Citizens (wander/flee/shelter), Builders (idle/walk-to-site/build), Zombies (wander/chase/attack).

**Trade-offs:** Simple and debuggable; can grow unwieldy past 8–10 states. For NPCs in this game, state count stays low enough for FSMs to remain clean.

**Example:**
```typescript
enum CitizenState { WANDERING, FLEEING, SHELTERING, GENERATING_COINS }

update(dt: number) {
  switch (this.state) {
    case CitizenState.WANDERING:
      this.wander(dt)
      if (this.nearbyZombie()) this.state = CitizenState.FLEEING
      break
    case CitizenState.FLEEING:
      this.moveTowardBase(dt)
      if (this.safeDistance()) this.state = CitizenState.WANDERING
      break
  }
}
```

### Pattern 3: Object Pool for Enemies and Coins

**What:** Pre-allocate a fixed group of zombie sprites at scene start. WaveSpawner calls `pool.get()` to revive a dormant sprite; on zombie death, `pool.release()` deactivates it instead of destroying it.

**When to use:** Any entity spawned/destroyed frequently — zombies, coin pickups, projectiles. Critical for wave peaks where 20–50 zombies may appear at once.

**Trade-offs:** Slightly more setup; massive GC benefit. Phaser's `Group` has built-in `getFirstDead()`/`setActive()` support.

**Example:**
```typescript
// pools/ZombiePool.ts
this.group = scene.physics.add.group({
  classType: Zombie,
  maxSize: 60,
  runChildUpdate: false  // manual update for performance
})

get(x: number, y: number): Zombie | null {
  const z = this.group.getFirstDead(false) as Zombie | null
  if (z) { z.revive(x, y) }
  return z
}

release(z: Zombie) {
  z.setActive(false).setVisible(false)
  z.body?.reset(0, 0)
}
```

### Pattern 4: Parallel HUD Scene

**What:** Run a separate `UIScene` in parallel with `GameScene` using Phaser's scene manager. The HUD never shares the same camera or depth stack as game world objects.

**When to use:** Anytime UI elements must stay fixed on screen while the world scrolls. Avoids the `setScrollFactor(0)` hack on every UI sprite.

**Trade-offs:** Slightly more complex scene wiring; HUD is cleanly isolated. UIScene communicates read-only via EventBus subscriptions.

## Data Flow

### Coin Drop Flow (core mechanic)

```
[Player presses DROP key]
    ↓
Hero.dropCoin()
    ↓ reads
EconomyManager.spend(amount)  →  GameState.coins -= amount
    ↓ emits
EventBus.emit('coin:dropped', { x, amount })
    ↓ listeners
BuildManager  →  checks if drop is near a build point
                    YES → find idle Builder NPC → assign(buildPoint)
                    NO  → spawn coin pickup sprite (from CoinPool)
CitizenManager → converts nearby peasant to citizen (if enough coins)
UIScene        → updates coin counter display
```

### Night Cycle / Wave Flow

```
DayNightManager.update(dt)
    ↓ when threshold crossed
EventBus.emit('night:start', { day })
    ↓
WaveSpawner.beginWave(day)
    ↓ computes
zombieCount = baseCount + (day * escalation)
    ↓ at intervals
ZombiePool.get(spawnEdge.x, spawnEdge.y) → Zombie.revive()
    ↓ per frame
Zombie.update() → approach nearest Structure or Hero
    ↓ on collision
Structure.takeDamage() or Hero.takeDamage()
    ↓ on Zombie HP = 0
EventBus.emit('zombie:killed') → EconomyManager.addCoins(reward)
ZombiePool.release(zombie)
    ↓ when wave depleted
EventBus.emit('wave:complete') → DayNightManager.startDay()
```

### NPC Job Assignment Flow (Kingdom Two Crowns pattern)

```
GameState.citizenCount  (idle citizens available)
    ↓ read by
BuildManager.assignBuilders()
    ↓ on coin:dropped near build point
  find nearest idle Citizen
  promote to Builder role
  Builder.assignTask(buildPoint)
    ↓ Builder FSM
  WALK_TO_SITE → BUILD (timer) → IDLE
    ↓ on BUILD complete
  EventBus.emit('structure:built', { type, x })
  Builder → demoted back to Citizen
```

### Hero Movement / Camera Flow

```
InputManager (Phaser cursor keys)
    ↓
Hero.update()  →  hero.body.setVelocityX(±speed)
    ↓
WorldManager.clampHero()  →  enforce world bounds
    ↓
Phaser camera.followTarget(hero.sprite)
    ↓
ParallaxLayer.update(cameraX)  →  each layer scrolls at its own factor
```

## Component Interaction Matrix

| System | Reads From | Writes To | Listens | Emits |
|--------|-----------|-----------|---------|-------|
| DayNightManager | GameState.dayCount | GameState.phase | — | `day:start`, `night:start`, `dawn:start` |
| WaveSpawner | GameState.dayCount | ZombiePool | `night:start` | `wave:complete` |
| EconomyManager | GameState.coins | GameState.coins | `zombie:killed`, `coin:collected` | `coins:changed` |
| BuildManager | WorldConfig.buildPoints, GameState.citizens | GameState.structures | `coin:dropped` | `structure:built` |
| Hero | InputManager | GameState.heroHP | — | `coin:dropped`, `hero:died` |
| Citizen NPC | GameState.phase | own state | `night:start`, `day:start` | — |
| Tower | EntityManager.zombieList | — | — | `zombie:killed` |
| UIScene | — | — | `coins:changed`, `day:start`, `wave:complete` | — |

## Suggested Build Order (Dependencies)

The systems have hard dependencies — some cannot be built before others exist.

```
PHASE 1 — Foundation (no gameplay yet)
  WorldManager        (parallax, camera bounds, scroll)
  GameState           (coins, day, phase — plain data object)
  EventBus            (zero-dependency singleton)

PHASE 2 — Hero Loop (core feel)
  Hero                (depends on: WorldManager, EventBus)
  EconomyManager      (depends on: GameState, EventBus)
    → Proves: hero moves, picks up coins, drops coins

PHASE 3 — Citizen Economy (social simulation)
  Citizen NPC         (depends on: EventBus, GameState)
  BuildManager        (depends on: EventBus, GameState, WorldConfig)
  Builder NPC         (depends on: BuildManager)
  Structure (Wall)    (depends on: BuildManager)
    → Proves: coin drop → builder appears → wall built

PHASE 4 — Day/Night + Defense (core threat)
  DayNightManager     (depends on: GameState, EventBus)
  ZombiePool          (depends on: EntityManager)
  WaveSpawner         (depends on: ZombiePool, DayNightManager, EventBus)
  Tower Structure     (depends on: Structure base, EntityManager)
    → Proves: night falls → zombies arrive → towers defend

PHASE 5 — Polish Systems
  UIScene (HUD)       (depends on: EventBus only)
  Vehicle             (depends on: Hero, WorldManager)
  Weapon pickup       (depends on: Hero, EntityManager)
  Death/reset         (depends on: GameState serialisation)
```

## Anti-Patterns

### Anti-Pattern 1: Scene as God Object

**What people do:** Put all game logic directly in `Game.ts` as class properties — units[], mainBase, resources[], all update logic inline in `update()`. The existing codebase already shows this tendency.

**Why it's wrong:** `Game.ts` becomes 800+ lines. Adding a wave spawner means editing the scene. Systems can't be tested or reasoned about in isolation. Phaser's `this` context makes it worse — everything bleeds together.

**Do this instead:** Game scene owns manager instances only. Each manager has its own file and is passed a scene reference in its constructor. The scene `update()` delegates: `this.dayNight.update(dt)`, `this.waveSpawner.update(dt)`.

### Anti-Pattern 2: Direct Manager-to-Manager References

**What people do:** `WaveSpawner` holds a reference to `EconomyManager` to add coins on zombie kill. `BuildManager` holds a reference to `DayNightManager` to pause building at night.

**Why it's wrong:** Creates a web of circular imports. Adding a new system that interacts with two others requires threading references through constructors. Changes cascade.

**Do this instead:** Systems communicate through the EventBus only. `Zombie` emits `zombie:killed`; `EconomyManager` listens and adds coins. Neither knows the other exists.

### Anti-Pattern 3: New Enemy Per Wave

**What people do:** `new Zombie()` on every spawn during wave events. At wave 10 with 40 zombies, this generates 40 object allocations and eventually 40 destructions — causing visible GC stutters in the browser.

**Do this instead:** Pre-allocate a `ZombiePool` with max expected count (60 is safe). Reuse instances. Use `setActive(false)` + `setVisible(false)` for "death" and `revive()` for "spawn".

### Anti-Pattern 4: setScrollFactor(0) on HUD Elements

**What people do:** Add coin counter and day counter as sprites/text in the game scene, then call `setScrollFactor(0)` so they don't move with the camera.

**Why it's wrong:** HUD elements share depth sorting with world sprites. Easy to accidentally put a zombie on top of the coin counter. Harder to update the HUD independently.

**Do this instead:** Use a parallel `UIScene` that runs on top of `GameScene`. UIScene has its own camera that never moves. Zero scroll factor hacks needed.

### Anti-Pattern 5: Hardcoded NPC Counts

**What people do:** `for (let i = 0; i < 5; i++) { new Citizen(...) }` in the scene constructor, as the existing codebase does.

**Why it's wrong:** NPCs cannot be dynamically added/removed as citizens are hired, die, or flee. Scaling population with day count is impossible.

**Do this instead:** EntityManager owns a dynamic array. Citizens are spawned into it via `entityManager.spawnCitizen(x)` and removed via `entityManager.despawn(id)`. The scene constructor spawns exactly 0 — the GameState drives initial population.

## Scaling Considerations

This is a single-player browser game. "Scaling" means CPU/frame budget, not infrastructure.

| Concern | At 20 entities | At 80 entities (wave peak) | At 200 entities |
|---------|---------------|---------------------------|-----------------|
| Physics | Fine — Arcade physics is cheap | Fine with `runChildUpdate: false` on pools | Enable/disable bodies by viewport distance |
| Rendering | Fine | Use texture atlases (1 draw call per atlas) | Sprite culling for off-screen entities |
| NPC AI | Fine | Run state machine every 3rd frame for offscreen NPCs | Spatial grid for proximity queries |
| Parallax | Fine | Fine — few layers, simple math | Fine — it's just multiplication |

Most sessions will peak around 40–60 zombies and 10–20 NPCs. The game should run at 60 FPS in a modern browser without needing complex optimisation beyond object pooling and atlas packing.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| GameScene ↔ UIScene | EventBus | UIScene never imports GameScene directly |
| DayNightManager ↔ WaveSpawner | EventBus (`night:start`) | Spawner is fully passive until event fires |
| Hero ↔ EconomyManager | EventBus (`coin:dropped`, `coin:collected`) | Economy does not know Hero's position |
| BuildManager ↔ CitizenNPCs | Direct method call | BuildManager holds reference to EntityManager to find idle citizens |
| Tower ↔ ZombiePool | Phaser overlap callback | Tower finds targets via physics group overlap, not direct reference |
| WaveSpawner ↔ ZombiePool | Direct method call | Spawner owns pool reference — acceptable tight coupling |

### Existing Code Reuse

The existing `Unit` class is reusable as a **base class** for `Hero`, `Citizen`, and `Builder`. Keep:
- State machine enum pattern
- `update()` switch pattern
- `findNearest()` utility pattern
- `updateFlip()` (sprite direction)

Remove or replace:
- `mainBase` reference (replace with EventBus)
- `isHarvester` boolean (replace with subclass type)
- `selectionCircle` (side-scroller has no click-selection)
- `shoot(scene)` stub (move to Weapon system)

The existing `Building` class is reusable as a base for `Wall` and `Tower`. Keep the constructor/create pattern; add HP, upgrade tier, and damage-taking.

## Sources

- Kingdom: Two Crowns developer interview — job assignment algorithm, citizen simulation ([80.lv](https://80.lv/articles/kingdom-how-2-guys-created-a-side-scrolling-strategy))
- Tower Defence Architecture practical guide ([Medium / Cubix](https://softwarefaster.medium.com/demystifying-tower-defence-game-architecture-a-practical-guide-65d10e48de4a))
- NPC AI state machine architecture for survival games ([Medium — Artem Melnyk](https://melnykkk.medium.com/npc-survival-simulator-complete-technical-documentation-090899dd9b5e))
- Phaser 3 Event system documentation ([docs.phaser.io](https://docs.phaser.io/phaser/concepts/events))
- Phaser 3 Object pooling patterns ([ourcade blog](https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-class/))
- Phaser 3 performance optimisation guide ([generalistprogrammer.com](https://generalistprogrammer.com/tutorials/phaser-performance-optimization-guide))
- Phaser ECS plugin Phatty ([phaser.io/news/2025/04/phatty](https://phaser.io/news/2025/04/phatty)) — considered, not recommended for this scope

---
*Architecture research for: Dead City (2D side-scrolling survival strategy)*
*Researched: 2026-04-16*
