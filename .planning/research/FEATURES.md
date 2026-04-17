# Feature Research

**Domain:** 2D Real-Time Strategy (sci-fi, asymmetric factions, weapon scavenging)
**Researched:** 2026-04-16
**Confidence:** HIGH (core RTS conventions are well-established; differentiator analysis informed by StarCraft/AoE/C&C design literature)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features players assume exist. Missing these = game feels broken or amateur.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Box-select + click-select units | Universal RTS convention since Dune II (1992). Any deviation feels broken. | LOW | Multi-unit box drag, shift-click to add/remove from selection |
| Right-click move/attack | Canonical input model. Players will right-click reflexively. | LOW | Right-click on ground = move; on enemy = attack-move |
| Control groups (Ctrl+1-9) | Required for multi-tasking. Top players hit 200-400 APM — keyboard control is the difference between manageable and overwhelming. | LOW | Number key recall, double-tap to camera-jump to group |
| Minimap | Players cannot manage a large battle without a strategic overview. The single most useful spatial navigation tool in the genre. | MEDIUM | Shows unit positions, fog of war state, click to pan camera |
| Resource counters (persistent HUD) | Economy is a core loop. Players must see current resources at all times without clicking anywhere. | LOW | Display both resources (common + rare) constantly, show income rate |
| Unit production queue | Players need to queue units while fighting elsewhere. No queue = constant babysitting of buildings. | LOW | Per-building queue, visual queue display, cancel individual items |
| Attack-move command | Without it, units path through enemies without engaging. Players expect "go here and fight what you find." | LOW | A-click or attack-move hotkey (A then click) |
| Basic unit pathfinding | Units must navigate around obstacles without getting stuck. Stuck units invalidate all tactical planning. | HIGH | A* or equivalent; group movement needs steering behaviors to avoid clumping |
| Fog of war | Core strategic tension. Without it, there is no scouting, no ambush, no information asymmetry — the strategy collapses. | MEDIUM | Unexplored (black) vs previously seen (shroud/grey) vs currently visible |
| Base building (structure placement) | Core economic and production loop. No structures = no game. | MEDIUM | Snap-to-grid or tile placement, building footprints, construction time |
| Unit production from buildings | Training units is the core action of the mid-game. | MEDIUM | Click building → select unit from panel → pays resources → unit spawns |
| Resource gathering (workers) | Economy needs an input loop. Workers harvest → deposit → repeat is the background engine of every game. | MEDIUM | Worker unit, resource nodes, home base deposit point |
| Win/loss conditions | Without objectives the game is aimless. Players need a goal. | LOW | Destroy enemy HQ, hold objective, or similar. Must communicate clearly via UI. |
| Combat auto-attack | Units must engage enemies when in range without player micromanagement for each shot. | LOW | Range check, attack cooldown, target selection (nearest/lowest-health) |
| Visual unit feedback | Selection rings, health bars, damage flashes — players need spatial feedback to understand what is happening. | LOW | Selection circle under unit, health bar above, hit flash on damage |
| Audio feedback (voice/sound) | Unit acknowledgment sounds ("Yes sir", "Acknowledged") and combat sounds are deeply expected — their absence feels unfinished. | LOW | Response on select, response on order, weapon fire sound, death sound |
| Camera pan + zoom | RTS maps are always bigger than the screen. Player must navigate freely. | LOW | WASD or edge-scroll pan, scroll-wheel zoom |
| Hotkeys for all common commands | Competitive and experienced players will not use a mouse for commands they execute hundreds of times per game. | LOW | Build, produce, attack-move, stop, hold, patrol — all hotkey-able |
| Unit roles with counters | Players expect different unit types to counter each other (infantry beats light vehicle; tanks beat infantry). No counter system = no strategy. | MEDIUM | Damage types, armor types, or explicit unit strengths/weaknesses |

---

### Differentiators (Competitive Advantage)

Features that make Ashes of Contact distinct. Not universally expected, but create the game's identity.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Weapon pickup from fallen units | Central identity mechanic. Every kill is a potential upgrade. Creates emergent power dynamics not present in any major RTS. Makes battles feel consequential beyond territory. | HIGH | Units carry a weapon slot; on kill, weapon drops to ground as lootable entity; any unit (cross-faction) can pick it up; weapon replaces current weapon slot |
| Asymmetric factions with different rules | Coalition upgrades via equipment; Veil mutates/evolves. Different base-building logic, unit production cadence, and visual language. Adds replayability and strategic identity. | HIGH | Must be implemented as data-driven config, not hardcoded logic. Each faction needs its own unit set, building set, and economy flavor. |
| Data-driven unit system (~50 types per faction) | Allows post-launch modding and rapid content addition without code changes. Makes the game a platform, not just a product. | MEDIUM | JSON/TypeScript config per unit: stats, sprite key, weapon, abilities, faction |
| Cross-faction weapon compatibility | Coalition units using alien weapons (and vice versa) creates visual incongruity that signals to players the scavenging happened. Deepens tactical identity. | MEDIUM | Dependent on weapon pickup system. Weapon sprite swaps on unit; stat effects apply regardless of faction. |
| Two-resource economy (common + rare) | Rare resource adds a second strategic dimension — what to spend it on forces prioritization. Differentiates from single-resource games (C&C) while staying simpler than 4-resource games (AoE). | LOW | Common = minerals/energy for standard production; Rare = alien material/tech for advanced units and upgrades |
| Veil mutation instead of upgrade | Alien structures are alive. Units mutate by spending rare resource, morphing visually. Contrasts with Coalition's equipment upgrade model. Creates clear faction identity via production fantasy. | HIGH | Requires morph animation or placeholder transformation effect. Mutation locked behind structure prerequisites. |
| Weapon upgrade progression | Units don't just get a weapon — better weapons are tiered (basic, mid, elite). Scavenged elite weapons give temporary advantage that tips fights without being permanent. | MEDIUM | Weapon data: damage, range, fire rate, tier. Tier affects how much advantage pickup confers. |
| Skirmish vs AI with multiple difficulty levels | Allows solo play before multiplayer is built. Critical for developer iteration — you can test the game without a second human. | HIGH | AI must execute: resource gather, build structures, train units, attack player. Difficulty = resource handicap + aggressiveness. |
| Tile-based maps with terrain types | Terrain (chokepoints, high ground, impassable) creates strategic map reading. Players who understand terrain win. | MEDIUM | Tile grid, passability per tile type, possible LOS bonus from elevation tiles |
| Objective-based win conditions beyond "destroy base" | Secondary objectives (hold zones, extract unit, survive N minutes) create scenario variety and campaign suitability. | MEDIUM | Win condition system: configurable per-map. Skirmish defaults to HQ destruction. Campaign maps use scenario-specific conditions. |

---

### Anti-Features (Things to Deliberately NOT Build)

Features that seem obviously good but create real problems for this project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Campaign mode (5-act story) in v1 | Narrative gives the game weight and replayability | Campaign requires polished maps, scripted events, cutscenes, voice, pacing, and testing — it is 3x the work of skirmish. Building it before skirmish is proven wastes effort on content players won't reach. | Build skirmish first. Use the faction lore as setting flavor in menus and unit flavor text. Campaign is explicitly v2+. |
| Multiplayer (1v1, co-op) in v1 | Most requested feature for RTS games | Networking requires authoritative game state, lockstep or rollback netcode, lobby system, and latency compensation. Adding this before the game loop is proven is an anti-pattern. | Skirmish AI as multiplayer substitute. Add networking as a discrete later milestone once the simulation is stable. |
| Map editor | Lets community create content | Requires a full additional tooling surface, serialization format, playtesting of community maps, and documentation. Infinite scope risk. | Hardcode 2-3 skirmish maps in v1. Design the map data format so a map editor could be added later without refactoring the format. |
| 12+ units per faction at launch | "More content = more value" | StarCraft launched with 9 units per race and AoE2 with ~30 units but 5 civilizations — breadth without depth creates balance nightmares and dilutes faction identity. | Start with 6-8 units per faction that are deep and well-tuned. Data-driven system makes adding units easy post-ship. |
| Fully animated unit sprites | Pixel art looks more polished with animation | Animation requires art assets that don't exist. Placeholder sprites with animation states (idle/walk/attack) will consume enormous time if per-unit. | Placeholder colored shapes or single-frame pixel sprites with directional facing (8 directions). Animation can be overlaid post-art-pass. |
| Complex hero units (RPG-level abilities) | Makes the game feel epic | Hero systems (cooldowns, leveling, item inventories) are a separate genre layer. They interact poorly with base RTS balance and double the ability management complexity. | Single-hero-character "Elias Vorn" appears in campaign cutscenes/flavor. In skirmish, any unit is nameable but mechanically identical to its type. |
| Ranked matchmaking | Adds competitive longevity | Matchmaking requires player accounts, ELO system, server infrastructure, and enough concurrent players to make matching work. Premature for v1. | Basic lobby (share link, join game) is sufficient for v1 multiplayer when it ships. |
| Procedurally generated maps | Infinite replayability | Procedural RTS maps require navigability guarantees, resource balance, faction start fairness, and choke-point logic. Extremely hard to get right. | Hand-craft 2-3 skirmish maps. Use a tile format that supports easy manual map creation. |

---

## Feature Dependencies

```
Resource Gathering
    └──requires──> Worker Unit
    └──requires──> Resource Nodes
    └──requires──> Home Base / Deposit Point

Base Building
    └──requires──> Resource Gathering (to pay for structures)
    └──requires──> Tile/Placement System

Unit Production
    └──requires──> Base Building (production buildings)
    └──requires──> Resource Gathering (to pay for units)

Combat System
    └──requires──> Unit Auto-Attack
    └──requires──> Unit Pathfinding
    └──requires──> Unit Roles + Counter System

Weapon Pickup (core differentiator)
    └──requires──> Combat System (units must die to drop weapons)
    └──requires──> Weapon entity system (weapon as droppable item)
    └──requires──> Unit weapon slot (units must have a swappable weapon)
    └──enhances──> Unit Roles (weapon tiers disrupt role hierarchy temporarily)

Fog of War
    └──requires──> Tile-based map (visibility calculated per tile)
    └──enhances──> Scouting (scout unit role becomes meaningful)
    └──enhances──> Weapon Pickup (you must find dropped weapons before opponents do)

Asymmetric Factions
    └──requires──> Data-driven unit system
    └──requires──> Separate building sets per faction
    └──enhances──> Weapon Pickup (cross-faction weapons create visual + mechanical surprise)

Tech Tree / Upgrades
    └──requires──> Base Building (upgrade buildings unlock tiers)
    └──requires──> Resource Gathering (to pay for research)
    └──enhances──> Weapon Pickup (weapon tier progression parallels tech tier)

Skirmish AI
    └──requires──> All of: Resource Gathering, Base Building, Unit Production, Combat System
    └──requires──> AI build-order scripting
    └──enhances──> Skirmish Mode (without AI, skirmish requires a human opponent)

Minimap
    └──requires──> Fog of War state to display correctly
    └──requires──> Camera system (click-to-pan)

Campaign Mode
    └──requires──> All table stakes
    └──requires──> All differentiators functioning and balanced
    └──requires──> Scripted event system
    └──requires──> Additional art/audio/narrative assets
    [defer to v2+]

Multiplayer
    └──requires──> Stable deterministic simulation
    └──requires──> Networking layer (lockstep/rollback)
    └──requires──> Lobby system
    [defer to v2+]
```

### Dependency Notes

- **Weapon Pickup requires Combat System:** Weapons only exist as droppable items after a unit dies. The entire mechanic depends on a functioning combat loop.
- **Fog of War requires Tile Map:** Tile-per-visibility is the standard implementation. Implementing fog before the tile system creates rework risk.
- **Skirmish AI requires everything:** The AI is a consumer of all other game systems. It cannot be built in isolation. It is the last major system to implement, not the first.
- **Asymmetric Factions enhance Weapon Pickup:** The most interesting version of weapon scavenging is when a Coalition unit picks up a Veil weapon — creates visible incongruity, narrative drama, and mechanical disruption. Both systems amplify each other.
- **Data-driven unit system enables Asymmetric Factions:** You cannot maintain two deeply different factions without config-driven unit definitions. This is a prerequisite, not a nice-to-have.

---

## MVP Definition

### Launch With — Skirmish v1

Minimum to validate the core game loop: build → gather → produce → fight → scavenge.

- [ ] Resource gathering (worker unit, two resource types, deposit at base)
- [ ] Base building (structure placement on tile grid, 3-4 structures per faction)
- [ ] Unit production (2-3 unit types per faction, production queue)
- [ ] Combat auto-attack with unit counters (2 damage types minimum)
- [ ] Weapon pickup from fallen units (the core differentiator — must ship in v1)
- [ ] Fog of war
- [ ] Box-select + control groups + attack-move + minimap
- [ ] One skirmish AI opponent (single difficulty, scripted build order)
- [ ] One playable map (hand-crafted, balanced starting positions)
- [ ] Win condition: destroy enemy HQ

### Add After Validation — Skirmish v1.x

Add once the core loop is proven fun.

- [ ] Additional unit types (expand to 6-8 per faction) — triggers when players ask "what else can I build?"
- [ ] Tech tree / upgrade research buildings — triggers when faction identity feels thin
- [ ] Multiple difficulty levels for AI — triggers when early testers say AI is too easy/hard
- [ ] 2-3 additional maps — triggers when single map creates stale games
- [ ] Coalition vs Veil asymmetric building differences — triggers when both factions feel the same

### Future Consideration — v2+

Defer until core loop is proven and team bandwidth exists.

- [ ] Multiplayer — defer: requires networking infrastructure and stable simulation
- [ ] Campaign mode (5 acts) — defer: requires scripting, art, narrative, and pacing work
- [ ] Map editor — defer: tooling investment, low impact on core game
- [ ] Hero unit (Elias Vorn as playable) — defer: hero system complexity, campaign context needed

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Resource gathering (worker + nodes) | HIGH | LOW | P1 |
| Base building (tile placement) | HIGH | MEDIUM | P1 |
| Unit production queue | HIGH | LOW | P1 |
| Combat auto-attack + death | HIGH | LOW | P1 |
| Weapon pickup from fallen units | HIGH | HIGH | P1 — core differentiator, must be in v1 |
| Box-select + control groups | HIGH | LOW | P1 |
| Attack-move | HIGH | LOW | P1 |
| Minimap | HIGH | MEDIUM | P1 |
| Fog of war | HIGH | MEDIUM | P1 |
| Skirmish AI (basic) | HIGH | HIGH | P1 — skirmish is unplayable without it |
| Two asymmetric factions | HIGH | HIGH | P1 — but start minimal, expand in v1.x |
| Data-driven unit config | HIGH | MEDIUM | P1 — prerequisite for factions |
| Tech tree / upgrade buildings | MEDIUM | MEDIUM | P2 |
| Multiple AI difficulties | MEDIUM | LOW | P2 |
| Additional maps | MEDIUM | LOW | P2 |
| Weapon upgrade tiers | MEDIUM | LOW | P2 |
| Campaign scripting system | HIGH | HIGH | P3 |
| Multiplayer networking | HIGH | HIGH | P3 |
| Map editor | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v1 skirmish launch
- P2: Add in v1.x iterations
- P3: v2+ future work

---

## Competitor Feature Analysis

| Feature | StarCraft (Blizzard) | Age of Empires II | Command & Conquer | Ashes of Contact Approach |
|---------|---------------------|-------------------|-------------------|--------------------------|
| Factions | 3 deeply asymmetric races | 35 civs, slight asymmetry | 2-3 factions, moderate asymmetry | 2 deeply asymmetric factions (StarCraft model) |
| Economy | 2 resources (minerals + gas) | 4 resources (food, wood, gold, stone) | 1 resource (tiberium/money) | 2 resources (common + rare) — closer to SC |
| Tech tree | Structure-gated, per-building research | Age progression unlocks tiers | Build-order unlock (no explicit research) | Structure-gated per-faction with data-driven config |
| Unit count | ~9-12 per faction | ~30 per civ | ~15-20 per faction | Start 6-8, expand to ~15 per faction |
| Weapon system | Fixed per unit | Fixed per unit | Fixed per unit | **Swappable via pickup (unique)** |
| Upgrade model | Research in specific buildings | Research in universities/smithies | Tech center unlocks | Coalition: equipment research; Veil: mutation |
| AI | Scripted with difficulty tiers | Scripted + some adaptive | Scripted | Scripted build-order, single difficulty first |
| Campaigns | 2-3 per race, narrative cutscenes | 6 campaigns, historical missions | Per-faction campaigns | Planned 5-act campaign — v2+ only |
| Multiplayer | Core feature at launch | Core feature at launch | Core feature at launch | Deferred — skirmish AI first |

---

## Sources

- [RTS Game Design Fundamentals — gamedesignskills.com](https://gamedesignskills.com/game-design/real-time-strategy/)
- [Seven Deadly Sins of Strategy Game Design — Soren Johnson, Game Developer](https://www.gamedeveloper.com/business/seven-deadly-sins-of-strategy-game-design)
- [Group Pathfinding & Movement in RTS Games — Game Developer](https://www.gamedeveloper.com/programming/group-pathfinding-movement-in-rts-style-games)
- [The Tapestry of RTS Design: Upgrades and Research — Wayward Strategy](https://waywardstrategy.com/2020/06/08/the-tapestry-of-rts-design-upgrades-and-research/)
- [What Makes RTS Games Fun: Asymmetric Design — GameCloud](https://gamecloud.net.au/features/opinion/what-makes-rts-games-fun-asymmetric-design)
- [UI Strategy Game Design Dos and Don'ts — Game Developer](https://www.gamedeveloper.com/design/ui-strategy-game-design-dos-and-don-ts)
- [Let's Talk RTS User Interface — Interview with Dave Pottinger, Wayward Strategy](https://waywardstrategy.com/2015/05/04/lets-talk-rts-user-interface-part-1-interview-with-dave-pottinger/)
- [RTS Fog of War implementation — jdxdev](https://www.jdxdev.com/blog/2022/06/08/rts-fog-of-war/)
- [Age of Empires Forum — RTS Gameplay Handling (community design discussion)](https://forums.ageofempires.com/t/good-rts-gameplay-handling-like-smart-select-auto-production-smart-gathering-auto-attacks-resources-abundance-pathfinding-build-grid-compact-ui-map-clearing-size-choke-point/72905)
- [RTS Balancing Research — valdiviadev.github.io](https://valdiviadev.github.io/RTS-balancing-research/)
- [5 RTS Mechanics That Changed The Genre — The Gamer](https://www.thegamer.com/rts-mechanics-changed-genre-outdated/)
- Reference games analyzed: StarCraft (1998/2010), Age of Empires II (1999/2019 DE), Command & Conquer: Tiberian Dawn (1995), Command & Conquer: Red Alert 2 (2000), Company of Heroes (2006), Warcraft III (2002)

---
*Feature research for: Ashes of Contact — 2D sci-fi RTS*
*Researched: 2026-04-16*
