import { BaseNPC } from './BaseNPC';
import {
  COLOR_FARMER, FARMER_WALK_SPEED, FARMER_WORK_RANGE,
  FARM_COIN_INTERVAL, FARM_COIN_FLOAT_DURATION
} from '../../constants';
import type { EconomyManager } from '../../systems/EconomyManager';
import type { Farm } from '../structures/Farm';

export enum FarmerState {
  WalkToFarm,
  Working,
}

export class Farmer extends BaseNPC {
  private state: FarmerState;
  private economy: EconomyManager;
  public farm: Farm;
  private farmX: number;
  private paceTarget: number;
  private coinTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, farm: Farm, economy: EconomyManager) {
    super(scene, x, COLOR_FARMER);
    this.economy = economy;
    this.farm = farm;
    this.farmX = farm.x;
    this.paceTarget = this.farmX;

    // If already at the farm, start working immediately
    if (Math.abs(x - this.farmX) < FARMER_WORK_RANGE) {
      this.state = FarmerState.Working;
      this.startWorking();
    } else {
      this.state = FarmerState.WalkToFarm;
    }
  }

  update(_time: number, _delta: number): void {
    if (this.destroyed) return;

    switch (this.state) {
      case FarmerState.WalkToFarm:
        if (this.moveToward(this.farmX, FARMER_WALK_SPEED)) {
          this.state = FarmerState.Working;
          this.startWorking();
        }
        break;

      case FarmerState.Working:
        // Pace back and forth across the farm
        if (this.moveToward(this.paceTarget, FARMER_WALK_SPEED)) {
          // Flip direction
          this.paceTarget = this.paceTarget > this.farmX
            ? this.farmX - FARMER_WORK_RANGE / 2
            : this.farmX + FARMER_WORK_RANGE / 2;
        }
        break;
    }
  }

  private startWorking(): void {
    this.farm.setActive(true);
    this.paceTarget = this.farmX + FARMER_WORK_RANGE / 2;

    // Generate coins periodically
    this.coinTimer = this.scene.time.addEvent({
      delay: FARM_COIN_INTERVAL,
      callback: () => this.generateCoin(),
      loop: true,
    });
  }

  private generateCoin(): void {
    if (this.destroyed) return;
    this.economy.addCoins(1, 'farm');

    // Visual: "+1" gold text floats up from farm
    const floatText = this.scene.add.text(
      this.farmX, this.farm.rect.y - 10,
      '+1',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#e2b714',
        fontStyle: 'bold',
      }
    ).setDepth(10).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 30,
      alpha: 0,
      duration: FARM_COIN_FLOAT_DURATION,
      onComplete: () => floatText.destroy(),
    });
  }

  destroy(): void {
    if (this.coinTimer) this.coinTimer.destroy();
    this.farm.setActive(false);
    super.destroy();
  }
}
