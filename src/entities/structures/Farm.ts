import Phaser from 'phaser';
import { BaseStructure } from './BaseStructure';
import {
  FARM_WIDTH, FARM_HEIGHT, COLOR_FARM
} from '../../constants';

export class Farm extends BaseStructure {
  private activePulse: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, buildPointId: string) {
    // Farms have no HP (not damageable in Phase 2 scope)
    super(scene, x, FARM_WIDTH, FARM_HEIGHT, COLOR_FARM, 9999, buildPointId);
  }

  /** Start the active pulse when a farmer is working */
  setActive(active: boolean): void {
    if (active && !this.activePulse) {
      this.activePulse = this.scene.tweens.add({
        targets: this.rect,
        alpha: { from: 0.7, to: 1.0 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });
    } else if (!active && this.activePulse) {
      this.activePulse.stop();
      this.activePulse = null;
      this.rect.setAlpha(1);
    }
  }

  destroy(): void {
    if (this.activePulse) this.activePulse.stop();
    super.destroy();
  }
}
