# Phase 2: Citizen Economy & Structures - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 02-citizen-economy-structures
**Areas discussed:** NPC spawning & behavior, Structure types & upgrades, HUD & economy display, Main base & lose condition

---

## NPC Spawning & Behavior

### How should NPCs enter the world?

| Option | Description | Selected |
|--------|-------------|----------|
| Coin conversion | Vagrants wander map edges, drop coin to recruit. Kingdom Two Crowns style. | ✓ |
| Auto-spawn at base | Citizens spawn automatically at the main base over time. | |
| Build a house | Drop coins at a house build point to spawn citizens. | |

**User's choice:** Coin conversion (Recommended)
**Notes:** None

### How should citizens generate passive income?

| Option | Description | Selected |
|--------|-------------|----------|
| Wander & drop coins | Citizens walk randomly and periodically drop coins on the ground. | |
| Auto-add to wallet | Each citizen adds coins directly to hero's count on timer. | |
| Work at farm only | Citizens only generate income when assigned to a farm. | ✓ |

**User's choice:** Work at farm only
**Notes:** None

### How should builders know what to build?

| Option | Description | Selected |
|--------|-------------|----------|
| Nearest builder walks over | Closest idle builder walks to build point and constructs. | |
| Builder spawns from base | Dropping coins creates a builder at the base who walks to the site. | |
| You decide | Claude picks the approach. | |

**User's choice:** Custom — "After first upgrade of the main base we get one building for builder and one for archer. On the second upgrade of the main base we get to build farmers."
**Notes:** Main base upgrade progression unlocks role buildings. This is a core design decision that ties NPC roles to base progression.

### How does farming work?

| Option | Description | Selected |
|--------|-------------|----------|
| Farm is a structure | Build a farm at a build point, citizen assigned becomes farmer. | ✓ |
| Farmer is a role | Any citizen near a farm area automatically farms. | ✓ |
| You decide | Claude designs the mechanic. | |

**User's choice:** Both — farm is a buildable structure AND citizens near it auto-become farmers.
**Notes:** None

### How many vagrants at start?

| Option | Description | Selected |
|--------|-------------|----------|
| 3-5 at start, slow respawn | Few vagrants at start, new ones appear slowly at map edges. | ✓ |
| Fixed pool of ~8 | 8 vagrants at start, no respawn. | |
| You decide | Claude balances count. | |

**User's choice:** 3-5 at start, slow respawn
**Notes:** None

### What role do recruited citizens start as?

| Option | Description | Selected |
|--------|-------------|----------|
| Idle citizen first | Wander near base until assigned via building. | |
| Direct assignment | Choose role immediately by leading to a building. | |
| Auto-assign nearest | Auto-fill empty role slots. | |

**User's choice:** Custom — "Running to main base if outside and just slowly walk and idle at the main base. We can recruit also by saving them in random buildings, can be now or in the future — you decide."
**Notes:** Citizen runs to base on recruitment, idles there. Rescue from buildings deferred to future.

### Main base upgrade costs?

| Option | Description | Selected |
|--------|-------------|----------|
| Escalating (5, 15, 30) | Steep curve rewards efficient play. | ✓ |
| Linear (10, 20, 30) | Even progression. | |
| You decide | Claude balances costs. | |

**User's choice:** Escalating (5, 15, 30)
**Notes:** None

---

## Structure Types & Upgrades

### How should walls work?

| Option | Description | Selected |
|--------|-------------|----------|
| Single wall per build point | One wall segment, upgrade with more coins. | ✓ |
| Wall extends with coins | Dropping coins extends the wall wider. | |
| You decide | Claude designs wall mechanics. | |

**User's choice:** Single wall per build point
**Notes:** None

### How many build points across the world?

| Option | Description | Selected |
|--------|-------------|----------|
| 5-7 symmetric | Both sides of base, symmetric. | |
| 3-4 key positions | Fewer points, tighter strategy. | |
| You decide | Claude places build points. | ✓ |

**User's choice:** You decide
**Notes:** None

### How should tower placement work?

| Option | Description | Selected |
|--------|-------------|----------|
| Behind walls | Towers must be behind walls, positional strategy. | |
| Anywhere on build points | Flexible placement on any build point. | ✓ |
| You decide | Claude determines placement rules. | |

**User's choice:** Anywhere on build points
**Notes:** None

### What visual style for structures?

| Option | Description | Selected |
|--------|-------------|----------|
| Colored rectangles | Continue Phase 1 style, swap to sprites later. | ✓ |
| Simple pixel sprites | Create basic pixel art now. | |
| You decide | Claude picks visual approach. | |

**User's choice:** Colored rectangles (Recommended)
**Notes:** None

---

## HUD & Economy Display

### HUD position?

| Option | Description | Selected |
|--------|-------------|----------|
| Top-left | Keep existing position, familiar placement. | ✓ |
| Top-center | Centered, more prominent. | |
| Bottom bar | Thin bar at bottom. | |

**User's choice:** Top-left (Recommended)
**Notes:** None

### Day counter visual style?

| Option | Description | Selected |
|--------|-------------|----------|
| Simple text | "Day 3" as text. | |
| Icon + number | Sun/moon icon next to number. | |
| You decide | Claude picks consistent style. | ✓ |

**User's choice:** You decide
**Notes:** None

### HUD scope?

| Option | Description | Selected |
|--------|-------------|----------|
| Coins + day only | Minimal HUD, just requirements. | ✓ |
| Add NPC count | Also show citizen/builder/archer counts. | |
| You decide | Claude decides useful info. | |

**User's choice:** Coins + day only
**Notes:** None

---

## Main Base & Lose Condition

### Main base visual?

| Option | Description | Selected |
|--------|-------------|----------|
| Large rectangle | Single big rectangle. | |
| Multi-part structure | Connected rectangles, grows with upgrades. | ✓ |
| You decide | Claude designs base visual. | |

**User's choice:** Multi-part structure
**Notes:** None

### What happens when base is destroyed?

| Option | Description | Selected |
|--------|-------------|----------|
| Instant game over | Immediate GameOver transition. | |
| Dramatic collapse + game over | Crumble animation, delay, then GameOver. | ✓ |
| You decide | Claude picks based on art style. | |

**User's choice:** Dramatic collapse + game over
**Notes:** None

### Health bar visibility?

| Option | Description | Selected |
|--------|-------------|----------|
| Always visible | Health bar above base at all times. | |
| Only when damaged | Appears after taking damage. | ✓ |
| No health bar | Visual damage only, no bar. | |

**User's choice:** Only when damaged
**Notes:** None

---

## Claude's Discretion

- Build point count and positions across 6000px world
- Day counter visual style
- Main base upgrade 3 effect
- Vagrant respawn timing
- Farm coin generation rate
- Structure costs (walls, towers, farms)
- Builder construction speed and animation

## Deferred Ideas

- Rescue vagrants from random buildings on the map (future exploration phase)
