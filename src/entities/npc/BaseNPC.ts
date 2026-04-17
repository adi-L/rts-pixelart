import Phaser from 'phaser';
import { NPC_WIDTH, NPC_HEIGHT, GROUND_Y } from '../../constants';

export abstract class BaseNPC {
  public sprite: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  protected scene: Phaser.Scene;
  protected destroyed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, color: number) {
    this.scene = scene;
    // NPC visual -- colored rectangle sitting on ground
    const y = GROUND_Y - NPC_HEIGHT / 2;
    const rect = scene.add.rectangle(x, y, NPC_WIDTH, NPC_HEIGHT, color).setDepth(3);
    scene.physics.add.existing(rect);
    this.sprite = rect as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setCollideWorldBounds(true);
  }

  /** Move horizontally toward targetX at given speed. Returns true if arrived (within 4px). */
  protected moveToward(targetX: number, speed: number): boolean {
    const dx = targetX - this.sprite.x;
    if (Math.abs(dx) < 4) {
      this.sprite.body.setVelocityX(0);
      return true;
    }
    this.sprite.body.setVelocityX(dx > 0 ? speed : -speed);
    return false;
  }

  abstract update(time: number, delta: number): void;

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.destroy();
  }
}
