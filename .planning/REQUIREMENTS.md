# Requirements: Dead City

**Defined:** 2026-04-16
**Core Value:** The coin-drop mechanic — everything in the game is triggered by the hero moving to a location and dropping coins. No menus, no direct unit control. Move, collect, drop, survive.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Core Infrastructure

- [ ] **INFRA-01**: EventBus singleton for system-to-system communication
- [ ] **INFRA-02**: Object pooling for zombies and coins (no runtime create/destroy)
- [ ] **INFRA-03**: Physics world bounds set to full world width
- [ ] **INFRA-04**: Clean scene shutdown with listener cleanup

### Hero

- [ ] **HERO-01**: Hero moves left/right with keyboard controls
- [ ] **HERO-02**: Camera follows hero with parallax scrolling backgrounds
- [ ] **HERO-03**: Hero can pick up weapons found in the world or dropped by enemies
- [ ] **HERO-04**: Hero can attack zombies with equipped weapon

### Coin Economy

- [ ] **COIN-01**: Physical coins exist in the world and hero collects them on contact
- [ ] **COIN-02**: Hero drops coins at build points to trigger construction
- [ ] **COIN-03**: HUD shows current coin count
- [ ] **COIN-04**: HUD shows current day number

### NPCs

- [ ] **NPC-01**: Builder NPC picks up dropped coins and constructs/upgrades structures
- [ ] **NPC-02**: Citizen NPC walks around and generates passive coin income over time
- [ ] **NPC-03**: Archer NPC hunts by day (earns coins) and defends tower at night
- [ ] **NPC-04**: Farmer NPC works a farm for passive income

### Structures

- [ ] **STRC-01**: Wall blocks zombies, upgradeable (wood to stone), takes damage
- [ ] **STRC-02**: Tower provides archer position for night defense
- [ ] **STRC-03**: Main base is the central structure; lose condition if destroyed
- [ ] **STRC-04**: Build points at fixed locations where coins can be dropped

### Day/Night & Combat

- [ ] **WAVE-01**: Day/night cycle with visual tint transition
- [ ] **WAVE-02**: Zombie waves spawn from both map edges at night
- [ ] **WAVE-03**: Zombie difficulty escalates each night (more zombies, tougher)
- [ ] **WAVE-04**: Zombies attack nearest structure/unit, deal damage

### Map & World

- [ ] **MAP-01**: Tile-based side-scrolling world (hand-crafted layout)
- [ ] **MAP-02**: Placeholder pixel-art sprites replaceable via config
- [ ] **MAP-03**: One complete skirmish map with balanced layout

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Exploration

- **EXPL-01**: Explorable pre-placed structures (gas stations, warehouses) with coin/weapon rewards
- **EXPL-02**: World extends significantly beyond initial city area

### Vehicles

- **VEH-01**: Bike vehicle with speed boost for exploration
- **VEH-02**: Car vehicle with cargo capacity for carrying more coins
- **VEH-03**: Fuel mechanic — vehicles require fuel from gas stations

### Progression

- **PROG-01**: Milestone events on specific days (day 7, day 14...)
- **PROG-02**: Lose-then-continue mechanic (hero knocked back, coins drop, structures degrade)
- **PROG-03**: Multiple zombie types with different behaviors

### Polish

- **POL-01**: Audio feedback (weapon sounds, zombie sounds, ambient)
- **POL-02**: Environmental storytelling for tutorial (skeleton with coin near wall)
- **POL-03**: Camera lookahead in movement direction

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Direct unit control | Destroys the indirect-control design philosophy |
| Inventory management screen | Pulls player out of the physical world |
| Procedural world generation | Removes intentional pacing of hand-placed rewards |
| Pop-up tutorials | Use environmental storytelling instead |
| Multiplayer | Single player only for now |
| Multiple save slots | Single session survival — complexity not justified for v1 |
| Gem/secondary currency | One currency (coins) keeps systems simple |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| HERO-01 | Phase 1 | Pending |
| HERO-02 | Phase 1 | Pending |
| HERO-03 | Phase 4 | Pending |
| HERO-04 | Phase 4 | Pending |
| COIN-01 | Phase 1 | Pending |
| COIN-02 | Phase 1 | Pending |
| COIN-03 | Phase 2 | Pending |
| COIN-04 | Phase 2 | Pending |
| NPC-01 | Phase 2 | Pending |
| NPC-02 | Phase 2 | Pending |
| NPC-03 | Phase 3 | Pending |
| NPC-04 | Phase 2 | Pending |
| STRC-01 | Phase 2 | Pending |
| STRC-02 | Phase 2 | Pending |
| STRC-03 | Phase 2 | Pending |
| STRC-04 | Phase 2 | Pending |
| WAVE-01 | Phase 3 | Pending |
| WAVE-02 | Phase 3 | Pending |
| WAVE-03 | Phase 3 | Pending |
| WAVE-04 | Phase 3 | Pending |
| MAP-01 | Phase 1 | Pending |
| MAP-02 | Phase 1 | Pending |
| MAP-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 — traceability mapped after roadmap creation*
