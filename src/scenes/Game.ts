import { Scene } from 'phaser';
import { Hero } from '../entities/Hero';
import { createCoinPool, spawnCoin, collectCoin } from '../entities/Coin';
import { BuildPoint } from '../entities/BuildPoint';
import EventBus from '../events/EventBus';
import {
  WORLD_WIDTH, WORLD_HEIGHT, GROUND_Y, GROUND_HEIGHT,
  GROUND_COLOR, GROUND_EDGE_COLOR, COLOR_SKY, COLOR_MID,
  CAMERA_LERP, CAMERA_DEADZONE_WIDTH,
  HERO_START_X, HERO_BODY_HEIGHT, PARALLAX_MID,
  COIN_INITIAL_SPAWN_COUNT, COIN_DROP_BOUNCE_DURATION,
  BUILD_POINT_LAYOUT, BUILD_POINT_DETECT_RADIUS,
  COIN_SIZE, COIN_SCALE, COLOR_ACCENT
} from '../constants';

export class Game extends Scene {
  private hero!: Hero;
  private midLayer!: Phaser.GameObjects.TileSprite;
  private coinPool!: Phaser.Physics.Arcade.Group;
  private buildPoints: BuildPoint[] = [];
  private coinCount: number = 0;
  private dropKey!: Phaser.Input.Keyboard.Key;
  private dropKeyDown!: Phaser.Input.Keyboard.Key;
  private coinCountText!: Phaser.GameObjects.Text;

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

    // Coin pool (INFRA-02)
    this.coinPool = createCoinPool(this);

    // Spawn initial coins scattered across the world
    const coinSpacing = WORLD_WIDTH / (COIN_INITIAL_SPAWN_COUNT + 1);
    for (let i = 1; i <= COIN_INITIAL_SPAWN_COUNT; i++) {
      const cx = coinSpacing * i + Phaser.Math.Between(-50, 50);
      spawnCoin(this.coinPool, cx, GROUND_Y - COIN_SIZE * COIN_SCALE / 2, this);
    }

    // Coin collection overlap (COIN-01, D-09)
    this.physics.add.overlap(
      this.hero.sprite,
      this.coinPool,
      (_hero, coin) => {
        const c = coin as Phaser.Physics.Arcade.Sprite;
        if (!c.active) return; // already being collected
        collectCoin(c, this.hero.sprite, this);
        this.coinCount++;
        this.coinCountText.setText(`Coins: ${this.coinCount}`);
      }
    );

    // Build points (D-12) -- use BUILD_POINT_LAYOUT for typed build points
    BUILD_POINT_LAYOUT.forEach((config) => {
      this.buildPoints.push(new BuildPoint(this, config));
    });

    // Drop key input (D-10 -- spacebar and down arrow)
    this.dropKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.dropKeyDown = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Debug coin count text (temporary HUD -- proper HUD is Phase 2)
    this.coinCountText = this.add.text(16, 16, 'Coins: 0', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#e2b714',
    }).setScrollFactor(0).setDepth(100);

    // Camera -- follow hero with lerp and deadzone
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.hero.sprite, true, CAMERA_LERP, CAMERA_LERP);
    this.cameras.main.setDeadzone(CAMERA_DEADZONE_WIDTH, 0);

    // Clean shutdown (INFRA-04) -- remove EventBus listeners and build points on scene shutdown
    this.events.once('shutdown', () => {
      EventBus.removeAllListeners();
      this.buildPoints.forEach(bp => bp.destroy());
      this.buildPoints.length = 0;
    });
  }

  update() {
    this.hero.update();
    // Parallax: mid-ground scrolls at fraction of camera scroll
    this.midLayer.tilePositionX = this.cameras.main.scrollX * PARALLAX_MID;

    // Build point proximity check -- updates pulse intensity
    for (const bp of this.buildPoints) {
      const distance = Math.abs(this.hero.sprite.x - bp.x);
      bp.setNearby(distance <= BUILD_POINT_DETECT_RADIUS);
    }

    // Coin drop logic (COIN-02, D-10)
    if (Phaser.Input.Keyboard.JustDown(this.dropKey) || Phaser.Input.Keyboard.JustDown(this.dropKeyDown)) {
      const nearBp = this.buildPoints.find(
        bp => Math.abs(this.hero.sprite.x - bp.x) <= BUILD_POINT_DETECT_RADIUS
      );
      if (nearBp && this.coinCount > 0) {
        this.coinCount--;
        this.coinCountText.setText(`Coins: ${this.coinCount}`);
        nearBp.addCoin();

        // Visual: coin flies from hero to build point
        const flyCoin = this.add.circle(
          this.hero.sprite.x, this.hero.sprite.y,
          COIN_SIZE, COLOR_ACCENT
        ).setDepth(10);
        this.tweens.add({
          targets: flyCoin,
          x: nearBp.x,
          y: nearBp.marker.y,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: COIN_DROP_BOUNCE_DURATION,
          ease: 'Quad.easeIn',
          onComplete: () => {
            flyCoin.destroy();
            // Bounce the build point on coin arrival
            this.tweens.add({
              targets: nearBp.marker,
              scaleX: 1.3,
              scaleY: 1.3,
              duration: COIN_DROP_BOUNCE_DURATION / 2,
              yoyo: true,
            });
          },
        });
      } else if (nearBp && this.coinCount === 0) {
        // Drop attempt with 0 coins: brief red tint flash on hero per UI-SPEC
        this.hero.sprite.setTint(0xff0000);
        this.time.delayedCall(100, () => {
          this.hero.sprite.clearTint();
        });
      }
      // If not near a build point, silently ignore per UI-SPEC
    }
  }
}
