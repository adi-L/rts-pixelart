# Ashes of Contact

## What This Is

A 2D real-time strategy game built with Phaser 3 where humans (The Coalition) fight aliens (The Veil) in a dark sci-fi setting. Players build bases, gather resources, train units, and fight on tile-based maps with an objective-based win system. The core twist: any unit can pick up any weapon from fallen enemies, making battlefield scavenging a central mechanic.

## Core Value

The weapon pickup system — units start with basic weapons and upgrade by scavenging from dead enemies (human or alien), making every encounter change the balance of power.

## Requirements

### Validated

- ✓ Phaser 3 game framework with TypeScript — existing
- ✓ Unit entity with state machine (idle, moving, harvesting, returning) — existing
- ✓ Building/MainBase entity with resource deposit — existing
- ✓ ResourceNode entity (harvestable) — existing
- ✓ Vite build pipeline with dev server — existing

### Active

- [ ] Two asymmetric factions: Coalition (humans) and Veil (aliens)
- [ ] Data-driven unit system supporting ~50 unit types per faction (easy to add/modify)
- [ ] Real-time auto-attack combat system
- [ ] Weapon pickup from dead units (cross-faction compatible)
- [ ] Weapon upgrade progression
- [ ] Two-resource economy (common + rare)
- [ ] Classic RTS base building (structures anywhere in territory)
- [ ] Unit production from structures
- [ ] Tile-based maps with fog of war and terrain
- [ ] Objective-based win conditions
- [ ] Skirmish mode vs AI
- [ ] Builder, scout, infantry, heavy, ranged, and special unit roles
- [ ] Humans have robots; aliens have spaceships
- [ ] Placeholder pixel-art sprites (easy to swap for real art later)
- [ ] 5-act campaign ("Ashes of Contact" story)
- [ ] Multiplayer: 1v1, teams, co-op campaign
- [ ] AI opponents for skirmish

### Out of Scope

- Mobile app — web-first, browser only for now
- 3D graphics — strictly 2D pixel art
- Microtransactions / monetization — not in scope
- Map editor — defer to post-v1
- Ranked matchmaking system — basic lobby first

## Context

**Existing codebase:** Phaser 3 TypeScript project with basic scaffolding. Has a Unit class with state machine for harvesting, Building/MainBase for resource depot, ResourceNode for gathering. Most scenes (Boot, Menu, GameOver) are commented out — only the Game scene is active. Barely playable; mostly prototype-level code.

**Art approach:** All sprites start as placeholders (colored shapes or simple pixel art). The system must make swapping sprites trivial — sprite keys defined in unit config data, not hardcoded.

**Faction design philosophy:**
- Coalition (humans): Organized, tactical, structured. Strong defenses. Units rely on equipment. "We don't evolve. We endure."
- The Veil (aliens): Organic, adaptive, unpredictable. Units mutate instead of upgrading. Structures are alive. "We do not conquer. We become."

**Balance model:** Asymmetric but even — like StarCraft's Terran vs Protoss. Each faction has strategic strengths and weaknesses, no faction is strictly stronger.

**Campaign story:** Dark sci-fi, 5 acts. Act 1-2 play as Coalition, Act 3 as The Veil, Act 4-5 feature faction splits and a choice-based ending (Purge / Merge / Break the System). Hero character: Elias Vorn — former Coalition soldier who survived alien assimilation.

## Constraints

- **Tech stack**: Phaser 3 + TypeScript + Vite (already established)
- **Art**: Pixel art placeholders that are trivially replaceable via config
- **Build order**: Skirmish first → multiplayer later → campaign last
- **Scale**: Unit system must support ~50 types per faction without code changes per unit
- **Performance**: Browser-based, must run smoothly with many units on screen

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser 3 as game engine | Already in use, good 2D support | — Pending |
| Data-driven unit definitions | Need ~50 unit types per side, must be easy to add/modify | — Pending |
| Tile-based maps | Classic RTS feel, supports fog of war and terrain | — Pending |
| Weapon pickup as core mechanic | Central to game identity and faction interaction | — Pending |
| Skirmish before multiplayer | Get game loop right first, add networking second | — Pending |
| Placeholder sprites | Missing art assets, need easy replacement path | — Pending |

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
