import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import {
  HUD_MARGIN, HUD_COIN_ICON_SIZE, HUD_COIN_TEXT_SIZE,
  HUD_LABEL_TEXT_SIZE, HUD_COIN_X, HUD_DAY_LABEL_X,
  HUD_Y, HUD_DEPTH, COLOR_ACCENT
} from '../constants';

export class HUD {
  private coinIcon: Phaser.GameObjects.Arc;
  private coinText: Phaser.GameObjects.Text;
  private dayText: Phaser.GameObjects.Text;
  private warningText: Phaser.GameObjects.Text;
  private onEconomyChanged: (data: { coins: number; day: number }) => void;
  private onNightWarning: () => void;

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
  }

  /** Remove EventBus listeners and destroy game objects */
  destroy(): void {
    EventBus.off('economy:changed', this.onEconomyChanged);
    EventBus.off('night:warning', this.onNightWarning);
    this.coinIcon.destroy();
    this.coinText.destroy();
    this.dayText.destroy();
    this.warningText.destroy();
  }
}
