---
phase: 02-citizen-economy-structures
plan: 05
status: complete
started: 2026-04-17T17:30:00Z
completed: 2026-04-17T18:15:00Z
---

## Summary

Created Builder and Farmer NPC subclasses, then wired ALL Phase 2 systems into Game.ts. Replaced bare coinCount with EconomyManager+HUD, initialized NPCManager and StructureManager, and enabled the full indirect-control loop. Added significant UX improvements based on user feedback: flag pole build point indicators, channel deposit mechanic (coins drop one by one, walk away to cancel/refund), all-or-nothing funding, instant structure construction on fund, and coin cost display.

## Key Files

### Created
- `src/entities/npc/Builder.ts` — Builder NPC with walk-to-target and hammer construction animation
- `src/entities/npc/Farmer.ts` — Farmer NPC that works at farms and generates passive coin income

### Modified
- `src/scenes/Game.ts` — Full Phase 2 integration: EconomyManager, HUD, NPCManager, StructureManager, channel deposit mechanic, role assignment, farm proximity checks
- `src/entities/BuildPoint.ts` — Flag pole + colored banner indicators, coin cost text, fundFull method, removed gold rectangle marker
- `src/constants.ts` — Flag pole/banner constants (dimensions, colors per structure type)

## Deviations

1. **Flag pole indicators (user request)** — Added tall flag poles with colored banners instead of relying on gold pulsing rectangles (user couldn't find build points)
2. **Channel deposit mechanic (user request)** — Changed from instant all-or-nothing to channeled one-by-one deposit with walk-away cancel/refund
3. **Instant structure build (user request)** — Structures appear immediately when funded instead of waiting for builder NPC
4. **Removed gold rectangle marker** — Replaced with flag-only visual per user preference

## Self-Check: PASSED

- All 3 tasks completed
- Builder and Farmer NPCs functional
- Game.ts fully wired with all Phase 2 systems
- User-approved visual verification passed
- TypeScript compiles clean
