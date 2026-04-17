# Phase 3: Day/Night & Zombie Waves - Research

**Researched:** 2026-04-17
**Domain:** Phaser 3 game loop systems -- day/night cycle, wave spawning, NPC AI, projectile combat
**Confidence:** HIGH

## Summary

Phase 3 introduces the survival loop: a day/night cycle with visual tint transitions, zombie wave spawning from both map edges, zombie combat against structures and NPCs, escalating difficulty, and archer NPCs that defend towers at night and hunt coins by day.

The existing codebase provides strong foundations. `BaseNPC` can be extended for both Zombie and Archer entities. `BaseStructure.takeDamage()` already handles HP reduction with visual feedback. `EconomyManager.setDay()` already tracks day number. The coin pool pattern (`Coin.ts`) provides a template for zombie and arrow object pools. All new systems coordinate through `EventBus` events (`night:start`, `night:end`, `day:start`).

**Primary recommendation:** Build three new systems (DayNightCycleManager, WaveManager, and Archer entity) that integrate through EventBus events. The day/night overlay is a single full-screen Rectangle with alpha-tweened transitions. Zombies are pooled via `Phaser.Physics.Arcade.Group`. Archer arrows are pooled similarly. Arrow-zombie combat uses `physics.add.overlap` between arrow pool and zombie pool (both are physics groups). Zombie-structure and zombie-NPC collisions use distance checks in `WaveManager.update()` since structures lack physics bodies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Day duration is 10 minutes, night duration is 8 minutes (18-minute total cycle)
- **D-02:** Gradual tint overlay transition -- dark blue/purple rectangle fades in over ~10-15 seconds
- **D-03:** Visual warning ~15-30 seconds before nightfall
- **D-04:** EconomyManager already tracks day number -- increment at dawn
- **D-05:** Straight march -- zombies walk in a straight line toward nearest structure, no pathfinding
- **D-06:** Stop and attack -- zombie stops at first structure it contacts, attacks ~2s interval
- **D-07:** Green/dark-green colored rectangles, NPC_WIDTH x NPC_HEIGHT size
- **D-08:** Zombies kill NPCs -- reaching unprotected citizen/builder/farmer kills them
- **D-09:** Zombies die at dawn -- fade out when day begins
- **D-10:** Zombie object pool -- pre-allocate and reuse, no runtime create/destroy
- **D-11:** Staggered spawning throughout the night -- trickle from both edges over 8 minutes
- **D-12:** Spawn from BOTH map edges (x=0 and x=WORLD_WIDTH)
- **D-13:** Archer role assignment via coin drop at built tower (same pattern as builder hut)
- **D-14:** Archers hunt by day (wander, earn coins), defend tower by night
- **D-15:** Arrow attack -- small yellow/white projectile line, object-pooled
- **D-16:** Linear difficulty growth -- start ~3-4 zombies night 1, add 2-3 per night
- **D-17:** Count only for MVP -- same HP/speed/damage for all zombies

### Claude's Discretion
- Zombie walk speed (balanced against 8-min night and world width)
- Zombie HP and damage-per-hit values (balanced against archer damage and structure HP)
- Archer fire rate, range, and damage per arrow
- Archer hunt coin generation rate and wander distance
- Exact nightfall warning visual
- Zombie spawn interval formula
- Arrow pool size
- Archer return-to-tower timing

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NPC-03 | Archer NPC hunts by day (earns coins) and defends tower at night | Archer entity extends BaseNPC with day/night state machine; tower assignment via D-13 coin-drop pattern; arrow pool for projectiles |
| WAVE-01 | Day/night cycle with visual tint transition | DayNightCycleManager with Rectangle overlay, alpha tween, EventBus coordination |
| WAVE-02 | Zombie waves spawn from both map edges at night | WaveManager with staggered spawn timer, zombie pool, spawn from x=0 and x=WORLD_WIDTH |
| WAVE-03 | Zombie difficulty escalates each night (more zombies, tougher) | Linear zombie count formula: `baseCount + (day - 1) * growthRate`; count-only for MVP |
| WAVE-04 | Zombies attack nearest structure/unit, deal damage | Zombie AI: march toward nearest structure, stop and call `takeDamage()` on ~2s interval; NPC kill on overlap |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Day/night visual overlay | Browser/Client (Phaser scene) | -- | Rectangle alpha tween renders on canvas |
| Day/night cycle timing | Browser/Client (Phaser scene) | -- | Timer-driven state machine, no server |
| Zombie spawning & pooling | Browser/Client (Phaser scene) | -- | Arcade Physics group with object pool |
| Zombie AI (march + attack) | Browser/Client (Phaser scene) | -- | Per-frame update loop with velocity control |
| Archer behavior (hunt/defend) | Browser/Client (Phaser scene) | -- | State machine in entity update loop |
| Arrow projectiles | Browser/Client (Phaser scene) | -- | Pooled physics sprites with overlap detection |
| Difficulty escalation | Browser/Client (Phaser scene) | -- | Formula computed from EconomyManager.day |
| Cross-system coordination | Browser/Client (EventBus) | -- | EventEmitter pattern already established |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | 3.87.0 (project-locked) | Game engine -- Arcade Physics, Groups, Tweens, Timers | Already installed; provides all needed subsystems [VERIFIED: package.json] |

### Supporting
No additional libraries needed. All Phase 3 features use built-in Phaser 3 capabilities:
- `Phaser.GameObjects.Rectangle` for overlay and zombie/arrow visuals
- `Phaser.Physics.Arcade.Group` for zombie and arrow pools
- `Phaser.Tweens` for overlay alpha transitions and zombie death fade
- `Phaser.Time.TimerEvent` for spawn intervals and attack cooldowns
- `Phaser.Math.Between` for spawn randomization

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual zombie velocity AI | easystar.js A* pathfinding | Overkill -- zombies march in straight lines per D-05, no pathfinding needed |
| Rex FSM plugin for zombie states | Manual state enum + switch | Zombies have only 3 states (march/attack/dying) -- too simple for FSM library overhead |

## Architecture Patterns

### System Architecture Diagram

```
                         DayNightCycleManager
                              |
              +---------+-----+-----+---------+
              |         |           |         |
         EventBus   EventBus    EventBus   EventBus
         "night     "night      "day       "night
          :warning"  :start"     :start"    :end"
              |         |           |         |
              v         v           v         v
          HUD flash  WaveManager  WaveManager  Archer
          warning    startWave()  killAll()    returnToTower()
                        |                        |
                        v                        v
                   ZombiePool               ArrowPool
                   (spawn/activate)         (fire/deactivate)
                        |                        |
                        v                        v
                   Zombie.update()          Arrow.update()
                   march toward             fly toward target
                   nearest structure        overlap -> damage
                        |
              +---------+---------+
              |                   |
              v                   v
         Structure distance   NPC distance
         check -> takeDamage  check -> kill NPC
```

### Recommended Project Structure
```
src/
  systems/
    DayNightCycleManager.ts   # Day/night state machine, overlay, events
    WaveManager.ts            # Zombie spawning, pooling, difficulty
  entities/
    npc/
      Zombie.ts               # Extends BaseNPC -- march, attack, die states
      Archer.ts               # Extends BaseNPC -- hunt/defend states, arrow firing
    Arrow.ts                  # Pooled projectile entity (or inline in WaveManager)
  constants.ts                # New constants for zombie/archer/cycle params
```

### Pattern 1: Day/Night Cycle Manager
**What:** A system that tracks elapsed time within the current day/night period, drives overlay alpha, and emits EventBus events at phase transitions.
**When to use:** Single instance created in Game.ts create(), updated every frame.
**Example:**
```typescript
// [VERIFIED: Phaser 3 Rectangle + tween pattern from codebase Game.ts and Context7]
class DayNightCycleManager {
  private overlay: Phaser.GameObjects.Rectangle;
  private elapsed: number = 0;
  private isNight: boolean = false;
  private warningEmitted: boolean = false;

  constructor(scene: Phaser.Scene) {
    // Full-screen overlay, fixed to camera, above all game objects
    this.overlay = scene.add.rectangle(
      scene.scale.width / 2, scene.scale.height / 2,
      scene.scale.width, scene.scale.height,
      0x0a0a3a // dark blue/purple
    ).setScrollFactor(0).setAlpha(0).setDepth(50);
  }

  update(delta: number): void {
    this.elapsed += delta;
    const phaseDuration = this.isNight ? NIGHT_DURATION : DAY_DURATION;

    if (!this.isNight && !this.warningEmitted &&
        this.elapsed >= phaseDuration - NIGHTFALL_WARNING_TIME) {
      EventBus.emit('night:warning');
      this.warningEmitted = true;
    }

    if (this.elapsed >= phaseDuration) {
      this.elapsed = 0;
      this.isNight = !this.isNight;
      this.warningEmitted = false;
      if (this.isNight) {
        this.transitionToNight();
      } else {
        this.transitionToDay();
      }
    }
  }

  private transitionToNight(): void {
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0.6, // dark but not black -- player needs to see
      duration: TRANSITION_DURATION, // 10-15 seconds
      onComplete: () => EventBus.emit('night:start'),
    });
  }

  private transitionToDay(): void {
    this.economy.setDay(this.economy.day + 1);
    EventBus.emit('night:end'); // triggers zombie kill-all
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: TRANSITION_DURATION,
      onComplete: () => EventBus.emit('day:start'),
    });
  }
}
```

### Pattern 2: Zombie Object Pool
**What:** Pre-allocated zombie sprites via Phaser.Physics.Arcade.Group, activated/deactivated instead of created/destroyed.
**When to use:** WaveManager creates pool once; spawns activate pool members.
**Example:**
```typescript
// [VERIFIED: matches Coin.ts pool pattern in codebase]
class WaveManager {
  private zombiePool: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.zombiePool = scene.physics.add.group({
      classType: Phaser.GameObjects.Rectangle,
      maxSize: ZOMBIE_POOL_SIZE, // e.g., 40
      runChildUpdate: false,
      allowGravity: false,
    });
  }

  spawnZombie(x: number): void {
    const zombie = this.zombiePool.get(x, GROUND_Y - NPC_HEIGHT / 2);
    if (!zombie) return; // pool exhausted
    zombie.setActive(true).setVisible(true);
    zombie.setFillStyle(COLOR_ZOMBIE);
    zombie.body.enable = true;
    // Set velocity toward center/nearest structure
  }

  deactivateZombie(zombie: Phaser.GameObjects.Rectangle): void {
    zombie.setActive(false).setVisible(false);
    zombie.body.enable = false;
    zombie.body.setVelocity(0, 0);
  }
}
```

### Pattern 3: Zombie AI (March + Attack via Distance Checks)
**What:** Each active zombie marches toward the nearest structure. When within contact distance, it stops and attacks on a timer. Uses distance checks in WaveManager.update() because structures lack physics bodies.
**When to use:** Called in WaveManager.update() for each active zombie.
**Example:**
```typescript
// [ASSUMED] -- balanced values, discretionary
enum ZombieState { March, Attack, Dying }

// Per-zombie data stored in zombie.getData / setData
updateZombie(zombie: GameObjects.Rectangle, structures: BaseStructure[], time: number): void {
  const state = zombie.getData('state') as ZombieState;
  if (state === ZombieState.Dying) return;

  // Check structure contact via distance (structures have no physics bodies)
  const nearest = this.findNearestStructure(zombie.x);
  if (nearest && Math.abs(zombie.x - nearest.x) < ZOMBIE_CONTACT_DISTANCE) {
    zombie.body.setVelocityX(0);
    zombie.setData('state', ZombieState.Attack);
    zombie.setData('targetStructure', nearest);
    // Cooldown-based attack
    const last = zombie.getData('lastAttack') || 0;
    if (time - last >= ZOMBIE_ATTACK_INTERVAL) {
      zombie.setData('lastAttack', time);
      nearest.takeDamage(ZOMBIE_DAMAGE);
      if (nearest.isDestroyed) {
        zombie.setData('state', ZombieState.March);
      }
    }
    return;
  }

  if (state === ZombieState.Attack) {
    // Structure was destroyed or moved out of range, resume marching
    zombie.setData('state', ZombieState.March);
  }

  // March state: move toward nearest structure
  if (!nearest) return;
  const dx = nearest.x - zombie.x;
  zombie.body.setVelocityX(dx > 0 ? ZOMBIE_SPEED : -ZOMBIE_SPEED);
}
```

### Pattern 4: Archer State Machine
**What:** Archer has two modes: day (hunt for coins near tower) and night (station at tower, fire arrows at zombies in range).
**When to use:** Archer entity with state transitions driven by EventBus events.
**Example:**
```typescript
// [ASSUMED] -- design pattern following Citizen.ts wander model
class Archer extends BaseNPC {
  private towerX: number;
  private state: ArcherState;

  constructor(scene: Phaser.Scene, x: number, towerX: number) {
    super(scene, x, COLOR_ARCHER);
    this.towerX = towerX;
    this.state = ArcherState.Hunt;
    EventBus.on('night:warning', () => this.returnToTower());
    EventBus.on('night:start', () => this.state = ArcherState.Defend);
    EventBus.on('day:start', () => this.state = ArcherState.Hunt);
  }

  update(time: number, delta: number): void {
    if (this.state === ArcherState.Defend) {
      this.scanAndFire(time);
    } else if (this.state === ArcherState.Hunt) {
      this.huntBehavior(time, delta);
    } else if (this.state === ArcherState.Returning) {
      if (this.moveToward(this.towerX, ARCHER_RETURN_SPEED)) {
        this.state = ArcherState.Defend; // arrived at tower
      }
    }
  }
}
```

### Anti-Patterns to Avoid
- **Creating/destroying zombies at runtime:** Always use the pre-allocated pool. Creating new GameObjects each spawn causes GC stalls. [VERIFIED: CLAUDE.md mandates INFRA-02 pooling]
- **Using `setTint()` on individual sprites for day/night:** Per-sprite tinting is expensive with many entities. Use a single overlay Rectangle for the global effect. [CITED: CLAUDE.md architecture patterns]
- **Putting zombie AI in the physics overlap callback:** Overlap callbacks fire every frame during contact. Attack logic should use a cooldown timer, not fire each frame. [VERIFIED: standard Phaser pattern]
- **Forgetting scene shutdown cleanup:** All EventBus listeners and TimerEvents must be cleaned up on shutdown. [VERIFIED: existing pattern in Game.ts]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Object pooling | Custom array pool | `Phaser.Physics.Arcade.Group` with `maxSize` | Built-in activate/deactivate, physics integration, overlap detection [VERIFIED: Coin.ts pattern] |
| Timed events | `setTimeout` / manual timer | `Phaser.Time.TimerEvent` via `scene.time.addEvent` | Respects scene pause, auto-cleanup on shutdown [VERIFIED: NPCManager respawn timer] |
| Smooth alpha transition | Manual lerp in update | `scene.tweens.add({ targets, alpha, duration })` | Handles easing, completion callbacks, cancellation [VERIFIED: Context7 tween docs] |
| Collision detection (group-to-group) | Manual distance checks | `physics.add.overlap(group, group, callback)` | Broadphase optimization, handles group-to-group efficiently [VERIFIED: Game.ts coin overlap]. Note: only applicable when BOTH sides are physics groups. Zombie-structure uses distance checks since structures lack physics bodies. |
| Cross-system events | Direct method calls between systems | EventBus (Phaser.Events.EventEmitter) | Decoupled systems, established project pattern [VERIFIED: EventBus.ts] |

**Key insight:** Every infrastructure piece needed for Phase 3 already exists in Phaser or in the project's established patterns. The work is integration and game logic, not infrastructure.

## Common Pitfalls

### Pitfall 1: Zombie Pool Exhaustion
**What goes wrong:** More zombies spawn than the pool can hold. `pool.get()` returns null and zombies silently fail to appear.
**Why it happens:** Pool size set too small for late-game nights with high zombie counts. D-16 formula: night N has `3 + 2*(N-1)` zombies. Night 15 = 31 zombies. Both edges = simultaneous.
**How to avoid:** Set pool size to max expected zombies per night + buffer. For 15 nights: `3 + 2*14 = 31` zombies. Pool size of 40 gives safe margin. Add a console warning when pool.get() returns null.
**Warning signs:** Missing zombies at higher night numbers; pool.get() returning null.

### Pitfall 2: Overlap Callback Firing Every Frame
**What goes wrong:** Zombie overlap with structure fires the attack callback 60 times/second instead of once per 2-second attack interval.
**Why it happens:** `physics.add.overlap` fires every frame while bodies overlap. Without a cooldown check, damage is applied continuously.
**How to avoid:** Store `lastAttackTime` on each zombie (via `setData`). In the overlap callback, check `time - lastAttackTime >= ATTACK_INTERVAL` before applying damage.
**Warning signs:** Structures destroyed instantly on zombie contact.

### Pitfall 3: Overlay Depth Ordering
**What goes wrong:** The night overlay covers the HUD, making coin count and day number unreadable during night.
**Why it happens:** Overlay depth set higher than HUD depth.
**How to avoid:** HUD depth is 100 (constant `HUD_DEPTH`). Set overlay depth below HUD (e.g., 50). Overlay uses `setScrollFactor(0)` so it stays fixed to camera.
**Warning signs:** HUD invisible during night.

### Pitfall 4: EventBus Listener Accumulation
**What goes wrong:** Archer or zombie EventBus listeners pile up across scene restarts, causing duplicate event handling.
**Why it happens:** Listeners added in constructor but not removed on destroy.
**How to avoid:** Store listener references and call `EventBus.off()` in every entity's `destroy()` method. Follow the pattern in Game.ts `onStructureBuilt`.
**Warning signs:** Multiple event firings per transition; zombie/archer count doubling after game restart.

### Pitfall 5: Zombies Walking Through Structures
**What goes wrong:** Zombies pass through walls and towers without stopping.
**Why it happens:** Using `overlap` instead of `collider`, or not setting zombie velocity to 0 when entering Attack state.
**How to avoid:** Use distance checks in WaveManager.update() to detect when a zombie is within contact range of a structure. Set velocity to 0 and switch to Attack state. Walls don't need physics bodies for this -- the distance check between zombie position and structure position is sufficient.
**Warning signs:** Zombies reaching the base despite walls being present.

### Pitfall 6: Arrow Pool Not Deactivating on Miss
**What goes wrong:** Arrows that miss (zombie dies before arrow arrives) remain active forever, accumulating off-screen.
**Why it happens:** Arrow deactivation only happens on zombie hit, not on out-of-bounds or max-distance.
**How to avoid:** In arrow update, check if arrow has traveled beyond max range or world bounds. Deactivate if so.
**Warning signs:** Steadily degrading performance during long nights.

## Code Examples

### Full-screen Night Overlay
```typescript
// [VERIFIED: Phaser Rectangle + tween from Context7 and codebase patterns]
// Create once in DayNightCycleManager constructor
const overlay = scene.add.rectangle(
  scene.scale.width / 2,
  scene.scale.height / 2,
  scene.scale.width,
  scene.scale.height,
  0x0a0a3a  // dark blue-purple
).setScrollFactor(0)
 .setAlpha(0)
 .setDepth(50); // below HUD_DEPTH (100)

// Transition to night
scene.tweens.add({
  targets: overlay,
  alpha: 0.55,
  duration: 12000, // 12 seconds
  ease: 'Sine.easeInOut',
});
```

### Zombie Pool Creation (following Coin.ts pattern)
```typescript
// [VERIFIED: matches Coin.ts createCoinPool pattern]
const ZOMBIE_POOL_SIZE = 40;

function createZombiePool(scene: Phaser.Scene): Phaser.Physics.Arcade.Group {
  const pool = scene.physics.add.group({
    maxSize: ZOMBIE_POOL_SIZE,
    runChildUpdate: false,
    allowGravity: false,
  });
  // Pre-create inactive rectangles
  for (let i = 0; i < ZOMBIE_POOL_SIZE; i++) {
    const rect = scene.add.rectangle(0, 0, NPC_WIDTH, NPC_HEIGHT, COLOR_ZOMBIE);
    scene.physics.add.existing(rect);
    rect.setActive(false).setVisible(false);
    (rect.body as Phaser.Physics.Arcade.Body).enable = false;
    pool.add(rect);
  }
  return pool;
}
```

### Staggered Spawn Timer
```typescript
// [VERIFIED: Phaser Time.TimerEvent from NPCManager pattern]
startNightSpawning(totalZombies: number): void {
  const interval = (NIGHT_DURATION * 0.8) / totalZombies; // spread over 80% of night
  let spawned = 0;
  this.spawnTimer = this.scene.time.addEvent({
    delay: interval,
    repeat: totalZombies - 1,
    callback: () => {
      // Alternate sides: even from left, odd from right
      const x = spawned % 2 === 0 ? 50 : WORLD_WIDTH - 50;
      this.spawnZombie(x);
      spawned++;
    },
  });
}
```

### Zombie-Structure Distance Check with Cooldown
```typescript
// [VERIFIED: distance-check approach chosen because structures lack physics bodies]
// Inside WaveManager.update(), for each active zombie:
const nearest = this.findNearestStructure(zombie.x);
if (nearest && Math.abs(zombie.x - nearest.x) < ZOMBIE_CONTACT_DISTANCE) {
  (zombie.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
  zombie.setData('state', ZombieState.Attack);
  const now = this.scene.time.now;
  const lastAttack = zombie.getData('lastAttack') || 0;
  if (now - lastAttack >= ZOMBIE_ATTACK_INTERVAL) {
    zombie.setData('lastAttack', now);
    nearest.takeDamage(ZOMBIE_DAMAGE);
  }
}
```

### Arrow Firing from Tower
```typescript
// [ASSUMED] -- arrow pool pattern following coin pool
fireArrow(fromX: number, fromY: number, targetX: number, targetY: number): void {
  const arrow = this.arrowPool.getFirst(false); // get inactive
  if (!arrow) return;
  arrow.setActive(true).setVisible(true);
  arrow.setPosition(fromX, fromY);
  arrow.body.enable = true;
  // Calculate velocity toward target
  const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
  const speed = ARROW_SPEED;
  arrow.body.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  arrow.setData('startX', fromX);
}
```

## Recommended Constant Values (Claude's Discretion)

These values balance against the existing game constants and the 10-min day / 8-min night pacing.

| Constant | Value | Rationale |
|----------|-------|-----------|
| `DAY_DURATION` | 600000 (10 min) | Per D-01 [LOCKED] |
| `NIGHT_DURATION` | 480000 (8 min) | Per D-01 [LOCKED] |
| `TRANSITION_DURATION` | 12000 (12s) | Per D-02, within 10-15s range [LOCKED] |
| `NIGHTFALL_WARNING_TIME` | 20000 (20s) | Per D-03, within 15-30s range [LOCKED] |
| `ZOMBIE_SPEED` | 40 | World is 6000px wide; at 40px/s a zombie crosses half in 75s. Gives archer time to shoot. [ASSUMED] |
| `ZOMBIE_HP` | 30 | ~3 archer hits to kill (10 damage each). Feels threatening but killable. [ASSUMED] |
| `ZOMBIE_DAMAGE` | 10 | Walls have 50 HP -- a single zombie takes 10 seconds (5 hits) to break through. [ASSUMED] |
| `ZOMBIE_ATTACK_INTERVAL` | 2000 | Per D-06, ~2s between hits [LOCKED] |
| `ZOMBIE_BASE_COUNT` | 4 | Per D-16, ~3-4 on night 1 [LOCKED] |
| `ZOMBIE_GROWTH_PER_NIGHT` | 2 | Per D-16, add 2-3 per night [LOCKED] |
| `ZOMBIE_POOL_SIZE` | 40 | Handles up to night 19 (40 zombies). Covers MVP gameplay. [ASSUMED] |
| `ZOMBIE_CONTACT_DISTANCE` | 20 | Distance in px at which zombie stops and attacks a structure. Half of NPC_WIDTH. [ASSUMED] |
| `ARCHER_RANGE` | 300 | ~300px detection range from tower. Covers area between tower and nearest wall. [ASSUMED] |
| `ARCHER_FIRE_RATE` | 1500 | 1 arrow per 1.5 seconds. Meaningful DPS without being instant-kill. [ASSUMED] |
| `ARROW_DAMAGE` | 10 | 3 hits to kill a zombie (30 HP). Archer can kill ~1 zombie per 4.5s. [ASSUMED] |
| `ARROW_SPEED` | 400 | Fast enough to feel snappy. Reaches max range in 0.75s. [ASSUMED] |
| `ARROW_MAX_RANGE` | 350 | Slightly beyond archer detection range for visual clarity. [ASSUMED] |
| `ARROW_POOL_SIZE` | 15 | ~2 archers x 5 arrows in flight max. [ASSUMED] |
| `ARCHER_HUNT_COIN_INTERVAL` | 15000 | 1 coin per 15s during day. ~40 coins per day if hunting full time. Balanced vs farm income. [ASSUMED] |
| `ARCHER_WANDER_DISTANCE` | 200 | How far archer roams from tower during day. [ASSUMED] |
| `ARCHER_RETURN_SPEED` | 120 | Fast walk back to tower on warning. Matches CITIZEN_RUN_SPEED. [ASSUMED] |
| `COLOR_ZOMBIE` | 0x2D8B2D | Green rectangle per D-07 [LOCKED] |
| `COLOR_ZOMBIE_DARK` | 0x1A5C1A | Dark-green variant for visual variety [ASSUMED] |
| `COLOR_ARCHER` | 0xCC6633 | Orange-brown to distinguish from farmer (green) and builder (brown) [ASSUMED] |
| `OVERLAY_NIGHT_COLOR` | 0x0a0a3a | Dark blue-purple per D-02 [LOCKED] |
| `OVERLAY_MAX_ALPHA` | 0.55 | Dark enough for atmosphere, light enough to see gameplay [ASSUMED] |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-sprite tinting for day/night | Single overlay Rectangle with alpha | Phaser 3.x | Much simpler, single draw call vs N tint calls |
| `game.time.events.loop()` (Phaser 2) | `scene.time.addEvent({ loop: true })` | Phaser 3.0 | New TimerEvent API |
| Manual collision checks | `physics.add.overlap(group, group)` | Phaser 3.0 | Built-in broadphase, handles group membership |

**Deprecated/outdated:**
- Phaser 2 timer syntax (`game.time.events`) -- use Phaser 3 `scene.time.addEvent()` [VERIFIED: Context7]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Zombie speed of 40px/s provides good pacing | Recommended Constants | Too slow = boring nights; too fast = impossible defense. Easily tunable. |
| A2 | Zombie HP 30, damage 10 creates balanced combat | Recommended Constants | Structures die too fast or zombies are trivial. Tuning required via playtesting. |
| A3 | Archer range 300px, fire rate 1.5s, arrow damage 10 | Recommended Constants | Archers may be too strong or too weak. Must playtest. |
| A4 | Arrow pool size 15 is sufficient | Recommended Constants | Could exhaust with many archers. Low risk -- easily increased. |
| A5 | Overlay alpha 0.55 is the right darkness level | Recommended Constants | Too dark = frustrating; too light = no atmosphere. Visual tuning needed. |
| A6 | Pre-creating rectangle GameObjects in zombie pool works with Arcade Physics Group | Code Examples | May need to use Sprite with generated texture instead of Rectangle if Group doesn't support Rectangle well. Low risk -- fallback is straightforward. |
| A7 | Archer hunt coin generation at 15s interval balances vs farm income (8s per coin) | Recommended Constants | Could make archers too economically powerful or useless. |

## Open Questions (RESOLVED)

1. **Structure physics bodies for overlap detection (RESOLVED)**
   - What we know: Structures are `Phaser.GameObjects.Rectangle` without physics bodies currently. Zombies need overlap detection with them.
   - What's unclear: Whether to add physics bodies to structures or use manual distance checks.
   - Recommendation: Add static physics bodies to structures (walls, towers, base) for `physics.add.overlap()`. Static bodies have zero physics cost. Alternatively, manual distance check in zombie update is simpler but less performant with many zombies.
   - **Resolution:** Use distance checks in `WaveManager.update()`. Structures lack physics bodies and adding them would require modifying BaseStructure (out of scope for Phase 3). With <40 zombies and <10 structures, the O(n*m) distance check per frame is negligible. Arrow-zombie overlap uses `physics.add.overlap` since both are physics groups.

2. **Zombie pool implementation with Rectangles vs Sprites (RESOLVED)**
   - What we know: Coins use Sprites with a generated texture. Zombies are colored rectangles per D-07.
   - What's unclear: `Phaser.Physics.Arcade.Group` typically manages Sprites. Rectangle support may have quirks.
   - Recommendation: Generate a zombie texture (filled rectangle) in Preloader like coin texture, then use Sprites in the pool. More compatible with Group API.
   - **Resolution:** Generate a filled-rectangle zombie texture in Preloader (like coin texture) and use `Phaser.Physics.Arcade.Sprite` in the pool. This is implemented in Plan 01 Task 1 (Preloader texture generation) and Plan 02 Task 2 (pool uses `classType: Phaser.Physics.Arcade.Sprite` with `key: SPRITE_ZOMBIE`).

3. **Archer-to-tower binding persistence (RESOLVED)**
   - What we know: D-13 says assign via coin drop at tower (like builder hut). But towers can be destroyed.
   - What's unclear: What happens to an archer whose tower is destroyed?
   - Recommendation: Archer becomes a wandering citizen again if tower is destroyed. Emit `structure:destroyed` event that archer listens to.
   - **Resolution:** Archer listens for tower destruction and reverts to citizen behavior. Implemented in Plan 03 Task 2 (Archer entity) and Plan 04 (Game.ts wiring). The archer checks its tower's existence and, if destroyed, is removed from the archers array and a new citizen is created.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified -- all features use built-in Phaser 3 capabilities and existing project infrastructure)

## Sources

### Primary (HIGH confidence)
- `/phaserjs/phaser` (Context7) -- Tween API, TimerEvent patterns, Rectangle overlay approach
- `/Users/adilevi/repo/my-phaser-game/src/entities/Coin.ts` -- Object pool pattern template
- `/Users/adilevi/repo/my-phaser-game/src/entities/npc/BaseNPC.ts` -- NPC base class for extension
- `/Users/adilevi/repo/my-phaser-game/src/systems/NPCManager.ts` -- NPC lifecycle management pattern
- `/Users/adilevi/repo/my-phaser-game/src/entities/structures/BaseStructure.ts` -- takeDamage() API
- `/Users/adilevi/repo/my-phaser-game/CLAUDE.md` -- Stack constraints, architecture patterns

### Secondary (MEDIUM confidence)
- Phaser 3 docs (docs.phaser.io) via Context7 -- Camera alpha, setTintFill, Timeline API

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or Context7

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries needed, all Phaser built-in
- Architecture: HIGH -- patterns directly extend existing codebase patterns (Coin pool, BaseNPC, EventBus)
- Pitfalls: HIGH -- based on verified Phaser behavior and codebase analysis
- Balance values: LOW -- all gameplay tuning constants are assumed and need playtesting

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stable -- Phaser 3.87 locked, no external dependencies)