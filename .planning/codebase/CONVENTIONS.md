# Coding Conventions

**Analysis Date:** 2026-04-16

## Naming Patterns

**Files:**
- Scene files: PascalCase (`Boot.ts`, `Game.ts`, `MainMenu.ts`, `Preloader.ts`, `GameOver.ts`)
- Engine module files: `index.ts` barrel files inside feature directories (`src/engine/units/index.ts`, `src/engine/buildings/index.ts`, `src/engine/resources/index.ts`)
- Config files: lowercase with dots (`tsconfig.json`, `config.dev.mjs`, `config.prod.mjs`)

**Classes:**
- PascalCase for all classes: `Unit`, `MainBase`, `Building`, `ResourceNode`, `Game`, `Boot`
- Scene classes match their file name exactly

**Interfaces:**
- Prefixed with `I`: `IUnitProps`, `IBuildingProps`, `IResourceNodeProps`
- Used as constructor parameter objects for entity configuration

**Enums:**
- PascalCase name, SCREAMING_SNAKE_CASE values: `UnitState.MOVING_TO_RESOURCE`, `UnitState.RETURNING_TO_BASE`

**Variables/Properties:**
- camelCase for all instance properties: `carryingResources`, `maxCarryCapacity`, `targetResource`, `mainBase`
- camelCase for methods: `findNearestResource()`, `depositResources()`, `updateFlip()`
- snake_case appears in some template-originating code: `msg_text`, `gameover_text` (legacy from Phaser template -- avoid in new code)

**Animation Keys:**
- Template literal with unit key prefix: `` `${this.key}-idle` ``

## Code Style

**Formatting:**
- No dedicated formatter (no Prettier/ESLint config detected)
- Indentation: 2 spaces in engine code (`src/engine/`), mixed in template scene files
- Semicolons: used consistently
- Quotes: double quotes for imports in engine code, mixed single/double in template scenes
- Use double quotes for new code to match the dominant engine convention

**Linting:**
- TypeScript strict mode enabled in `tsconfig.json`
- `noUnusedLocals: true` and `noUnusedParameters: true` enforced
- `noFallthroughCasesInSwitch: true`
- `strictPropertyInitialization: false` (relaxed for Phaser scene class patterns where properties are set in `create()`)

## Import Organization

**Order (observed pattern):**
1. Framework imports (`import { Scene } from "phaser"`)
2. Internal engine imports (`import { Unit } from "../engine/units"`)
3. No third-party libraries beyond Phaser

**Path Aliases:**
- None configured -- all imports use relative paths
- Engine modules use barrel exports via `index.ts` files

**Style:**
- Named exports only -- no default exports except `src/main.ts` which exports the game instance

## Error Handling

**Patterns:**
- Guard clauses with early returns: `if (!this.unit || !this.mainBase) return;` in `src/engine/units/index.ts` line 163
- Null checks before property access: `if (this.selectionCircle) { ... }` in `src/engine/units/index.ts`
- No try/catch blocks anywhere in the codebase
- No custom error classes
- Defensive math: `Math.min(amount, this.amount)` prevents over-harvesting in `src/engine/resources/index.ts` line 49

## Logging

**Framework:** None

**Patterns:**
- No logging is used anywhere in the codebase
- No console.log, console.error, or logging library

## Comments

**When to Comment:**
- Inline comments for section headers within methods: `// Create selection circle`, `// Add UI for resource display`
- Constructor-level comments for entity identity: `// Lizzy - The Leader`
- Template comments from Phaser boilerplate in `Boot.ts`, `Preloader.ts` (more verbose, explanatory style)

**JSDoc/TSDoc:**
- Not used anywhere

## Class Design

**Entity Pattern (Units, Buildings, Resources):**
All game entities follow a consistent lifecycle pattern:

```typescript
class Entity {
  // 1. Properties declared at class level
  scene: Phaser.Scene;
  x: number;
  y: number;
  
  // 2. Constructor takes scene + props interface
  constructor(scene: Phaser.Scene, props: IEntityProps) {
    this.scene = scene;
    this.x = props.x;
    // ...
  }
  
  // 3. preload() - loads assets
  preload() { /* load spritesheets/images */ return this; }
  
  // 4. create() - creates game objects
  create() { /* add sprites, text, containers */ return this; }
  
  // 5. update() - per-frame logic (if needed)
  update() { /* state machine, movement */ }
}
```

- `preload()` and `create()` return `this` for method chaining
- Constructor does NOT create Phaser game objects -- that happens in `create()`
- Scene reference is stored as `this.scene` on every entity

**Scene Pattern (Phaser scenes):**
```typescript
export class MyScene extends Scene {
  // Properties typed with Phaser types
  camera: Phaser.Cameras.Scene2D.Camera;
  
  constructor() {
    super("SceneName"); // string key matches class name
  }
  
  preload() { /* asset loading */ }
  create() { /* scene setup */ }
  update() { /* game loop */ }
}
```

**State Machine Pattern:**
- Enum-based states (`UnitState`) with a `switch` statement in `update()`
- State transitions happen by direct assignment: `this.state = UnitState.IDLE`
- See `src/engine/units/index.ts` lines 165-237

**Command Pattern:**
- `commands()` method returns a chainable object of named actions
- Example: `unit.commands().idle()` in `src/scenes/Game.ts`
- Pattern is partially implemented (shoot command is empty stub)

## Module Design

**Exports:**
- Named exports for all classes, interfaces, and enums
- One default export in `src/main.ts` (the game instance)

**Barrel Files:**
- Each engine feature directory has an `index.ts` that exports everything
- `src/engine/units/index.ts`, `src/engine/buildings/index.ts`, `src/engine/resources/index.ts`

**Inheritance:**
- `MainBase extends Building` in `src/engine/buildings/index.ts` -- calls `super.create()` for shared setup

## Property Initialization

**Pattern:**
- Class properties with defaults use initializers: `state: UnitState = UnitState.IDLE`, `carryingResources: number = 0`
- Properties set in constructor are declared without initializers: `x: number;`
- Phaser game objects are declared without initializers and assigned in `create()`: `unit: Phaser.GameObjects.Sprite;`
- `strictPropertyInitialization: false` in tsconfig supports this Phaser pattern

---

*Convention analysis: 2026-04-16*
