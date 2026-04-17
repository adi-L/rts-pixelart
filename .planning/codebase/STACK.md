# Technology Stack

**Analysis Date:** 2026-04-16

## Languages

**Primary:**
- TypeScript 5.4.5 - All game logic in `src/` (scenes, engine modules)
- Target: ES2020, strict mode enabled

**Secondary:**
- JavaScript (CommonJS) - `log.js` telemetry script (Node.js, runs at dev/build time)
- HTML/CSS - `index.html` entry point, `public/style.css` for page styling

## Runtime

**Environment:**
- Browser (DOM) - Phaser renders to a `<canvas>` inside `<div id="game-container">`
- Node.js - Used for build tooling (Vite) and the `log.js` telemetry script

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Phaser 3.87.0 ("Hanabi") - 2D game framework with Arcade Physics
  - Renderer: `Phaser.AUTO` (WebGL with Canvas fallback)
  - Physics: Arcade (used for unit movement via `this.physics.moveTo()` and `this.physics.add.existing()`)
  - Scale mode: `Phaser.Scale.FIT` with `CENTER_BOTH`

**Testing:**
- None detected - no test framework configured

**Build/Dev:**
- Vite 5.3.1 - Dev server and production bundler
  - Dev config: `vite/config.dev.mjs` (port 8080)
  - Prod config: `vite/config.prod.mjs` (Terser minification, 2-pass compression)
- Terser 5.31.0 - Production minification
- TypeScript 5.4.5 - Type checking (noEmit mode, bundler module resolution)

## Key Dependencies

**Critical:**
- `phaser` ^3.87.0 - The entire game framework. Provides Scene management, Sprite rendering, Arcade Physics, Animation system, Camera, TileSprite, input handling.

**Dev Dependencies:**
- `vite` ^5.3.1 - Build tool and dev server
- `typescript` ^5.4.5 - Type checking
- `terser` ^5.31.0 - JS minifier for production builds

**Note:** This is a minimal dependency tree. No state management libraries, no UI frameworks, no network libraries beyond what Phaser provides.

## Configuration

**TypeScript (`tsconfig.json`):**
- Target: ES2020
- Module: ESNext with bundler resolution
- Strict mode: enabled
- `strictPropertyInitialization`: disabled (important for Phaser scene classes that initialize in `create()`)
- `noUnusedLocals` and `noUnusedParameters`: enabled
- Includes only: `src/`

**Vite:**
- Base path: `./` (relative, for static hosting)
- Dev server port: 8080
- Phaser is split into a separate chunk via `manualChunks` in both dev and prod configs
- Production uses Terser with 2-pass compression and comment stripping

**Build:**
- `index.html` at project root serves as Vite entry point
- Module entry: `<script type="module" src="/src/main.ts">`

## Scripts

```bash
npm run dev          # Start dev server (port 8080) + telemetry ping
npm run build        # Production build with Terser + telemetry ping
npm run dev-nolog    # Dev server without telemetry
npm run build-nolog  # Production build without telemetry
```

## Platform Requirements

**Development:**
- Node.js (version not pinned, no `.nvmrc`)
- npm
- Modern browser with WebGL support

**Production:**
- Static file hosting (builds to `dist/`)
- No server-side runtime required
- Browser with WebGL or Canvas support

## Static Assets

**Location:** `public/assets/`
- Sprite sheets: `gunner/`, `Characters(100x100)/`, `robots/`, `Outline/`
- Backgrounds: `background.png`, `bg.png`
- Other images: `logo.png`, `soldier1.png`, `players blue x1.png`
- Buildings directory: `buildings/`

Assets are referenced via absolute paths from the public root (e.g., `/assets/gunner/lizzy.png`).

---

*Stack analysis: 2026-04-16*
