import { BaseStructure } from './BaseStructure';
import { ARMORY_WIDTH, ARMORY_HEIGHT, COLOR_ARMORY, ARMORY_HP } from '../../constants';

export class Armory extends BaseStructure {
  constructor(scene: Phaser.Scene, x: number, buildPointId: string) {
    super(scene, x, ARMORY_WIDTH, ARMORY_HEIGHT, COLOR_ARMORY, ARMORY_HP, buildPointId);
  }
}
