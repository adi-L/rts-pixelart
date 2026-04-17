# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-16)

**Core value:** The coin-drop mechanic — everything in the game is triggered by the hero moving to a location and dropping coins. No menus, no direct unit control. Move, collect, drop, survive.
**Current focus:** Phase 1 — Foundation & Hero Loop

## Current Position

Phase: 1 of 4 (Foundation & Hero Loop)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-04-16 — Roadmap created, phases derived from 27 v1 requirements

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: RTS codebase is reference only — do not reuse directly, treat as architectural reset
- Init: Object pooling for zombies and coins from day one (non-negotiable per research)
- Init: Physics world bounds must be set to world width, not viewport (critical pitfall)

### Pending Todos

None yet.

### Blockers/Concerns

- Existing RTS code (Unit state machine, Building/MainBase, ResourceNode) assumes top-down perspective — Phase 1 must establish clean side-scrolling scaffolding before any of it is touched.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Vehicles | VEH-01, VEH-02, VEH-03 | v2 | Init |
| Exploration | EXPL-01, EXPL-02 | v2 | Init |
| Progression | PROG-01, PROG-02, PROG-03 | v2 | Init |
| Polish | POL-01, POL-02, POL-03 | v2 | Init |

## Session Continuity

Last session: 2026-04-16
Stopped at: Roadmap and STATE.md created — ready to plan Phase 1
Resume file: None
