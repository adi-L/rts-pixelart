---
phase: 02-citizen-economy-structures
verified: 2026-04-17T19:00:00Z
status: human_needed
score: 5/5
overrides_applied: 0
human_verification:
  - test: "HUD displays coin count and Day 1 at top-left, updating in real time on coin pickup/spend/farm income"
    expected: "Gold circle + number at top-left, Day 1 text. Number increments on coin pickup and farm income, decrements on spend."
    why_human: "Visual positioning and real-time update timing cannot be verified programmatically"
  - test: "Vagrant recruitment flow: walk to map edge, find gray rectangle, press SPACE, vagrant flashes white then turns blue and runs to base"
    expected: "Gray NPC at map edges, coin spent, white flash, color change to blue, NPC runs to center, converts to citizen"
    why_human: "Animation sequence, timing, and visual feedback require runtime observation"
  - test: "Channel deposit mechanic: press SPACE near build point, coins drop one by one, walk away to cancel/refund"
    expected: "Coins animate from hero to ground near build point, structure appears on full funding, walking away refunds coins"
    why_human: "Channel mechanic with walk-away cancel is a UX flow requiring interactive testing"
  - test: "Main base upgrades through tiers with growing wings, and destruction triggers GameOver"
    expected: "Base grows wider with wings at tier 2+, crown at max. HP depletion triggers shake/collapse/fade/GameOver scene"
    why_human: "Multi-stage visual upgrade sequence and destruction animation require runtime observation"
  - test: "Farm economy loop: farmer auto-assigns when citizen near farm, +1 gold text floats up every 8 seconds"
    expected: "Green farmer NPC paces on farm, +1 text appears periodically, coin count increments"
    why_human: "Timer-based income generation and float text animation require runtime observation"
---

# Phase 2: Citizen Economy & Structures Verification Report

**Phase Goal:** The indirect-control loop is complete -- citizens generate coins, builders construct structures when coins are dropped, and the main base exists as a lose condition
**Verified:** 2026-04-17T19:00:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | HUD shows current coin count and current day number, updating in real time | VERIFIED | `src/ui/HUD.ts` renders coin icon + count + "Day 1", listens to `economy:changed` EventBus events. Wired in Game.ts line 86 |
| 2 | Citizens walk autonomously and the coin count grows passively over time without player action | VERIFIED | `Citizen.ts` wanders near base. `Farmer.ts` calls `economy.addCoins(1, 'farm')` on `FARM_COIN_INTERVAL` timer. `Game.ts` auto-assigns citizens near farms via `checkFarmProximity()` |
| 3 | Dropping coins at a build point causes a structure to be constructed | VERIFIED | `Game.ts` channel deposit mechanic funds build point via `fundFull()`, then calls `structureManager.completeConstruction()`. Builder NPC also exists and can construct via funded build points. Deviation: instant construction on fund (user-requested) |
| 4 | Walls and towers are upgradeable by dropping more coins at the same build point | VERIFIED | `Wall.ts` has `upgradeToStone()`. `StructureManager.completeConstruction()` handles wall upgrade path. BuildPoint transitions to `Upgradeable` state after wall built, shows marker for more coins |
| 5 | The main base structure exists on the map and its destruction triggers a lose state | VERIFIED | `MainBase.ts` at x=3000 with 4 upgrade tiers, wings, crown. `takeDamage()` triggers `destroyBase()` at 0 HP: shake, collapse, flash, fade, `scene.start('GameOver')`. GameOver shows "YOUR CITY HAS FALLEN" with ENTER restart |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/constants.ts` | Phase 2 constants (NPC, structure, HUD, economy, build point layout) | VERIFIED | Contains `BUILD_POINT_LAYOUT`, `BuildPointType`, `BuildPointConfig`, all NPC/structure/HUD constants, flag pole constants |
| `src/systems/EconomyManager.ts` | Central coin/day state with event emission | VERIFIED | Exports `EconomyManager` with `addCoins`, `spendCoins`, `setDay`, `reset`. Emits `economy:changed` via EventBus |
| `src/ui/HUD.ts` | Camera-fixed coin count + day display | VERIFIED | Exports `HUD` with coin icon, coin text, day text. `setScrollFactor(0)`, `setDepth(HUD_DEPTH)`. Listens/cleans EventBus |
| `src/entities/npc/BaseNPC.ts` | Base class for all NPCs | VERIFIED | Abstract class with rectangle sprite, physics body, `moveToward`, `destroy` |
| `src/entities/npc/Vagrant.ts` | Vagrant with wander/recruit/run-to-base | VERIFIED | 3-state machine, `recruit()`, emits `npc:arrived-at-base` |
| `src/entities/npc/Citizen.ts` | Citizen with idle/wander near base | VERIFIED | 2-state machine, wanders with 2s pause |
| `src/entities/npc/Builder.ts` | Builder that constructs structures | VERIFIED | 4-state machine (Idle/WalkToSite/Building/Returning), hammer tween, calls `structureManager.completeConstruction()` |
| `src/entities/npc/Farmer.ts` | Farmer that generates coins | VERIFIED | 2-state machine, `economy.addCoins(1, 'farm')` on timer, +1 float text |
| `src/entities/structures/BaseStructure.ts` | Base class with HP, health bar, upgrade | VERIFIED | HP system, health bar hidden at full HP, `takeDamage` with red flash, `upgradeVisual` with scale pulse |
| `src/entities/structures/Wall.ts` | Wall with wood/stone upgrade | VERIFIED | `upgradeToStone()`, `isMaxTier` getter |
| `src/entities/structures/Tower.ts` | Tower with platform indicator | VERIFIED | Platform rectangle at top |
| `src/entities/structures/Farm.ts` | Farm with active pulse | VERIFIED | `setActive(boolean)` toggles alpha pulse tween |
| `src/entities/structures/BuilderHut.ts` | Builder hut for role assignment | VERIFIED | Simple structure extending BaseStructure |
| `src/entities/structures/MainBase.ts` | Multi-part base with tiers and destruction | VERIFIED | 4 upgrade tiers, wings, crown, destruction sequence to GameOver |
| `src/entities/BuildPoint.ts` | Build point with type, state machine, flag indicator | VERIFIED | `BuildPointState` enum, `fundFull()`, flag pole + banner + coin text, cost getter |
| `src/systems/StructureManager.ts` | Build-point-to-structure lifecycle | VERIFIED | Listens `coin:deposited`, `base:upgraded`. Manages build points from `BUILD_POINT_LAYOUT`. `completeConstruction()`, `getBuilderTarget()`, `updateProximity()` |
| `src/systems/NPCManager.ts` | NPC spawn, recruitment, conversion | VERIFIED | Spawns 4 initial vagrants, respawn timer, `tryRecruitNearby()`, `convertVagrantToCitizen()`, updates all NPCs |
| `src/scenes/GameOver.ts` | Game over with correct text and restart | VERIFIED | "YOUR CITY HAS FALLEN", "Press ENTER to restart", black background, ENTER key + pointer restart |
| `src/scenes/Game.ts` | Full integration of all Phase 2 systems | VERIFIED | EconomyManager, StructureManager, NPCManager, HUD initialized. Channel deposit mechanic, vagrant recruitment, role assignment, farm proximity, shutdown cleanup |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| EconomyManager.ts | EventBus.ts | `EventBus.emit('economy:changed')` | WIRED | Lines 12, 18, 24 |
| HUD.ts | EconomyManager.ts | `EventBus.on('economy:changed')` | WIRED | Line 41 |
| Vagrant.ts | EventBus.ts | `EventBus.emit('npc:arrived-at-base')` | WIRED | Line 60 |
| BaseNPC.ts | constants.ts | `import NPC_WIDTH` | WIRED | Line 2 |
| MainBase.ts | GameOver.ts | `scene.scene.start('GameOver')` | WIRED | Line 125 |
| StructureManager.ts | EventBus.ts | `EventBus.on('coin:deposited')` | WIRED | Line 60 |
| NPCManager.ts | EventBus.ts | `EventBus.on('npc:arrived-at-base')` | WIRED | Line 52 |
| Builder.ts | StructureManager.ts | `structureManager.completeConstruction()` | WIRED | Line 126 |
| Farmer.ts | EconomyManager.ts | `economy.addCoins(1, 'farm')` | WIRED | Line 75 |
| Game.ts | EconomyManager.ts | `this.economy.addCoins/spendCoins` | WIRED | Lines 96, 237 |
| Game.ts | StructureManager.ts | `this.structureManager.updateProximity/completeConstruction` | WIRED | Lines 133, 283 |
| Game.ts | NPCManager.ts | `this.npcManager.update/tryRecruitNearby` | WIRED | Lines 136, 166 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| HUD.ts | coinText/dayText | EconomyManager via EventBus `economy:changed` | Yes -- addCoins/spendCoins emit with real coin/day values | FLOWING |
| Farmer.ts | coin generation | economy.addCoins(1, 'farm') on FARM_COIN_INTERVAL timer | Yes -- timer callback calls addCoins which updates real state | FLOWING |
| Game.ts | economy | EconomyManager instance | Yes -- pickup overlap, channel deposit, recruitment all route through economy | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles | `npx tsc --noEmit` | Zero errors | PASS |
| All Phase 2 files exist | `ls src/systems/ src/ui/ src/entities/npc/ src/entities/structures/` | All 18 expected files present | PASS |
| No coinCount in Game.ts | `grep 'private coinCount' src/scenes/Game.ts` | No match | PASS |
| EconomyManager wired in Game.ts | `grep 'this.economy' src/scenes/Game.ts` | Multiple matches (lines 83, 96, 180, 237, 310) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-----------|-------------|--------|----------|
| COIN-03 | 02-01 | HUD shows current coin count | SATISFIED | HUD.ts displays coin count, updates via economy:changed events |
| COIN-04 | 02-01 | HUD shows current day number | SATISFIED | HUD.ts displays "Day 1", updates via economy:changed events |
| NPC-01 | 02-04, 02-05 | Builder NPC picks up dropped coins and constructs/upgrades structures | SATISFIED | Builder.ts walks to funded build points, constructs via StructureManager. Game.ts also has instant construction path |
| NPC-02 | 02-02 | Citizen NPC walks around and generates passive coin income over time | SATISFIED | Citizen wanders near base. Citizens auto-convert to Farmers near farms. Farmers generate passive income via FARM_COIN_INTERVAL |
| NPC-04 | 02-04, 02-05 | Farmer NPC works a farm for passive income | SATISFIED | Farmer.ts paces on farm, generates coins via economy.addCoins(1, 'farm') every 8s |
| STRC-01 | 02-03 | Wall blocks zombies, upgradeable (wood to stone), takes damage | SATISFIED | Wall.ts with wood/stone upgrade, BaseStructure HP + takeDamage. Blocking zombies is Phase 3 scope |
| STRC-02 | 02-03 | Tower provides archer position for night defense | SATISFIED | Tower.ts with platform indicator. Archer NPC is Phase 3 scope |
| STRC-03 | 02-04 | Main base is the central structure; lose condition if destroyed | SATISFIED | MainBase.ts at x=3000, 4 upgrade tiers, destruction triggers GameOver |
| STRC-04 | 02-03 | Build points at fixed locations where coins can be dropped | SATISFIED | BuildPoint.ts with BUILD_POINT_LAYOUT (10 symmetric positions), flag pole indicators, cost display, fundFull mechanic |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/entities/Coin.ts | 8 | "placeholder coin texture" comment | Info | Phase 1 texture utility -- refers to programmatic texture, not a stub |

No blockers, no warnings. The codebase is clean of TODO/FIXME/PLACEHOLDER stubs in Phase 2 files.

### Human Verification Required

### 1. HUD Real-Time Display

**Test:** Run `npm run dev`, collect coins, verify HUD updates
**Expected:** Gold circle + coin count at top-left, "Day 1" text. Count increments on pickup, decrements on spend
**Why human:** Visual positioning and real-time update timing require runtime observation

### 2. Vagrant Recruitment Flow

**Test:** Walk to map edge, find gray vagrant, press SPACE near it
**Expected:** Coin spent, vagrant flashes white, turns blue, runs to center, converts to citizen
**Why human:** Animation sequence and color transition require visual confirmation

### 3. Channel Deposit Mechanic

**Test:** Walk to a build point flag, press SPACE, watch coins animate, then walk away mid-channel
**Expected:** Coins drop one by one from hero to ground, walking away refunds all spent coins. Completing deposit builds structure
**Why human:** Interactive UX flow with walk-away cancel needs manual testing

### 4. Base Upgrade and Destruction

**Test:** Drop coins at main base to upgrade through tiers. Then trigger damage to destroy it
**Expected:** Base grows with wings at tier 2+, crown at tier 4. Destruction: shake, debris, red flash, fade, GameOver
**Why human:** Multi-stage visual sequence requires runtime observation

### 5. Farm Economy Loop

**Test:** Build farm (requires tier 3 base), wait for citizen to auto-convert to farmer
**Expected:** Green farmer paces on farm, "+1" gold text floats up every ~8 seconds, coin count increments
**Why human:** Timer-based passive income and float animation need runtime verification

### Gaps Summary

No automated gaps found. All 5 roadmap success criteria are verified at the code level. All 9 requirement IDs (COIN-03, COIN-04, NPC-01, NPC-02, NPC-04, STRC-01, STRC-02, STRC-03, STRC-04) are satisfied. TypeScript compiles cleanly. All 18 Phase 2 files exist, are substantive, and are wired together through EventBus events and direct references.

Notable deviation from plan: Plan 05 introduced user-requested changes (flag pole indicators, channel deposit mechanic, instant structure construction). These enhance the original design rather than reducing scope.

---

_Verified: 2026-04-17T19:00:00Z_
_Verifier: Claude (gsd-verifier)_
