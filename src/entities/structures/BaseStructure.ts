import Phaser from 'phaser';
import {
  GROUND_Y, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, HEALTH_BAR_OFFSET_Y,
  COLOR_HEALTH_BG, COLOR_HEALTH_HIGH, COLOR_HEALTH_MID, COLOR_HEALTH_LOW,
  STRUCTURE_SCALE_PULSE, FLASH_TINT_DURATION
} from '../../constants';

export class BaseStructure {
  public rect: Phaser.GameObjects.Rectangle;
  protected scene: Phaser.Scene;
  protected hp: number;
  protected maxHp: number;
  protected tier: number = 1;
  protected originalColor: number;
  public buildPointId: string;

  // Health bar components
  private hpBg: Phaser.GameObjects.Rectangle;
  private hpFill: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    width: number,
    height: number,
    color: number,
    hp: number,
    buildPointId: string
  ) {
    this.scene = scene;
    this.hp = hp;
    this.maxHp = hp;
    this.originalColor = color;
    this.buildPointId = buildPointId;

    // Main visual -- bottom edge at GROUND_Y
    this.rect = scene.add.rectangle(x, GROUND_Y - height / 2, width, height, color)
      .setDepth(2);

    // Health bar -- centered above structure, hidden at full HP
    const hpY = GROUND_Y - height - HEALTH_BAR_OFFSET_Y;
    this.hpBg = scene.add.rectangle(x, hpY, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, COLOR_HEALTH_BG)
      .setDepth(2).setVisible(false);
    this.hpFill = scene.add.rectangle(x, hpY, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, COLOR_HEALTH_HIGH)
      .setDepth(2).setVisible(false);
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.updateHealthBar();
    // Brief red tint flash, then restore original color
    const savedColor = this.originalColor;
    this.rect.setFillStyle(0xCC4444);
    this.scene.time.delayedCall(FLASH_TINT_DURATION, () => {
      this.rect.setFillStyle(savedColor);
    });
  }

  protected updateHealthBar(): void {
    const visible = this.hp < this.maxHp;
    this.hpBg.setVisible(visible);
    this.hpFill.setVisible(visible);
    if (visible) {
      const ratio = this.hp / this.maxHp;
      this.hpFill.width = HEALTH_BAR_WIDTH * ratio;
      if (ratio > 0.5) {
        this.hpFill.setFillStyle(COLOR_HEALTH_HIGH);
      } else if (ratio > 0.25) {
        this.hpFill.setFillStyle(COLOR_HEALTH_MID);
      } else {
        this.hpFill.setFillStyle(COLOR_HEALTH_LOW);
      }
    }
  }

  /** Upgrade visual: new size, color, HP. Plays scale pulse + white flash. */
  protected upgradeVisual(
    newWidth: number, newHeight: number, newColor: number, newMaxHp: number
  ): void {
    this.tier++;
    this.maxHp = newMaxHp;
    this.hp = newMaxHp;
    this.originalColor = newColor;
    this.rect.width = newWidth;
    this.rect.height = newHeight;
    this.rect.y = GROUND_Y - newHeight / 2;
    this.rect.setFillStyle(newColor);
    // Reposition health bar
    const hpY = GROUND_Y - newHeight - HEALTH_BAR_OFFSET_Y;
    this.hpBg.setPosition(this.rect.x, hpY);
    this.hpFill.setPosition(this.rect.x, hpY);
    this.updateHealthBar();
    // Scale pulse animation
    this.scene.tweens.add({
      targets: this.rect,
      scaleX: 1.1, scaleY: 1.1,
      duration: STRUCTURE_SCALE_PULSE / 2,
      yoyo: true,
    });
    // White flash then restore color
    this.rect.setFillStyle(0xFFFFFF);
    this.scene.time.delayedCall(FLASH_TINT_DURATION, () => {
      this.rect.setFillStyle(newColor);
    });
  }

  get isDestroyed(): boolean { return this.hp <= 0; }
  get x(): number { return this.rect.x; }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.rect);
    this.rect.destroy();
    this.hpBg.destroy();
    this.hpFill.destroy();
  }
}
