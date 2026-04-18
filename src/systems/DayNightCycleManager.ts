import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import { EconomyManager } from './EconomyManager';
import {
  DAY_DURATION, NIGHT_DURATION, TRANSITION_DURATION,
  NIGHTFALL_WARNING_TIME, OVERLAY_NIGHT_COLOR,
  OVERLAY_MAX_ALPHA, OVERLAY_DEPTH
} from '../constants';

export class DayNightCycleManager {
  private scene: Phaser.Scene;
  private economy: EconomyManager;
  private overlay: Phaser.GameObjects.Rectangle;
  private elapsed: number = 0;
  private _isNight: boolean = false;
  private warningEmitted: boolean = false;

  constructor(scene: Phaser.Scene, economy: EconomyManager) {
    this.scene = scene;
    this.economy = economy;

    // Full-screen overlay for night darkness, fixed to camera
    this.overlay = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      scene.scale.width,
      scene.scale.height,
      OVERLAY_NIGHT_COLOR
    )
      .setScrollFactor(0)
      .setDepth(OVERLAY_DEPTH)
      .setAlpha(0);
  }

  get isNightTime(): boolean {
    return this._isNight;
  }

  update(delta: number): void {
    this.elapsed += delta;

    if (!this._isNight) {
      // Day phase -- check for nightfall warning
      if (!this.warningEmitted && this.elapsed >= DAY_DURATION - NIGHTFALL_WARNING_TIME) {
        EventBus.emit('night:warning');
        this.warningEmitted = true;
      }

      // Day phase complete -- transition to night
      if (this.elapsed >= DAY_DURATION) {
        this.elapsed = 0;
        this._isNight = true;
        this.warningEmitted = false;
        this.transitionToNight();
      }
    } else {
      // Night phase complete -- transition to day
      if (this.elapsed >= NIGHT_DURATION) {
        this.elapsed = 0;
        this._isNight = false;
        this.transitionToDay();
      }
    }
  }

  private transitionToNight(): void {
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: OVERLAY_MAX_ALPHA,
      duration: TRANSITION_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        EventBus.emit('night:start');
      },
    });
  }

  private transitionToDay(): void {
    // Increment day counter via EconomyManager (per D-04)
    this.economy.setDay(this.economy.day + 1);

    EventBus.emit('night:end');

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: TRANSITION_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        EventBus.emit('day:start');
      },
    });
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.overlay);
    this.overlay.destroy();
  }
}
