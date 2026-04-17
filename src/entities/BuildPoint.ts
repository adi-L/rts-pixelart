import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import {
  BUILD_POINT_DETECT_RADIUS, COLOR_ACCENT, GROUND_Y,
  BUILD_POINT_FADE_IN, WALL_WOOD_COST, WALL_STONE_UPGRADE_COST,
  TOWER_COST, FARM_COST, BUILDER_HUT_COST, BASE_UPGRADE_COST_1,
  BASE_UPGRADE_COST_2, BASE_UPGRADE_COST_3,
  FLAG_POLE_WIDTH, FLAG_POLE_HEIGHT, FLAG_BANNER_WIDTH, FLAG_BANNER_HEIGHT,
  FLAG_POLE_COLOR, FLAG_COLORS,
} from '../constants';
import type { BuildPointType, BuildPointConfig } from '../constants';
import type { BaseStructure } from './structures/BaseStructure';

export enum BuildPointState {
  Locked,      // invisible, no interaction
  Empty,       // flag visible, accepts coins
  Funded,      // enough coins deposited, waiting for builder
  Building,    // builder is constructing
  Complete,    // structure exists
  Upgradeable, // structure can accept more coins
}

/**
 * BuildPoint -- a location where the hero can deposit coins.
 * Renders as a flag pole with colored banner + coin counter text.
 * Counter shows only when the hero is within detection radius.
 */
export class BuildPoint {
  readonly id: string;
  readonly x: number;
  readonly type: BuildPointType;
  readonly unlockTier: number;
  coinsDeposited: number;
  isNearby: boolean;
  state: BuildPointState;
  structureRef: BaseStructure | null = null;

  /** Kept for external references (e.g. coin fly target in Game.ts) */
  readonly marker: Phaser.GameObjects.Rectangle;

  private scene: Phaser.Scene;
  private flagPole: Phaser.GameObjects.Rectangle;
  private flagBanner: Phaser.GameObjects.Rectangle;
  private coinText: Phaser.GameObjects.Text;
  private bannerPulseTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, config: BuildPointConfig) {
    this.scene = scene;
    this.x = config.x;
    this.id = config.id;
    this.type = config.type;
    this.unlockTier = config.unlockTier;
    this.coinsDeposited = 0;
    this.isNearby = false;

    this.state = config.unlockTier === 0 ? BuildPointState.Empty : BuildPointState.Locked;
    const isVisible = this.state !== BuildPointState.Locked;

    // Invisible marker kept as coin-fly target anchor
    this.marker = scene.add
      .rectangle(config.x, GROUND_Y - 24, 1, 1, 0x000000)
      .setAlpha(0)
      .setDepth(4);

    // Flag pole
    const poleY = GROUND_Y - FLAG_POLE_HEIGHT / 2;
    this.flagPole = scene.add
      .rectangle(config.x, poleY, FLAG_POLE_WIDTH, FLAG_POLE_HEIGHT, FLAG_POLE_COLOR)
      .setAlpha(isVisible ? 0.8 : 0)
      .setDepth(5);

    // Flag banner at top of pole
    const bannerColor = FLAG_COLORS[config.type] ?? COLOR_ACCENT;
    const bannerX = config.x + FLAG_BANNER_WIDTH / 2 + FLAG_POLE_WIDTH / 2;
    const bannerY = GROUND_Y - FLAG_POLE_HEIGHT + FLAG_BANNER_HEIGHT / 2;
    this.flagBanner = scene.add
      .rectangle(bannerX, bannerY, FLAG_BANNER_WIDTH, FLAG_BANNER_HEIGHT, bannerColor)
      .setAlpha(isVisible ? 1 : 0)
      .setDepth(5);

    // Gentle banner pulse
    this.bannerPulseTween = scene.tweens.add({
      targets: this.flagBanner,
      alpha: { from: 0.7, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      paused: !isVisible,
    });

    // Coin counter text at base of pole (hidden until hero is nearby)
    this.coinText = scene.add.text(
      config.x,
      GROUND_Y - 8,
      this.getCoinLabel(),
      { fontSize: '10px', color: '#e2b714', fontFamily: 'monospace', align: 'center' }
    )
      .setOrigin(0.5, 1)
      .setDepth(6)
      .setAlpha(0);
  }

  private getCoinLabel(): string {
    return `${this.coinsDeposited}/${this.cost}`;
  }

  private refreshCoinText(): void {
    this.coinText.setText(this.getCoinLabel());
  }

  /** Check and apply unlock based on current base tier */
  checkUnlock(currentBaseTier: number): void {
    if (this.state !== BuildPointState.Locked) return;
    if (currentBaseTier >= this.unlockTier) {
      this.state = BuildPointState.Empty;
      this.flagPole.setAlpha(0);
      this.flagBanner.setAlpha(0);
      this.scene.tweens.add({
        targets: this.flagPole,
        alpha: 0.8,
        duration: BUILD_POINT_FADE_IN,
      });
      this.scene.tweens.add({
        targets: this.flagBanner,
        alpha: 1,
        duration: BUILD_POINT_FADE_IN,
        onComplete: () => {
          this.bannerPulseTween.resume();
        },
      });
      this.refreshCoinText();
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
   * Update proximity state. Shows/hides coin counter.
   */
  setNearby(near: boolean): void {
    if (this.state === BuildPointState.Locked || this.state === BuildPointState.Building) {
      this.isNearby = false;
      return;
    }
    if (this.isNearby === near) return;
    this.isNearby = near;

    // Show/hide coin counter when hero is nearby
    this.scene.tweens.add({
      targets: this.coinText,
      alpha: near ? 1 : 0,
      duration: 200,
    });

    // Brighten/dim the banner
    this.bannerPulseTween.stop();
    if (near) {
      this.bannerPulseTween = this.scene.tweens.add({
        targets: this.flagBanner,
        alpha: { from: 0.9, to: 1 },
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    } else {
      this.bannerPulseTween = this.scene.tweens.add({
        targets: this.flagBanner,
        alpha: { from: 0.7, to: 1 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * Deposit a coin at this build point.
   * Emits coin:deposited on the EventBus.
   */
  addCoin(): number {
    if (this.state === BuildPointState.Locked || this.state === BuildPointState.Building) {
      return this.coinsDeposited;
    }
    this.coinsDeposited++;
    this.refreshCoinText();
    EventBus.emit('coin:deposited', {
      buildPointId: this.id,
      total: this.coinsDeposited,
      type: this.type,
    });
    return this.coinsDeposited;
  }

  /** Hide flag when structure is built */
  hideMarker(): void {
    this.bannerPulseTween.stop();
    this.marker.setVisible(false);
    this.flagPole.setVisible(false);
    this.flagBanner.setVisible(false);
    this.coinText.setVisible(false);
  }

  /** Show flag again for upgradeable state */
  showMarker(): void {
    this.flagPole.setVisible(true);
    this.flagBanner.setVisible(true);
    this.coinText.setVisible(true);
    this.refreshCoinText();
    this.bannerPulseTween = this.scene.tweens.add({
      targets: this.flagBanner,
      alpha: { from: 0.7, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });
  }

  destroy(): void {
    this.bannerPulseTween.stop();
    this.marker.destroy();
    this.flagPole.destroy();
    this.flagBanner.destroy();
    this.coinText.destroy();
  }
}

export { BUILD_POINT_DETECT_RADIUS };
