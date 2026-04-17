# Phase 1: Foundation & Hero Loop - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Architectural reset from top-down RTS to side-scrolling survival game. Establish the scrolling world, hero movement, physical coin collection/drop at build points, and core infrastructure (EventBus, object pooling, physics bounds, clean shutdown). The coin-drop mechanic must be playable by the end of this phase.

</domain>

<decisions>
## Implementation Decisions

### World & Ground Layout
- **D-01:** Flat ground plane — single ground level across the entire world, like Kingdom Two Crowns. No hills, slopes, or multi-level terrain.
- **D-02:** World width ~6000px (about 5-6 screens). Room for city center, build points on both sides, and exploration space.
- **D-03:** 3 parallax background layers — sky (static/very slow), mid-ground (buildings/trees, slow scroll), foreground ground layer.
- **D-04:** Programmatic world generation from code — no Tiled Map Editor dependency for Phase 1. Can switch to Tiled JSON later.

### Hero Movement
- **D-05:** No jumping — pure left/right movement only. Flat ground, no vertical movement needed.
- **D-06:** Two animation states only: Idle and Walk. Flip sprite for direction change.
- **D-07:** Moderate and deliberate movement speed — ~15-20 seconds to cross the full 6000px world. Strategic pacing like Kingdom Two Crowns.
- **D-08:** Reuse existing gunner spritesheet from assets/ for the hero placeholder.

### Coin Interaction
- **D-09:** Auto-collect on contact — hero walks over a coin and it's instantly picked up. No button press. Fluid, magnetic feel.
- **D-10:** Drop coins by pressing a key (spacebar or down arrow) while near a build point. One press = one coin dropped. Precise player control over investment.
- **D-11:** Coins are small animated sprites (spinning/glowing placeholder) on the ground. Visually distinct pickup feel.
- **D-12:** Build points are glowing/pulsing markers on the ground. Accept coins and fire an event. Become structures in Phase 2.

### Existing Code Strategy
- **D-13:** Clean wipe of src/engine/ — delete all RTS code (Unit, Building, ResourceNode). The top-down harvester patterns don't map to a side-scroller.
- **D-14:** Keep existing scene structure (Boot, Preloader, MainMenu, GameOver). Standard Phaser scaffolding that any game needs. Rewrite Game.ts from scratch for the side-scroller.

### Claude's Discretion
- Camera follow behavior tuning (deadzone, lerp)
- EventBus implementation pattern
- Object pool sizing and configuration
- Physics body sizes and collision groups
- Exact coin spawn locations and build point placement within the 6000px world

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and project-level docs:

### Project Context
- `.planning/PROJECT.md` — Core value (coin-drop mechanic), constraints, key decisions
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: INFRA-01 through INFRA-04, HERO-01, HERO-02, COIN-01, COIN-02, MAP-01, MAP-02
- `.planning/ROADMAP.md` — Phase 1 success criteria and dependency chain
- `CLAUDE.md` — Technology stack details, architecture patterns, version compatibility

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Gunner spritesheets in assets/ (Lizzy, Tiny Gunslinger) — reuse for hero placeholder
- Background image in assets/background.png — potential reuse for one parallax layer

### Established Patterns
- Phaser scene lifecycle (preload/create/update) is standard in existing scenes
- Game config in main.ts uses Phaser.Scale.FIT with CENTER_BOTH — keep this
- No physics currently enabled in game config — must add Arcade Physics

### Integration Points
- main.ts scene array needs to be restored to full Boot → Preloader → MainMenu → Game flow (currently only loads Game)
- "Game copy.ts" is a dead file that should be removed during cleanup

</code_context>

<specifics>
## Specific Ideas

- Kingdom Two Crowns is the direct reference for movement feel, ground style, and coin interaction flow
- The hero should feel like they're deliberately traversing a world, not rushing through it
- Coins should feel satisfying to collect (animated, magnetic) and meaningful to drop (one at a time, precise)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-hero-loop*
*Context gathered: 2026-04-16*
