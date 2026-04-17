---
phase: 01-foundation-hero-loop
verified: 2026-04-17T12:00:00Z
status: gaps_found
score: 4/5 must-haves verified
overrides_applied: 0
gaps:
  - truth: "RTS engine code is deleted and no imports reference it"
    status: failed
    reason: "src/engine/units/index.ts still exists (buildings and resources were deleted but units was not). This orphaned file causes npx tsc --noEmit to fail with 5 TypeScript errors. While no source files import from it, the broken compilation violates Plan 01 acceptance criteria and Roadmap SC5 (clean shutdown implies clean codebase)."
    artifacts:
      - path: "src/engine/units/index.ts"
        issue: "Orphaned RTS file still present -- references deleted ../resources and ../buildings modules, causing TS2307 errors"
    missing:
      - "Delete src/engine/units/index.ts and the src/engine/ directory entirely"
human_verification:
  - test: "Launch game with npm run dev, press ENTER on main menu, walk hero left/right, verify parallax scrolling, coin collection, and coin drop at build point"
    expected: "Hero moves smoothly, camera follows with parallax, coins magnetically collect on contact, spacebar drops coin at glowing build point near world center"
    why_human: "Visual gameplay verification -- animations, parallax feel, tween smoothness, and interaction feedback cannot be verified programmatically"
---

# Phase 1: Foundation & Hero Loop Verification Report

**Phase Goal:** The coin-drop mechanic is playable -- hero moves through a scrolling world, collects coins, and drops them at a build point
**Verified:** 2026-04-17T12:00:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Hero walks left and right with keyboard input and the camera follows with parallax scrolling | VERIFIED | Hero.ts: WASD+arrows input, setVelocityX, setFlipX, idle/walk anims. Game.ts: camera.startFollow with CAMERA_LERP, setDeadzone, midLayer.tilePositionX parallax update in update() |
| 2 | Physical coins appear in the world and disappear into the hero's count on contact | VERIFIED | Game.ts: 20 coins spawned via spawnCoin across world width. physics.add.overlap wired between hero.sprite and coinPool. collectCoin does magnetic tween, coinCount++ updates text |
| 3 | Hero can drop coins at a designated build point and the interaction fires | VERIFIED | Game.ts: JustDown(dropKey/dropKeyDown) checks proximity to build points. nearBp.addCoin() called on drop. BuildPoint.addCoin() emits EventBus 'coin:deposited'. Red tint flash on 0 coins. Coin-fly visual feedback on successful drop |
| 4 | Object pool is in use -- no coins or entities are created/destroyed at runtime after initial spawn | VERIFIED | Coin.ts: createCoinPool uses maxSize=COIN_POOL_SIZE(30), createMultiple pre-allocates all sprites inactive. spawnCoin activates from pool with null guard. collectCoin returns to pool via setActive(false).setVisible(false) |
| 5 | Scene shuts down cleanly with no lingering listeners or physics bodies | VERIFIED | Game.ts: events.once('shutdown') calls EventBus.removeAllListeners() and iterates buildPoints calling bp.destroy(). BuildPoint.destroy() stops tweens and destroys marker |

**Score:** 4/5 roadmap success criteria verified (SC5 passes but RTS cleanup gap affects overall TypeScript health)

### Additional Plan Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| A1 | Game boots through Boot > Preloader > MainMenu > Game scene chain without errors | PARTIAL | Scene chain correctly wired in main.ts: [Boot, Preloader, MainMenu, MainGame, GameOver]. However npx tsc --noEmit fails due to orphaned src/engine/units/index.ts. Vite likely still serves the game since no files import engine/units |
| A2 | Arcade Physics is enabled and accessible in Game scene | VERIFIED | main.ts: physics config with default:'arcade', gravity:{x:0,y:0}. Game.ts: this.physics.world.setBounds, physics.add.overlap, physics.add.group all used |
| A3 | EventBus singleton exists and can emit/listen for events | VERIFIED | src/events/EventBus.ts: new Phaser.Events.EventEmitter() exported as default. Used in BuildPoint.ts (emit) and Game.ts (removeAllListeners) |
| A4 | All tuning constants are centralized in one file | VERIFIED | src/constants.ts: 50+ named exports covering world, hero, camera, coin, build point, parallax, and sprite constants |
| A5 | RTS engine code is deleted and no imports reference it | FAILED | src/engine/units/index.ts still exists (194+ lines). buildings/ and resources/ were deleted. No source files import from engine, but the orphaned file breaks TypeScript compilation |
| A6 | Hero sprite flips to face movement direction | VERIFIED | Hero.ts: setFlipX(true) on left, setFlipX(false) on right |
| A7 | Hero plays idle animation when stationary and walk animation when moving | VERIFIED | Hero.ts: play('hero-walk', true) when moving, play('hero-idle', true) when stationary |
| A8 | Build points pulse on the ground and glow brighter when hero is nearby | VERIFIED | BuildPoint.ts: idle pulse 0.3-0.7 alpha, active pulse 0.7-1.0 alpha. setNearby() switches between them with early-return guard |
| A9 | Depositing a coin at a build point fires a coin:deposited event on the EventBus | VERIFIED | BuildPoint.ts line 90: EventBus.emit('coin:deposited', { buildPointId, total }) |
| A10 | Attempting to drop a coin with 0 coins shows a brief red tint flash on hero | VERIFIED | Game.ts line 164: hero.sprite.setTint(0xff0000) with delayedCall(100) clearTint |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/constants.ts` | All magic numbers centralized | VERIFIED | 63 lines, 50+ named exports for world/hero/camera/coin/build-point/parallax/sprite constants |
| `src/events/EventBus.ts` | Singleton Phaser EventEmitter | VERIFIED | 4 lines, correct implementation |
| `src/main.ts` | Game config with Arcade Physics and scene chain | VERIFIED | Physics config present, full scene chain [Boot, Preloader, MainMenu, MainGame, GameOver] |
| `src/entities/Hero.ts` | Hero class with movement and animation | VERIFIED | 87 lines, WASD+arrows, idle/walk anims, flipX, collideWorldBounds, no gravity |
| `src/scenes/Game.ts` | Parallax world, ground, hero, camera, coins, build points | VERIFIED | 172 lines, all systems wired |
| `src/entities/Coin.ts` | Coin pool helpers | VERIFIED | 97 lines, createCoinTexture, createCoinPool, spawnCoin, collectCoin all exported |
| `src/entities/BuildPoint.ts` | BuildPoint class with proximity and deposit | VERIFIED | 107 lines, pulsing, setNearby, addCoin with EventBus emit, destroy |
| `src/scenes/Preloader.ts` | Hero spritesheet + coin texture loading | VERIFIED | Loads hero spritesheet (48x32), calls createCoinTexture |
| `src/scenes/Boot.ts` | Background image loading | VERIFIED | Loads assets/background.png |
| `src/scenes/MainMenu.ts` | Dead City branding with ENTER key | VERIFIED | "DEAD CITY" title, "Press ENTER to begin", keydown-ENTER handler |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Game.ts | Hero.ts | import + new Hero() | WIRED | Line 2: import, Line 60: new Hero(this, ...) |
| Game.ts | constants.ts | import constants | WIRED | Line 6-14: imports WORLD_WIDTH, HERO_START_X, etc. |
| Hero.ts | constants.ts | import HERO_SPEED etc. | WIRED | Line 2-7: imports all hero constants |
| Game.ts | EventBus.ts | import for shutdown | WIRED | Line 5: import, Line 110: removeAllListeners |
| Game.ts | Coin.ts | import pool/spawn/collect | WIRED | Line 3: imports createCoinPool, spawnCoin, collectCoin. Line 65: createCoinPool, Line 71: spawnCoin, Line 81: collectCoin |
| Game.ts | BuildPoint.ts | import + new BuildPoint | WIRED | Line 4: import, Line 89: new BuildPoint(this, ...) |
| BuildPoint.ts | EventBus.ts | EventBus.emit('coin:deposited') | WIRED | Line 2: import, Line 90: emit call |
| Game.ts | coin pool overlap | physics.add.overlap | WIRED | Line 75: this.physics.add.overlap(hero.sprite, coinPool, callback) |
| Preloader.ts | Coin.ts | createCoinTexture | WIRED | Line 2: import, Line 51: createCoinTexture(this) |
| Preloader.ts | hero spritesheet | load.spritesheet | WIRED | Line 38: load.spritesheet('hero', ..., {frameWidth:48, frameHeight:32}) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| Game.ts | coinCount | physics.add.overlap callback increments on coin contact | Yes -- 20 coins spawned from pool, overlap triggers collectCoin | FLOWING |
| Game.ts | coinCountText | setText from coinCount changes | Yes -- updates on collect and drop | FLOWING |
| Game.ts | buildPoints[] | BUILD_POINT_POSITIONS array from constants | Yes -- [3000] creates 1 build point | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles | npx tsc --noEmit | 5 errors from src/engine/units/index.ts | FAIL |
| Hero spritesheet exists | ls public/assets/gunner/ | Tiny Gunslinger 48x32.png present | PASS |
| No engine imports in source | grep -r "import.*engine" src/ (excluding engine/) | No matches | PASS |
| Module exports Hero | grep "export class Hero" src/entities/Hero.ts | Found | PASS |
| Module exports BuildPoint | grep "export class BuildPoint" src/entities/BuildPoint.ts | Found | PASS |
| Module exports coin functions | grep "export function" src/entities/Coin.ts | 4 functions exported | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INFRA-01 | 01-01 | EventBus singleton for system-to-system communication | SATISFIED | src/events/EventBus.ts exports Phaser EventEmitter singleton, used in BuildPoint and Game |
| INFRA-02 | 01-03 | Object pooling for coins (no runtime create/destroy) | SATISFIED | Coin.ts createCoinPool with maxSize=30, createMultiple pre-allocation, spawnCoin/collectCoin pool lifecycle |
| INFRA-03 | 01-01, 01-02 | Physics world bounds set to full world width | SATISFIED | Game.ts: physics.world.setBounds(0, 0, 6000, 768), Hero setCollideWorldBounds(true) |
| INFRA-04 | 01-01, 01-02 | Clean scene shutdown with listener cleanup | SATISFIED | Game.ts: events.once('shutdown') removes EventBus listeners and destroys build points |
| HERO-01 | 01-02 | Hero moves left/right with keyboard controls | SATISFIED | Hero.ts: WASD + arrow keys, setVelocityX(+/-HERO_SPEED) |
| HERO-02 | 01-02 | Camera follows hero with parallax scrolling backgrounds | SATISFIED | Game.ts: camera.startFollow, setDeadzone, midLayer.tilePositionX parallax update |
| COIN-01 | 01-03 | Physical coins exist in world, hero collects on contact | SATISFIED | 20 coins spawned, physics.add.overlap triggers magnetic collectCoin tween, coinCount increments |
| COIN-02 | 01-03 | Hero drops coins at build points to trigger construction | SATISFIED | Space/Down arrow input, proximity check, nearBp.addCoin(), EventBus 'coin:deposited' emission |
| MAP-01 | 01-02, 01-03 | Tile-based side-scrolling world (hand-crafted layout) | SATISFIED | 6000px scrolling world with parallax layers, ground, and build points. Uses rectangles + TileSprite (not Tiled tilemap yet -- full tilemap expected in Phase 4 with MAP-03) |
| MAP-02 | 01-01 | Placeholder pixel-art sprites replaceable via config | SATISFIED | constants.ts exports SPRITE_HERO, SPRITE_COIN, SPRITE_HERO_PATH, SPRITE_HERO_FRAME_WIDTH/HEIGHT -- all sprite references go through constants |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/engine/units/index.ts | 1-231 | Orphaned RTS code -- entire file is dead code that breaks TypeScript compilation | BLOCKER | npx tsc --noEmit fails with 5 errors. Summary claimed "Deleted src/engine/" but units/ remains |
| src/entities/Coin.ts | 8 | "placeholder" in comment | INFO | Descriptive comment about procedural texture generation -- not a code stub |

### Human Verification Required

### 1. Full Gameplay Loop Visual Verification

**Test:** Run `npm run dev`, press ENTER on main menu, walk hero left/right through the world, collect coins, and drop them at the build point near world center (x=3000)
**Expected:** Hero animates smoothly (walk when moving, idle when stopped), camera follows with parallax effect, gold spinning coins visible and collected with magnetic tween on contact, gold pulsing build point at center glows brighter on approach, spacebar drops coin with fly animation, red flash on empty drop attempt
**Why human:** Visual animations, parallax feel, tween smoothness, and interaction feedback timing cannot be verified programmatically

### Gaps Summary

One gap found: **src/engine/units/index.ts was not deleted** during Plan 01 execution. The SUMMARY claimed the entire src/engine/ directory was deleted, but only buildings/ and resources/ subdirectories were removed. The orphaned units/index.ts references the deleted modules and causes 5 TypeScript compilation errors. No source files import from engine, so the game likely still runs via Vite (which only compiles imported modules), but `npx tsc --noEmit` fails.

**Fix required:** Delete `src/engine/units/index.ts` and the now-empty `src/engine/` directory tree. This is a 1-line fix (rm -rf src/engine).

---

_Verified: 2026-04-17T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
