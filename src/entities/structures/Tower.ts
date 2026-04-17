import Phaser from 'phaser';
import { BaseStructure } from './BaseStructure';
import {
  TOWER_WIDTH, TOWER_HEIGHT, TOWER_PLATFORM_HEIGHT,
  COLOR_TOWER, COLOR_TOWER_PLATFORM, TOWER_HP, GROUND_Y
} from '../../constants';

export class Tower extends BaseStructure {
  private platform: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, buildPointId: string) {
    super(scene, x, TOWER_WIDTH, TOWER_HEIGHT, COLOR_TOWER, TOWER_HP, buildPointId);
    // Platform indicator at top -- lighter color, 32x4px
    this.platform = scene.add.rectangle(
      x, GROUND_Y - TOWER_HEIGHT + TOWER_PLATFORM_HEIGHT / 2,
      TOWER_WIDTH, TOWER_PLATFORM_HEIGHT, COLOR_TOWER_PLATFORM
    ).setDepth(2);
  }

  destroy(): void {
    this.platform.destroy();
    super.destroy();
  }
}
