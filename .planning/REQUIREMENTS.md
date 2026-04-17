# Requirements: Ashes of Contact

**Defined:** 2026-04-16
**Core Value:** The weapon pickup system — units start with basic weapons and upgrade by scavenging from dead enemies, making every encounter change the balance of power.

## v1 Requirements

Requirements for initial skirmish release. Each maps to roadmap phases.

### Core Infrastructure

- [ ] **INFRA-01**: Game uses seeded RNG singleton for all game logic randomness
- [ ] **INFRA-02**: Game runs on a fixed-tick update loop (simulation decoupled from rendering)
- [ ] **INFRA-03**: All game entities use object pooling (no runtime create/destroy)
- [ ] **INFRA-04**: Typed EventBus for system-to-system communication

### Map

- [ ] **MAP-01**: User can play on a tile-based grid map with different terrain types
- [ ] **MAP-02**: Units pathfind around obstacles using A* navigation
- [ ] **MAP-03**: Map supports impassable terrain, chokepoints, and resource locations

### Economy

- [ ] **ECON-01**: Worker units harvest two resource types (common + rare) from nodes
- [ ] **ECON-02**: Workers deposit resources at the main base structure
- [ ] **ECON-03**: User can place structures on the tile grid with construction time
- [ ] **ECON-04**: Buildings produce units with a queue system (pay resources to train)

### Units & Factions

- [ ] **UNIT-01**: Data-driven unit definitions loaded from config (stats, sprite key, weapon, faction)
- [ ] **UNIT-02**: Two factions: Coalition (humans) and Veil (aliens) with distinct unit rosters
- [ ] **UNIT-03**: 6-8 unit types per faction (builder, scout, infantry, ranged, heavy, special)
- [ ] **UNIT-04**: Coalition has robot unit types; Veil has spaceship unit types
- [ ] **UNIT-05**: Placeholder pixel-art sprites that are trivially replaceable via config

### Combat

- [ ] **CMBT-01**: Units auto-attack enemies within range with cooldown-based attacks
- [ ] **CMBT-02**: Damage type / armor type counter system (rock-paper-scissors balance)
- [ ] **CMBT-03**: Visible projectiles travel from attacker to target (bullets, plasma bolts, etc.)
- [ ] **CMBT-04**: Projectile visuals differ by weapon type (ballistic, energy, bio)
- [ ] **CMBT-05**: Units drop their weapon on death as a lootable ground entity
- [ ] **CMBT-06**: Any unit can pick up any dropped weapon (cross-faction compatible)
- [ ] **CMBT-07**: Weapons have tiers (basic, mid, elite) affecting damage/range/fire rate
- [ ] **CMBT-08**: Health bars, selection rings, and hit flash visual feedback on all units

### Controls & UI

- [ ] **UI-01**: User can box-select and click-select units
- [ ] **UI-02**: User can assign and recall control groups (Ctrl+1-9, double-tap to jump)
- [ ] **UI-03**: Right-click to move (ground) or attack (enemy); attack-move command (A+click)
- [ ] **UI-04**: Minimap showing unit positions with click-to-pan
- [ ] **UI-05**: Persistent HUD with resource counters, production panel, and unit info
- [ ] **UI-06**: Hotkeys for all common commands (build, produce, attack-move, stop)

### AI & Game Mode

- [ ] **AI-01**: Skirmish AI opponent that gathers resources, builds base, trains units, and attacks
- [ ] **AI-02**: At least one hand-crafted skirmish map with balanced starting positions

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Vision & Map

- **FOG-01**: Fog of war with unexplored/shrouded/visible states per tile
- **FOG-02**: Minimap reflects fog of war state

### Factions

- **FACT-01**: Coalition upgrades equipment; Veil mutates — asymmetric production mechanics
- **FACT-02**: Veil structures are alive with organic visual style

### Game Modes

- **MODE-01**: Objective-based win conditions (hold zones, extract unit, survive timer)
- **MODE-02**: Multiple AI difficulty levels (resource handicap + aggressiveness)

### Audio

- **AUD-01**: Unit voice acknowledgment sounds on select and order
- **AUD-02**: Weapon fire sounds and death sounds
- **AUD-03**: Ambient battlefield audio

### Camera

- **CAM-01**: Camera pan via WASD/edge-scroll and scroll-wheel zoom

### Campaign & Multiplayer

- **CAMP-01**: 5-act campaign ("Ashes of Contact" story with Elias Vorn)
- **MP-01**: 1v1 online multiplayer
- **MP-02**: Team games and co-op campaign
- **MP-03**: Basic lobby system (share link, join game)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Map editor | Tooling investment, low impact on core game. Design map format for future editor compatibility. |
| Ranked matchmaking | Requires accounts, ELO, server infra, and player base. Basic lobby sufficient for v1 multiplayer. |
| Procedurally generated maps | Hard to guarantee navigability, balance, and fairness. Hand-craft maps instead. |
| Complex hero RPG abilities | Hero system (cooldowns, leveling, inventories) is a separate genre layer. Elias Vorn is campaign/flavor only. |
| Fully animated sprites | Placeholder sprites first. Animation overlaid post-art-pass. |
| 50 unit types per faction at launch | Start with 6-8 deep and well-tuned. Data-driven system makes expansion trivial. |
| Mobile app | Web-first, browser only |
| 3D graphics | Strictly 2D pixel art |
| Microtransactions | Not in scope |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | — | Pending |
| INFRA-02 | — | Pending |
| INFRA-03 | — | Pending |
| INFRA-04 | — | Pending |
| MAP-01 | — | Pending |
| MAP-02 | — | Pending |
| MAP-03 | — | Pending |
| ECON-01 | — | Pending |
| ECON-02 | — | Pending |
| ECON-03 | — | Pending |
| ECON-04 | — | Pending |
| UNIT-01 | — | Pending |
| UNIT-02 | — | Pending |
| UNIT-03 | — | Pending |
| UNIT-04 | — | Pending |
| UNIT-05 | — | Pending |
| CMBT-01 | — | Pending |
| CMBT-02 | — | Pending |
| CMBT-03 | — | Pending |
| CMBT-04 | — | Pending |
| CMBT-05 | — | Pending |
| CMBT-06 | — | Pending |
| CMBT-07 | — | Pending |
| CMBT-08 | — | Pending |
| UI-01 | — | Pending |
| UI-02 | — | Pending |
| UI-03 | — | Pending |
| UI-04 | — | Pending |
| UI-05 | — | Pending |
| UI-06 | — | Pending |
| AI-01 | — | Pending |
| AI-02 | — | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 0
- Unmapped: 32

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after initial definition*
