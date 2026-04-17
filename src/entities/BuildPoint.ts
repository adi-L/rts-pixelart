import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import {
  BUILD_POINT_WIDTH, BUILD_POINT_HEIGHT, BUILD_POINT_DETECT_RADIUS,
  BUILD_POINT_IDLE_ALPHA_MIN, BUILD_POINT_IDLE_ALPHA_MAX,
  BUILD_POINT_ACTIVE_ALPHA_MIN, BUILD_POINT_ACTIVE_ALPHA_MAX,
  BUILD_POINT_PULSE_DURATION, COLOR_ACCENT, GROUND_Y
} from '../constants';

/**
 * BuildPoint -- a location where the hero can deposit coins.
 * Renders as a pulsing gold rectangle on the ground.
 * Glows brighter when the hero is within detection radius.
 */
export class BuildPoint {
  readonly id: string;
  readonly x: number;
  readonly marker: Phaser.GameObjects.Rectangle;
  coinsDeposited: number;
  isNearby: boolean;

  private scene: Phaser.Scene;
  private pulseTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, id: string) {
    this.scene = scene;
    this.x = x;
    this.id = id;
    this.coinsDeposited = 0;
    this.isNearby = false;

    // Visual marker -- gold rectangle sitting on the ground
    this.marker = scene.add
      .rectangle(
        x,
        GROUND_Y - BUILD_POINT_HEIGHT / 2,
        BUILD_POINT_WIDTH,
        BUILD_POINT_HEIGHT,
        COLOR_ACCENT
      )
      .setAlpha(BUILD_POINT_IDLE_ALPHA_MIN)
      .setDepth(2);

    // Idle pulse tween
    this.pulseTween = scene.tweens.add({
      targets: this.marker,
      alpha: { from: BUILD_POINT_IDLE_ALPHA_MIN, to: BUILD_POINT_IDLE_ALPHA_MAX },
      duration: BUILD_POINT_PULSE_DURATION,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Update proximity state. Switches between idle and active pulse intensity.
   * No-op if state is unchanged to avoid tween churn.
   */
  setNearby(near: boolean): void {
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
   * Emits coin:deposited on the EventBus with build point ID and running total.
   * Returns the new total.
   */
  addCoin(): number {
    this.coinsDeposited++;
    EventBus.emit('coin:deposited', {
      buildPointId: this.id,
      total: this.coinsDeposited,
    });
    return this.coinsDeposited;
  }

  /**
   * Clean up tweens and graphics on scene shutdown.
   */
  destroy(): void {
    this.pulseTween.stop();
    this.marker.destroy();
  }
}

// Re-export the detection radius for convenience
export { BUILD_POINT_DETECT_RADIUS };
