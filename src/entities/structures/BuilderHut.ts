import { BaseStructure } from './BaseStructure';
import {
  BUILDER_HUT_WIDTH, BUILDER_HUT_HEIGHT, COLOR_BUILDER_HUT
} from '../../constants';

export class BuilderHut extends BaseStructure {
  constructor(scene: Phaser.Scene, x: number, buildPointId: string) {
    // Builder hut has no HP (not damageable in Phase 2 scope)
    super(scene, x, BUILDER_HUT_WIDTH, BUILDER_HUT_HEIGHT, COLOR_BUILDER_HUT, 9999, buildPointId);
  }
}
