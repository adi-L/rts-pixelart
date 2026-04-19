# Phase 4: Combat & World Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 04-combat-world-polish
**Areas discussed:** Weapon pickup & types, Combat mechanics, Hero vulnerability, Skirmish map layout

---

## Weapon Pickup & Types

| Option | Description | Selected |
|--------|-------------|----------|
| World-placed only | Weapons at fixed locations in the world | |
| Zombie drops only | Zombies drop weapons on death | |
| Both sources | Pre-placed + zombie drops | |
| Other (user) | Armory structure unlocked at base level 3 | ✓ |

**User's choice:** Armory structure — a new buildable structure unlocked at main base level 3. Hero drops coins to build it, then picks up weapon there.
**Notes:** Fits the coin-drop mechanic perfectly. Building-based weapon acquisition, not random drops.

| Option | Description | Selected |
|--------|-------------|----------|
| One weapon (melee) | Single melee weapon | |
| Two weapons (melee + ranged) | Melee + ranged combo | |
| Ranged only (user) | One ranged weapon (gun) | ✓ |

**User's choice:** Ranged only — one gun weapon for MVP.
**Notes:** Futuristic setting drives this choice.

| Option | Description | Selected |
|--------|-------------|----------|
| Unlimited shots | Balanced by fire rate only | |
| Limited ammo, restock at armory | Must return to restock | ✓ |

**User's choice:** Limited ammo, restock at armory.

| Option | Description | Selected |
|--------|-------------|----------|
| Build once, free restocks | Construction costs, restocks free | |
| Build once, restocks cost coins | Both construction and restocks cost coins | ✓ |

**User's choice:** Build once, restocks cost coins.

| Option | Description | Selected |
|--------|-------------|----------|
| Spacebar to shoot | Would conflict with coin drop | |
| Dedicated attack key | Separate key for shooting | |
| Auto-fire at nearest zombie | Indirect control style | |
| Mouse aim + click (user) | Keyboard movement, mouse aim/fire | ✓ |

**User's choice:** Mouse aim and click to shoot. Keyboard for movement, mouse for aiming/firing.
**Notes:** User provided sprite reference images for gun. Twin-stick style control.

| Option | Description | Selected |
|--------|-------------|----------|
| Gun only rotates | Gun sprite rotates, hero body stays normal | ✓ |
| Hero faces mouse | Hero sprite flips to face mouse direction | |

**User's choice:** Gun sprite only rotates toward mouse cursor.

---

## Combat Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Small bullet (rectangle) | Colored rectangle, placeholder style | ✓ |
| Bullet sprite from assets | Sprite from gun spritesheet | |

**User's choice:** Small bullet rectangle, consistent with placeholder art.
**Notes:** User explicitly stated "no arrows at all — we are in the future."

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, convert to gunners | Rename archers, shoot bullets from towers | ✓ |
| Keep archers as-is | Leave Phase 3 implementation unchanged | |

**User's choice:** Convert archers to gunners. Fits the futuristic theme. Shared bullet pool.

| Option | Description | Selected |
|--------|-------------|----------|
| Damage + knockback | HP damage + push back | ✓ |
| Damage only | HP damage, no position change | |

**User's choice:** Damage + knockback — gives hero crowd control.

| Option | Description | Selected |
|--------|-------------|----------|
| Stop on first hit | Each bullet damages one zombie | ✓ |
| Pierce through | Bullet travels full range, hits all | |

**User's choice:** Stop on first hit.

**Combat balance values:** Claude's discretion (fire rate, damage, ammo clip size, restock cost).

---

## Hero Vulnerability

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, hero takes damage | Hero has HP, can die | ✓ |
| Hero is invulnerable | Only structures/NPCs are targets | |
| Knockback only, no HP | Push back without damage | |

**User's choice:** Hero takes damage from zombies.

| Option | Description | Selected |
|--------|-------------|----------|
| Game over | Same as base destroyed | ✓ |
| Respawn at base, lose coins | Kingdom Two Crowns style | |
| Respawn at base, lose weapon | Must restock at armory | |

**User's choice:** Hero death = game over. Two lose conditions.

| Option | Description | Selected |
|--------|-------------|----------|
| HUD health bar | Top of screen, always visible | ✓ |
| Above hero sprite | Floating, shown when damaged | |

**User's choice:** HUD health bar.

---

## Skirmish Map Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 6000px | Current size | |
| Expand to 8000-10000px | Double current | |
| 20000px (user) | Much larger world for exploration | ✓ |

**User's choice:** 20,000px world — "make the world much huge! we building city and we want to explore and also to expend"

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, reward zones at edges | Exploration zones with rewards | ✓ |
| No, defensive perimeter is boundary | Tighter scope | |

**User's choice:** Yes, reward zones at edges.

| Option | Description | Selected |
|--------|-------------|----------|
| Coin caches | Piles of coins | ✓ |
| Abandoned structures | Repairable ruins | ✓ |
| Vagrant camps | Recruit groups | ✓ |
| Resource buildings | Special bonus structures | ✓ |

**User's choice:** All four reward types in exploration zones.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, many more build points | Scaled up for 20000px | ✓ |
| Keep current count, spread wider | Same ~10 points | |

**User's choice:** Many more build points for progressive city expansion.

---

## Claude's Discretion

- Armory cost, ammo restock cost, clip size
- Fire rate, bullet damage, bullet speed, bullet pool size
- Hero HP, zombie damage to hero
- Gun sprite visual, rotation anchor
- Full 20,000px build point layout
- Exploration zone content placement and balancing
- Gunner stats (adapted from archer stats)

## Deferred Ideas

None — discussion stayed within phase scope.
