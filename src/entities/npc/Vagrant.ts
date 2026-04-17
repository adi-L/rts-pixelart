import Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import EventBus from '../../events/EventBus';
import {
  COLOR_VAGRANT, COLOR_CITIZEN, VAGRANT_DRIFT_SPEED,
  VAGRANT_WANDER_RANGE, CITIZEN_RUN_SPEED, FLASH_TINT_DURATION
} from '../../constants';

export enum VagrantState {
  Wander,
  Recruited,
  RunToBase,
}

export class Vagrant extends BaseNPC {
  private state: VagrantState = VagrantState.Wander;
  private wanderCenter: number;
  private wanderTarget: number;
  private baseX: number;

  constructor(scene: Phaser.Scene, x: number, baseX: number) {
    super(scene, x, COLOR_VAGRANT);
    this.wanderCenter = x;
    this.wanderTarget = x + Phaser.Math.Between(-VAGRANT_WANDER_RANGE, VAGRANT_WANDER_RANGE);
    this.baseX = baseX;
  }

  /** Called externally by NPCManager when hero drops coin near this vagrant */
  recruit(): void {
    if (this.state !== VagrantState.Wander) return;
    this.state = VagrantState.Recruited;
  }

  update(_time: number, _delta: number): void {
    if (this.destroyed) return;

    switch (this.state) {
      case VagrantState.Wander:
        if (this.moveToward(this.wanderTarget, VAGRANT_DRIFT_SPEED)) {
          // Pick new wander target within range of spawn center
          this.wanderTarget = this.wanderCenter +
            Phaser.Math.Between(-VAGRANT_WANDER_RANGE, VAGRANT_WANDER_RANGE);
        }
        break;

      case VagrantState.Recruited:
        // Transition immediately to RunToBase so this block runs only once
        this.state = VagrantState.RunToBase;
        // Flash white briefly, then change to citizen blue
        this.sprite.setFillStyle(0xFFFFFF);
        this.scene.time.delayedCall(FLASH_TINT_DURATION, () => {
          if (this.destroyed) return;
          this.sprite.setFillStyle(COLOR_CITIZEN);
        });
        break;

      case VagrantState.RunToBase:
        if (this.moveToward(this.baseX, CITIZEN_RUN_SPEED)) {
          // Arrived at base -- notify NPCManager to convert to Citizen
          EventBus.emit('npc:arrived-at-base', { vagrant: this });
        }
        break;
    }
  }
}
