# Architecture

**Analysis Date:** 2026-04-16

## Pattern Overview

**Overall:** Scene-based game architecture using Phaser 3 framework with an emerging Entity-Component pattern in the engine layer.

**Key Characteristics:**
- Phaser Scene lifecycle drives all game flow (preload -> create -> update)
- Engine layer provides reusable game entity classes (Unit, Building, ResourceNode) separate from scenes
- State machine pattern governs unit behavior (UnitState enum with IDLE, MOVING_TO_RESOURCE, HARVESTING, RETURNING_TO_BASE)
- No dependency injection; scenes directly instantiate engine entities
- Physics handled via Phaser Arcade Physics (applied ad-hoc per entity in scene)

## Layers

**Entry Point / Config:**
- Purpose: Bootstrap Phaser Game instance with configuration
- Location: `src/main.ts`
- Contains: Game config (dimensions, scale mode, scene registration)
- Depends on: Phaser, all Scene classes
- Used by: `index.html` via `<script type="module">`

**Scenes Layer:**
- Purpose: Define discrete game states (boot, menu, gameplay, game over)
- Location: `src/scenes/`
- Contains: Phaser Scene subclasses with lifecycle hooks (preload, create, update)
- Depends on: Phaser Scene, engine layer entities
- Used by: Phaser game config scene array in `src/main.ts`
- Key files:
  - `src/scenes/Game.ts` - Main gameplay scene (currently the only active scene in config)
  - `src/scenes/Boot.ts` - Asset bootstrap scene (commented out of config)
  - `src/scenes/Preloader.ts` - Loading bar scene (commented out of config)
  - `src/scenes/MainMenu.ts` - Menu scene (commented out of config)
  - `src/scenes/GameOver.ts` - Game over screen (commented out of config)
  - `src/scenes/Game copy.ts` - Older prototype of Game scene (dead code)

**Engine Layer:**
- Purpose: Reusable game entity classes with game logic
- Location: `src/engine/`
- Contains: Entity classes with their own preload/create/update lifecycle
- Depends on: Phaser core APIs (Scene, GameObjects, Physics, Math)
- Used by: Scene layer (specifically `src/scenes/Game.ts`)
- Sub-modules:
  - `src/engine/units/index.ts` - Unit class with state machine, movement, harvesting AI
  - `src/engine/buildings/index.ts` - Building base class and MainBase (resource depot)
  - `src/engine/resources/index.ts` - ResourceNode (harvestable resource)

**Static Assets:**
- Purpose: Game sprites, backgrounds, and static files
- Location: `public/assets/`
- Contains: PNG spritesheets, background images
- Used by: Scene preload methods and Unit preload

## Data Flow

**Game Initialization:**

1. `index.html` loads `src/main.ts` as ES module
2. `src/main.ts` creates `new Phaser.Game(config)` with scene array
3. Currently only `Game` scene is registered (Boot/Preloader/MainMenu are commented out)
4. Phaser invokes `Game` constructor, then `preload()`, then `create()`

**Resource Harvesting Loop (core gameplay):**

1. `Game.update()` calls `harvester.update(resources)` each frame
2. Unit checks `UnitState` in a switch statement:
   - `IDLE` -> finds nearest non-empty ResourceNode -> transitions to `MOVING_TO_RESOURCE`
   - `MOVING_TO_RESOURCE` -> uses `physics.moveTo()` toward resource -> at range 40, transitions to `HARVESTING`
   - `HARVESTING` -> calls `resource.harvest(maxCarryCapacity)` -> transitions to `RETURNING_TO_BASE`
   - `RETURNING_TO_BASE` -> uses `physics.moveTo()` toward MainBase -> at range 120, calls `mainBase.depositResources()` -> transitions to `IDLE`
3. `Game.update()` refreshes resource counter text from `mainBase.getResources()`

**State Management:**
- Game state lives directly on Scene instance properties (`this.units`, `this.harvesters`, `this.mainBase`, `this.resources`)
- Unit state managed via `UnitState` enum on each Unit instance
- Resource totals tracked on `MainBase.resources` (simple number counter)
- No centralized state store or event bus

## Key Abstractions

**Unit (`src/engine/units/index.ts`):**
- Purpose: Represents any game character (leader, harvester)
- Pattern: Config-driven via `IUnitProps` interface, owns its own sprite and animations
- Has lifecycle methods that mirror Phaser scenes: `preload()`, `create()`, `update()`
- State machine via `UnitState` enum drives autonomous behavior
- Commands pattern via `commands()` method returning chainable command object

**Building / MainBase (`src/engine/buildings/index.ts`):**
- Purpose: Static structures; MainBase acts as resource depot
- Pattern: `Building` base class with `IBuildingProps`, `MainBase` extends it
- MainBase tracks deposited resources and provides `depositResources()` / `getResources()`

**ResourceNode (`src/engine/resources/index.ts`):**
- Purpose: Harvestable resource point on the map
- Pattern: Config-driven via `IResourceNodeProps`, visual container with amount text
- Provides `harvest(amount)`, `isEmpty()`, and `destroy()` methods

## Entry Points

**Browser Entry:**
- Location: `index.html`
- Triggers: Browser page load
- Responsibilities: Mounts `#game-container` div, loads `src/main.ts`

**Application Entry:**
- Location: `src/main.ts`
- Triggers: Module import from `index.html`
- Responsibilities: Configures and instantiates Phaser Game with canvas size, scale mode, physics, and scene list

**Active Gameplay Entry:**
- Location: `src/scenes/Game.ts`
- Triggers: Phaser scene manager (first scene in config array)
- Responsibilities: Orchestrates all gameplay - creates units, buildings, resources, runs update loop

## Error Handling

**Strategy:** Minimal - no explicit error handling in game code.

**Patterns:**
- Null checks on `this.unit` and `this.mainBase` at start of `Unit.update()`
- Resource depletion handled via `isEmpty()` check and `Math.min()` clamping in `harvest()`
- No try/catch blocks in game logic
- No error boundaries or fallback UI

## Cross-Cutting Concerns

**Logging:** Not implemented in game code. `log.js` is a Phaser template telemetry script (pings gryzor.co on dev/build), not application logging.

**Validation:** None. Entity props are trusted at construction time. No runtime validation of `IUnitProps`, `IBuildingProps`, or `IResourceNodeProps`.

**Authentication:** Not applicable (single-player browser game).

**Physics:** Phaser Arcade Physics applied ad-hoc. Physics bodies added to sprites in `Game.create()` via `this.physics.add.existing()`. Movement via `this.scene.physics.moveTo()`. No physics config in game config (relies on Phaser defaults).

---

*Architecture analysis: 2026-04-16*
