import Phaser from 'phaser';
import {
  ARROW_POOL_SIZE, SPRITE_ARROW, ARROW_SPEED, ARROW_MAX_RANGE,
  ARROW_WIDTH, ARROW_HEIGHT, WORLD_WIDTH
} from '../constants';

/**
 * Generate a placeholder arrow texture programmatically.
 * Call once during Preloader so the texture is available when Game scene starts.
 */
export function createArrowTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0xffcc00, 1);
  graphics.fillRect(0, 0, ARROW_WIDTH, ARROW_HEIGHT);
  graphics.generateTexture(SPRITE_ARROW, ARROW_WIDTH, ARROW_HEIGHT);
  graphics.destroy();
}

/**
 * Create the object pool for arrows.
 * All arrows are pre-allocated inactive; use fireArrow to activate them.
 */
export function createArrowPool(scene: Phaser.Scene): Phaser.Physics.Arcade.Group {
  const pool = scene.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    maxSize: ARROW_POOL_SIZE,
    runChildUpdate: false,
    allowGravity: false,
  });
  pool.createMultiple({
    key: SPRITE_ARROW,
    quantity: ARROW_POOL_SIZE,
    active: false,
    visible: false,
  });
  return pool;
}

/**
 * Fire an arrow from the pool toward a target position.
 * Returns null if the pool is exhausted.
 */
export function fireArrow(
  pool: Phaser.Physics.Arcade.Group,
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  scene: Phaser.Scene
): Phaser.Physics.Arcade.Sprite | null {
  const arrow = pool.get(fromX, fromY, SPRITE_ARROW) as Phaser.Physics.Arcade.Sprite;
  if (!arrow) return null;

  arrow.setActive(true).setVisible(true).setDepth(5);

  // Enable physics body
  scene.physics.world.enable(arrow);
  (arrow.body as Phaser.Physics.Arcade.Body).enable = true;

  // Calculate velocity toward target
  const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
  (arrow.body as Phaser.Physics.Arcade.Body).setVelocity(
    Math.cos(angle) * ARROW_SPEED,
    Math.sin(angle) * ARROW_SPEED
  );

  // Store start position for range checking
  arrow.setData('startX', fromX);
  arrow.setData('startY', fromY);

  return arrow;
}

/**
 * Deactivate an arrow and return it to the pool.
 */
export function deactivateArrow(arrow: Phaser.Physics.Arcade.Sprite): void {
  arrow.setActive(false).setVisible(false);
  if (arrow.body) {
    (arrow.body as Phaser.Physics.Arcade.Body).enable = false;
    (arrow.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }
}

/**
 * Update all active arrows in the pool -- deactivate any that exceed max range or leave world bounds.
 */
export function updateArrows(pool: Phaser.Physics.Arcade.Group): void {
  const children = pool.getChildren();
  for (const child of children) {
    const arrow = child as Phaser.Physics.Arcade.Sprite;
    if (!arrow.active) continue;

    // Check if arrow exceeded max range
    const dx = arrow.x - (arrow.getData('startX') as number);
    const dy = arrow.y - (arrow.getData('startY') as number);
    if (Math.sqrt(dx * dx + dy * dy) > ARROW_MAX_RANGE) {
      deactivateArrow(arrow);
      continue;
    }

    // Check world bounds
    if (arrow.x < 0 || arrow.x > WORLD_WIDTH) {
      deactivateArrow(arrow);
    }
  }
}
