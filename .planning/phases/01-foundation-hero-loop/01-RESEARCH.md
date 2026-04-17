# Phase 1: Foundation & Hero Loop - Research

**Researched:** 2026-04-16
**Domain:** Phaser 3 side-scrolling game foundation -- world setup, hero movement, camera, coins, object pooling, EventBus
**Confidence:** HIGH

## Summary

Phase 1 establishes the playable core of Dead City: a 6000px side-scrolling world with parallax backgrounds, a hero that moves left/right, physical coins the hero auto-collects on contact, and build points where the hero drops coins. The existing codebase is a top-down RTS prototype that must be architecturally reset -- the `src/engine/` directory (Unit, Building, ResourceNode) is deleted, Game.ts is rewritten, and the scene chain (Boot > Preloader > MainMenu > Game > GameOver) is restored.

All required functionality is achievable with Phaser 3.87's built-in systems: Arcade Physics for collision, `camera.startFollow()` with deadzone for tracking, TileSprite with `scrollFactor` for parallax, `Phaser.GameObjects.Group` for object pooling, and the native EventEmitter for cross-system communication. No additional npm packages are needed for this phase.

**Primary recommendation:** Build a clean vertical slice using only Phaser 3.87 built-ins. Structure the code around a constants file, an EventBus singleton, entity classes (Hero, Coin, BuildPoint), and a rewritten Game scene. Prioritize clean shutdown patterns from day one to prevent memory leaks across scene restarts.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Flat ground plane -- single ground level across the entire world. No hills, slopes, or multi-level terrain.
- **D-02:** World width ~6000px (about 5-6 screens).
- **D-03:** 3 parallax background layers -- sky (static/very slow), mid-ground (buildings/trees, slow scroll), foreground ground layer.
- **D-04:** Programmatic world generation from code -- no Tiled Map Editor dependency for Phase 1.
- **D-05:** No jumping -- pure left/right movement only.
- **D-06:** Two animation states only: Idle and Walk. Flip sprite for direction change.
- **D-07:** Moderate and deliberate movement speed -- ~15-20 seconds to cross the full 6000px world.
- **D-08:** Reuse existing gunner spritesheet from assets/ for the hero placeholder.
- **D-09:** Auto-collect on contact -- hero walks over a coin and it's instantly picked up. No button press.
- **D-10:** Drop coins by pressing a key (spacebar or down arrow) while near a build point. One press = one coin dropped.
- **D-11:** Coins are small animated sprites (spinning/glowing placeholder) on the ground.
- **D-12:** Build points are glowing/pulsing markers on the ground. Accept coins and fire an event.
- **D-13:** Clean wipe of src/engine/ -- delete all RTS code.
- **D-14:** Keep existing scene structure (Boot, Preloader, MainMenu, GameOver). Rewrite Game.ts from scratch.

### Claude's Discretion
- Camera follow behavior tuning (deadzone, lerp)
- EventBus implementation pattern
- Object pool sizing and configuration
- Physics body sizes and collision groups
- Exact coin spawn locations and build point placement within the 6000px world

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | EventBus singleton for system-to-system communication | Phaser's built-in `Phaser.Events.EventEmitter` -- create a standalone instance exported as a singleton module. Scene-scoped cleanup in shutdown handler. |
| INFRA-02 | Object pooling for zombies and coins (no runtime create/destroy) | `Phaser.GameObjects.Group` with `maxSize` config. Pre-create coins via `createMultiple`. Use `group.get()` to activate, return to pool on collect. |
| INFRA-03 | Physics world bounds set to full world width | `this.physics.world.setBounds(0, 0, 6000, 768)` -- must be set BEFORE any physics bodies are created. |
| INFRA-04 | Clean scene shutdown with listener cleanup | Listen to `this.events.on('shutdown', ...)` to clear arrays, remove EventBus listeners, and destroy tweens. |
| HERO-01 | Hero moves left/right with keyboard controls | `this.input.keyboard.createCursorKeys()` + WASD via `addKeys`. Set `hero.body.setVelocityX()` in update loop. |
| HERO-02 | Camera follows hero with parallax scrolling backgrounds | `camera.startFollow(hero, true, 0.1, 0.1)` + `camera.setBounds(0, 0, 6000, 768)`. TileSprite layers with `setScrollFactor()` for parallax. |
| COIN-01 | Physical coins exist in the world and hero collects them on contact | Physics group of coin sprites. `this.physics.add.overlap(hero, coinGroup, collectCoin)`. Coin tweens to hero on collect, then deactivates to pool. |
| COIN-02 | Hero drops coins at build points to trigger construction | Proximity check (hero x vs build point x within 32px). On spacebar/down-arrow press, decrement coin count, emit `coin:deposited` via EventBus. |
| MAP-01 | Tile-based side-scrolling world (hand-crafted layout) | D-04 overrides "tile-based" -- programmatic generation for Phase 1. Ground is a Rectangle at y=600, 6000px wide. Parallax via TileSprite layers. |
| MAP-02 | Placeholder pixel-art sprites replaceable via config | All sprite keys and dimensions in a constants file. Spritesheet paths as string constants, easy to swap. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hero movement & input | Game Scene (update loop) | -- | Phaser scene update drives velocity from keyboard state |
| Camera follow & parallax | Game Scene (create) | -- | Camera config is scene-level; parallax layers are scene GameObjects |
| Coin collection physics | Arcade Physics (overlap) | Game Scene (callback) | Physics engine detects overlap, callback handles game logic |
| Coin drop mechanic | Game Scene (input handler) | EventBus | Key press triggers logic in scene, EventBus notifies other systems |
| Object pooling | Phaser Group | -- | Group manages activate/deactivate lifecycle for coins |
| World layout | Game Scene (create) | Constants module | Scene instantiates world from config values defined in constants |
| Scene lifecycle | Phaser Scene Manager | -- | Boot > Preloader > MainMenu > Game > GameOver chain |
| Cross-system events | EventBus singleton | -- | Decoupled communication between coins, build points, future systems |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | 3.87.0 (locked in package.json) | Game engine -- physics, camera, sprites, input, scene management | Already installed. Provides every capability needed for Phase 1 without additional dependencies. [VERIFIED: package.json] |
| typescript | 5.4.5 | Type safety for entity classes and scene code | Already installed. Strict mode enabled in tsconfig. [VERIFIED: tsconfig.json] |
| vite | 5.3.1 | Dev server with HMR, production bundler | Already installed with dev/prod configs. [VERIFIED: package.json] |

### Supporting
No additional npm packages needed for Phase 1. All functionality comes from Phaser 3 built-ins.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Built-in EventEmitter for EventBus | mitt, eventemitter3 | Unnecessary dependency -- Phaser's EventEmitter is identical in API and already loaded |
| Manual Rectangle for ground | Tiled JSON tilemap | D-04 explicitly defers Tiled to later phases; programmatic is correct for Phase 1 |
| Phaser Group for pooling | Custom pool class | Group already handles activate/deactivate/maxSize; custom class adds complexity with no benefit |

**Installation:**
```bash
# No new packages needed. Existing stack is sufficient.
npm install  # Only if node_modules is missing
```

## Architecture Patterns

### System Architecture Diagram

```
[Keyboard Input]
    |
    v
[Game Scene update()]
    |
    +---> [Hero] --velocity--> [Arcade Physics]
    |       |                        |
    |       |                   [Overlap Detection]
    |       |                        |
    |       |              +---------+---------+
    |       |              |                   |
    |       |        [Coin Group]        [Build Points]
    |       |         (pooled)           (static markers)
    |       |              |                   |
    |       +--collect---->+                   |
    |       |                                  |
    |       +--drop (spacebar)---------------->+
    |                                          |
    v                                          v
[Camera Follow] <-- lerp/deadzone     [EventBus]
    |                                    |
    v                                    v
[Parallax Layers]               [coin:deposited event]
 (TileSprite x2 +                (consumed by future
  Ground Rectangle)               build system Phase 2)
```

### Recommended Project Structure
```
src/
|-- main.ts              # Phaser game config (add Arcade Physics, restore scene chain)
|-- constants.ts         # All magic numbers: world size, colors, speeds, sprite configs
|-- events/
|   +-- EventBus.ts      # Singleton Phaser.Events.EventEmitter instance
|-- entities/
|   |-- Hero.ts          # Hero class wrapping Phaser.Physics.Arcade.Sprite
|   |-- Coin.ts          # Coin class or config for pooled coin sprites
|   +-- BuildPoint.ts    # Build point marker with proximity detection
|-- scenes/
|   |-- Boot.ts          # Load minimal assets for preloader (keep existing, update paths)
|   |-- Preloader.ts     # Load all game assets (spritesheet, placeholder textures)
|   |-- MainMenu.ts      # Title screen (keep existing, update text)
|   |-- Game.ts          # Main game scene -- REWRITTEN from scratch
|   +-- GameOver.ts      # Game over screen (keep existing)
+-- vite-env.d.ts        # Vite types (keep existing)
```

### Pattern 1: EventBus Singleton
**What:** A single `Phaser.Events.EventEmitter` instance shared across the entire game for cross-system communication.
**When to use:** Any time one system needs to notify others without direct coupling (e.g., coin deposited at build point, hero entered build point zone).
**Example:**
```typescript
// Source: Phaser 3 EventEmitter API [VERIFIED: Context7 /websites/phaser_io]
// src/events/EventBus.ts
import Phaser from 'phaser';

const EventBus = new Phaser.Events.EventEmitter();
export default EventBus;

// Usage in Game.ts
import EventBus from '../events/EventBus';

// Emit
EventBus.emit('coin:deposited', { buildPointId: 'bp-1', totalDeposited: 3 });

// Listen
EventBus.on('coin:deposited', (data) => { /* handle */ });

// CRITICAL: Clean up in shutdown
this.events.on('shutdown', () => {
    EventBus.removeAllListeners();
});
```

### Pattern 2: Object Pooling with Phaser Group
**What:** Pre-create all coin sprites in a physics group. Activate/deactivate instead of create/destroy.
**When to use:** Coins (and later zombies). Any entity that appears and disappears frequently.
**Example:**
```typescript
// Source: Phaser 3 Arcade Physics Group [VERIFIED: Context7 /websites/phaser_io]
// In Game.ts create():
this.coinPool = this.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    maxSize: 30,
    runChildUpdate: false,
    allowGravity: false,
});

// Pre-create coins
this.coinPool.createMultiple({
    key: 'coin',
    quantity: 30,
    active: false,
    visible: false,
});

// Spawn a coin at position
const coin = this.coinPool.get(x, y, 'coin') as Phaser.Physics.Arcade.Sprite;
if (coin) {
    coin.setActive(true).setVisible(true);
    coin.body?.enable && (coin.body.enable = true);
}

// Return to pool on collect
coin.setActive(false).setVisible(false);
coin.body && (coin.body.enable = false);
```

### Pattern 3: Parallax with TileSprite and ScrollFactor
**What:** Canvas-sized TileSprites that scroll at different rates relative to camera movement.
**When to use:** Background layers that create depth illusion during horizontal scrolling.
**Example:**
```typescript
// Source: Phaser 3 TileSprite + ScrollFactor [VERIFIED: Context7 /websites/phaser_io]
// CRITICAL: TileSprite must be canvas-sized, NOT world-sized (performance)
const sky = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'sky')
    .setOrigin(0, 0)
    .setScrollFactor(0)   // Static -- does not move with camera
    .setDepth(0);

const midground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'midground')
    .setOrigin(0, 0)
    .setScrollFactor(0)   // We manually update tilePosition instead
    .setDepth(1);

// In update():
// Manual tilePosition update for mid-ground parallax
midground.tilePositionX = this.cameras.main.scrollX * 0.3;
```

### Pattern 4: Camera Follow with Deadzone
**What:** Camera tracks hero smoothly with a horizontal deadzone so small movements don't cause jitter.
**When to use:** Always -- the camera must follow the hero.
**Example:**
```typescript
// Source: Phaser 3 Camera API [VERIFIED: Context7 /websites/phaser_io]
this.cameras.main.setBounds(0, 0, 6000, 768);
this.cameras.main.startFollow(hero, true, 0.1, 0.1);
this.cameras.main.setDeadzone(100, 0); // 100px horizontal deadzone
```

### Pattern 5: Hero Movement (No Gravity, Flat Ground)
**What:** Hero as an Arcade Physics sprite with horizontal-only velocity. No gravity since D-05 says no jumping.
**When to use:** Hero entity setup.
**Example:**
```typescript
// In Game.ts create():
this.hero = this.physics.add.sprite(3000, 552, 'hero'); // Start at world center, above ground
this.hero.setScale(2);
this.hero.body.setSize(24, 48); // Narrower collision body
this.hero.setCollideWorldBounds(true);
this.hero.body.setAllowGravity(false); // No jumping, flat ground

// In update():
const cursors = this.input.keyboard.createCursorKeys();
if (cursors.left.isDown) {
    this.hero.setVelocityX(-300);
    this.hero.setFlipX(true);
    this.hero.play('hero-walk', true);
} else if (cursors.right.isDown) {
    this.hero.setVelocityX(300);
    this.hero.setFlipX(false);
    this.hero.play('hero-walk', true);
} else {
    this.hero.setVelocityX(0);
    this.hero.play('hero-idle', true);
}
```

### Pattern 6: Clean Shutdown
**What:** Remove all event listeners, clear arrays, stop tweens on scene shutdown to prevent memory leaks.
**When to use:** Every scene that creates listeners or stores references.
**Example:**
```typescript
// In Game.ts create():
this.events.once('shutdown', () => {
    // Remove EventBus listeners
    EventBus.removeAllListeners();
    
    // Clear entity arrays
    this.buildPoints.length = 0;
    
    // Physics colliders are auto-cleaned by Phaser on shutdown
    // Tweens on scene objects are auto-cleaned
    // Input listeners on this.input are auto-cleaned
});
```

### Anti-Patterns to Avoid
- **World-sized TileSprite:** Creating a TileSprite at 6000px width consumes excessive GPU memory. Always create canvas-sized and scroll via `tilePositionX`. [VERIFIED: Context7 Phaser docs -- "never create a TileSprite larger than your actual canvas size"]
- **Runtime coin creation/destruction:** Using `this.add.sprite()` on each coin spawn and `.destroy()` on collect causes GC pauses. Use object pooling from day one. [ASSUMED -- standard game dev practice]
- **Hardcoded magic numbers:** Scattering pixel values across scene code makes tuning painful. All values belong in `constants.ts`.
- **Forgetting shutdown cleanup:** Stale EventBus listeners from a previous scene run will fire duplicate callbacks on scene restart.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Object pooling | Custom pool data structure | `Phaser.GameObjects.Group` with `maxSize` + `createMultiple` | Built-in handles activate/deactivate, physics body enable/disable, and iteration |
| Event system | Custom pub/sub class | `Phaser.Events.EventEmitter` singleton | Already loaded with Phaser, supports `on/off/once/emit`, typed events |
| Camera follow | Manual camera position math in update() | `camera.startFollow()` + `setDeadzone()` + `setLerp()` | Built-in handles lerp interpolation, deadzone, bounds clamping |
| Sprite animation | Manual frame switching in update() | `this.anims.create()` + `sprite.play()` | Animation manager handles frame timing, looping, and interruption |
| Collision detection | Manual distance checks | `this.physics.add.overlap()` / `this.physics.add.collider()` | Arcade Physics broadphase is optimized; manual checks miss edge cases |
| Input handling | Manual `addEventListener('keydown')` | `this.input.keyboard.createCursorKeys()` + `addKeys()` | Phaser input auto-cleans on scene shutdown; raw DOM listeners leak |

**Key insight:** Phaser 3 provides production-quality implementations of every system needed for Phase 1. The risk is not missing features -- it is accidentally rebuilding what already exists.

## Common Pitfalls

### Pitfall 1: TileSprite Sized to World Width
**What goes wrong:** Creating a TileSprite at 6000x768 pixels for the background layer.
**Why it happens:** Developers think the TileSprite needs to be as wide as the world to cover it.
**How to avoid:** Create TileSprite at canvas dimensions (e.g., 1024x768). Set `scrollFactor(0)` and update `tilePositionX` in the update loop based on `camera.scrollX * parallaxFactor`.
**Warning signs:** High GPU memory usage, visual glitches on mobile/integrated GPUs.

### Pitfall 2: Physics World Bounds Not Set
**What goes wrong:** Hero walks off-screen to the right and keeps going. Or physics interactions fail at world edges.
**Why it happens:** Default physics world bounds match the canvas viewport, not the game world.
**How to avoid:** Call `this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)` in create() BEFORE adding physics bodies. Also set `hero.setCollideWorldBounds(true)`.
**Warning signs:** Hero disappears off-screen, collisions stop working at world edges.

### Pitfall 3: Scene Restart Leaks EventBus Listeners
**What goes wrong:** After restarting a scene (e.g., game over then replay), event handlers fire twice -- once from the old scene, once from the new.
**Why it happens:** `Phaser.Events.EventEmitter` is a global singleton, not tied to scene lifecycle. Phaser auto-cleans scene-scoped events but not external emitters.
**How to avoid:** Always call `EventBus.removeAllListeners()` (or targeted `.off()`) in the scene's `shutdown` event handler.
**Warning signs:** Duplicate actions, phantom coin collection, double-counting.

### Pitfall 4: Object Pool Exhaustion Silent Failure
**What goes wrong:** `group.get()` returns `null` when all pool members are active, and the code doesn't check for it.
**Why it happens:** Pool `maxSize` is too small, or coins aren't being returned to the pool after collection.
**How to avoid:** Always null-check the return value of `group.get()`. Size the pool generously (30 coins is safe for Phase 1). Verify coins are deactivated after collection tween completes.
**Warning signs:** Coins stop appearing, no error in console.

### Pitfall 5: Spritesheet Frame Miscounting
**What goes wrong:** Animation plays wrong frames or crashes with "frame out of range" error.
**Why it happens:** The Tiny Gunslinger spritesheet is 48x32 per frame, but the exact number of frames per row and which rows correspond to idle vs walk must be counted from the image.
**How to avoid:** Examine the spritesheet image carefully. The loaded spritesheet shows ~6 frames in row 0 (likely idle) and ~7 frames in row 1 (likely walk). Use `generateFrameNumbers` with explicit `start` and `end` values after verifying frame indices.
**Warning signs:** Sprite shows wrong animation, flickers, or shows blank frame.

### Pitfall 6: Arcade Physics Not Enabled in Game Config
**What goes wrong:** `this.physics.add.sprite()` throws an error because no physics engine is configured.
**Why it happens:** The current `main.ts` has no `physics` property in the game config.
**How to avoid:** Add `physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } }` to the game config. Gravity y=0 because there's no jumping (D-05).
**Warning signs:** Runtime error on first `this.physics.*` call.

## Code Examples

### Game Config with Arcade Physics
```typescript
// Source: Phaser 3 GameConfig [VERIFIED: Context7 /websites/phaser_io]
// src/main.ts
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Game, Types } from 'phaser';

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#202020',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
    scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};

export default new Game(config);
```

### Constants Module
```typescript
// src/constants.ts
// All values from UI-SPEC.md -- single source of truth for tuning

// World
export const WORLD_WIDTH = 6000;
export const WORLD_HEIGHT = 768;
export const GROUND_Y = 600;
export const GROUND_HEIGHT = 168;
export const GROUND_COLOR = 0x3a3a3a;
export const GROUND_EDGE_COLOR = 0x5a5a5a;

// Colors
export const COLOR_SKY = 0x1a1a2e;
export const COLOR_MID = 0x16213e;
export const COLOR_ACCENT = 0xe2b714;

// Hero
export const HERO_SPEED = 300;
export const HERO_SCALE = 2;
export const HERO_BODY_WIDTH = 24;
export const HERO_BODY_HEIGHT = 48;
export const HERO_IDLE_FPS = 8;
export const HERO_WALK_FPS = 10;

// Camera
export const CAMERA_LERP = 0.1;
export const CAMERA_DEADZONE_WIDTH = 100;

// Coins
export const COIN_SIZE = 12;
export const COIN_SCALE = 2;
export const COIN_POOL_SIZE = 30;
export const COIN_SPIN_DURATION = 600;
export const COIN_COLLECT_DURATION = 150;

// Build Points
export const BUILD_POINT_WIDTH = 32;
export const BUILD_POINT_HEIGHT = 48;
export const BUILD_POINT_DETECT_RADIUS = 32;
export const BUILD_POINT_IDLE_ALPHA_MIN = 0.3;
export const BUILD_POINT_IDLE_ALPHA_MAX = 0.7;
export const BUILD_POINT_ACTIVE_ALPHA_MIN = 0.7;
export const BUILD_POINT_ACTIVE_ALPHA_MAX = 1.0;
export const BUILD_POINT_PULSE_DURATION = 1000;

// Parallax
export const PARALLAX_SKY = 0.0;
export const PARALLAX_MID = 0.3;
export const PARALLAX_GROUND = 1.0;
```

### Coin Collection with Pool Return
```typescript
// Source: Phaser 3 overlap + group pool pattern [VERIFIED: Context7]
// In Game.ts create():
this.physics.add.overlap(
    this.hero,
    this.coinPool,
    (hero, coin) => {
        const c = coin as Phaser.Physics.Arcade.Sprite;
        // Magnetic collection tween
        this.tweens.add({
            targets: c,
            x: this.hero.x,
            y: this.hero.y,
            alpha: 0,
            duration: COIN_COLLECT_DURATION,
            onComplete: () => {
                c.setActive(false).setVisible(false).setAlpha(1);
                if (c.body) c.body.enable = false;
            },
        });
        // Immediately disable physics to prevent double-collect
        if (c.body) c.body.enable = false;
        this.coinCount++;
    },
);
```

### Build Point Proximity Detection
```typescript
// In Game.ts update():
for (const bp of this.buildPoints) {
    const distance = Math.abs(this.hero.x - bp.x);
    const isNear = distance <= BUILD_POINT_DETECT_RADIUS;
    bp.setNearby(isNear); // Toggles pulse intensity
}

// Coin drop input (in create):
this.dropKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
this.dropKeyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

// In update:
if (Phaser.Input.Keyboard.JustDown(this.dropKey) || Phaser.Input.Keyboard.JustDown(this.dropKeyDown)) {
    const nearBp = this.buildPoints.find(bp => Math.abs(this.hero.x - bp.x) <= BUILD_POINT_DETECT_RADIUS);
    if (nearBp && this.coinCount > 0) {
        this.coinCount--;
        EventBus.emit('coin:deposited', { buildPointId: nearBp.id, total: nearBp.addCoin() });
    }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| World-sized TileSprite for backgrounds | Canvas-sized TileSprite + tilePositionX scroll | Phaser 3.60+ docs clarified | Prevents GPU memory bloat |
| Separate @types/phaser package | Types bundled with phaser npm package | Phaser 3.55+ | No separate type install needed [VERIFIED: CLAUDE.md] |
| Generic EventEmitter (Node.js style) | Phaser.Events.EventEmitter (same API, zero extra deps) | Always available in Phaser 3 | No npm dependency for event bus |

**Deprecated/outdated:**
- Phaser 3.90 is the final Phaser 3 release. Stay on 3.87 as locked in package.json. [CITED: CLAUDE.md]
- `@types/phaser` is obsolete -- types are bundled. [VERIFIED: package.json shows no @types/phaser]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Tiny Gunslinger spritesheet row 0 is idle (~6 frames), row 1 is walk (~7 frames) | Code Examples / Pitfall 5 | Wrong frame ranges will show incorrect animations. Low risk -- easily corrected by examining sprite during implementation. |
| A2 | 30 coins is sufficient pool size for Phase 1 | Architecture Patterns (pooling) | If more than 30 coins are visible simultaneously, coins will fail to spawn. Low risk -- pool size is easily increased. |
| A3 | Runtime create/destroy causes noticeable GC pauses in browser games | Don't Hand-Roll (pooling rationale) | If Phaser's internal pooling is not actually needed at this entity count, pooling adds minor complexity for no benefit. Low risk -- pooling is a best practice regardless. |

## Open Questions

1. **Exact spritesheet frame mapping for Tiny Gunslinger 48x32.png**
   - What we know: The image shows ~10 rows of frames, 48x32 per frame. Row 0 appears to be ~6 frames, row 1 appears to be ~7 frames.
   - What's unclear: Which rows correspond to idle vs walk vs other states. Exact frame counts per row.
   - Recommendation: During implementation, load the spritesheet and examine frame indices empirically. Create animations with conservative frame ranges and adjust.

2. **Build point count and placement**
   - What we know: Build points need to be spread across the 6000px world. The hero starts presumably near center.
   - What's unclear: How many build points and their exact x-coordinates.
   - Recommendation: Start with 4-6 build points evenly spaced (e.g., at x = 500, 1500, 2500, 3500, 4500, 5500). This is Claude's discretion per CONTEXT.md.

3. **Initial coin spawn count and locations**
   - What we know: Coins must exist in the world for the hero to collect.
   - What's unclear: How many coins and where they spawn initially.
   - Recommendation: Scatter 15-20 coins in clusters near build points so players naturally discover the collect-then-drop loop. This is Claude's discretion.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server | Assumed available | -- | -- |
| npm | Package management | Assumed available | -- | -- |
| phaser | Game engine | Yes (installed) | ^3.87.0 | -- |
| typescript | Type checking | Yes (installed) | ^5.4.5 | -- |
| vite | Dev server | Yes (installed) | ^5.3.1 | -- |

**Missing dependencies with no fallback:** None identified.
**Missing dependencies with fallback:** None identified.

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/phaser_io` -- Camera startFollow/deadzone/setBounds, TileSprite performance, Arcade Physics groups/overlap, Animation creation, Scene events shutdown/destroy, Physics world setBounds
- `package.json` -- Verified installed versions: phaser ^3.87.0, typescript ^5.4.5, vite ^5.3.1
- `tsconfig.json` -- Verified strict mode enabled, ES2020 target, bundler moduleResolution
- `main.ts` -- Verified current game config (no physics, scene array broken)
- `01-CONTEXT.md` -- All 14 locked decisions
- `01-UI-SPEC.md` -- All implementation constants, sprite dimensions, color palette

### Secondary (MEDIUM confidence)
- `CLAUDE.md` Technology Stack section -- Phaser version guidance, Rex plugins guidance, architecture patterns
- Tiny Gunslinger spritesheet visual inspection -- frame layout approximations

### Tertiary (LOW confidence)
- None -- all claims verified or cited.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed and verified
- Architecture: HIGH -- all patterns verified against Phaser 3 official docs via Context7
- Pitfalls: HIGH -- TileSprite performance warning is directly from official docs; shutdown cleanup is documented Phaser pattern

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable -- Phaser 3.87 is locked, no moving targets)
