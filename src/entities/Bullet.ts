import Phaser from 'phaser';
import {
  BULLET_POOL_SIZE, SPRITE_BULLET, BULLET_SPEED, BULLET_MAX_RANGE,
  BULLET_WIDTH, BULLET_HEIGHT, BULLET_COLOR, WORLD_WIDTH
} from '../constants';

/**
 * Generate a placeholder bullet texture programmatically.
 * Call once during Preloader so the texture is available when Game scene starts.
 */
export function createBulletTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(BULLET_COLOR, 1);
  graphics.fillRect(0, 0, BULLET_WIDTH, BULLET_HEIGHT);
  graphics.generateTexture(SPRITE_BULLET, BULLET_WIDTH, BULLET_HEIGHT);
  graphics.destroy();
}

/**
 * Create the object pool for bullets.
 * All bullets are pre-allocated inactive; use fireBullet to activate them.
 */
export function createBulletPool(scene: Phaser.Scene): Phaser.Physics.Arcade.Group {
  const pool = scene.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    maxSize: BULLET_POOL_SIZE,
    runChildUpdate: false,
    allowGravity: false,
  });
  pool.createMultiple({
    key: SPRITE_BULLET,
    quantity: BULLET_POOL_SIZE,
    active: false,
    visible: false,
  });
  return pool;
}

/**
 * Fire a bullet from the pool toward a target position.
 * Returns null if the pool is exhausted (T-04-02 mitigation).
 */
export function fireBullet(
  pool: Phaser.Physics.Arcade.Group,
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  scene: Phaser.Scene
): Phaser.Physics.Arcade.Sprite | null {
  const bullet = pool.get(fromX, fromY, SPRITE_BULLET) as Phaser.Physics.Arcade.Sprite;
  if (!bullet) return null;

  bullet.setActive(true).setVisible(true).setDepth(5);

  // Enable physics body
  scene.physics.world.enable(bullet);
  (bullet.body as Phaser.Physics.Arcade.Body).enable = true;

  // Calculate velocity toward target
  const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
  (bullet.body as Phaser.Physics.Arcade.Body).setVelocity(
    Math.cos(angle) * BULLET_SPEED,
    Math.sin(angle) * BULLET_SPEED
  );

  // Store start position for range checking
  bullet.setData('startX', fromX);
  bullet.setData('startY', fromY);

  return bullet;
}

/**
 * Deactivate a bullet and return it to the pool.
 */
export function deactivateBullet(bullet: Phaser.Physics.Arcade.Sprite): void {
  bullet.setActive(false).setVisible(false);
  if (bullet.body) {
    (bullet.body as Phaser.Physics.Arcade.Body).enable = false;
    (bullet.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }
}

/**
 * Update all active bullets in the pool -- deactivate any that exceed max range or leave world bounds.
 */
export function updateBullets(pool: Phaser.Physics.Arcade.Group): void {
  const children = pool.getChildren();
  for (const child of children) {
    const bullet = child as Phaser.Physics.Arcade.Sprite;
    if (!bullet.active) continue;

    // Check if bullet exceeded max range
    const dx = bullet.x - (bullet.getData('startX') as number);
    const dy = bullet.y - (bullet.getData('startY') as number);
    if (Math.sqrt(dx * dx + dy * dy) > BULLET_MAX_RANGE) {
      deactivateBullet(bullet);
      continue;
    }

    // Check world bounds
    if (bullet.x < 0 || bullet.x > WORLD_WIDTH) {
      deactivateBullet(bullet);
    }
  }
}
