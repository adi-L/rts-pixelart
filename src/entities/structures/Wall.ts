import { BaseStructure } from './BaseStructure';
import {
  WALL_WIDTH, WALL_WOOD_HEIGHT, WALL_STONE_HEIGHT,
  COLOR_WALL_WOOD, COLOR_WALL_STONE,
  WALL_WOOD_HP, WALL_STONE_HP
} from '../../constants';

export class Wall extends BaseStructure {
  constructor(scene: Phaser.Scene, x: number, buildPointId: string) {
    super(scene, x, WALL_WIDTH, WALL_WOOD_HEIGHT, COLOR_WALL_WOOD, WALL_WOOD_HP, buildPointId);
  }

  /** Upgrade from wood (tier 1) to stone (tier 2). */
  upgradeToStone(): void {
    if (this.tier >= 2) return;
    this.upgradeVisual(WALL_WIDTH, WALL_STONE_HEIGHT, COLOR_WALL_STONE, WALL_STONE_HP);
  }

  get isMaxTier(): boolean { return this.tier >= 2; }
}
