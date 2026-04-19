# Phase 4: Combat & World Polish - Research

**Researched:** 2026-04-18
**Domain:** Phaser 3 combat systems, mouse-aimed shooting, world expansion, structure system extension
**Confidence:** HIGH

## Summary

Phase 4 adds hero combat (mouse-aimed ranged weapon), hero vulnerability (HP + game over), renames archers to gunners with a unified bullet system, introduces the armory structure, and expands the world from 6,000px to 20,000px with exploration zones. The codebase already has all the foundational patterns needed: object pooling (Arrow.ts/Coin.ts), projectile physics (Arrow.ts with `fireArrow`/`deactivateArrow`), structure building (BuildPoint + StructureManager), health bars (BaseStructure), and the day/night-driven NPC behavior (Archer.ts).

The primary technical challenge is adding mouse input to a keyboard-only game. Phaser 3's `this.input.activePointer` provides `worldX`/`worldY` for aim direction, and `Phaser.Math.Angle.Between` (already used in Arrow.ts) computes the rotation for the gun sprite. The existing Arrow entity is refactored into a Bullet entity, and both hero and gunners share the same bullet pool. The world expansion from 6,000px to 20,000px requires updating `WORLD_WIDTH`, `HERO_START_X`, `BUILD_POINT_LAYOUT`, physics bounds, camera bounds, and coin/vagrant spawn distributions.

**Primary recommendation:** Refactor Arrow.ts into Bullet.ts as the unified projectile system first, then layer hero combat (mouse aim + shooting) on top, then extend the world and build point layout last. This ordering minimizes integration risk.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Armory structure -- new buildable unlocked at main base level 3. Same coin-drop build pattern as all other structures.
- **D-02:** Ranged only -- one gun weapon for MVP. No melee weapons.
- **D-03:** Limited ammo -- hero gets a clip from armory, must return to restock. Restock costs coins.
- **D-04:** Mouse aim + click to shoot -- keyboard for movement, mouse cursor for aim, left-click fires. Coin drop stays on spacebar/down arrow.
- **D-05:** Gun sprite rotates toward mouse cursor. Hero body stays in normal animation -- only gun visual rotates.
- **D-06:** Bullet is a small colored rectangle, object-pooled like coins.
- **D-07:** Bullets stop on first hit -- each bullet damages one zombie, no piercing.
- **D-08:** Damage + knockback on hit -- zombie takes HP damage AND gets pushed back.
- **D-09:** Archers become gunners -- rename throughout. Towers become gun positions. Arrows removed entirely.
- **D-10:** Gunners and hero share the same bullet pool. Unified projectile system.
- **D-11:** Gunner behavior stays the same as Phase 3 archer behavior -- only weapon type and naming changes.
- **D-12:** Hero has HP -- zombies deal damage on contact.
- **D-13:** Hero death = game over -- same consequence as main base destruction.
- **D-14:** Hero health bar displayed in HUD, always visible.
- **D-15:** Hero HP value, zombie damage to hero -- Claude's discretion.
- **D-16:** World expands to 20,000px from 6,000px.
- **D-17:** Many more build points -- scaled up proportionally for 20,000px.
- **D-18:** Exploration zones beyond defensive perimeter with coin caches, abandoned structures, vagrant camps, resource buildings.

### Claude's Discretion
- Armory construction cost and ammo restock cost
- Ammo clip size, fire rate, bullet damage, bullet speed
- Hero HP value and zombie damage-to-hero value
- Bullet pool size (shared between hero and gunners)
- Gun sprite visual (size, color, rotation anchor point)
- Exact build point layout across 20,000px world
- Exploration zone placement, coin cache amounts, abandoned structure types
- Vagrant camp sizes and locations
- Resource building bonus types
- Hero knockback distance when hit by zombie (if any)
- Armory build point position relative to main base

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-03 | Hero can pick up weapons found in the world or dropped by enemies | Armory structure (D-01) is the weapon source. Hero visits armory, drops coins, receives ammo clip. Pattern reuses existing coin-drop build mechanic. No physical weapon pickup -- the armory grants the weapon capability. |
| HERO-04 | Hero can attack zombies with equipped weapon | Mouse aim (D-04) + left-click fire (D-04) + bullet pool (D-06, D-10) + damage on hit (D-07, D-08). Bullet entity replaces Arrow entity. Hero.ts extended with gun sprite child, shoot method, ammo tracking. |
| MAP-03 | One complete skirmish map with balanced layout | World expands to 20,000px (D-16) with symmetric build point layout (D-17), exploration zones (D-18) containing coin caches, abandoned structures, vagrant camps. All programmatic -- no Tiled dependency. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Mouse aim + gun rotation | Browser/Client (Phaser input) | -- | `this.input.activePointer` provides worldX/worldY; angle calculation is pure math |
| Bullet pool + projectile physics | Browser/Client (Arcade Physics) | -- | Object pool with velocity-based movement, overlap detection for hits |
| Hero HP + damage | Browser/Client (game state) | -- | HP tracked on Hero instance, zombie-hero overlap in Game.ts |
| Armory structure | Browser/Client (game state) | -- | Extends BuildPoint/BaseStructure pattern, no server interaction |
| World expansion + layout | Browser/Client (constants + spawning) | -- | All layout defined in constants.ts, spawned programmatically |
| HUD (health bar, ammo) | Browser/Client (Phaser UI) | -- | Fixed-position Text/Rectangle objects with setScrollFactor(0) |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | 3.87.0 (locked) | Game engine | Already in project. Arcade Physics, input system, object pooling all built-in. [VERIFIED: package.json] |
| TypeScript | 5.4.5 | Type safety | Already in project. [VERIFIED: package.json] |

### Supporting
No new libraries needed for Phase 4. All features are implemented using existing Phaser 3 APIs:
- `this.input.activePointer` for mouse position [VERIFIED: Context7 /phaserjs/phaser, Pointer API]
- `Phaser.Math.Angle.Between` for aim angle [VERIFIED: already used in Arrow.ts line 61]
- `Phaser.Physics.Arcade.Group` for bullet pool [VERIFIED: already used for arrows and zombies]
- `physics.add.overlap` for bullet-zombie and zombie-hero collisions [VERIFIED: already used in Game.ts]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Child image for gun sprite | Phaser Container | Container adds overhead; a simple child image with manual position/rotation is lighter for a single attachment |
| Manual ammo tracking | State machine plugin | Overkill for a single integer counter with reload mechanic |

## Architecture Patterns

### System Architecture Diagram

```
[Mouse Input] --> [Hero.update()] --> [Gun Sprite Rotation]
                        |
                  [Left Click] --> [fireBullet()] --> [Bullet Pool]
                        |                                  |
                  [Keyboard] --> [Hero Movement]     [physics.overlap]
                                                          |
                                                    [Zombie Pool]
                                                          |
                                                    [damageZombie() + knockback]

[Zombie Pool] --> [zombie march] --> [hero contact] --> [hero.takeDamage()]
                                                              |
                                                        [HP <= 0?] --> [Game Over]

[Armory BuildPoint] --> [coin deposit] --> [grantAmmo()] --> [hero.ammo += clipSize]

[Gunner NPC] --> [defendBehavior()] --> [fireBullet()] --> [same Bullet Pool]
```

### Recommended Project Structure
```
src/
  entities/
    Hero.ts              # Extended with gun sprite, HP, shoot(), takeDamage()
    Bullet.ts            # Replaces Arrow.ts -- unified projectile system
    npc/
      Gunner.ts          # Renamed from Archer.ts
    structures/
      Armory.ts          # New structure extending BaseStructure
  constants.ts           # Updated WORLD_WIDTH, new bullet/hero-HP/armory constants
  scenes/Game.ts         # New overlaps, mouse input, armory integration
  ui/HUD.ts              # Extended with hero health bar, ammo counter
```

### Pattern 1: Mouse-Aimed Gun Sprite
**What:** A child image attached to the hero sprite that rotates toward the mouse cursor
**When to use:** When the hero needs a visual weapon that tracks aim direction
**Example:**
```typescript
// Source: [VERIFIED: Context7 /phaserjs/phaser Pointer API + Angle.Between]
// In Hero constructor:
this.gunSprite = scene.add.rectangle(x, y, 16, 4, 0xCCCCCC).setDepth(4);

// In Hero update():
const pointer = this.scene.input.activePointer;
pointer.updateWorldPoint(this.scene.cameras.main);
const angle = Phaser.Math.Angle.Between(
  this.sprite.x, this.sprite.y,
  pointer.worldX, pointer.worldY
);
this.gunSprite.setRotation(angle);
this.gunSprite.setPosition(this.sprite.x, this.sprite.y);

// Flip handling: when aiming left, the gun should still look correct
if (pointer.worldX < this.sprite.x) {
  this.sprite.setFlipX(true);
} else {
  this.sprite.setFlipX(false);
}
```

### Pattern 2: Unified Bullet Pool (replaces Arrow)
**What:** Single object pool shared between hero and all gunner NPCs
**When to use:** D-10 requires unified projectile system
**Example:**
```typescript
// Source: [VERIFIED: existing Arrow.ts pattern in codebase]
// Bullet.ts -- refactored from Arrow.ts
export function fireBullet(
  pool: Phaser.Physics.Arcade.Group,
  fromX: number, fromY: number,
  targetX: number, targetY: number,
  scene: Phaser.Scene
): Phaser.Physics.Arcade.Sprite | null {
  const bullet = pool.get(fromX, fromY, SPRITE_BULLET) as Phaser.Physics.Arcade.Sprite;
  if (!bullet) return null;
  bullet.setActive(true).setVisible(true).setDepth(5);
  scene.physics.world.enable(bullet);
  (bullet.body as Phaser.Physics.Arcade.Body).enable = true;
  const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
  (bullet.body as Phaser.Physics.Arcade.Body).setVelocity(
    Math.cos(angle) * BULLET_SPEED,
    Math.sin(angle) * BULLET_SPEED
  );
  bullet.setData('startX', fromX);
  bullet.setData('startY', fromY);
  return bullet;
}
```

### Pattern 3: Hero HP with Zombie Contact Damage
**What:** Hero takes damage when zombies contact, with invincibility frames to prevent instant death
**When to use:** D-12 requires hero vulnerability
**Example:**
```typescript
// Source: [ASSUMED -- standard game pattern for contact damage]
// In Game.ts create():
this.physics.add.overlap(
  this.hero.sprite,
  this.waveManager.pool,
  (_heroSprite, zombieObj) => {
    const zombie = zombieObj as Phaser.Physics.Arcade.Sprite;
    if (!zombie.active) return;
    this.hero.takeDamage(ZOMBIE_DAMAGE_TO_HERO);
  }
);

// In Hero.ts:
private lastDamageTime: number = 0;
private readonly INVINCIBILITY_MS = 1000; // i-frames prevent rapid death

takeDamage(amount: number): void {
  const now = this.scene.time.now;
  if (now - this.lastDamageTime < this.INVINCIBILITY_MS) return;
  this.lastDamageTime = now;
  this.hp = Math.max(0, this.hp - amount);
  // Red flash feedback
  this.sprite.setTint(0xff0000);
  this.scene.time.delayedCall(100, () => this.sprite.clearTint());
  // Blink during i-frames
  this.scene.tweens.add({
    targets: this.sprite,
    alpha: { from: 0.3, to: 1 },
    duration: 100,
    repeat: 4,
  });
  if (this.hp <= 0) {
    EventBus.emit('hero:died');
  }
}
```

### Pattern 4: Knockback on Zombie Hit
**What:** When a bullet hits a zombie, push the zombie backward
**When to use:** D-08 requires knockback
**Example:**
```typescript
// Source: [VERIFIED: Phaser Arcade Physics setVelocity]
// In WaveManager.damageZombie():
damageZombie(zombie: Phaser.Physics.Arcade.Sprite, damage: number, bulletX?: number): void {
  const hp = (zombie.getData('hp') as number) - damage;
  zombie.setData('hp', hp);
  // Knockback: push zombie away from bullet origin
  if (bulletX !== undefined) {
    const dir = zombie.x > bulletX ? 1 : -1;
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(dir * ZOMBIE_KNOCKBACK_SPEED);
    // Resume normal march after knockback duration
    this.scene.time.delayedCall(ZOMBIE_KNOCKBACK_DURATION, () => {
      if (zombie.active && zombie.getData('state') !== ZombieState.Dying) {
        this.setMarchVelocity(zombie, this.findNearestStructure(zombie.x));
      }
    });
  }
  if (hp <= 0) this.killZombie(zombie);
}
```

### Anti-Patterns to Avoid
- **Using Phaser Container for gun attachment:** Containers have transform overhead and interfere with physics bodies. Use a standalone Rectangle/Image positioned manually relative to the hero sprite instead. [ASSUMED]
- **Separate bullet pools for hero and gunners:** D-10 explicitly requires a shared pool. Separate pools waste memory and complicate overlap registration.
- **Checking `pointer.isDown` in update() without debounce:** This fires every frame while held down. Use `this.input.on('pointerdown', ...)` for single-shot behavior, or track last fire time for fire-rate limiting.
- **Forgetting `pointer.updateWorldPoint(camera)` after camera scroll:** The pointer's worldX/worldY must be recalculated relative to the current camera position. Without this, aim direction will be wrong when the camera scrolls. [VERIFIED: Context7 Pointer API `updateWorldPoint(camera)` method]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Projectile pooling | Custom array management | `Phaser.Physics.Arcade.Group` with `createMultiple` | Already proven in Arrow.ts; handles activation, deactivation, pool exhaustion |
| Angle calculation | Manual trigonometry | `Phaser.Math.Angle.Between(x1,y1,x2,y2)` | Already used in Arrow.ts; returns radians directly |
| Health bar rendering | DOM elements or canvas text | `Phaser.GameObjects.Rectangle` pair (bg + fill) | Already established pattern in BaseStructure.ts |
| Invincibility flash | Manual alpha toggling | `scene.tweens.add` with alpha yoyo + repeat | Consistent with existing tween patterns throughout codebase |
| Distance checks | `Math.sqrt(dx*dx + dy*dy)` | `Phaser.Math.Distance.Between` or simple `Math.abs(x1-x2)` for 1D | Game is side-scrolling; most distance checks are 1D (x-axis only) |

## Common Pitfalls

### Pitfall 1: Mouse World Coordinates vs Screen Coordinates
**What goes wrong:** Aim direction is incorrect when camera has scrolled from the initial position.
**Why it happens:** `pointer.x`/`pointer.y` are screen-space; the hero's `sprite.x`/`sprite.y` are world-space. Using screen coordinates for angle calculation produces wrong angles.
**How to avoid:** Always use `pointer.worldX`/`pointer.worldY` after calling `pointer.updateWorldPoint(this.cameras.main)`. The Phaser pointer auto-updates worldX/worldY each frame when using `activePointer`, but explicitly calling updateWorldPoint guarantees correctness.
**Warning signs:** Bullets fly in wrong direction when hero is far from world origin.

### Pitfall 2: World Width Change Breaking Spawn Positions
**What goes wrong:** After changing WORLD_WIDTH from 6,000 to 20,000, zombies spawn in wrong positions, vagrants appear at old edge positions, coins cluster in the first 6,000px.
**Why it happens:** Multiple systems use `WORLD_WIDTH` directly: WaveManager spawn margins, NPCManager vagrant positions, initial coin distribution, camera bounds, physics world bounds.
**How to avoid:** Grep for all `WORLD_WIDTH` and `6000` and `3000` references. Update every one. Key locations:
- `Game.ts create()`: physics bounds, camera bounds, ground rectangle width
- `WaveManager.ts`: zombie spawn at `ZOMBIE_SPAWN_MARGIN` and `WORLD_WIDTH - ZOMBIE_SPAWN_MARGIN`
- `NPCManager.ts`: vagrant spawn positions hardcoded as `Phaser.Math.Between(400, 800)` etc.
- `constants.ts`: `HERO_START_X = 3000` must become `10000`
- `constants.ts`: `BUILD_POINT_POSITIONS` and `BUILD_POINT_LAYOUT` x-coordinates centered on 3000
**Warning signs:** Entities cluster in one corner of the expanded map.

### Pitfall 3: Bullet Pool Exhaustion with Shared Pool
**What goes wrong:** Hero can't shoot because gunners consumed all bullets, or vice versa.
**Why it happens:** D-10 requires shared pool. If pool size is too small for the number of active gunners + hero firing, `pool.get()` returns null.
**How to avoid:** Size the pool generously. With ~4-6 gunners firing every 1.5s and hero firing faster, budget ~40-50 bullets. Current ARROW_POOL_SIZE is 15 -- must increase significantly. Each bullet travels at BULLET_SPEED and deactivates after BULLET_MAX_RANGE or on hit, so pool turnover is fast.
**Warning signs:** `console.warn('Bullet pool exhausted')` appearing in console.

### Pitfall 4: Hero Instant Death from Zombie Swarm
**What goes wrong:** Hero contacts multiple zombies in a cluster and HP drops to 0 in a single frame.
**Why it happens:** `physics.add.overlap` fires for each overlapping zombie on the same frame. Without invincibility frames, 4 zombies = 4x damage instantly.
**How to avoid:** Implement invincibility frames (i-frames) -- after taking damage, hero is immune for ~1 second. Track `lastDamageTime` and skip damage if within cooldown. Visual feedback (blinking) communicates the invulnerable state.
**Warning signs:** Hero dies immediately on first zombie contact.

### Pitfall 5: Gun Sprite Flip Issue When Hero Faces Left
**What goes wrong:** Gun sprite appears mirrored/upside down when hero faces left because `setFlipX(true)` doesn't affect child rotation.
**Why it happens:** The gun is a separate GameObject positioned relative to the hero. When the hero flips, the gun's rotation anchor and offset need manual adjustment.
**How to avoid:** When aiming left (angle > PI/2 or < -PI/2), add PI to the gun rotation and offset the gun to the hero's left side. Or: use `setFlipY(true)` on the gun sprite when aiming left to mirror it vertically.
**Warning signs:** Gun visually clips through hero or points backward.

## Code Examples

### Armory Structure (extending BaseStructure)
```typescript
// Source: [VERIFIED: BaseStructure.ts pattern in codebase]
import { BaseStructure } from './BaseStructure';

export const ARMORY_WIDTH = 48;
export const ARMORY_HEIGHT = 48;
export const ARMORY_HP = 80;
export const COLOR_ARMORY = 0x8888CC;
export const ARMORY_COST = 8;
export const AMMO_RESTOCK_COST = 2;
export const AMMO_CLIP_SIZE = 12;

export class Armory extends BaseStructure {
  constructor(scene: Phaser.Scene, x: number, buildPointId: string) {
    super(scene, x, ARMORY_WIDTH, ARMORY_HEIGHT, COLOR_ARMORY, ARMORY_HP, buildPointId, 'armory');
  }
}
```

### Hero Health Bar in HUD
```typescript
// Source: [VERIFIED: HUD.ts pattern in codebase]
// Add to HUD constructor:
this.healthBg = scene.add.rectangle(
  scene.scale.width / 2, HUD_Y, 100, 8, COLOR_HEALTH_BG
).setScrollFactor(0).setDepth(HUD_DEPTH);
this.healthFill = scene.add.rectangle(
  scene.scale.width / 2, HUD_Y, 100, 8, COLOR_HEALTH_HIGH
).setScrollFactor(0).setDepth(HUD_DEPTH);

// Listen for hero HP changes:
EventBus.on('hero:hp-changed', (data: { hp: number; maxHp: number }) => {
  const ratio = data.hp / data.maxHp;
  this.healthFill.width = 100 * ratio;
  // Color based on ratio -- same as structure health bars
});
```

### Expanded Build Point Layout Pattern
```typescript
// Source: [ASSUMED -- based on existing BUILD_POINT_LAYOUT pattern]
// World center at 10000 (20000/2). Symmetric layout with progressive tiers.
// Inner defense ring: walls + towers at ~1000px from center
// Mid defense ring: walls + towers at ~2500px from center
// Outer defense ring: walls + towers at ~4000px from center
// Exploration zone: 5000-9500px from center on each side

export const BUILD_POINT_LAYOUT: BuildPointConfig[] = [
  // Base
  { id: 'bp-base', x: 10000, type: 'base', unlockTier: 0 },
  // Inner ring (tier 0)
  { id: 'bp-wall-L1', x: 9000, type: 'wall', unlockTier: 0 },
  { id: 'bp-wall-R1', x: 11000, type: 'wall', unlockTier: 0 },
  // ... more build points at progressive distances and unlock tiers
  // Armory (tier 3)
  { id: 'bp-armory', x: 10200, type: 'armory', unlockTier: 3 },
  // Exploration zone structures
  { id: 'bp-ruin-L1', x: 5000, type: 'ruin', unlockTier: 0 },
  // ... etc
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Arrow entity (Arrow.ts) | Bullet entity (Bullet.ts) | Phase 4 | All projectiles become bullets; Arrow.ts deleted |
| Archer NPC class | Gunner NPC class | Phase 4 | Rename Archer.ts to Gunner.ts, update all references |
| 6,000px world | 20,000px world | Phase 4 | All position constants rescaled; world ~3.3x wider |
| Hero has no HP | Hero has HP + game over on death | Phase 4 | New lose condition alongside base destruction |
| Keyboard-only input | Keyboard + mouse input | Phase 4 | Mouse aim for combat; keyboard unchanged for movement/coin drop |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Invincibility frames of ~1000ms are appropriate for hero damage | Pattern 3 / Pitfall 4 | Hero either dies too fast or is too tanky; easily tuned via constant |
| A2 | Phaser Container overhead is significant enough to avoid for gun sprite | Anti-Patterns | Container might be fine; manual positioning is more work but safer for physics |
| A3 | Bullet pool of 40-50 is sufficient for hero + 4-6 gunners | Pitfall 3 | Pool exhaustion if too small; wasted memory if too large; easily tuned |
| A4 | `pointer.updateWorldPoint` must be called explicitly | Pitfall 1 | Phaser may auto-update worldX/worldY each frame -- needs testing |
| A5 | Gun flip behavior requires manual PI offset when aiming left | Pitfall 5 | Simpler solution may exist; needs testing during implementation |

## Open Questions

1. **Hero HP balance**
   - What we know: Zombies deal 10 damage to structures (ZOMBIE_DAMAGE constant). Hero should survive multiple hits.
   - What's unclear: Exact HP value that feels fair. Too high = no tension. Too low = frustrating.
   - Recommendation: Start with HERO_HP = 100, ZOMBIE_DAMAGE_TO_HERO = 15. Hero survives ~6 hits. Tune based on playtesting. [ASSUMED]

2. **Ammo clip size and fire rate balance**
   - What we know: Ammo must create tension (D-03). Must return to armory to restock.
   - What's unclear: How many bullets per clip feels right. How fast should hero fire.
   - Recommendation: Clip size = 12, fire rate = 300ms (3.3 shots/sec), bullet damage = 15 (kills zombie in 2 hits). Restock cost = 2 coins. [ASSUMED]

3. **Exploration zone content density**
   - What we know: 20,000px world with zones containing coin caches, ruins, vagrant camps (D-18).
   - What's unclear: How many of each, how much coin per cache, how far apart.
   - Recommendation: Scatter 6-8 coin caches (5-10 coins each), 2-4 repairable ruins, 3-4 vagrant camps (2-3 vagrants each) across the exploration zones (beyond ~5000px from center on each side). [ASSUMED]

4. **`pointer.updateWorldPoint` auto-update behavior**
   - What we know: Context7 docs show it as a method on Pointer.
   - What's unclear: Whether Phaser auto-calls it each frame when using `activePointer` or requires manual call.
   - Recommendation: Test in implementation. If worldX/worldY update automatically, omit the explicit call.

## Discretion Recommendations

Based on game balance and consistency with existing constants:

| Parameter | Recommended Value | Rationale |
|-----------|-------------------|-----------|
| HERO_HP | 100 | Same scale as structure HP; survives ~6 zombie hits |
| ZOMBIE_DAMAGE_TO_HERO | 15 | Slightly higher than structure damage (10) since hero is mobile and can escape |
| HERO_INVINCIBILITY_MS | 1000 | Prevents instant death from swarms; standard i-frame duration |
| BULLET_SPEED | 500 | Faster than ARROW_SPEED (400) for futuristic feel |
| BULLET_DAMAGE | 15 | Kills zombie (30 HP) in 2 hits; same as current ARROW_DAMAGE=10 was 3 hits |
| BULLET_MAX_RANGE | 400 | Slightly longer than ARROW_MAX_RANGE (350) |
| BULLET_POOL_SIZE | 40 | Handles hero + 6 gunners simultaneously |
| HERO_FIRE_RATE | 300 | ms between shots; fast but not overwhelming |
| AMMO_CLIP_SIZE | 12 | ~3.6 seconds of continuous fire; forces strategic use |
| AMMO_RESTOCK_COST | 2 | Cheap enough to restock often, expensive enough to create pressure |
| ARMORY_COST | 8 | More than tower (6), less than a full base upgrade |
| ARMORY_HP | 80 | Between tower (60) and base tier 1 (100) |
| ZOMBIE_KNOCKBACK_SPEED | 150 | Brief push; 3-4x zombie walk speed |
| ZOMBIE_KNOCKBACK_DURATION | 200 | ms; quick stagger, not a stun |
| GUN_SPRITE_WIDTH | 16 | Matches scale of hero (24px body width) |
| GUN_SPRITE_HEIGHT | 4 | Thin rectangle, visible but not dominant |
| GUN_COLOR | 0xCCCCCC | Light gray; distinct from hero sprite |

## Sources

### Primary (HIGH confidence)
- Context7 `/phaserjs/phaser` -- Pointer API (worldX, worldY, leftButtonDown, updateWorldPoint), Arcade Physics (overlap, collider, setVelocity), Container nesting
- Codebase files -- Arrow.ts, Archer.ts, BaseStructure.ts, BuildPoint.ts, StructureManager.ts, Game.ts, Hero.ts, WaveManager.ts, NPCManager.ts, HUD.ts, constants.ts

### Secondary (MEDIUM confidence)
- None needed; all patterns exist in codebase already

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries needed, all Phaser 3 built-in APIs
- Architecture: HIGH -- extends existing proven patterns (Arrow->Bullet, Structure->Armory, Hero HP mirrors Structure HP)
- Pitfalls: HIGH -- all identified pitfalls have clear solutions based on codebase patterns
- Balance values: LOW -- all numeric values (HP, damage, ammo) are educated guesses requiring playtesting

**Research date:** 2026-04-18
**Valid until:** 2026-05-18 (stable -- no external dependency changes expected)
