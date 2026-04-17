import Phaser from 'phaser';
import { BaseStructure } from './BaseStructure';
import EventBus from '../../events/EventBus';
import {
  GROUND_Y,
  BASE_TIER1_WIDTH, BASE_TIER1_HEIGHT,
  BASE_TIER2_WIDTH, BASE_TIER2_HEIGHT,
  BASE_TIER3_WIDTH, BASE_TIER3_HEIGHT,
  BASE_TIER_MAX_WIDTH,
  BASE_WING_TIER2_WIDTH, BASE_WING_TIER2_HEIGHT,
  BASE_WING_TIER3_WIDTH, BASE_WING_TIER3_HEIGHT,
  COLOR_BASE_TIER1, COLOR_BASE_TIER2, COLOR_BASE_TIER3,
  BASE_TIER1_HP, BASE_TIER2_HP, BASE_TIER3_HP,
  BASE_COLLAPSE_SHAKE_DURATION, BASE_COLLAPSE_FALL_DURATION,
  SCREEN_FADE_DURATION, FLASH_TINT_DURATION,
} from '../../constants';

export class MainBase extends BaseStructure {
  private leftWing: Phaser.GameObjects.Rectangle | null = null;
  private rightWing: Phaser.GameObjects.Rectangle | null = null;
  private baseTier: number = 1;

  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, BASE_TIER1_WIDTH, BASE_TIER1_HEIGHT, COLOR_BASE_TIER1, BASE_TIER1_HP, 'bp-base');
  }

  get currentTier(): number { return this.baseTier; }

  /** Upgrade to next tier. Returns true if upgrade happened. */
  upgrade(): boolean {
    if (this.baseTier >= 4) return false;
    this.baseTier++;

    switch (this.baseTier) {
      case 2:
        this.upgradeVisual(BASE_TIER2_WIDTH, BASE_TIER2_HEIGHT, COLOR_BASE_TIER2, BASE_TIER2_HP);
        // Add wings
        this.leftWing = this.scene.add.rectangle(
          this.rect.x - BASE_TIER2_WIDTH / 2 - BASE_WING_TIER2_WIDTH / 2,
          GROUND_Y - BASE_WING_TIER2_HEIGHT / 2,
          BASE_WING_TIER2_WIDTH, BASE_WING_TIER2_HEIGHT, COLOR_BASE_TIER2
        ).setDepth(2);
        this.rightWing = this.scene.add.rectangle(
          this.rect.x + BASE_TIER2_WIDTH / 2 + BASE_WING_TIER2_WIDTH / 2,
          GROUND_Y - BASE_WING_TIER2_HEIGHT / 2,
          BASE_WING_TIER2_WIDTH, BASE_WING_TIER2_HEIGHT, COLOR_BASE_TIER2
        ).setDepth(2);
        break;

      case 3:
        this.upgradeVisual(BASE_TIER3_WIDTH, BASE_TIER3_HEIGHT, COLOR_BASE_TIER3, BASE_TIER3_HP);
        // Grow wings
        if (this.leftWing && this.rightWing) {
          this.leftWing.width = BASE_WING_TIER3_WIDTH;
          this.leftWing.height = BASE_WING_TIER3_HEIGHT;
          this.leftWing.x = this.rect.x - BASE_TIER3_WIDTH / 2 - BASE_WING_TIER3_WIDTH / 2;
          this.leftWing.y = GROUND_Y - BASE_WING_TIER3_HEIGHT / 2;
          this.leftWing.setFillStyle(COLOR_BASE_TIER3);
          this.rightWing.width = BASE_WING_TIER3_WIDTH;
          this.rightWing.height = BASE_WING_TIER3_HEIGHT;
          this.rightWing.x = this.rect.x + BASE_TIER3_WIDTH / 2 + BASE_WING_TIER3_WIDTH / 2;
          this.rightWing.y = GROUND_Y - BASE_WING_TIER3_HEIGHT / 2;
          this.rightWing.setFillStyle(COLOR_BASE_TIER3);
        }
        break;

      case 4:
        // Max tier: wider, more HP, add a "crown" indicator (small lighter rect on top)
        this.upgradeVisual(BASE_TIER_MAX_WIDTH, BASE_TIER3_HEIGHT + 8, COLOR_BASE_TIER3, 250);
        if (this.leftWing && this.rightWing) {
          this.leftWing.x = this.rect.x - BASE_TIER_MAX_WIDTH / 2 - BASE_WING_TIER3_WIDTH / 2;
          this.rightWing.x = this.rect.x + BASE_TIER_MAX_WIDTH / 2 + BASE_WING_TIER3_WIDTH / 2;
        }
        // Crown indicator -- small gold rectangle on top
        this.scene.add.rectangle(
          this.rect.x, GROUND_Y - (BASE_TIER3_HEIGHT + 8) - 4,
          24, 6, 0xe2b714
        ).setDepth(2);
        break;
    }

    EventBus.emit('base:upgraded', { tier: this.baseTier });
    return true;
  }

  /** Main base destruction sequence per D-09 and UI-SPEC */
  destroyBase(): void {
    // Step 1: Freeze all physics
    this.scene.physics.pause();

    // Step 2: Shake
    this.scene.tweens.add({
      targets: this.rect,
      x: this.rect.x + 3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        // Step 3: Collapse -- split into falling debris rectangles
        this.rect.setVisible(false);
        if (this.leftWing) this.leftWing.setVisible(false);
        if (this.rightWing) this.rightWing.setVisible(false);

        for (let i = 0; i < 6; i++) {
          const debris = this.scene.add.rectangle(
            this.rect.x + Phaser.Math.Between(-30, 30),
            this.rect.y,
            16, 12, this.rect.fillColor
          ).setDepth(10);
          this.scene.tweens.add({
            targets: debris,
            y: GROUND_Y + 50,
            x: debris.x + Phaser.Math.Between(-40, 40),
            angle: Phaser.Math.Between(-180, 180),
            alpha: 0,
            duration: BASE_COLLAPSE_FALL_DURATION,
          });
        }

        // Step 4: Red flash + fade to black after shake duration
        this.scene.time.delayedCall(BASE_COLLAPSE_SHAKE_DURATION, () => {
          this.scene.cameras.main.flash(FLASH_TINT_DURATION, 204, 68, 68);
          this.scene.cameras.main.fadeOut(SCREEN_FADE_DURATION, 0, 0, 0);
          this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.scene.start('GameOver');
          });
        });
      },
    });
  }

  /** Override takeDamage to trigger destruction at 0 HP */
  takeDamage(amount: number): void {
    super.takeDamage(amount);
    if (this.hp <= 0) {
      this.destroyBase();
    }
  }

  destroy(): void {
    if (this.leftWing) this.leftWing.destroy();
    if (this.rightWing) this.rightWing.destroy();
    super.destroy();
  }
}
