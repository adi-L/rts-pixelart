# Phase 1: Foundation & Hero Loop - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 01-foundation-hero-loop
**Areas discussed:** World & ground layout, Hero movement feel, Coin interaction design, Existing code strategy

---

## World & Ground Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Flat ground plane | Single flat ground level across entire world, like Kingdom Two Crowns | ✓ |
| Gentle hills/slopes | Ground has slight elevation changes, hero walks up/down smoothly | |
| Multi-platform terrain | Multiple ground levels with ledges and drops | |

**User's choice:** Flat ground plane
**Notes:** Kingdom Two Crowns reference — terrain variation comes from structures, not ground shape.

---

| Option | Description | Selected |
|--------|-------------|----------|
| ~4000px (compact) | About 3-4 screens wide | |
| ~6000px (medium) | About 5-6 screens wide, matches Kingdom Two Crowns feel | ✓ |
| ~10000px (expansive) | About 8-10 screens wide, better suited for vehicles (v2) | |

**User's choice:** ~6000px (medium)
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| 3 layers | Sky, mid-ground, foreground ground layer | ✓ |
| 2 layers | Just sky background + ground | |
| You decide | Claude picks | |

**User's choice:** 3 layers
**Notes:** Standard for the genre, good depth without complexity.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Programmatic | Generate from code, no Tiled dependency for Phase 1 | ✓ |
| Tiled JSON from day one | Author in Tiled Map Editor, load as JSON | |
| You decide | Claude picks | |

**User's choice:** Programmatic
**Notes:** Faster to iterate. Can switch to Tiled JSON later.

---

## Hero Movement Feel

| Option | Description | Selected |
|--------|-------------|----------|
| No jumping | Pure left/right movement only, like Kingdom Two Crowns | ✓ |
| Basic jump | Hero can jump with a button press | |
| You decide | Claude picks | |

**User's choice:** No jumping
**Notes:** Ground is flat, no need for vertical movement. Keeps hero controller simple.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Idle + Walk | Two states for MVP, flip sprite for direction | ✓ |
| Idle + Walk + Coin actions | Add coin-collect and coin-drop animations | |
| You decide | Claude picks | |

**User's choice:** Idle + Walk
**Notes:** Enough to prove the loop.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Moderate and deliberate | Walking pace, ~15-20 seconds to cross world | ✓ |
| Snappy and fast | Quick traversal, arcade feel | |
| You decide | Claude tunes | |

**User's choice:** Moderate and deliberate
**Notes:** Kingdom Two Crowns pacing — forces player to plan movements.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse existing spritesheet | Use gunner spritesheets from assets/ | ✓ |
| Colored rectangle | Simple colored box placeholder | |
| You decide | Claude picks | |

**User's choice:** Reuse existing spritesheet
**Notes:** Gives immediate visual character even as placeholder.

---

## Coin Interaction Design

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-collect on contact | Walk over coin, instantly picked up, no button press | ✓ |
| Button press to collect | Must press key while near coin | |
| You decide | Claude picks | |

**User's choice:** Auto-collect on contact
**Notes:** Fluid, magnetic feel. Like Kingdom Two Crowns.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Press key near build point | Spacebar/down arrow, one press = one coin dropped | ✓ |
| Auto-drop when standing still | Coins auto-drop while standing at build point | |
| Hold key to stream coins | Hold key for continuous coin drop | |

**User's choice:** Press key near build point
**Notes:** Precise player control over investment.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Small animated sprite | Spinning/glowing placeholder on ground | ✓ |
| Static icons on ground | Simple static images, no animation | |
| You decide | Claude picks | |

**User's choice:** Small animated sprite
**Notes:** Visually distinct, feel like pickups.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Glowing marker on ground | Subtle glowing/pulsing spot, accepts coins, fires event | ✓ |
| Signpost or flag | Small visual marker at each build point | |
| You decide | Claude picks | |

**User's choice:** Glowing marker on ground
**Notes:** Becomes a structure in Phase 2. Just needs to accept coins and fire an event for now.

---

## Existing Code Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Clean wipe of src/engine/ | Delete all RTS code, start fresh | ✓ |
| Keep as reference, build alongside | Don't delete, build new systems in parallel | |
| Salvage the class structure | Keep Unit/Building shells, rewrite internals | |

**User's choice:** Clean wipe of src/engine/
**Notes:** RTS patterns don't map to side-scroller.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Keep scene structure | Keep Boot, Preloader, MainMenu, GameOver. Rewrite Game.ts | ✓ |
| Single Game scene only | Strip to just Game.ts for MVP | |
| You decide | Claude picks | |

**User's choice:** Keep scene structure
**Notes:** Standard Phaser scaffolding that any game needs.

---

## Claude's Discretion

- Camera follow behavior tuning (deadzone, lerp)
- EventBus implementation pattern
- Object pool sizing and configuration
- Physics body sizes and collision groups
- Exact coin spawn locations and build point placement

## Deferred Ideas

None — discussion stayed within phase scope.
