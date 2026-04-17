# Dead City

## What This Is

A 2D side-scrolling survival strategy game inspired by Kingdom Two Crowns, set in a futuristic zombie world. The player controls a single hero who moves left/right, collects coins, and drops them to build defenses, expand the city, and survive increasingly dangerous nightly zombie waves. Citizens and builders act autonomously — the player's only tools are movement and coins.

## Core Value

The coin-drop mechanic — everything in the game is triggered by the hero moving to a location and dropping coins. No menus, no direct unit control. Move, collect, drop, survive.

## Requirements

### Validated

- ✓ Phaser 3 game framework with TypeScript — existing
- ✓ Vite build pipeline with dev server — existing

### Active

- [ ] Side-scrolling hero movement with keyboard controls
- [ ] Coin collection and coin-drop interaction system
- [ ] Day/night cycle with visual transition
- [ ] Autonomous citizens that walk around and generate coins over time
- [ ] Builders that auto-build when coins are dropped at build points
- [ ] Walls and towers as buildable defenses
- [ ] Zombie waves from map edges at night
- [ ] Hero combat with pickup-able weapons
- [ ] Structure upgrades via coin investment
- [ ] Explorable world left/right of the city with discoverable structures
- [ ] Vehicles (bikes, cars) for exploration with fuel mechanic
- [ ] Day counter with milestone events and escalating difficulty
- [ ] Lose-progress death (pushed back, lose structures/coins, keep going)
- [ ] Pixel art style with parallax scrolling backgrounds
- [ ] Modular systems for easy expansion

### Out of Scope

- Direct unit control — the player controls only the hero
- Top-down or isometric view — strictly side-scrolling
- Multiplayer — single player only for now
- Complex RPG stats — simple systems only
- Procedural world generation — hand-crafted map layout

## Context

**Existing codebase:** Phaser 3 TypeScript project with basic scaffolding. Has a Unit class with state machine, Building/MainBase entity, and ResourceNode. Most of this was built for an RTS prototype and will need significant rework for the new side-scrolling survival style. The engine layer concepts (units, buildings, resources) are directionally useful but the implementation assumes top-down RTS.

**Game reference:** Kingdom Two Crowns is the primary inspiration — the feel of riding through a 2D world, dropping coins to trigger actions, and defending against nightly attacks. The zombie/futuristic setting and weapon pickup system are the key twists.

**MVP approach:** Start extremely small — hero movement, coins, one wall, one tower, simple zombies, day/night cycle. Prove the loop works before expanding.

## Constraints

- **Tech stack**: Phaser 3 + TypeScript + Vite (already established)
- **Art**: Pixel art with placeholder sprites initially, easy to swap via config
- **Perspective**: Flat 2D side-view with parallax backgrounds
- **Scope**: MVP first, expand modularly
- **Performance**: Browser-based, must handle scrolling world + multiple entities smoothly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser 3 as game engine | Already in use, good 2D support | — Pending |
| Kingdom Two Crowns as design reference | Proven coin-drop mechanic, elegant simplicity | — Pending |
| Side-scrolling (not top-down RTS) | Simpler scope, better fit for the survival loop | — Pending |
| MVP-first approach | Prove the core loop before expanding | — Pending |
| No direct unit control | Coins as the only interaction — keeps it simple and unique | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 after initialization*
