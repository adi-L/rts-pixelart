# Architecture Research

**Domain:** 2D Real-Time Strategy Game (Phaser 3 / TypeScript / Browser)
**Researched:** 2026-04-16
**Confidence:** HIGH (core patterns), MEDIUM (Phaser-specific implementation details)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INPUT LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ SelectionMgr │  │ CommandHandler│  │  CameraCtrl  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘              │
│         │                 │                                          │
├─────────┴─────────────────┴──────────────────────────────────────── ┤
│                         GAME SYSTEMS LAYER          EventBus         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Unit    │ │ Combat   │ │  Build   │ │ Economy  │ │   AI     │  │
│  │ Manager  │ │ System   │ │ System   │ │ System   │ │ Director │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │            │            │            │            │          │
├───────┴────────────┴────────────┴────────────┴────────────┴──────── ┤
│                      WORLD / SIMULATION LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ TileMap  │ │ FogOfWar │ │Pathfinder│ │ Physics  │               │
│  │ System   │ │  System  │ │ (A*)     │ │ (Arcade) │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  Unit    │ │ Weapon   │ │  Map     │ │ Game     │               │
│  │ Registry │ │ Registry │ │  Data    │ │  State   │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **SelectionManager** | Drag-box selection, unit groups, multi-select | UnitManager, CommandHandler |
| **CommandHandler** | Translates player input (clicks, hotkeys) to commands | UnitManager, BuildSystem, EventBus |
| **CameraController** | Pan, zoom, edge-scroll, follow-camera | Phaser Camera |
| **UnitManager** | Spawning, despawning, unit registry, group queries | All systems via EventBus |
| **CombatSystem** | Attack resolution, range checks, damage, death | UnitManager, EconomySystem (loot), WeaponRegistry |
| **BuildSystem** | Placement validation, construction queue, territory | TileMap, EconomySystem |
| **EconomySystem** | Resource balances, income/cost transactions, alerts | EventBus (broadcasts resource events) |
| **AIDirector** | Macro AI strategy: build order, attack timing, scouting | All systems (reads state, issues commands) |
| **UnitAI** | Per-unit FSM: idle, move, attack, flee, harvest | CombatSystem, Pathfinder |
| **TileMapSystem** | Tile data, passability, terrain queries, vision blockers | FogOfWar, Pathfinder |
| **FogOfWarSystem** | Visibility grid, sight radius per unit, reveal/hide | TileMap, UnitManager, Renderer |
| **Pathfinder** | A* on tile grid, caches paths, handles groups | TileMap, UnitManager |
| **WeaponRegistry** | Data store: all weapon definitions | CombatSystem, UnitAI |
| **UnitRegistry** | Data store: all unit type definitions (the ~50 per faction) | UnitManager, BuildSystem |

---

## Recommended Project Structure

```
src/
├── data/                   # Pure data — no Phaser imports allowed here
│   ├── units/
│   │   ├── coalition/      # One file per unit type: soldier.ts, tank.ts ...
│   │   ├── veil/
│   │   └── index.ts        # Re-exports typed UnitDef registry
│   ├── weapons/            # Weapon definitions
│   ├── buildings/          # Building definitions
│   └── maps/               # Tiled JSON maps, embedded as data
│
├── engine/                 # Framework-agnostic game logic
│   ├── units/
│   │   ├── Unit.ts         # Entity class (sprite wrapper + FSM)
│   │   ├── UnitManager.ts  # Spawn/despawn, group queries
│   │   └── UnitAI.ts       # Per-unit AI state machine
│   ├── combat/
│   │   ├── CombatSystem.ts # Attack resolution, range checks
│   │   └── WeaponSystem.ts # Weapon pickup, swap, upgrade
│   ├── economy/
│   │   └── EconomySystem.ts
│   ├── building/
│   │   ├── BuildSystem.ts  # Placement, construction queue
│   │   └── ProductionQueue.ts
│   ├── map/
│   │   ├── TileMapSystem.ts
│   │   └── FogOfWar.ts
│   ├── pathfinding/
│   │   └── Pathfinder.ts   # A* on tile grid
│   ├── ai/
│   │   └── AIDirector.ts   # Strategic AI (per-player instance)
│   └── events/
│       └── EventBus.ts     # Central typed event emitter
│
├── input/
│   ├── SelectionManager.ts
│   ├── CommandHandler.ts
│   └── CameraController.ts
│
├── scenes/
│   ├── Boot.ts
│   ├── Preloader.ts
│   ├── MainMenu.ts
│   ├── Game.ts             # Orchestrates all systems
│   ├── GameOver.ts
│   └── HUD.ts              # Separate Phaser scene layered on top
│
├── ui/                     # HUD components (resource bar, minimap, unit panel)
│   ├── ResourceBar.ts
│   ├── Minimap.ts
│   └── UnitPanel.ts
│
└── main.ts
```

### Structure Rationale

- **data/:** Pure typed objects only. No Phaser imports. This means unit definitions can be unit-tested, parsed server-side for multiplayer, or serialized without pulling in the full game engine.
- **engine/:** Game logic classes that depend on Phaser but not on any specific scene. Systems are instantiated by the Game scene and can be tested in isolation.
- **input/:** Decoupled from systems — translates raw Phaser input events into semantic game commands, then fires them onto EventBus.
- **scenes/HUD.ts:** A separate Phaser scene running on top of Game scene. This prevents UI updates from touching the game world's display list and makes the HUD trivially pauseable/replaceable.

---

## Architectural Patterns

### Pattern 1: Data-Driven Unit Registry

**What:** All unit types are plain TypeScript objects conforming to a `UnitDef` interface. The `UnitManager` reads from this registry at spawn time. No code change is needed to add a unit.

**When to use:** Always — required to hit the ~50 types per faction target.

**Trade-offs:** Schema must be designed carefully upfront; adding new capabilities (e.g., a new weapon slot) requires updating `UnitDef` and all consumers.

**Example:**
```typescript
// data/units/coalition/rifleman.ts
import { UnitDef } from '../../types';

export const rifleman: UnitDef = {
  id: 'coalition.rifleman',
  faction: 'coalition',
  role: 'infantry',
  displayName: 'Rifleman',
  spriteKey: 'coalition_rifleman',    // resolved from asset manifest
  stats: { hp: 80, speed: 90, sightRange: 150, armor: 5 },
  weapon: 'weapons.assault_rifle',    // reference by ID, not object
  cost: { common: 50, rare: 0 },
  productionTime: 8,                  // seconds
};
```

### Pattern 2: Composable Unit State Machine (FSM)

**What:** Each unit has a hierarchical FSM. Top-level states are coarse behaviors (IDLE, MOVING, ATTACKING, HARVESTING, DEAD). Each state delegates to sub-FSMs for fine-grained logic (e.g., MOVING internally handles pathfinding, obstacle replanning, arrival detection).

**When to use:** All units. Scales to 50+ unit types because behavior is composed from shared sub-states, not copy-pasted per type.

**Trade-offs:** Nested FSMs add indirection; for simple units an inline switch is fine at first, but transition to composable FSMs before adding the 10th unit type.

**Example:**
```typescript
// engine/units/UnitAI.ts
type TopState = 'idle' | 'moving' | 'attacking' | 'harvesting' | 'dead';

class UnitAI {
  private state: TopState = 'idle';

  transition(next: TopState) { this.state = next; }

  update(dt: number, context: UnitContext) {
    switch (this.state) {
      case 'idle':    this.tickIdle(context); break;
      case 'moving':  this.tickMoving(dt, context); break;
      case 'attacking': this.tickAttacking(dt, context); break;
    }
  }
}
```

### Pattern 3: EventBus for Cross-System Communication

**What:** A typed central event emitter. Systems publish events; other systems subscribe. No direct dependencies between sibling systems.

**When to use:** Whenever two systems need to react to each other but neither should own the other. Examples: unit death (CombatSystem publishes `unit:died`; EconomySystem listens to drop loot; FogOfWar listens to remove sight contribution; UnitManager listens to remove entity).

**Trade-offs:** Event order can be surprising; debugging requires tracing event chains. Worth it — the alternative (direct references between all systems) becomes unmanageable.

**Example:**
```typescript
// engine/events/EventBus.ts
type GameEvents = {
  'unit:died':    { unit: Unit; killedBy: Unit | null };
  'unit:spawned': { unit: Unit };
  'resource:changed': { player: number; type: 'common' | 'rare'; delta: number };
  'building:placed': { building: Building; player: number };
  'fog:revealed': { tiles: number[] };
};

class EventBus extends Phaser.Events.EventEmitter {
  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): boolean {
    return super.emit(event, data);
  }
  on<K extends keyof GameEvents>(event: K, fn: (data: GameEvents[K]) => void) {
    return super.on(event, fn);
  }
}
```

### Pattern 4: Fog of War via Reference-Counted Grid

**What:** The map is divided into a coarse grid (e.g., 8×8 px cells). Each cell stores a reference count of how many friendly units currently see it. Count > 0 = visible; count == 0 but previously seen = shroud (semi-dark); never seen = black.

**When to use:** This is the standard approach for tile-based RTS. Works in Phaser using a `RenderTexture` or a dedicated tilemap layer with alpha-per-tile.

**Trade-offs:** Cell size is a performance knob — smaller cells = more accurate FOW but more cells to process each frame. 8–16px cells are standard.

**Implementation approach in Phaser 3:**
```typescript
// engine/map/FogOfWar.ts
class FogOfWar {
  private grid: Int16Array;   // reference counts
  private seen: Uint8Array;   // ever-visible bitmask
  private fogTexture: Phaser.GameObjects.RenderTexture;

  update(units: Unit[]) {
    // 1. Decrement all cells that were visible last frame
    // 2. For each unit, flood-fill cells within sightRange, increment
    // 3. Redraw fogTexture only for changed cells (dirty-flag optimization)
  }
}
```

---

## Data Flow

### Player Issues a Move Command

```
MouseClick (right-click on map)
    ↓
CommandHandler.onRightClick(worldX, worldY)
    ↓ (reads SelectionManager.selected)
CommandHandler → emits EventBus 'command:move' { units, target }
    ↓
UnitManager.onMoveCommand({ units, target })
    ↓ (for each unit)
Pathfinder.findPath(unit.tile, targetTile) → path[]
    ↓
UnitAI.transition('moving', path)
    ↓ (each frame)
UnitAI.tickMoving() → moves sprite via Phaser physics
```

### Unit Dies in Combat

```
CombatSystem.tickAttack(attacker, target)
    → target.hp -= damage
    → if target.hp <= 0:
        EventBus.emit('unit:died', { unit: target, killedBy: attacker })
            ↓ listeners:
            UnitManager     → remove from active list, play death anim
            FogOfWar        → remove sight contribution
            CombatSystem    → drop weapon loot (weapon pickup mechanic)
            EconomySystem   → award kill bounty to attacker's player
            AIDirector      → update threat assessment
```

### Resource Gather Cycle

```
UnitAI (state: HARVESTING)
    → resource.harvest(amount)
    → EconomySystem.add(player, 'common', amount)
        → EventBus.emit('resource:changed', ...)
            ↓
            HUD.ResourceBar.update()
            AIDirector (checks if thresholds met for next build)
```

### Building Placement

```
Player selects structure from build menu
    ↓
BuildSystem.startPlacement(buildingDef)
    ↓ (hover)
BuildSystem.validatePlacement(tile) → checks TileMap passability + territory
    ↓ (confirm click)
BuildSystem.place(tile)
    → EconomySystem.spend(cost)
    → TileMap.markOccupied(tile)
    → EventBus.emit('building:placed', ...)
        ↓
        AIDirector registers new structure
        FogOfWar registers sight contribution (if tower)
```

---

## Suggested Build Order (Phase Dependencies)

This order respects hard dependencies and de-risks the core game loop early.

```
1. DATA LAYER
   └── UnitDef / WeaponDef / BuildingDef interfaces + ~5 sample units
       (No Phaser dependency — can be done first, validates the schema)

2. TILEMAP SYSTEM
   └── Load Tiled JSON map, tile passability, world→tile coordinate conversion
       (Everything else — pathfinding, FOW, building placement — needs this)

3. PATHFINDER (A*)
   └── A* on tile grid, path cache
       (Required by UnitAI.MOVING before any unit can move meaningfully)

4. UNIT MANAGER + UNIT AI (basic FSM: idle / move / dead)
   └── Spawn units from UnitDef, drive FSM, use Pathfinder
       (Core game object; combat and economy bolt on top)

5. EVENTBUS
   └── Central typed emitter
       (Introduce when systems start needing to talk — at step 4/5 junction)

6. COMBAT SYSTEM + WEAPON SYSTEM
   └── Attack resolution, damage, death events, weapon drop/pickup
       (The signature mechanic — must be solid before AI)

7. ECONOMY SYSTEM
   └── Resource balances, transactions, harvester FSM states
       (Required before BuildSystem — you need a spend() call)

8. BUILD SYSTEM + PRODUCTION QUEUE
   └── Placement, construction time, unit production from buildings
       (Needs EconomySystem for costs and TileMap for placement validation)

9. SELECTION MANAGER + COMMAND HANDLER
   └── Drag-box selection, right-click move/attack commands
       (Polish step — units can be tested with hardcoded commands first)

10. FOG OF WAR
    └── Reference-counted grid, RenderTexture overlay
        (Deferred — doesn't block any other system; add once map is stable)

11. UNIT AI (full: attack-move, patrol, flee, guard)
    └── Layered on top of basic FSM from step 4
        (Needs Combat, Pathfinder, and FogOfWar to be meaningful)

12. AI DIRECTOR (strategic AI)
    └── Reads game state; issues commands via same CommandHandler pipeline
        (Last — needs all systems to exist before it can play the game)

13. HUD / UI
    └── ResourceBar, Minimap, UnitPanel as separate Phaser scene
        (Can be done in parallel from step 7 onward, but non-blocking)
```

---

## Anti-Patterns

### Anti-Pattern 1: God Scene

**What people do:** Put all game logic (combat, pathfinding, economy, AI) as methods directly in the Phaser `Game` scene class.

**Why it's wrong:** The Game scene becomes 3,000+ lines within a few phases. Systems cannot be tested independently. Adding multiplayer becomes a full rewrite because all state is entangled with Phaser rendering.

**Do this instead:** The Game scene is an orchestrator only — it instantiates systems, wires up EventBus subscriptions, and calls `system.update(delta)` in its own `update()`. All logic lives in engine/ classes.

### Anti-Pattern 2: Hardcoded Unit Types

**What people do:** Create `Rifleman.ts`, `Tank.ts`, `Veil_Spawner.ts` as separate classes with duplicated stats and behavior.

**Why it's wrong:** Adding the 10th unit type requires a new class. Adding a new stat (e.g., `shieldHP`) means editing every class. Impossible to reach ~50 unit types without massive duplication.

**Do this instead:** One `Unit` class + one `UnitDef` data record per type. Behavior variations are flags and capability sets on the definition, not subclasses.

### Anti-Pattern 3: Polling for Visibility

**What people do:** Every frame, every unit checks every other unit to determine visibility.

**Why it's wrong:** O(n²) per frame. At 100 units per side this is 10,000 comparisons × 60fps = 600,000 checks/second. Will tank performance.

**Do this instead:** FogOfWar reference-count grid. Units only update their grid contribution when they move (lazy update). Visibility queries become O(1) cell lookups.

### Anti-Pattern 4: Synchronous A* Blocking Main Thread

**What people do:** Run A* pathfinding synchronously inside `update()` for every unit every frame.

**Why it's wrong:** A* on a large tilemap is expensive. Running it for 50+ units in the same frame causes frame drops. JavaScript is single-threaded.

**Do this instead:** Stagger pathfinding requests across frames (time-slice budget, e.g., 2ms per frame). Cache paths and only replan when terrain changes or the path is blocked. Consider a Web Worker for the pathfinder once unit counts grow.

### Anti-Pattern 5: Direct System-to-System References

**What people do:** `combatSystem.economySystem.addResources(...)` — systems hold references to each other.

**Why it's wrong:** Creates a tightly coupled dependency graph. Adding multiplayer (where economy may be authoritative server-side) requires rewriting every cross-system call.

**Do this instead:** EventBus for all cross-system communication. Systems only know about EventBus and their own domain data.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| CommandHandler → Systems | EventBus commands | Input never calls systems directly |
| CombatSystem ↔ UnitManager | EventBus events | `unit:died`, `unit:spawned` |
| UnitAI ↔ Pathfinder | Direct method call | Pathfinder is a utility, not a peer system |
| FogOfWar ↔ Renderer | RenderTexture API | FOW writes to a Phaser RenderTexture; renderer doesn't know about FOW logic |
| AIDirector → Game Systems | Same CommandHandler pipeline | AI issues commands exactly like a player; no special backdoor |
| Game Scene ↔ HUD Scene | Phaser EventEmitter or shared GameState ref | HUD scene reads from a GameState object or listens to EventBus |

### Future: Multiplayer Boundary

When multiplayer is added, the EventBus command events become the network payload. Commands are:
1. Validated client-side
2. Sent to server
3. Server re-emits authoritative version
4. All clients process the server event

This works cleanly only if all state changes happen through EventBus events, not through direct system calls. The architecture above enforces this.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single-player skirmish (current target) | All systems in main thread; A* synchronous is fine for small maps; no sharding needed |
| Large maps (256×256+ tiles) | Hierarchical pathfinding (HPA*): plan at chunk level, refine locally; FOW cell size increase |
| Many units (200+ per side) | Move pathfinder to Web Worker; spatial hash for unit queries instead of linear scan; throttle AI update rate |
| Multiplayer (future) | Lockstep simulation or server-authoritative; commands become network messages; deterministic random required |

### Scaling Priorities

1. **First bottleneck:** Pathfinding. A* for 50+ units requesting paths simultaneously will stutter. Fix: path request queue with per-frame budget (2ms), path sharing for units moving to same destination.
2. **Second bottleneck:** FogOfWar redraw. Repainting the entire RenderTexture every frame is expensive. Fix: dirty-cell tracking, only repaint changed regions.
3. **Third bottleneck:** Unit draw calls. At 200+ units, individual sprites stress WebGL batching. Fix: Phaser's `blendMode` batching is automatic, but ensuring same texture atlas per faction is critical.

---

## Sources

- Composable State Machines for RTS Unit Behavior: https://medium.com/@galiullinnikolai/composable-state-machines-building-scalable-unit-behavior-in-rts-games-7b3b56cb4906
- RTS Fog of War reference-count grid architecture: https://www.jdxdev.com/blog/2022/06/08/rts-fog-of-war/
- Scalable RTS game architecture (unidirectional command flow): https://medium.com/@crimson.wheeler/scalable-architecture-for-your-games-with-an-rts-walkthrough-part-1-56b123626a4a
- HowToRTS.github.io — build order: pathfinding → steering → flow fields → AI: https://howtorts.github.io/
- Resource Entity Action design pattern (REA): https://liacs.leidenuniv.nl/~plaata1/papers/abbadi-resources_entities_actions_a_generalized_design_pattern-118.pdf
- Group pathfinding & movement in RTS: https://www.gamedeveloper.com/programming/group-pathfinding-movement-in-rts-style-games
- RTS AI architecture — rule-based, FSM, behavior trees: https://www.capermint.com/blog/real-time-strategy-ai-games/
- Phaser 3 Fog of War approaches: https://blog.ourcade.co/posts/2020/phaser3-fog-of-war-field-of-view-roguelike/
- Phaser 3 Tilemap documentation: https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-3-procedural-dungeon-3bc19b841cd

---
*Architecture research for: Ashes of Contact — 2D RTS (Phaser 3)*
*Researched: 2026-04-16*
