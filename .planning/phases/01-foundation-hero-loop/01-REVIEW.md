---
phase: 01-foundation-hero-loop
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/constants.ts
  - src/entities/BuildPoint.ts
  - src/entities/Coin.ts
  - src/entities/Hero.ts
  - src/events/EventBus.ts
  - src/main.ts
  - src/scenes/Boot.ts
  - src/scenes/Game.ts
  - src/scenes/MainMenu.ts
  - src/scenes/Preloader.ts
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-17
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

The foundation hero loop implementation is solid overall. The entity architecture (Hero, Coin pool, BuildPoint) is clean and well-separated. Constants are centralized properly. The coin pool pattern with `createMultiple` and double-collect guards is correctly implemented.

Key concerns are: (1) EventBus cleanup is overly aggressive and will break multi-scene setups, (2) tween lifecycle management in BuildPoint and Coin has leak potential on repeated state transitions, and (3) re-enabling physics on already-enabled pooled sprites may cause subtle body duplication.

No security issues were found -- this is a client-side game with no network or user-input persistence.

## Warnings

### WR-01: EventBus.removeAllListeners() nukes all subscribers globally

**File:** `src/scenes/Game.ts:110`
**Issue:** The shutdown handler calls `EventBus.removeAllListeners()` which removes every listener on the global EventBus singleton, not just those registered by the Game scene. If any other scene, system, or future module registers listeners on the same EventBus, they will be silently removed when the Game scene shuts down. This is a latent bug that will surface as soon as a second consumer of EventBus is added.
**Fix:** Track listeners registered by the Game scene and remove only those on shutdown. For example:
```typescript
// In create():
const onDeposited = (data: any) => { /* ... */ };
EventBus.on('coin:deposited', onDeposited);

// In shutdown:
this.events.once('shutdown', () => {
  EventBus.off('coin:deposited', onDeposited);
  this.buildPoints.forEach(bp => bp.destroy());
  this.buildPoints.length = 0;
});
```

### WR-02: Tween leak in BuildPoint.setNearby on repeated toggles

**File:** `src/entities/BuildPoint.ts:62`
**Issue:** When `setNearby` is called, `pulseTween.stop()` stops the old tween but does not remove it from the Phaser tween manager. Over many proximity toggles (hero walking back and forth past a build point), stopped-but-not-destroyed tweens accumulate in the tween manager's internal array. While stopped tweens are inert, they still occupy memory and are iterated during tween manager updates.
**Fix:** Use `this.pulseTween.destroy()` instead of `this.pulseTween.stop()`:
```typescript
setNearby(near: boolean): void {
  if (this.isNearby === near) return;
  this.isNearby = near;

  this.pulseTween.destroy(); // fully remove from tween manager

  // ... create new tween as before
}
```
Also update `destroy()` at line 101 to use `.destroy()` instead of `.stop()`.

### WR-03: Redundant physics.world.enable on pooled sprites may create duplicate bodies

**File:** `src/entities/Coin.ts:55-56`
**Issue:** `spawnCoin` calls `scene.physics.world.enable(coin)` every time a coin is activated from the pool. However, pooled sprites created via `pool.createMultiple` with `classType: Phaser.Physics.Arcade.Sprite` already have physics bodies. The `pool.get()` call reactivates the sprite, and re-calling `world.enable()` can reinitialize the body. While Arcade Physics typically handles this gracefully (it reuses the existing body), it is unnecessary work and the explicit body enable on line 56 is sufficient on its own.
**Fix:** Remove the `world.enable` call and just re-enable the existing body:
```typescript
export function spawnCoin(
  pool: Phaser.Physics.Arcade.Group,
  x: number,
  y: number,
  scene: Phaser.Scene
): Phaser.Physics.Arcade.Sprite | null {
  const coin = pool.get(x, y, SPRITE_COIN) as Phaser.Physics.Arcade.Sprite;
  if (!coin) return null;

  coin.setActive(true).setVisible(true).setScale(COIN_SCALE).setDepth(3);

  // Re-enable the existing physics body (no need to call world.enable again)
  if (coin.body) {
    (coin.body as Phaser.Physics.Arcade.Body).enable = true;
  }

  // Spin tween ...
```

## Info

### IN-01: MainMenu instance properties are unused outside create()

**File:** `src/scenes/MainMenu.ts:5-7`
**Issue:** `background`, `logo`, and `title` are declared as instance properties but are only assigned in `create()` and never referenced elsewhere. They can be local variables, reducing the class surface area.
**Fix:** Change to local `const` declarations inside `create()`, or remove the property declarations if they exist solely for future use.

### IN-02: Non-null assertions on scene.input.keyboard across multiple files

**File:** `src/entities/Hero.ts:34-35`, `src/scenes/Game.ts:93-94`, `src/scenes/MainMenu.ts:32`
**Issue:** Multiple files use `scene.input.keyboard!` (non-null assertion). While this is safe for a browser game with the default Phaser config (keyboard plugin is enabled by default), these assertions suppress TypeScript's null safety. If the game config ever disables the keyboard plugin or runs in a headless test environment, these will throw at runtime with no useful error message.
**Fix:** Low priority -- acceptable for now given the game always runs in-browser with default input config. Consider adding a guard if headless testing is planned:
```typescript
if (!scene.input.keyboard) {
  throw new Error('Keyboard plugin is required');
}
```

---

_Reviewed: 2026-04-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
