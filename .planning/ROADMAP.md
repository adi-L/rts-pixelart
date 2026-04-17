# Roadmap: Dead City

## Overview

Dead City is built in four phases that follow the game's dependency chain. Phase 1 proves the coin-drop mechanic in isolation — hero moves, picks up coins, drops them. Phase 2 wires the full indirect-control loop with autonomous NPCs and buildable structures. Phase 3 adds the existential threat: day/night cycle and zombie waves that test everything built so far. Phase 4 completes the hero's combat agency and delivers a balanced, playable skirmish map.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Hero Loop** - Architectural reset, scrolling world, hero movement, physical coin collection/drop
- [ ] **Phase 2: Citizen Economy & Structures** - HUD, autonomous NPCs (builder/citizen/farmer), all buildable structures
- [ ] **Phase 3: Day/Night & Zombie Waves** - Day/night cycle, nightly zombie waves, archer defense, escalating difficulty
- [ ] **Phase 4: Combat & World Polish** - Hero weapons, hero combat, complete skirmish map

## Phase Details

### Phase 1: Foundation & Hero Loop
**Goal**: The coin-drop mechanic is playable — hero moves through a scrolling world, collects coins, and drops them at a build point
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, HERO-01, HERO-02, COIN-01, COIN-02, MAP-01, MAP-02
**Success Criteria** (what must be TRUE):
  1. Hero walks left and right with keyboard input and the camera follows with parallax scrolling
  2. Physical coins appear in the world and disappear into the hero's count on contact
  3. Hero can drop coins at a designated build point and the interaction fires
  4. Object pool is in use — no coins or entities are created/destroyed at runtime after initial spawn
  5. Scene shuts down cleanly with no lingering listeners or physics bodies
**Plans**: TBD

### Phase 2: Citizen Economy & Structures
**Goal**: The indirect-control loop is complete — citizens generate coins, builders construct structures when coins are dropped, and the main base exists as a lose condition
**Depends on**: Phase 1
**Requirements**: COIN-03, COIN-04, NPC-01, NPC-02, NPC-04, STRC-01, STRC-02, STRC-03, STRC-04
**Success Criteria** (what must be TRUE):
  1. HUD shows current coin count and current day number, updating in real time
  2. Citizens walk autonomously and the coin count grows passively over time without player action
  3. Dropping coins at a build point causes a builder to pick them up and construct a wall or tower
  4. Walls and towers are upgradeable by dropping more coins at the same build point
  5. The main base structure exists on the map and its destruction triggers a lose state
**Plans**: TBD
**UI hint**: yes

### Phase 3: Day/Night & Zombie Waves
**Goal**: The survival loop is active — the world transitions between day and night, zombies attack from both edges at night, and the archer NPC defends from towers
**Depends on**: Phase 2
**Requirements**: NPC-03, WAVE-01, WAVE-02, WAVE-03, WAVE-04
**Success Criteria** (what must be TRUE):
  1. World visibly transitions from day to night with a color tint change
  2. Zombies spawn from both map edges when night begins and march toward structures
  3. Zombies deal damage to walls, towers, and the main base on contact
  4. Each successive night spawns more zombies than the previous one
  5. An archer NPC stationed in a tower attacks incoming zombies automatically at night
**Plans**: TBD

### Phase 4: Combat & World Polish
**Goal**: The hero can fight, the world is explorable, and the game is a complete playable skirmish
**Depends on**: Phase 3
**Requirements**: HERO-03, HERO-04, MAP-03
**Success Criteria** (what must be TRUE):
  1. Hero can pick up a weapon found in the world (or dropped by a zombie)
  2. Hero attacks zombies with the equipped weapon and the zombie takes damage
  3. A complete hand-crafted skirmish map exists with balanced build points, coin sources, and zombie spawn edges
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Hero Loop | 0/TBD | Not started | - |
| 2. Citizen Economy & Structures | 0/TBD | Not started | - |
| 3. Day/Night & Zombie Waves | 0/TBD | Not started | - |
| 4. Combat & World Polish | 0/TBD | Not started | - |
