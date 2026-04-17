# Stack Research

**Domain:** 2D RTS browser game (Phaser 3, TypeScript)
**Researched:** 2026-04-16
**Confidence:** MEDIUM-HIGH (core libraries verified via npm + Context7; AI/fog patterns verified via official Phaser docs and community; lockstep networking LOW confidence — no authoritative 2025 source found)

---

## Recommended Stack

### Core Technologies (Already Established)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Phaser 3 | 3.90.0 | Game framework, rendering, tilemaps, input, audio | Already in use; 3.90 is the final Phaser 3 release — stable, well-documented, no upgrade pressure |
| TypeScript | ^5.4.5 | Type safety across all game systems | Already in use; critical for a codebase with ~50 unit types — data contract enforcement |
| Vite | ^5.3.1 | Build pipeline, dev server, HMR | Already in use; fastest build tool for browser-first TS projects |

**Note on Phaser 4:** Phaser 4 (4.0.0) was published as `latest` on npm but was released in mid-2025 and represents a ground-up WebGL renderer rewrite. BitmapMask and Mesh are removed. Migration from Phaser 3 is non-trivial. **Do not upgrade for this project.** Pin to `phaser@^3.90.0`. Phaser 3.90 is officially the final v3 release.

---

### Supporting Libraries

#### Pathfinding

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pathfinding` | 0.4.18 | A* and variant path algorithms on a 2D grid | Single-unit pathing, small-to-medium unit counts (<100 simultaneous path requests) |

**Recommendation: `pathfinding` (PathFinding.js).** Verified on Context7 and npm. Synchronous per-request A*, JPS (Jump Point Search) included for performance, walkability masks align cleanly with Phaser tilemap tile metadata. EasyStar.js is async-by-default which sounds appealing but forces async callback chains; PathFinding.js is synchronous and easier to integrate into a fixed game loop.

**For large unit groups (100+):** Implement a flow-field layer on top (custom, ~200 LOC based on Dijkstra breadth-first — no library needed). Flow fields amortize pathfinding cost across all units sharing a destination. This is the approach used by Planetary Annihilation and Supreme Commander. Research this before implementing the main pathfinding phase.

#### ECS (Entity Component System)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `bitecs` | 0.4.0 | Data-oriented ECS with TypedArrays | Unit simulation loop, combat, AI ticking — any system processing many entities per frame |

**Recommendation: `bitecs`.** This is the same ECS library that Phaser 4 uses internally — it is the de facto standard for high-performance JavaScript ECS as of 2025. Verified via Context7 (219 code snippets, HIGH reputation). Uses TypedArrays for component storage which is cache-friendly and dramatically faster than object-per-entity patterns. bitecs 0.4 adds logical operators (`Or`, `Not`) in queries, hierarchical queries, and improved TypeScript types. The Ourcade blog has working Phaser 3 + bitecs integration examples.

**Do not use:** Miniplex (React-first, not performance-oriented), ECSY (unmaintained since 2021), or rolling a custom ECS. Rolling custom ECS for 50+ unit types + AI ticking is the main cause of RTS prototype rewrites.

#### Multiplayer Networking

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `colyseus` (client) | 0.17.9 | WebSocket client + room/state management | Browser client — connects to Colyseus server, receives delta-compressed state |
| `@colyseus/schema` | 4.0.20 | Shared state schema (client + server) | Define replicated game state: unit positions, HP, fog visibility, resource counts |
| `colyseus` (server, separate repo) | 0.17.9 | Authoritative Node.js game server | Runs server-side: room lifecycle, game logic validation, state broadcast |

**Recommendation: Colyseus 0.17.** Verified via npm. Has official Phaser 3 tutorial + production examples (Grapplenauts, 2025). Colyseus uses an authoritative server model — game logic lives on Node.js, clients are display-only. Delta-compressed binary state sync means low bandwidth. The `@colyseus/schema` package lets you share one typed state definition between browser and server.

**Architecture note for RTS:** Use a deferred multiplayer strategy. Build the full single-player skirmish loop first as if multiplayer doesn't exist. When adding multiplayer, extract the game simulation into a shared module that runs authoritatively on the server. The Phaser scene becomes a "dumb renderer" that reflects replicated state. This avoids locking your game logic to a network model early.

**Lockstep vs authoritative server:** Lockstep (all clients run same deterministic simulation, server only relays inputs) is used by StarCraft II and Age of Empires but requires deterministic floating point, careful desync handling, and is significantly harder to implement. For this project's scale — 1v1 or co-op, browser-based — authoritative server via Colyseus is the correct choice. LOW confidence in lockstep-vs-authoritative nuance for JavaScript specifically; revisit when approaching multiplayer milestone.

#### Tilemap

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tiled Map Editor | 1.11.x (tool, not npm) | Authoring tile maps: terrain layers, object layers, fog of war grid data | Designing all game maps; exports Tiled JSON consumed by Phaser |
| Built-in Phaser Tilemaps | (Phaser 3.90) | Loading and rendering Tiled JSON, tile collision, layer queries | Everything tilemap in-game — no external library needed |

**Recommendation: Tiled + Phaser built-in tilemap API.** Phaser 3 has first-class Tiled JSON support: `this.make.tilemap()`, multiple layers (background, terrain, objects, fog), per-tile walkability metadata. No third-party tilemap library is needed or recommended — `phaser-tiled` (englercj) is abandoned and targets Phaser 2. Use Tiled to define terrain cost layers and pass them directly to the pathfinding grid.

#### Fog of War

No standalone library recommended. Implement using Phaser's built-in `RenderTexture` + `BitmapMask` pattern:

1. Maintain a 2D `Uint8Array` (one cell per tile) with three states: `HIDDEN`, `EXPLORED`, `VISIBLE`.
2. Each game tick, compute which tiles fall in any friendly unit's vision radius.
3. Draw a `RenderTexture` covering the viewport: fill dark (`HIDDEN`), draw lighter overlay (`EXPLORED`), leave clear (`VISIBLE`).
4. Apply as a `BitmapMask` on the fog display layer.

This approach is confirmed working in Phaser 3.x and is the standard pattern discussed on the Phaser forums. Performance note: keep the RenderTexture at screen size, not map size. Do not use a third-party fog-of-war library — none exist for Phaser 3 with active maintenance.

#### AI (Skirmish Opponent)

No external library recommended. Implement a two-layer AI using patterns already present in the codebase:

- **Tactical layer:** Hierarchical Finite State Machines (FSMs) — the existing Unit state machine pattern extended. Each AI faction has a top-level FSM (Expanding / Defending / Rushing) that drives unit-level FSMs.
- **Strategic layer:** A simple utility scorer that evaluates resource pressure, enemy unit count, and base health to transition between FSM states.
- **Unit behaviors:** Steering behaviors (seek, flee, separate) implemented as bitecs systems operating on `Position` / `Velocity` / `Target` components.

**Do not use:** behavior-tree libraries like `behaviortree` or `bt.js` — they add abstraction overhead and are not well-suited to Phaser's game-loop model. A composable FSM in ~300 LOC outperforms them for this scope. The Medium article "Composable State Machines: Building Scalable Unit Behavior in RTS Games" (2024) confirms this pattern.

---

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Tiled 1.11 | Map authoring | Export as Tiled JSON (uncompressed), embed tilesets, use object layers for spawn points |
| Vite 5 | Dev server + build | Already configured; add `assetsInclude: ['**/*.tiledmap', '**/*.tmj']` if using `.tmj` extension |
| TypeScript strict mode | Type safety | Enable `"strict": true` in tsconfig; bitecs components are typed arrays — catch index errors at compile time |

---

## Installation

```bash
# RTS gameplay libraries
npm install bitecs pathfinding

# Multiplayer (add when starting the multiplayer milestone)
npm install colyseus @colyseus/schema
```

Server (separate project, when multiplayer milestone starts):
```bash
mkdir rts-server && cd rts-server
npm init -y
npm install colyseus @colyseus/schema
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `pathfinding` (PathFinding.js) | `easystarjs` | If you need truly async, non-blocking pathfinding and don't mind callback-based API. EasyStar is older (last npm release 0.4.4, maintenance unclear) but simpler. |
| `pathfinding` + custom flow field | NavMesh (recast-js) | If maps have organic non-grid terrain. For tile-based RTS, navmeshes are overkill and harder to keep in sync with fog data. |
| `bitecs` | Custom ECS | Never. Rolling custom ECS for an RTS is the primary cause of rewrites. |
| `bitecs` | `miniplex` | If project is React-heavy. Miniplex has React bindings and ergonomic API but is slower — not appropriate for high unit counts. |
| Colyseus | raw Socket.io | For ultra-simple games. Colyseus adds authoritative rooms, schema state sync, matchmaking. Socket.io alone requires implementing all of that manually. |
| Colyseus | Nakama | If you need accounts, leaderboards, friend lists (full game backend). Nakama is heavier infrastructure. Colyseus is lighter and TypeScript-native. |
| Phaser built-in tilemap | LDtk | LDtk (Level Designer Toolkit) has a better design UX than Tiled and strong TypeScript codegen. **Viable alternative** — use it if the team prefers it. Phaser does not natively load LDtk; requires `ldtk-ts` or manual parser. Adds a dependency. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Phaser 4 (`phaser@latest` or `phaser@4.x`) | npm `latest` tag now resolves to Phaser 4. Phaser 4 removes BitmapMask, Mesh, Point, and replaces the entire WebGL pipeline. The existing codebase is Phaser 3 and migration is non-trivial. | Pin to `phaser@^3.90.0` explicitly |
| `phaser-tiled` (englercj) | Abandoned, targets Phaser 2. Will not work with Phaser 3. | Phaser's built-in tilemap API |
| `easystarjs` for large groups | Async-per-unit pathfinding causes hundreds of pending callbacks per frame with 50+ units — kills performance | `pathfinding` synchronous + flow field for groups |
| `becsy` ECS | Multithreaded ECS requiring SharedArrayBuffer — browser security headers (COOP/COEP) add deployment complexity for no benefit at this scale | `bitecs` |
| Lockstep networking (custom) | Requires deterministic floating point simulation — JavaScript `Math` is non-deterministic across engines and platforms. Desync bugs are catastrophic and extremely hard to debug. | Colyseus authoritative server |
| Peer-to-peer (no server) | Cheating is trivial; state divergence unrecoverable in RTS where unit positions are authoritative | Colyseus authoritative server |
| Three.js or PixiJS | Not the current engine. Mixing with Phaser 3 creates two competing render pipelines. | Phaser 3 built-in renderer only |

---

## Stack Patterns by Variant

**For single-player skirmish (Phase 1):**
- Use: `phaser@^3.90.0` + `bitecs` + `pathfinding`
- Fog of war: RenderTexture + BitmapMask (no extra lib)
- AI: FSM + steering behaviors (no extra lib)
- Do NOT add Colyseus yet — it complicates the game loop unnecessarily early

**For multiplayer (later milestone):**
- Add: `colyseus` (client) + `@colyseus/schema`
- Create separate `rts-server/` project with Colyseus server
- Refactor: extract simulation loop from Phaser scene into shared `GameSimulation` class that runs on server; Phaser scene becomes display-only

**For campaign mode (last milestone):**
- No new libraries needed
- Campaign sequences are scripted Phaser scene transitions + dialogue overlay
- Use Phaser's built-in `Timeline` / `Tween` for cutscene animation

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `phaser@^3.90.0` | `bitecs@0.4.0` | No direct dependency — bitecs manages its own world; Phaser game objects are referenced by entity ID |
| `phaser@^3.90.0` | `pathfinding@0.4.18` | No conflict — pathfinding operates on a plain grid; Phaser tilemap provides the walkability data |
| `colyseus@0.17.9` | `@colyseus/schema@4.0.20` | Must match exactly — Colyseus 0.17 requires schema 4.x; mismatched versions cause silent serialization failures |
| `typescript@^5.4.5` | `bitecs@0.4.0` | bitecs 0.4 ships improved TS types; works with strict mode |
| `vite@^5.3.1` | All above | No conflicts |
| `phaser@4.x` | Existing codebase | **INCOMPATIBLE** — do not use `npm install phaser` without pinning version; `latest` tag resolves to v4 |

---

## Sources

- `/natethegreatt/bitecs` (Context7, HIGH confidence) — TypeScript API, query operators, performance model
- `/qiao/pathfinding.js` (Context7, HIGH confidence) — A* API, grid configuration
- `/websites/phaser_io_phaser` (Context7, HIGH confidence) — Tilemap API, RenderTexture, BitmapMask
- `npm view phaser dist-tags` — Confirmed `latest` = 4.0.0, Phaser 3.90.0 is last v3
- `npm view bitecs version` — Confirmed 0.4.0
- `npm view pathfinding version` — Confirmed 0.4.18
- `npm view colyseus version` — Confirmed 0.17.9
- `npm view @colyseus/schema version` — Confirmed 4.0.20
- https://phaser.io/news/2025/05/phaser-v390-released — Phaser 3.90 final v3 release confirmation
- https://docs.colyseus.io/learn/tutorial/phaser — Official Phaser + Colyseus tutorial (MEDIUM confidence)
- https://github.com/ourcade/phaser3-bitecs-getting-started — Phaser 3 + bitecs integration pattern (MEDIUM confidence)
- https://www.redblobgames.com/blog/2024-04-27-flow-field-pathfinding/ — Flow field theory (HIGH confidence, authoritative source)
- Lockstep vs authoritative server for JS RTS: LOW confidence — no authoritative 2025 source found; recommendation is based on engineering reasoning

---

*Stack research for: 2D RTS — Ashes of Contact (Phaser 3 + TypeScript)*
*Researched: 2026-04-16*
