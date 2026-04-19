import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import {
  HUD_MARGIN, HUD_COIN_ICON_SIZE, HUD_COIN_TEXT_SIZE,
  HUD_LABEL_TEXT_SIZE, HUD_COIN_X, HUD_DAY_LABEL_X,
  HUD_Y, HUD_DEPTH, COLOR_ACCENT,
  COLOR_HEALTH_BG, COLOR_HEALTH_HIGH, COLOR_HEALTH_MID, COLOR_HEALTH_LOW
} from '../constants';

export class HUD {
  private coinIcon: Phaser.GameObjects.Arc;
  private coinText: Phaser.GameObjects.Text;
  private dayText: Phaser.GameObjects.Text;
  private warningText: Phaser.GameObjects.Text;
  private healthBg: Phaser.GameObjects.Rectangle;
  private healthFill: Phaser.GameObjects.Rectangle;
  private ammoText: Phaser.GameObjects.Text;
  private onEconomyChanged: (data: { coins: number; day: number }) => void;
  private onNightWarning: () => void;
  private onHpChanged: (data: { hp: number; maxHp: number }) => void;
  private onAmmoChanged: (data: { ammo: number; maxAmmo: number }) => void;

  constructor(scene: Phaser.Scene) {
    // Coin icon -- small gold circle at top-left
    this.coinIcon = scene.add.circle(
      HUD_MARGIN, HUD_Y, HUD_COIN_ICON_SIZE / 2, COLOR_ACCENT
    ).setScrollFactor(0).setDepth(HUD_DEPTH);

    // Coin count text -- bold, accent color, right of icon
    this.coinText = scene.add.text(HUD_COIN_X, HUD_Y, '0', {
      fontFamily: '"Courier New", monospace',
      fontSize: HUD_COIN_TEXT_SIZE,
      color: '#e2b714',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0, 0.3);

    // Day text -- "Day 1", white, right of coin count
    this.dayText = scene.add.text(HUD_DAY_LABEL_X, HUD_Y, 'Day 1', {
      fontFamily: '"Courier New", monospace',
      fontSize: HUD_LABEL_TEXT_SIZE,
      color: '#FFFFFF',
    }).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0, 0.3);

    // Nightfall warning text -- centered, hidden by default
    this.warningText = scene.add.text(
      scene.scale.width / 2, 60,
      'NIGHT APPROACHES',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#FF4444',
        fontStyle: 'bold',
      }
    ).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0.5, 0.5).setAlpha(0);

    // Listen for economy changes
    this.onEconomyChanged = (data: { coins: number; day: number }) => {
      this.coinText.setText(`${data.coins}`);
      this.dayText.setText(`Day ${data.day}`);
    };
    EventBus.on('economy:changed', this.onEconomyChanged);

    // Listen for nightfall warning
    this.onNightWarning = () => {
      // Flash warning text 3 times over 3 seconds then fade out
      scene.tweens.add({
        targets: this.warningText,
        alpha: { from: 0, to: 1 },
        duration: 500,
        yoyo: true,
        repeat: 2,
        onComplete: () => this.warningText.setAlpha(0),
      });
    };
    EventBus.on('night:warning', this.onNightWarning);

    // Health bar -- positioned at top-center of screen
    const healthBarWidth = 100;
    const healthBarHeight = 8;
    const healthBarX = scene.scale.width / 2;
    const healthBarY = HUD_Y;

    this.healthBg = scene.add.rectangle(
      healthBarX, healthBarY, healthBarWidth, healthBarHeight, COLOR_HEALTH_BG
    ).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0.5, 0.5);

    this.healthFill = scene.add.rectangle(
      healthBarX, healthBarY, healthBarWidth, healthBarHeight, COLOR_HEALTH_HIGH
    ).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0.5, 0.5);

    // Ammo counter -- positioned to the right of the health bar
    this.ammoText = scene.add.text(
      healthBarX + healthBarWidth / 2 + 16, healthBarY, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: HUD_LABEL_TEXT_SIZE,
        color: '#CCCCCC',
      }
    ).setScrollFactor(0).setDepth(HUD_DEPTH).setOrigin(0, 0.3);

    // Listen for hero HP changes
    this.onHpChanged = (data: { hp: number; maxHp: number }) => {
      const ratio = data.hp / data.maxHp;
      this.healthFill.width = 100 * ratio;
      if (ratio > 0.5) this.healthFill.setFillStyle(COLOR_HEALTH_HIGH);
      else if (ratio > 0.25) this.healthFill.setFillStyle(COLOR_HEALTH_MID);
      else this.healthFill.setFillStyle(COLOR_HEALTH_LOW);
    };
    EventBus.on('hero:hp-changed', this.onHpChanged);

    // Listen for hero ammo changes
    this.onAmmoChanged = (data: { ammo: number; maxAmmo: number }) => {
      if (data.maxAmmo > 0) {
        this.ammoText.setText(`${data.ammo}/${data.maxAmmo}`);
      }
    };
    EventBus.on('hero:ammo-changed', this.onAmmoChanged);
  }

  /** Remove EventBus listeners and destroy game objects */
  destroy(): void {
    EventBus.off('economy:changed', this.onEconomyChanged);
    EventBus.off('night:warning', this.onNightWarning);
    EventBus.off('hero:hp-changed', this.onHpChanged);
    EventBus.off('hero:ammo-changed', this.onAmmoChanged);
    this.coinIcon.destroy();
    this.coinText.destroy();
    this.dayText.destroy();
    this.warningText.destroy();
    this.healthBg.destroy();
    this.healthFill.destroy();
    this.ammoText.destroy();
  }
}
