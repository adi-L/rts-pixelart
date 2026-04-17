import Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import EventBus from '../../events/EventBus';
import {
  COLOR_BUILDER, BUILDER_WALK_SPEED, BUILDER_WANDER_RANGE,
  BUILDER_CONSTRUCT_DURATION, BUILDER_HAMMER_AMPLITUDE, BUILDER_HAMMER_PERIOD
} from '../../constants';
import { BuildPointState } from '../BuildPoint';
import type { StructureManager } from '../../systems/StructureManager';
import type { BuildPoint } from '../BuildPoint';

export enum BuilderState {
  Idle,
  WalkToSite,
  Building,
  Returning,
}

export class Builder extends BaseNPC {
  private state: BuilderState = BuilderState.Idle;
  private structureManager: StructureManager;
  private homeX: number;
  private targetBuildPoint: BuildPoint | null = null;
  private wanderTarget: number;
  private wanderTimer: number = 0;
  private hammerTween: Phaser.Tweens.Tween | null = null;
  private buildTimer: Phaser.Time.TimerEvent | null = null;

  // Event listener reference for cleanup
  private onStructureFunded: (data: { buildPointId: string }) => void;

  constructor(scene: Phaser.Scene, x: number, structureManager: StructureManager) {
    super(scene, x, COLOR_BUILDER);
    this.structureManager = structureManager;
    this.homeX = x;
    this.wanderTarget = x;

    // Listen for newly funded structures
    this.onStructureFunded = () => {
      if (this.state === BuilderState.Idle) {
        this.seekTarget();
      }
    };
    EventBus.on('structure:funded', this.onStructureFunded);
  }

  private seekTarget(): void {
    const target = this.structureManager.getBuilderTarget(this.sprite.x);
    if (target) {
      this.targetBuildPoint = target;
      target.state = BuildPointState.Building;
      this.state = BuilderState.WalkToSite;
    }
  }

  update(_time: number, delta: number): void {
    if (this.destroyed) return;

    switch (this.state) {
      case BuilderState.Idle:
        // Wander near home (builder hut)
        this.wanderTimer += delta;
        if (this.wanderTimer > 3000) {
          this.wanderTimer = 0;
          this.wanderTarget = this.homeX +
            Phaser.Math.Between(-BUILDER_WANDER_RANGE, BUILDER_WANDER_RANGE);
        }
        this.moveToward(this.wanderTarget, BUILDER_WALK_SPEED / 2);

        // Periodically check for funded build points
        if (Math.random() < 0.01) this.seekTarget(); // ~once per 1.6s at 60fps
        break;

      case BuilderState.WalkToSite:
        if (!this.targetBuildPoint) {
          this.state = BuilderState.Idle;
          break;
        }
        if (this.moveToward(this.targetBuildPoint.x, BUILDER_WALK_SPEED)) {
          this.startBuilding();
        }
        break;

      case BuilderState.Building:
        // Hammering animation is handled by tween, timer handles completion
        this.sprite.body.setVelocityX(0);
        break;

      case BuilderState.Returning:
        if (this.moveToward(this.homeX, BUILDER_WALK_SPEED)) {
          this.state = BuilderState.Idle;
          this.wanderTimer = 0;
        }
        break;
    }
  }

  private startBuilding(): void {
    this.state = BuilderState.Building;
    this.sprite.body.setVelocityX(0);

    // Hammering tween -- slight Y oscillation
    this.hammerTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - BUILDER_HAMMER_AMPLITUDE,
      duration: BUILDER_HAMMER_PERIOD,
      yoyo: true,
      repeat: -1,
    });

    // Build timer -- construction completes after BUILDER_CONSTRUCT_DURATION
    this.buildTimer = this.scene.time.delayedCall(BUILDER_CONSTRUCT_DURATION, () => {
      this.completeBuilding();
    });
  }

  private completeBuilding(): void {
    // Stop hammer animation
    if (this.hammerTween) {
      this.hammerTween.stop();
      this.hammerTween = null;
    }

    // Tell StructureManager to create the structure
    if (this.targetBuildPoint) {
      this.structureManager.completeConstruction(this.targetBuildPoint.id);
      this.targetBuildPoint = null;
    }

    // Return to hut
    this.state = BuilderState.Returning;
  }

  destroy(): void {
    EventBus.off('structure:funded', this.onStructureFunded);
    if (this.hammerTween) this.hammerTween.stop();
    if (this.buildTimer) this.buildTimer.destroy();
    super.destroy();
  }
}
