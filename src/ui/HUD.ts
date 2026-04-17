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
  private onEconomyChanged: (data: { coins: number; day: number }) => void;

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

    // Listen for economy changes
    this.onEconomyChanged = (data: { coins: number; day: number }) => {
      this.coinText.setText(`${data.coins}`);
      this.dayText.setText(`Day ${data.day}`);
    };
    EventBus.on('economy:changed', this.onEconomyChanged);
  }

  /** Remove EventBus listeners and destroy game objects */
  destroy(): void {
    EventBus.off('economy:changed', this.onEconomyChanged);
    this.coinIcon.destroy();
    this.coinText.destroy();
    this.dayText.destroy();
  }
}
