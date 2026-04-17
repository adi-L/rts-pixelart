import { Scene } from 'phaser';
import { Hero } from '../entities/Hero';
import EventBus from '../events/EventBus';
import {
  WORLD_WIDTH, WORLD_HEIGHT, GROUND_Y, GROUND_HEIGHT,
  GROUND_COLOR, GROUND_EDGE_COLOR, COLOR_SKY, COLOR_MID,
  CAMERA_LERP, CAMERA_DEADZONE_WIDTH,
  HERO_START_X, HERO_BODY_HEIGHT, PARALLAX_MID
} from '../constants';

export class Game extends Scene {
  private hero!: Hero;
  private midLayer!: Phaser.GameObjects.TileSprite;

  constructor() {
    super('Game');
  }

  create() {
    // Physics world bounds (MUST be set before creating any physics bodies)
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Sky layer (depth 0) -- solid color rectangle, scrollFactor 0 (fixed to camera)
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLOR_SKY)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    // Mid-ground layer (depth 1) -- TileSprite with manual parallax via tilePositionX
    this.midLayer = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1)
      .setTint(COLOR_MID);

    // Ground (depth 2) -- full world width
    this.add.rectangle(
      WORLD_WIDTH / 2, GROUND_Y + GROUND_HEIGHT / 2,
      WORLD_WIDTH, GROUND_HEIGHT, GROUND_COLOR
    ).setDepth(2);

    // Ground top edge highlight (2px for depth)
    this.add.rectangle(
      WORLD_WIDTH / 2, GROUND_Y,
      WORLD_WIDTH, 2, GROUND_EDGE_COLOR
    ).setDepth(2);

    // Hero (depth 3) -- positioned so bottom aligns with ground top
    this.hero = new Hero(this, HERO_START_X, GROUND_Y - HERO_BODY_HEIGHT / 2);
    this.hero.createAnimations();
    this.hero.sprite.setDepth(3);

    // Camera -- follow hero with lerp and deadzone
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.hero.sprite, true, CAMERA_LERP, CAMERA_LERP);
    this.cameras.main.setDeadzone(CAMERA_DEADZONE_WIDTH, 0);

    // Clean shutdown (INFRA-04) -- remove EventBus listeners on scene shutdown
    this.events.once('shutdown', () => {
      EventBus.removeAllListeners();
    });
  }

  update() {
    this.hero.update();
    // Parallax: mid-ground scrolls at fraction of camera scroll
    this.midLayer.tilePositionX = this.cameras.main.scrollX * PARALLAX_MID;
  }
}
