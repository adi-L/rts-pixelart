# Phase 3: Day/Night & Zombie Waves - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 03-day-night-zombie-waves
**Areas discussed:** Day/Night cycle timing, Zombie behavior & spawning, Archer NPC mechanics, Difficulty escalation

---

## Day/Night Cycle Timing

| Option | Description | Selected |
|--------|-------------|----------|
| 60 seconds total | ~40s day / ~20s night. Fast-paced, Kingdom Two Crowns ratio. | |
| 90 seconds total | ~60s day / ~30s night. More breathing room. | |
| 120 seconds total | ~80s day / ~40s night. Generous pacing. | |

**User's choice:** 10 min day, 8 min night (18 min total cycle)
**Notes:** User specified custom timing — much longer than any presented option. Deliberate, strategic pacing.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Gradual tint overlay | Dark blue/purple rectangle fades in over ~10-15 seconds. | ✓ |
| Sudden snap | Instant switch. More arcade-like. | |
| Multi-stage transition | Sunset → dusk → night → dawn → day. Multiple color stops. | |

**User's choice:** Gradual tint overlay
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Visual warning | Screen-edge flash or HUD indicator ~15-30 seconds before nightfall. | ✓ |
| No warning | Night just arrives. Player judges timing. | |
| You decide | Claude picks appropriate warning signal. | |

**User's choice:** Visual warning
**Notes:** None

---

## Zombie Behavior & Spawning

| Option | Description | Selected |
|--------|-------------|----------|
| Straight march | Walk in straight line from map edge toward nearest structure. | ✓ |
| Nearest-target seeking | Dynamically retarget to closest structure/NPC. | |
| Main base beeline | Always walk toward main base, ignore outer structures. | |

**User's choice:** Straight march
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Stop and attack | Stop at first structure, attack every ~2s. Move on when destroyed. | ✓ |
| Swarm and stack | Multiple zombies pile up on same structure. | |
| You decide | Claude picks attack behavior. | |

**User's choice:** Stop and attack
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Colored rectangles | Green/dark-green rectangles, same size as citizens. Placeholder style. | ✓ |
| Existing spritesheet | Check assets/ for enemy sprites. | |
| You decide | Claude picks what fits. | |

**User's choice:** Colored rectangles
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — zombies kill NPCs | Zombie reaches unprotected NPC, kills them. Real stakes. | ✓ |
| No — structures only | Zombies only target structures. | |
| NPCs flee instead | NPCs run away but can't be killed. | |

**User's choice:** Yes — zombies kill NPCs
**Notes:** None

---

## Archer NPC Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Coin drop at tower | Same pattern as builder hut. Drop coins at built tower to convert citizen. | ✓ |
| Auto-assign on tower build | Nearest citizen auto-becomes archer when tower built. | |
| Separate archer hut | New build point type for training archers. | |

**User's choice:** Coin drop at tower
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hunt for coins | Leave tower during day, wander, hunt, earn coins. Return before nightfall. | ✓ |
| Stay in tower | Remain stationed 24/7. No economy contribution. | |
| You decide | Claude picks day behavior. | |

**User's choice:** Hunt for coins
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Small projectile line | Yellow/white line from tower to zombie. Object-pooled. | ✓ |
| Instant hit with flash | No projectile, instant damage with flash effect. | |
| You decide | Claude picks cleanest approach. | |

**User's choice:** Small projectile line
**Notes:** None

---

## Difficulty Escalation

| Option | Description | Selected |
|--------|-------------|----------|
| Linear growth | Start ~3-4 zombies night 1, add 2-3 per night. | ✓ |
| Exponential growth | Double every 2-3 nights. | |
| You decide | Claude picks scaling formula. | |

**User's choice:** Linear growth
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Count only for MVP | Same HP/speed/damage for all zombies. Only count increases. | ✓ |
| Count + speed increase | Zombies also get slightly faster each night. | |
| Count + HP increase | Zombies get tougher each night. | |

**User's choice:** Count only for MVP
**Notes:** Different zombie types deferred to v2 (PROG-03).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Staggered over the night | Trickle in from both edges throughout the 8-minute night. | ✓ |
| All at once at nightfall | Every zombie spawns immediately when night begins. | |
| Multiple mini-waves | 2-3 distinct bursts with pauses. | |

**User's choice:** Staggered over the night
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Zombies die at dawn | All surviving zombies disintegrate when day begins. Clean slate. | ✓ |
| Zombies retreat | Turn around and walk back to map edges. | |
| Zombies persist | Stay until killed. Most punishing. | |

**User's choice:** Zombies die at dawn
**Notes:** Kingdom Two Crowns style — sunrise is relief.

---

## Claude's Discretion

- Zombie walk speed, HP, and damage values
- Archer fire rate, range, and damage per arrow
- Archer hunt coin generation rate and wander distance
- Nightfall warning visual style
- Zombie spawn interval formula
- Arrow pool size
- Archer return-to-tower timing

## Deferred Ideas

None — discussion stayed within phase scope.
