<!-- GSD:project-start source:PROJECT.md -->
## Project

**Dead City**

A 2D side-scrolling survival strategy game inspired by Kingdom Two Crowns, set in a futuristic zombie world. The player controls a single hero who moves left/right, collects coins, and drops them to build defenses, expand the city, and survive increasingly dangerous nightly zombie waves. Citizens and builders act autonomously — the player's only tools are movement and coins.

**Core Value:** The coin-drop mechanic — everything in the game is triggered by the hero moving to a location and dropping coins. No menus, no direct unit control. Move, collect, drop, survive.

### Constraints

- **Tech stack**: Phaser 3 + TypeScript + Vite (already established)
- **Art**: Pixel art with placeholder sprites initially, easy to swap via config
- **Perspective**: Flat 2D side-view with parallax backgrounds
- **Scope**: MVP first, expand modularly
- **Performance**: Browser-based, must handle scrolling world + multiple entities smoothly
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Phaser 3 | ^3.87.0 (project) / 3.90.0 (latest) | Game engine | Already in project. Mature, well-documented, has built-in Arcade Physics, Camera system with `startFollow`/`setBounds`, TileSprite for parallax, and Tilemap/Tiled JSON support. Do NOT upgrade to 3.90 mid-project — 3.90 is declared the final Phaser 3 release and Phaser 4 is an entirely different renderer. Stay on locked version. |
| TypeScript | ^5.4.5 | Type safety | Already in project. Prevents class mismatch bugs in entity systems. Essential for a multi-system game with Citizens, Builders, Zombies sharing interfaces. |
| Vite | ^5.3.1 | Dev server / bundler | Already in project. HMR makes rapid iteration on game scenes practical. Fast cold-start compared to webpack. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| phaser3-rex-plugins | ^1.80.19 (npm, active as of 2026) | FSM plugin, UI toolkit, shader utilities | Use `rexFSM` for the hero state machine (idle/run/jump/attack) and for NPC states (citizen/builder/zombie). Use `rexGlowFilterPipeline` for tower glow effects. Import individual plugin files (not the full bundle) to avoid bloat. |
| phaser-navmesh | 2.3.1 (unmaintained, last updated ~2021) | Navmesh pathfinding | LOW confidence — see note below. Only use if zombie AI needs multi-path navigation around obstacles. Not needed for MVP. |
| easystar.js | ^0.4.4 | A* grid pathfinding | Simpler alternative to NavMesh for grid-aligned zombie movement. Appropriate for MVP — zombies walk from map edge toward the base along the single horizontal axis, so grid-based A* is sufficient. |
| Tiled (desktop tool) | 1.11.x | Tilemap authoring | Not an npm package. Use for authoring the world map as a Tiled JSON file; load with `this.make.tilemap()` in Phaser. Export as uncompressed JSON with embedded tilesets. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| Vite dev server | HMR, fast rebuild | Already configured. Use `vite/config.dev.mjs` for dev, `vite/config.prod.mjs` + terser for prod. |
| TypeScript strict mode | Catch entity typing errors early | Enable `"strict": true` in tsconfig. Phaser 3 types are bundled with `phaser` npm package — no separate `@types/phaser` needed. |
| Tiled Map Editor | Author the side-scrolling world layout | Free, cross-platform. Export to JSON. One tilemap = the full world width (~6000-10000px) with foreground, midground, and background layers. |
## Architecture Patterns for This Domain
### Parallax Scrolling (no plugin needed)
### Camera System (built-in)
### Day/Night Cycle (built-in tweens + Rectangle overlay)
### Entity State Machines
### Pathfinding for Zombies
### Coin/Economy System
### Physics
- Hero: dynamic body with gravity for jumping
- Ground/platforms/walls: static bodies (no physics calculations, efficient)
- Zombies: dynamic bodies with manual velocity control
- Tilemap collision layer handles all terrain automatically
## Installation
# The core stack is already installed. Only add as needed:
# Entity AI (post-MVP, when simple velocity chasing is insufficient)
# Rich plugins (FSM, shaders, UI — add when needed, tree-shake via direct imports)
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Built-in TileSprite parallax | Parallax plugin (various) | Never — Phaser's native approach is sufficient and has no dependency risk |
| Built-in Rectangle tween for day/night | phaser3-rex-plugins ColorTransition | Only if you need per-sprite tint cycling across many objects |
| easystar.js for pathfinding | phaser-navmesh | If you have a non-linear open world with complex obstacle topology; not needed for a corridor-based side-scroller |
| Arcade Physics | Matter.js | Only if you need soft bodies, complex polygon collision, or realistic physics simulation |
| Hand-rolled FSM / rexFSM | XState | XState is far too heavy for game loop use; its overhead becomes visible in fast update cycles |
| Tiled JSON tilemap | Programmatic segment generation | Use programmatic generation only if the world is infinite/procedural; Dead City uses a hand-crafted map, so Tiled is correct |
| Phaser 3.87 (locked) | Phaser 3.90 or Phaser 4 | Upgrade to 3.90 only after verifying no breaking changes in your plugin chain; Phaser 4 is a different product — do not migrate mid-project |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Phaser 4 | Completely different renderer architecture, no stable release, would require rewriting the entire codebase from scratch | Stay on Phaser 3.87 (or upgrade to 3.90 in a dedicated upgrade task) |
| Matter.js physics | Adds ~200KB, requires complex body shapes, overkill for AABB side-scroller; performance penalty at 50+ entities | Arcade Physics |
| phaser-navmesh | Unmaintained since 2021, last version 2.3.1, no recent community usage | easystar.js or custom velocity-only zombie AI |
| Full phaser3-rex-plugins bundle import | Entire bundle is very large; importing `import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'` pulls in everything | Import only specific plugin files: `import FSM from 'phaser3-rex-plugins/plugins/fsm.js'` |
| React/Vue for game UI | Mixing a DOM framework with the Phaser canvas creates z-index, input, and lifecycle complexity | Use Phaser's built-in Text, Rectangle, and DOM Elements for minimal HUD; Rex UI plugin for anything more complex |
| Separate entity/component frameworks (bitECS) | Adds conceptual overhead and integration complexity for a game with <200 entities; gains are irrelevant at this scale | Phaser GameObjects with TypeScript class hierarchy |
## Stack Patterns by Variant
- Enable camera culling by checking `camera.worldView` bounds before creating/activating entities
- Deactivate physics bodies on objects outside camera worldView + margin
- Use object pooling for zombies and coins via `Phaser.GameObjects.Group` with `createMultiple`
- Use `setTint(color)` on tilemap layers rather than an overlay rectangle
- Drive tint from the same `dayProgress` scalar
- Switch from individual GameObjects to a custom spatial hash or array-based update loop
- Keep Arcade Physics bodies but minimize physics checks via `overlap` groups instead of per-pair colliders
## Version Compatibility
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| phaser@3.87.0 | TypeScript@5.4.x, Vite@5.x | Types bundled with phaser package; no @types/phaser needed |
| phaser@3.90.0 | TypeScript@5.x | Final Phaser 3 release per official announcement; upgrade is safe but not urgent |
| phaser3-rex-plugins@1.80.19 | phaser@3.60–3.90 | Actively maintained (updated March 2026). Import individual plugins, not the root index |
| easystar@0.4.4 | Any | Plain JavaScript, no Phaser dependency; works with Phaser tilemap data by manual grid extraction |
## Sources
- `/phaserjs/examples` (Context7) — Camera, TileSprite, physics patterns
- `/rexrainbow/phaser3-rex-notes` (Context7) — FSM plugin, glow filter, pathfinder patterns
- https://phaser.io/download/stable — Phaser 3.90.0 confirmed as latest/final Phaser 3 release
- https://www.npmjs.com/package/phaser3-rex-plugins — Version 1.80.19, active as of 2026
- https://www.npmjs.com/package/phaser-navmesh — Version 2.3.1, last published ~4 years ago (unmaintained)
- https://phaser.discourse.group/t/best-way-to-approach-paralax-background/2318 — Community parallax patterns (MEDIUM confidence)
- https://github.com/mikewesthad/navmesh — NavMesh Phaser plugin source
- https://generalistprogrammer.com/tutorials/phaser-physics-arcade-box2d-guide — Arcade vs Matter.js comparison (MEDIUM confidence)
- https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b — 2025 Phaser 3 performance tips (MEDIUM confidence)
- https://www.gamedeveloper.com/design/kingdom-two-crowns-design — Kingdom Two Crowns one-dimensional design rationale
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
