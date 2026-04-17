import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import {
  BUILD_POINT_WIDTH, BUILD_POINT_HEIGHT, BUILD_POINT_DETECT_RADIUS,
  BUILD_POINT_IDLE_ALPHA_MIN, BUILD_POINT_IDLE_ALPHA_MAX,
  BUILD_POINT_ACTIVE_ALPHA_MIN, BUILD_POINT_ACTIVE_ALPHA_MAX,
  BUILD_POINT_PULSE_DURATION, COLOR_ACCENT, GROUND_Y,
  BUILD_POINT_FADE_IN, WALL_WOOD_COST, WALL_STONE_UPGRADE_COST,
  TOWER_COST, FARM_COST, BUILDER_HUT_COST, BASE_UPGRADE_COST_1,
  BASE_UPGRADE_COST_2, BASE_UPGRADE_COST_3
} from '../constants';
import type { BuildPointType, BuildPointConfig } from '../constants';
import type { BaseStructure } from './structures/BaseStructure';

export enum BuildPointState {
  Locked,      // invisible, no interaction
  Empty,       // pulsing marker, accepts coins
  Funded,      // enough coins deposited, waiting for builder
  Building,    // builder is constructing
  Complete,    // structure exists
  Upgradeable, // structure can accept more coins
}

/**
 * BuildPoint -- a location where the hero can deposit coins.
 * Renders as a pulsing gold rectangle on the ground.
 * Glows brighter when the hero is within detection radius.
 * Supports full build lifecycle from Locked through Upgradeable.
 */
export class BuildPoint {
  readonly id: string;
  readonly x: number;
  readonly type: BuildPointType;
  readonly unlockTier: number;
  readonly marker: Phaser.GameObjects.Rectangle;
  coinsDeposited: number;
  isNearby: boolean;
  state: BuildPointState;
  structureRef: BaseStructure | null = null;

  private scene: Phaser.Scene;
  private pulseTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, config: BuildPointConfig) {
    this.scene = scene;
    this.x = config.x;
    this.id = config.id;
    this.type = config.type;
    this.unlockTier = config.unlockTier;
    this.coinsDeposited = 0;
    this.isNearby = false;

    // Start locked or empty based on unlockTier
    this.state = config.unlockTier === 0 ? BuildPointState.Empty : BuildPointState.Locked;

    // Visual marker -- gold rectangle sitting on the ground
    this.marker = scene.add
      .rectangle(
        config.x,
        GROUND_Y - BUILD_POINT_HEIGHT / 2,
        BUILD_POINT_WIDTH,
        BUILD_POINT_HEIGHT,
        COLOR_ACCENT
      )
      .setAlpha(this.state === BuildPointState.Locked ? 0 : BUILD_POINT_IDLE_ALPHA_MIN)
      .setDepth(4);

    // Idle pulse tween (only if not locked)
    this.pulseTween = scene.tweens.add({
      targets: this.marker,
      alpha: { from: BUILD_POINT_IDLE_ALPHA_MIN, to: BUILD_POINT_IDLE_ALPHA_MAX },
      duration: BUILD_POINT_PULSE_DURATION,
      yoyo: true,
      repeat: -1,
      paused: this.state === BuildPointState.Locked,
    });
  }

  /** Check and apply unlock based on current base tier */
  checkUnlock(currentBaseTier: number): void {
    if (this.state !== BuildPointState.Locked) return;
    if (currentBaseTier >= this.unlockTier) {
      this.state = BuildPointState.Empty;
      // Fade in animation
      this.marker.setAlpha(0);
      this.scene.tweens.add({
        targets: this.marker,
        alpha: BUILD_POINT_IDLE_ALPHA_MIN,
        duration: BUILD_POINT_FADE_IN,
        onComplete: () => {
          this.pulseTween.resume();
        },
      });
    }
  }

  /** Returns the coin cost for this build point's structure type */
  get cost(): number {
    switch (this.type) {
      case 'wall': return this.structureRef ? WALL_STONE_UPGRADE_COST : WALL_WOOD_COST;
      case 'tower': return TOWER_COST;
      case 'farm': return FARM_COST;
      case 'hut': return BUILDER_HUT_COST;
      case 'base':
        if (this.coinsDeposited === 0) return BASE_UPGRADE_COST_1;
        if (this.coinsDeposited < BASE_UPGRADE_COST_1 + BASE_UPGRADE_COST_2) return BASE_UPGRADE_COST_2;
        return BASE_UPGRADE_COST_3;
      default: return 0;
    }
  }

  /**
   * Update proximity state. Switches between idle and active pulse intensity.
   * No-op if state is Locked or Building, or if state is unchanged.
   */
  setNearby(near: boolean): void {
    if (this.state === BuildPointState.Locked || this.state === BuildPointState.Building) {
      this.isNearby = false;
      return;
    }
    if (this.isNearby === near) return;
    this.isNearby = near;

    this.pulseTween.stop();

    if (near) {
      this.pulseTween = this.scene.tweens.add({
        targets: this.marker,
        alpha: { from: BUILD_POINT_ACTIVE_ALPHA_MIN, to: BUILD_POINT_ACTIVE_ALPHA_MAX },
        duration: BUILD_POINT_PULSE_DURATION,
        yoyo: true,
        repeat: -1,
      });
    } else {
      this.pulseTween = this.scene.tweens.add({
        targets: this.marker,
        alpha: { from: BUILD_POINT_IDLE_ALPHA_MIN, to: BUILD_POINT_IDLE_ALPHA_MAX },
        duration: BUILD_POINT_PULSE_DURATION,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * Deposit a coin at this build point.
   * Rejects coins in Locked or Building state.
   * Emits coin:deposited on the EventBus with build point ID, running total, and type.
   * Returns the new total.
   */
  addCoin(): number {
    if (this.state === BuildPointState.Locked || this.state === BuildPointState.Building) {
      return this.coinsDeposited;
    }
    this.coinsDeposited++;
    EventBus.emit('coin:deposited', {
      buildPointId: this.id,
      total: this.coinsDeposited,
      type: this.type,
    });
    return this.coinsDeposited;
  }

  /** Hide marker when structure is built */
  hideMarker(): void {
    this.pulseTween.stop();
    this.marker.setVisible(false);
  }

  /** Show marker again for upgradeable state */
  showMarker(): void {
    this.marker.setVisible(true);
    this.pulseTween = this.scene.tweens.add({
      targets: this.marker,
      alpha: { from: BUILD_POINT_IDLE_ALPHA_MIN, to: BUILD_POINT_IDLE_ALPHA_MAX },
      duration: BUILD_POINT_PULSE_DURATION,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Clean up tweens and graphics on scene shutdown.
   * Does NOT destroy structureRef -- StructureManager handles that.
   */
  destroy(): void {
    this.pulseTween.stop();
    this.marker.destroy();
  }
}

// Re-export the detection radius for convenience
export { BUILD_POINT_DETECT_RADIUS };
