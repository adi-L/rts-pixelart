import Phaser from 'phaser';
import {
  COIN_SIZE, COIN_SCALE, COLOR_ACCENT, COIN_SPIN_DURATION,
  COIN_COLLECT_DURATION, COIN_POOL_SIZE, SPRITE_COIN
} from '../constants';

/**
 * Generate a placeholder coin texture programmatically (no external asset needed).
 * Call once during Preloader so the texture is available when Game scene starts.
 */
export function createCoinTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(COLOR_ACCENT, 1);
  graphics.fillCircle(COIN_SIZE / 2, COIN_SIZE / 2, COIN_SIZE / 2);
  graphics.generateTexture(SPRITE_COIN, COIN_SIZE, COIN_SIZE);
  graphics.destroy();
}

/**
 * Create the object pool for coins (INFRA-02).
 * All coins are pre-allocated inactive; use spawnCoin to activate them.
 */
export function createCoinPool(scene: Phaser.Scene): Phaser.Physics.Arcade.Group {
  const pool = scene.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    maxSize: COIN_POOL_SIZE,
    runChildUpdate: false,
    allowGravity: false,
  });
  pool.createMultiple({
    key: SPRITE_COIN,
    quantity: COIN_POOL_SIZE,
    active: false,
    visible: false,
  });
  return pool;
}

/**
 * Activate a coin from the pool at the given position.
 * Returns null if the pool is exhausted (Pitfall 4 guard).
 */
export function spawnCoin(
  pool: Phaser.Physics.Arcade.Group,
  x: number,
  y: number,
  scene: Phaser.Scene
): Phaser.Physics.Arcade.Sprite | null {
  const coin = pool.get(x, y, SPRITE_COIN) as Phaser.Physics.Arcade.Sprite;
  if (!coin) return null;

  coin.setActive(true).setVisible(true).setScale(COIN_SCALE).setDepth(3);

  // Enable and reset physics body for overlap detection
  scene.physics.world.enable(coin);
  (coin.body as Phaser.Physics.Arcade.Body).enable = true;

  // Spin tween: coin squashes horizontally to simulate rotation
  scene.tweens.add({
    targets: coin,
    scaleX: { from: COIN_SCALE, to: 0 },
    duration: COIN_SPIN_DURATION / 2,
    yoyo: true,
    repeat: -1,
  });

  return coin;
}

/**
 * Magnetically collect a coin toward the hero, then return it to the pool.
 * Disables physics immediately to prevent double-collect.
 * Kills spin tween on pool return to prevent tween accumulation (T-01-08).
 */
export function collectCoin(
  coin: Phaser.Physics.Arcade.Sprite,
  heroSprite: Phaser.Physics.Arcade.Sprite,
  scene: Phaser.Scene
): void {
  // Immediately disable physics to prevent double-collect
  if (coin.body) {
    (coin.body as Phaser.Physics.Arcade.Body).enable = false;
  }

  // Magnetic tween toward hero
  scene.tweens.add({
    targets: coin,
    x: heroSprite.x,
    y: heroSprite.y,
    alpha: 0,
    duration: COIN_COLLECT_DURATION,
    onComplete: () => {
      coin.setActive(false).setVisible(false).setAlpha(1);
      scene.tweens.killTweensOf(coin);
    },
  });
}
