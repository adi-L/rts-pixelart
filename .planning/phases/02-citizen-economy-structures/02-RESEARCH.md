# Phase 2: Citizen Economy & Structures - Research

**Researched:** 2026-04-17
**Domain:** Phaser 3 NPC AI, structure system, economy loop, HUD
**Confidence:** HIGH

## Summary

Phase 2 transforms the hero-loop foundation into a full indirect-control game loop. The phase introduces three interconnected systems: NPCs (vagrants, citizens, builders, farmers), structures (main base, walls, towers, farms, builder hut), and economy (coin generation from farms, spending via coin drops). All systems communicate through the existing EventBus and are rendered as colored rectangles consistent with Phase 1's placeholder art style.

The codebase from Phase 1 provides strong foundations: EventBus for cross-system events, object pooling pattern for coins, BuildPoint with coin deposit tracking, and the entity class pattern (scene reference + sprite + destroy cleanup). The main architectural challenge is managing NPC state machines (idle/wander/move-to-target/work) and the build-point-to-structure lifecycle (empty -> under construction -> built -> upgradeable).

**Primary recommendation:** Use a hand-rolled TypeScript enum-based state machine for NPCs (no external FSM library needed for this complexity level). Structure the code as one base NPC class with role-specific subclasses (Vagrant, Citizen, Builder, Farmer). Use a central EconomyManager to track coins, day number, and base upgrade tier -- replacing the bare `coinCount` number in Game.ts.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Vagrant-to-citizen conversion -- idle vagrants wander near map edges. Hero drops a coin near a vagrant to recruit them. Kingdom Two Crowns style.
- **D-02:** 3-5 vagrants at game start, scattered across the map. New vagrants slowly respawn at map edges (~60s).
- **D-03:** Recruited citizens run toward the main base, then idle/wander slowly near it until assigned a role.
- **D-04:** Role assignment via buildings -- drop coins at builder hut for builder, archer tower for archer, farm for farmer. Citizens near a farm also auto-become farmers (proximity-based).
- **D-05:** Farm-only income -- citizens do NOT generate passive coins by wandering. Coins come exclusively from farm structures.
- **D-06:** Farms are buildable structures at build points. Citizens near a farm auto-become farmers and produce coins.
- **D-07:** Main base upgrade progression: Tier 1 (5 coins) -> builder hut + tower build points. Tier 2 (15 coins) -> farm build points. Tier 3 (30 coins) -> visual/HP increase.
- **D-08:** Main base is multi-part structure -- connected rectangles growing with each upgrade level.
- **D-09:** Main base destruction triggers dramatic collapse animation, then GameOver scene.
- **D-10:** Health bar appears on main base only when damaged. Hidden at full HP.
- **D-11:** Walls -- one per build point, upgradeable wood -> stone. Block zombies, take damage.
- **D-12:** Towers -- any build point, provide archer positions for Phase 3.
- **D-13:** Build point layout across 6000px world -- Claude's discretion, symmetric.
- **D-14:** HUD position: top-left, replacing debug coin count text.
- **D-15:** HUD scope: coin count + day number only.
- **D-16:** Day counter visual style -- Claude's discretion.
- **D-17:** All structures rendered as colored rectangles.

### Claude's Discretion
- Build point count and exact positions across the 6000px world
- Day counter visual style
- Main base upgrade 3 effect (visual growth, HP increase, or both)
- Vagrant respawn timing and exact behavior patterns
- Coin generation rate from farms
- Structure costs (walls, towers, farms)
- Builder construction speed and animation

### Deferred Ideas (OUT OF SCOPE)
- Rescue vagrants from random buildings on the map -- future phase candidate.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COIN-03 | HUD shows current coin count | HUD system with EconomyManager as data source; UI-SPEC defines layout at top-left |
| COIN-04 | HUD shows current day number | Static "Day 1" display for Phase 2 (day/night cycle is Phase 3); HUD renders it |
| NPC-01 | Builder NPC picks up dropped coins and constructs/upgrades structures | Builder class listens for `coin:deposited` events, walks to build point, runs construction tween |
| NPC-02 | Citizen NPC walks around and generates passive coin income | Per D-05, citizens do NOT generate income -- they become farmers via D-04/D-06 which then generate income. NPC-02 is satisfied by the citizen-wander + farm-income pipeline |
| NPC-04 | Farmer NPC works a farm for passive income | Farmer subclass walks back/forth on farm, generates coins via timed event into EconomyManager |
| STRC-01 | Wall blocks zombies, upgradeable (wood to stone), takes damage | Wall entity with tier system, HP, and physics static body for blocking |
| STRC-02 | Tower provides archer position for night defense | Tower entity rendered at build point; archer functionality deferred to Phase 3 |
| STRC-03 | Main base is central structure; lose condition if destroyed | MainBase entity with HP, upgrade tiers, destruction sequence -> GameOver scene |
| STRC-04 | Build points at fixed locations where coins can be dropped | Extend existing BuildPoint system with type/tier/unlock logic per BUILD_POINT_LAYOUT |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| NPC AI (wander, move-to, work) | Game scene update loop | Entity classes | Each NPC owns its state machine; Game.ts calls `update()` on each NPC per frame |
| Economy (coin tracking) | EconomyManager singleton | EventBus | Central coin/day state; emits events when values change; HUD listens |
| Structure lifecycle | Structure entity classes | BuildPoint | BuildPoint triggers construction; Structure classes own rendering, HP, upgrade |
| HUD rendering | HUD class (camera-fixed) | EconomyManager | HUD reads from EconomyManager, updates text objects on economy events |
| Build point unlock progression | MainBase upgrade handler | EconomyManager | Base upgrade tier determines which build points are visible/interactive |
| Lose condition | MainBase destruction handler | Game scene | MainBase detects HP=0, triggers collapse sequence, transitions to GameOver scene |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | ^3.87.0 (locked in project) | Game engine -- Arcade Physics, tweens, scene management | Already installed, all Phase 1 code built on it [VERIFIED: package.json] |
| typescript | ^5.4.5 | Type safety for entity/NPC class hierarchies | Already installed [VERIFIED: package.json] |
| vite | ^5.3.1 | Dev server with HMR | Already installed [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| phaser3-rex-plugins (FSM only) | ^1.80.19 | NPC state machine | OPTIONAL -- only if hand-rolled enum FSM proves insufficient. Import as `import FSM from 'phaser3-rex-plugins/plugins/fsm.js'` [CITED: Context7 rexrainbow/phaser3-rex-notes] |

### Decision: Hand-Rolled FSM vs Rex FSM

For Phase 2 NPCs, a hand-rolled TypeScript enum-based state machine is recommended over rex FSM. Rationale:

1. **NPC states are simple:** Each NPC type has 3-5 states (idle, wander, move-to-target, work, recruited). No complex transition guards or hierarchical states needed. [ASSUMED]
2. **No new dependency:** Avoids adding phaser3-rex-plugins (not currently installed) for a feature that amounts to a switch statement. [VERIFIED: package.json shows no rex plugins]
3. **TypeScript enum provides compile-time safety:** `enum NPCState { Idle, Wander, MoveTo, Working }` catches invalid states at compile time.
4. **Rex FSM can be added later:** If Phase 3+ zombie AI needs complex state machines, rex FSM can be introduced then without refactoring Phase 2 NPCs.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled enum FSM | phaser3-rex-plugins FSM | Rex adds a dependency but provides event hooks, `prevState`, and update-loop integration. Worth it only if NPC states exceed 6-7 per entity. |
| Single NPC class with role property | Separate Vagrant/Citizen/Builder/Farmer classes | Separate classes are cleaner for distinct behaviors but add more files. Recommended: base NPC class + subclasses. |
| EconomyManager class | Bare variables in Game.ts | EconomyManager centralizes coin/day state, emits events, prevents scattered state. Worth the small abstraction. |

**Installation:**
```bash
# No new packages needed for Phase 2. All built on Phaser 3 + TypeScript.
# Only install if FSM complexity warrants it:
# npm install phaser3-rex-plugins
```

## Architecture Patterns

### System Architecture Diagram

```
                    PLAYER INPUT
                         |
                    [Hero.update()]
                         |
            +------------+------------+
            |                         |
    [Walk near vagrant]        [Drop coin at BuildPoint]
            |                         |
    [Recruit: coin -> vagrant]   [BuildPoint.addCoin()]
            |                         |
    [Vagrant -> Citizen]         [EventBus: coin:deposited]
            |                         |
    [Citizen runs to base]       +----+----+
            |                    |         |
    [Citizen idles near base]  [Builder]  [MainBase upgrade]
            |                    |         |
    [Role assignment via       [Walk to    [Unlock new
     building proximity]        site]      build points]
            |                    |
    [Citizen -> Farmer]      [Construct structure]
            |                    |
    [Farm coin generation]   [Structure entity created]
            |
    [EconomyManager.addCoins()]
            |
    [EventBus: economy:changed]
            |
    [HUD updates display]
```

### Recommended Project Structure
```
src/
  constants.ts           # Extended with Phase 2 constants (from UI-SPEC)
  entities/
    Hero.ts              # Existing
    Coin.ts              # Existing
    BuildPoint.ts        # Extended: type, unlockTier, structure reference
    npc/
      BaseNPC.ts         # Base class: sprite, state machine, wander, move-to
      Vagrant.ts         # Wander at map edges, recruitble
      Citizen.ts         # Idle near base, assignable to roles
      Builder.ts         # Walk to build site, construct, return to hut
      Farmer.ts          # Work farm, generate coins
    structures/
      BaseStructure.ts   # Base class: sprite, HP, health bar, upgrade tier
      MainBase.ts        # Multi-part visual, upgrade progression, lose condition
      Wall.ts            # Wood/stone tiers, blocks zombies
      Tower.ts           # Archer platform (functionality Phase 3)
      Farm.ts            # Farmer workplace, coin generation source
      BuilderHut.ts      # Role assignment building
  systems/
    EconomyManager.ts    # Coin count, day number, economy events
    StructureManager.ts  # Tracks all structures, handles build-point-to-structure lifecycle
    NPCManager.ts        # Spawns/tracks NPCs, handles recruitment and role assignment
  ui/
    HUD.ts               # Coin count + day number display, camera-fixed
  events/
    EventBus.ts          # Existing
  scenes/
    Game.ts              # Extended: init managers, NPC update loops, structure overlaps
    GameOver.ts          # Extended: "YOUR CITY HAS FALLEN" per UI-SPEC
```

### Pattern 1: Enum-Based NPC State Machine

**What:** Each NPC uses a TypeScript enum for states and a switch statement in `update()` to execute state-specific behavior.
**When to use:** Any NPC entity with 3-6 discrete states.

```typescript
// [ASSUMED] -- standard TypeScript game pattern
enum VagrantState {
  Wander,
  Recruited,
  RunToBase,
}

class Vagrant extends BaseNPC {
  private state: VagrantState = VagrantState.Wander;
  private wanderTarget: number;
  private wanderTimer: number = 0;

  update(time: number, delta: number): void {
    switch (this.state) {
      case VagrantState.Wander:
        this.handleWander(delta);
        break;
      case VagrantState.Recruited:
        this.flashWhite();
        this.state = VagrantState.RunToBase;
        break;
      case VagrantState.RunToBase:
        this.moveToward(this.baseX, CITIZEN_RUN_SPEED);
        if (Math.abs(this.sprite.x - this.baseX) < 10) {
          // Convert to Citizen -- handled by NPCManager
          EventBus.emit('npc:arrived-at-base', { vagrant: this });
        }
        break;
    }
  }
}
```

### Pattern 2: EconomyManager as Central State

**What:** A singleton-like class that owns coin count and day number, provides add/spend methods, and emits events on change.
**When to use:** Any time multiple systems need to read or modify the economy.

```typescript
// [ASSUMED] -- derived from existing EventBus pattern
class EconomyManager {
  private _coins: number = 0;
  private _day: number = 1;

  get coins(): number { return this._coins; }
  get day(): number { return this._day; }

  addCoins(amount: number, source: string): void {
    this._coins += amount;
    EventBus.emit('economy:changed', { coins: this._coins, day: this._day, source });
  }

  spendCoins(amount: number): boolean {
    if (this._coins < amount) return false;
    this._coins -= amount;
    EventBus.emit('economy:changed', { coins: this._coins, day: this._day, source: 'spend' });
    return true;
  }
}
```

### Pattern 3: Structure Construction Lifecycle

**What:** Build points transition through states: empty -> waiting-for-builder -> under-construction -> built. Each state has different visual representation.
**When to use:** Any build point that can hold a structure.

```typescript
// [ASSUMED] -- based on existing BuildPoint.addCoin() pattern
enum BuildPointState {
  Locked,       // invisible, no interaction (unlockTier > current base tier)
  Empty,        // pulsing marker, accepts coins
  Funded,       // coins deposited, waiting for builder
  Building,     // builder is constructing
  Complete,     // structure exists
  Upgradeable,  // structure exists but can accept more coins for upgrade
}
```

### Pattern 4: Health Bar Component

**What:** Reusable health bar that attaches to any structure. Hidden at full HP (D-10), shows colored bar when damaged.
**When to use:** MainBase, Walls, any damageable structure.

```typescript
// [ASSUMED] -- standard Phaser pattern
class HealthBar {
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private maxHP: number;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHP: number) {
    this.maxHP = maxHP;
    this.bg = scene.add.rectangle(x, y, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, COLOR_HEALTH_BG);
    this.fill = scene.add.rectangle(x, y, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, COLOR_HEALTH_HIGH);
    this.setVisible(false); // Hidden at full HP
  }

  update(currentHP: number): void {
    const ratio = currentHP / this.maxHP;
    this.fill.width = HEALTH_BAR_WIDTH * ratio;
    this.fill.fillColor = ratio > 0.5 ? COLOR_HEALTH_HIGH : ratio > 0.25 ? COLOR_HEALTH_MID : COLOR_HEALTH_LOW;
    this.setVisible(currentHP < this.maxHP);
  }
}
```

### Anti-Patterns to Avoid
- **Monolithic Game.ts:** Do NOT put all NPC logic, structure logic, and economy logic directly in Game.ts. Extract into manager classes. Game.ts should only instantiate managers and call their update methods.
- **NPC state as string:** Use TypeScript enums, not string literals, for NPC states. Prevents typo bugs and enables exhaustive switch checking.
- **Direct coin mutation:** Do NOT modify coin count directly from multiple places. All coin changes go through EconomyManager so the HUD stays in sync.
- **Forgetting scene shutdown cleanup:** Every manager, NPC, and structure must clean up EventBus listeners and tweens in the `shutdown` handler. Phase 1 established this pattern -- extend it. [VERIFIED: Game.ts line 109-113]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Object pooling | Custom pool manager | `Phaser.Physics.Arcade.Group` with `createMultiple` | Already used for coins in Phase 1. Handles activation, deactivation, and recycling. [VERIFIED: Coin.ts] |
| NPC pathfinding | A* grid navigation | Simple `moveToward(targetX, speed)` with velocity | NPCs move along a single horizontal axis -- A* is overkill for 1D movement. [ASSUMED] |
| Tween management | Manual animation frame counters | `scene.tweens.add()` | Phaser's tween system handles easing, yoyo, repeat, and cleanup. Already used extensively in Phase 1. [VERIFIED: BuildPoint.ts, Coin.ts] |
| Health bar UI | Custom canvas drawing | Phaser `Rectangle` GameObjects (bg + fill) | Two rectangles with width scaling is simpler and more performant than custom rendering. [ASSUMED] |
| Event system | Custom pub/sub | `Phaser.Events.EventEmitter` via EventBus | Already established in Phase 1. Handles listener management and cleanup. [VERIFIED: EventBus.ts] |

**Key insight:** This phase's complexity is in orchestration (many systems communicating), not in any individual technical challenge. Use Phaser's built-in primitives for rendering, physics, and events; focus implementation effort on the manager layer that coordinates NPCs, structures, and economy.

## Common Pitfalls

### Pitfall 1: EventBus Listener Leaks
**What goes wrong:** NPCs and structures register EventBus listeners in constructors but don't clean them up when destroyed or when the scene shuts down. Over multiple scene restarts, listeners accumulate.
**Why it happens:** Phase 1 uses `EventBus.removeAllListeners()` on shutdown, which is a sledgehammer. With many entities registering individual listeners, this approach works but individual entity cleanup is better practice.
**How to avoid:** Each NPC and structure should store listener references and remove them in `destroy()`. The scene shutdown handler should call `destroy()` on all managed entities.
**Warning signs:** Console shows duplicate event firings, economy counts jump by 2x after scene restart.

### Pitfall 2: Coin Count Desync Between EconomyManager and HUD
**What goes wrong:** Coins are added/spent from multiple places (hero pickup, farm generation, build point drops) and the HUD shows the wrong number.
**Why it happens:** Direct mutation of coin variables without going through a single source of truth.
**How to avoid:** ALL coin changes go through `EconomyManager.addCoins()` / `EconomyManager.spendCoins()`. HUD listens to `economy:changed` event only. Never read coin count from anywhere except EconomyManager.
**Warning signs:** HUD shows negative coins, or farm income doesn't appear in HUD.

### Pitfall 3: BuildPoint State Conflicts
**What goes wrong:** Player drops coins at a build point while a builder is already constructing there, creating duplicate structures or corrupted state.
**Why it happens:** Build point doesn't track its current state (empty vs. building vs. complete).
**How to avoid:** BuildPoint must have an explicit state enum. Coins can only be deposited when state is `Empty` or `Upgradeable`. The build point should reject coins during `Building` state.
**Warning signs:** Two structures overlapping at the same position, or coins consumed without any construction starting.

### Pitfall 4: NPC-to-Role Conversion Object Lifecycle
**What goes wrong:** When a Vagrant converts to a Citizen (or Citizen to Builder/Farmer), the old NPC object isn't properly destroyed and the new one isn't properly registered.
**Why it happens:** Object identity changes -- the Vagrant instance must be destroyed and a Citizen instance created in its place.
**How to avoid:** NPCManager handles all conversions. The pattern is: (1) remove old NPC from tracking list, (2) create new NPC at same position, (3) add to appropriate tracking list, (4) destroy old NPC (including sprite and listeners).
**Warning signs:** Ghost NPCs that wander but can't be interacted with, or NPC count grows without bound.

### Pitfall 5: MainBase Upgrade Unlocking Build Points
**What goes wrong:** Upgrading the main base should make new build points visible, but the build points don't react to the upgrade event.
**Why it happens:** Build points are initialized once and their visibility isn't linked to base tier changes.
**How to avoid:** BuildPoints check their `unlockTier` against current base tier. MainBase emits `base:upgraded` event. BuildPoints (or a StructureManager) listens and updates visibility. The BUILD_POINT_LAYOUT constant already includes `unlockTier` per the UI-SPEC.
**Warning signs:** Player upgrades base but no new build points appear.

### Pitfall 6: Tween Accumulation on Frequently-Updated Objects
**What goes wrong:** NPCs that switch states rapidly accumulate tweens (e.g., walking tween created on every state entry without killing previous).
**Why it happens:** `scene.tweens.add()` doesn't auto-kill previous tweens on the same target.
**How to avoid:** Call `scene.tweens.killTweensOf(this.sprite)` before adding new movement tweens. Or use `sprite.setVelocityX()` for movement instead of tweens (recommended for NPCs -- use Arcade Physics velocity, not position tweens).
**Warning signs:** Jittery NPC movement, gradually degrading performance.

## Code Examples

### NPC Movement via Arcade Physics (not tweens)

```typescript
// [VERIFIED: Hero.ts uses this exact pattern for movement]
// Use velocity for NPC movement -- physics engine handles per-frame position updates
moveToward(targetX: number, speed: number): void {
  const dx = targetX - this.sprite.x;
  if (Math.abs(dx) < 4) {
    this.sprite.setVelocityX(0);
    return; // arrived
  }
  this.sprite.setVelocityX(dx > 0 ? speed : -speed);
  this.sprite.setFlipX(dx < 0);
}
```

### Structure Construction Tween (Builder Hammering)

```typescript
// [ASSUMED] -- based on existing tween patterns in BuildPoint.ts
startConstruction(builder: Builder, structure: BaseStructure): void {
  // Builder Y oscillation ("hammering")
  this.scene.tweens.add({
    targets: builder.sprite,
    y: builder.sprite.y - BUILDER_HAMMER_AMPLITUDE,
    duration: BUILDER_HAMMER_PERIOD,
    yoyo: true,
    repeat: -1,
    key: 'hammer', // for later killTweensOf
  });

  // Structure grows from 0 to full height over build duration
  structure.sprite.setScale(1, 0);
  this.scene.tweens.add({
    targets: structure.sprite,
    scaleY: 1,
    duration: BUILDER_CONSTRUCT_DURATION,
    ease: 'Linear',
    onComplete: () => {
      this.scene.tweens.killTweensOf(builder.sprite);
      // Signal construction complete
      EventBus.emit('structure:built', { buildPointId: structure.buildPointId });
    },
  });
}
```

### HUD Setup (Camera-Fixed)

```typescript
// [VERIFIED: Game.ts line 97-101 shows existing debug text pattern]
// [CITED: UI-SPEC defines exact positions and sizes]
class HUD {
  private coinIcon: Phaser.GameObjects.Arc;
  private coinText: Phaser.GameObjects.Text;
  private dayText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.coinIcon = scene.add.circle(HUD_MARGIN, HUD_Y, HUD_COIN_ICON_SIZE / 2, COLOR_ACCENT)
      .setScrollFactor(0).setDepth(HUD_DEPTH);

    this.coinText = scene.add.text(HUD_COIN_X, HUD_Y, '0', {
      fontFamily: '"Courier New", monospace',
      fontSize: HUD_COIN_TEXT_SIZE,
      color: '#e2b714',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0, 0.3);

    this.dayText = scene.add.text(HUD_DAY_LABEL_X, HUD_Y, 'Day 1', {
      fontFamily: '"Courier New", monospace',
      fontSize: HUD_LABEL_TEXT_SIZE,
      color: '#FFFFFF',
    }).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0, 0.3);

    // Listen for economy changes
    EventBus.on('economy:changed', (data: { coins: number; day: number }) => {
      this.coinText.setText(`${data.coins}`);
      this.dayText.setText(`Day ${data.day}`);
    });
  }
}
```

### MainBase Destruction Sequence

```typescript
// [CITED: UI-SPEC destruction contract -- shake, collapse, red flash, fade, GameOver]
destroyBase(scene: Phaser.Scene): void {
  // Step 1: Freeze all entities
  scene.physics.pause();

  // Step 2: Shake
  scene.tweens.add({
    targets: this.mainRect,
    x: this.mainRect.x + 3,
    duration: 100,
    yoyo: true,
    repeat: 5,
    onComplete: () => {
      // Step 3: Collapse particles (split into falling rectangles)
      this.mainRect.setVisible(false);
      for (let i = 0; i < 5; i++) {
        const debris = scene.add.rectangle(
          this.mainRect.x + Phaser.Math.Between(-20, 20),
          this.mainRect.y,
          16, 12,
          this.mainRect.fillColor
        ).setDepth(10);
        scene.tweens.add({
          targets: debris,
          y: GROUND_Y + 50,
          x: debris.x + Phaser.Math.Between(-30, 30),
          angle: Phaser.Math.Between(-180, 180),
          alpha: 0,
          duration: BASE_COLLAPSE_FALL_DURATION,
        });
      }

      // Step 4: Red flash + fade to black
      scene.time.delayedCall(BASE_COLLAPSE_SHAKE_DURATION, () => {
        scene.cameras.main.flash(FLASH_TINT_DURATION, 204, 68, 68);
        scene.cameras.main.fadeOut(SCREEN_FADE_DURATION, 0, 0, 0);
        scene.cameras.main.once('camerafadeoutcomplete', () => {
          scene.scene.start('GameOver');
        });
      });
    },
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| XState for game FSMs | Enum-based or lightweight FSMs (rex/hand-rolled) | Ongoing consensus | XState overhead (bundle size, update cost) is inappropriate for game loops running at 60fps [CITED: CLAUDE.md "What NOT to Use"] |
| Direct scene property mutation for game state | Manager classes with EventBus | Phase 1 established pattern | Prevents state desync across systems |
| String-based NPC types | TypeScript enum + class hierarchy | TypeScript best practice | Compile-time safety for NPC role assignments |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Hand-rolled enum FSM is sufficient for 3-5 state NPCs | Standard Stack decision | Low risk -- can migrate to rex FSM later without breaking changes |
| A2 | 1D movement (horizontal only) means no pathfinding library needed | Don't Hand-Roll | Low risk -- NPCs walk left/right on flat ground. If obstacles are added, easystar.js can be introduced |
| A3 | Health bar as two Phaser Rectangles is the standard approach | Code Examples | Very low risk -- this is the most common Phaser health bar pattern |
| A4 | NPC conversion should destroy old instance and create new instance | Pitfalls | Medium risk -- alternative is a single NPC class with mutable role property. Subclasses are cleaner but require careful lifecycle management |

## Open Questions

1. **Builder Assignment Priority**
   - What we know: A builder is assigned from the builder hut. When coins are dropped at a build point, a builder should walk there.
   - What's unclear: If multiple build points are funded simultaneously, how does the builder choose which to construct first?
   - Recommendation: Nearest-first. If multiple builders exist, each takes the nearest unfunded build point. Queue excess jobs.

2. **Farm Coin Delivery Mechanism**
   - What we know: Farms generate coins passively (D-05, D-06). Farmers work the farm.
   - What's unclear: Do farm coins appear as physical coins the hero must collect, or do they go directly into the economy?
   - Recommendation: Direct to economy via EconomyManager.addCoins() with "+1" float text visual. Physical coin spawning would clutter the screen and require hero to constantly revisit farms, contradicting the "passive income" design.

3. **Citizen Auto-Assignment to Farms (D-04)**
   - What we know: "Citizens near a farm also auto-become farmers (proximity-based)"
   - What's unclear: What radius triggers auto-assignment? What if multiple citizens are near a farm?
   - Recommendation: Use FARMER_WORK_RANGE (64px from UI-SPEC) as proximity trigger. One farmer per farm. If a citizen wanders near an unmanned farm, auto-convert them.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified). Phase 2 uses only Phaser 3 built-in features and TypeScript -- no new CLI tools, databases, or services required.

## Sources

### Primary (HIGH confidence)
- `/websites/phaser_io_api-documentation` (Context7) -- Physics.Arcade.World.enable, staticGroup factory, body types
- `/websites/phaser_io` (Context7) -- Scene shutdown/destroy events, cleanup patterns
- `/rexrainbow/phaser3-rex-notes` (Context7) -- FSM plugin API, standalone import pattern
- Phase 1 codebase (verified) -- EventBus.ts, BuildPoint.ts, Coin.ts, Hero.ts, Game.ts, constants.ts

### Secondary (MEDIUM confidence)
- `02-UI-SPEC.md` -- All visual constants, layout specifications, interaction contracts
- `02-CONTEXT.md` -- User decisions D-01 through D-17
- `01-PATTERNS.md` -- Established entity patterns, scene lifecycle patterns

### Tertiary (LOW confidence)
- None -- all claims verified or cited.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in Phase 1
- Architecture: HIGH -- patterns extend proven Phase 1 foundations
- NPC state management: HIGH -- enum-based FSM is standard TypeScript game pattern
- Pitfalls: MEDIUM -- derived from Phase 1 experience + common Phaser patterns, not from Phase 2-specific debugging

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stable -- Phaser 3.87 is locked, no version changes expected)
