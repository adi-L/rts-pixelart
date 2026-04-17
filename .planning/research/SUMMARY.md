# Project Research Summary

**Project:** Dead City
**Domain:** 2D side-scrolling survival strategy game (Kingdom Two Crowns-style)
**Researched:** 2026-04-16
**Confidence:** HIGH

## Executive Summary

Dead City is a Kingdom Two Crowns-style game built on an existing Phaser 3 RTS codebase that requires a Phase 0 architectural reset before feature work begins. The core design philosophy — every resource and action is a physical entity in the world, no menus, no aggregate numbers — must be preserved. The 6-phase roadmap progresses hero loop → citizen economy → day/night/waves → archer defense → differentiators → vehicles, strictly following the feature dependency chain.

## Recommended Stack

Already installed: Phaser 3.87, TypeScript 5.4, Vite 5.3. No new dependencies for MVP. Post-MVP: `phaser3-rex-plugins` (FSM) and `easystar.js` (pathfinding) only as needed.

## Key Findings

- **Coin-drop as physical interaction** is the genre's load-bearing constraint
- **Autonomous NPC AI** is table stakes, not a differentiator
- **Vehicles + weapons** are genuine market gaps — no competitor has tried this
- **EventBus architecture** prevents the Scene God Object anti-pattern
- **Object pooling** is non-negotiable for zombie waves (GC stutters at 30+ entities)
- **Existing RTS code** must be treated as reference only, not reused directly

## Critical Pitfalls

1. Physics world bounds must be set to world width (not viewport default)
2. Object pools for zombies/coins from day one
3. RTS code assumptions will contaminate side-scrolling game if left intact
4. TileSprite must be viewport-width, not world-width
5. Bidirectional zombie spawning from wave 1 (not post-MVP)

## Suggested Phases: 6

1. **Codebase Reset** — clear RTS assumptions, establish scaffolding
2. **Hero + Coin Loop** — prove the core mechanic
3. **Citizen Economy + Structures** — wire the indirect-control loop
4. **Day/Night + Zombie Waves** — add the existential threat
5. **Archer Tower + Passive Economy + Polish** — complete defensive loop, add differentiators
6. **Vehicles (Post-MVP)** — highest complexity, defer until world scale confirmed

---
*Research synthesis: 2026-04-16*
