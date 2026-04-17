# Codebase Structure

**Analysis Date:** 2026-04-16

## Directory Layout

```
my-phaser-game/
├── src/                    # TypeScript source code
│   ├── main.ts             # Application entry point - Phaser Game config
│   ├── vite-env.d.ts       # Vite type declarations
│   ├── scenes/             # Phaser Scene classes
│   │   ├── Boot.ts         # Initial boot scene (loads minimal assets)
│   │   ├── Preloader.ts    # Asset loading with progress bar
│   │   ├── MainMenu.ts     # Main menu screen
│   │   ├── Game.ts         # Primary gameplay scene (ACTIVE)
│   │   ├── Game copy.ts    # Old prototype of Game scene (DEAD CODE)
│   │   └── GameOver.ts     # Game over screen
│   └── engine/             # Reusable game entity classes
│       ├── units/
│       │   └── index.ts    # Unit class with state machine & harvesting AI
│       ├── buildings/
│       │   └── index.ts    # Building base class & MainBase resource depot
│       └── resources/
│           └── index.ts    # ResourceNode harvestable entity
├── public/                 # Static files served as-is
│   ├── favicon.png         # Browser favicon
│   ├── style.css           # Global CSS (body reset, #app container)
│   └── assets/             # Game art assets (spritesheets, backgrounds)
│       ├── background.png  # Tiled gameplay background
│       ├── bg.png          # Menu background
│       ├── logo.png        # Game logo
│       ├── buildings/      # Building sprites (wall, gas-station, etc.)
│       ├── gunner/         # Gunslinger character spritesheets
│       ├── robots/         # Robot character sprites
│       ├── Outline/        # Mini character outline sprites
│       └── Characters(100x100)/  # High-res character spritesheets
│           ├── Soldier/    # Soldier animations (idle, walk, attack, death)
│           └── Orc/        # Orc animations (idle, walk, attack, death)
├── vite/                   # Vite configuration (split dev/prod)
│   ├── config.dev.mjs      # Dev server config (port 8080)
│   └── config.prod.mjs     # Production build config (terser minification)
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config (ES2020, strict mode)
├── log.js                  # Phaser template telemetry script
├── LICENSE                 # MIT license
└── README.md               # Phaser template readme
```

## Directory Purposes

**`src/scenes/`:**
- Purpose: One file per Phaser Scene representing a game state/screen
- Contains: Classes extending `Phaser.Scene` with `preload()`, `create()`, `update()` lifecycle methods
- Key files: `Game.ts` is the active gameplay scene; others (Boot, Preloader, MainMenu, GameOver) are commented out of the scene config

**`src/engine/`:**
- Purpose: Game entity logic separated from scene orchestration
- Contains: Entity classes (Unit, Building, ResourceNode) with their own interfaces and lifecycle
- Key files: Each subdirectory has a single `index.ts` barrel file containing all code for that entity type

**`src/engine/units/`:**
- Purpose: Character/unit logic including movement, state machine, harvesting behavior
- Key files: `index.ts` exports `Unit` class, `IUnitProps` interface, `UnitState` enum

**`src/engine/buildings/`:**
- Purpose: Static structure entities; MainBase serves as resource depot
- Key files: `index.ts` exports `Building` base class, `IBuildingProps` interface, `MainBase` subclass

**`src/engine/resources/`:**
- Purpose: Harvestable resource nodes on the map
- Key files: `index.ts` exports `ResourceNode` class, `IResourceNodeProps` interface

**`public/assets/`:**
- Purpose: All game art (spritesheets, backgrounds, UI images)
- Contains: PNG files organized by character/entity type
- Note: Paths with spaces and parentheses (e.g., `Characters(100x100)`) - use quotes in code references

**`vite/`:**
- Purpose: Split Vite configuration for development vs production builds
- Contains: Two config files; prod adds terser minification and Phaser chunk splitting

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell with `#game-container` div
- `src/main.ts`: Phaser Game instantiation and config

**Configuration:**
- `tsconfig.json`: TypeScript strict mode, ES2020 target, bundler module resolution
- `vite/config.dev.mjs`: Dev server on port 8080
- `vite/config.prod.mjs`: Production build with terser minification
- `package.json`: Scripts (`dev`, `build`, `dev-nolog`, `build-nolog`)

**Core Logic:**
- `src/scenes/Game.ts`: Main gameplay orchestrator (creates entities, runs update loop)
- `src/engine/units/index.ts`: Unit entity with state machine AI (~248 lines)
- `src/engine/buildings/index.ts`: Building and MainBase entities (~87 lines)
- `src/engine/resources/index.ts`: ResourceNode entity (~73 lines)

**Styling:**
- `public/style.css`: Minimal global CSS (body reset, flexbox centering for game container)

## Naming Conventions

**Files:**
- Scene files: PascalCase matching class name (`Boot.ts`, `Game.ts`, `MainMenu.ts`)
- Engine modules: lowercase directory name with `index.ts` barrel (`units/index.ts`, `buildings/index.ts`)

**Directories:**
- Source directories: lowercase (`scenes`, `engine`, `units`, `buildings`, `resources`)
- Asset directories: mixed case matching asset pack names (`Characters(100x100)`, `Outline`, `gunner`)

**Classes:**
- PascalCase: `Unit`, `Building`, `MainBase`, `ResourceNode`

**Interfaces:**
- Prefixed with `I`: `IUnitProps`, `IBuildingProps`, `IResourceNodeProps`

**Enums:**
- PascalCase name, UPPER_SNAKE_CASE values: `UnitState.MOVING_TO_RESOURCE`

## Where to Add New Code

**New Scene (game screen/state):**
- Create file: `src/scenes/{SceneName}.ts`
- Extend `Phaser.Scene`, call `super('{SceneName}')` in constructor
- Register in scene array in `src/main.ts`

**New Entity Type (e.g., projectiles, enemies):**
- Create directory: `src/engine/{entityType}/`
- Create file: `src/engine/{entityType}/index.ts`
- Define interface `I{EntityType}Props` and class `{EntityType}`
- Follow existing pattern: constructor takes `(scene, props)`, implement `preload()`, `create()`, `update()`

**New Building Type:**
- Add to `src/engine/buildings/index.ts` extending `Building` class
- Follow `MainBase` pattern for specialization

**New Unit Behavior/State:**
- Add enum value to `UnitState` in `src/engine/units/index.ts`
- Add case to `update()` switch statement
- Add command method to `commands()` return object

**New Assets:**
- Place in `public/assets/{category}/`
- Load in scene `preload()` or entity `preload()` method
- Reference with path relative to public root (e.g., `/assets/gunner/lizzy.png`)

**Utilities/Helpers:**
- No utility directory exists yet. Create `src/utils/` for shared helpers if needed.

## Special Directories

**`node_modules/`:**
- Purpose: npm dependencies (Phaser, Vite, TypeScript, Terser)
- Generated: Yes (via `npm install`)
- Committed: No (in `.gitignore`)

**`.planning/`:**
- Purpose: Project planning and codebase analysis documents
- Generated: No (manually maintained)
- Committed: Yes

**`public/`:**
- Purpose: Static assets served directly by Vite dev server and copied to dist on build
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-04-16*
