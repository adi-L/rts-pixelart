import Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import {
  COLOR_CITIZEN, CITIZEN_WANDER_SPEED, CITIZEN_WANDER_RANGE
} from '../../constants';

export enum CitizenState {
  Idle,
  Wander,
}

export class Citizen extends BaseNPC {
  private state: CitizenState = CitizenState.Idle;
  private wanderCenter: number;
  private wanderTarget: number;
  private wanderTimer: number = 0;
  private readonly wanderPause: number = 2000; // ms pause between wanders

  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, COLOR_CITIZEN);
    this.wanderCenter = x; // center of wander area (main base x)
    this.wanderTarget = x;
  }

  update(_time: number, delta: number): void {
    if (this.destroyed) return;

    switch (this.state) {
      case CitizenState.Idle:
        this.sprite.body.setVelocityX(0);
        this.wanderTimer += delta;
        if (this.wanderTimer >= this.wanderPause) {
          this.wanderTimer = 0;
          this.wanderTarget = this.wanderCenter +
            Phaser.Math.Between(-CITIZEN_WANDER_RANGE, CITIZEN_WANDER_RANGE);
          this.state = CitizenState.Wander;
        }
        break;

      case CitizenState.Wander:
        if (this.moveToward(this.wanderTarget, CITIZEN_WANDER_SPEED)) {
          this.state = CitizenState.Idle;
          this.wanderTimer = 0;
        }
        break;
    }
  }
}
