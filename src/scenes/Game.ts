import { Scene } from 'phaser';
import { Hero } from '../entities/Hero';
import { createCoinPool, spawnCoin, collectCoin } from '../entities/Coin';
import { EconomyManager } from '../systems/EconomyManager';
import { StructureManager } from '../systems/StructureManager';
import { NPCManager } from '../systems/NPCManager';
import { HUD } from '../ui/HUD';
import { Builder } from '../entities/npc/Builder';
import { Farmer } from '../entities/npc/Farmer';
import { BuildPointState } from '../entities/BuildPoint';
import EventBus from '../events/EventBus';
import {
  WORLD_WIDTH, WORLD_HEIGHT, GROUND_Y, GROUND_HEIGHT,
  GROUND_COLOR, GROUND_EDGE_COLOR, COLOR_SKY, COLOR_MID,
  CAMERA_LERP, CAMERA_DEADZONE_WIDTH,
  HERO_START_X, HERO_BODY_HEIGHT, PARALLAX_MID,
  COIN_INITIAL_SPAWN_COUNT, COIN_DROP_BOUNCE_DURATION,
  BUILD_POINT_DETECT_RADIUS, COIN_SIZE, COIN_SCALE, COLOR_ACCENT,
  VAGRANT_RECRUIT_RADIUS, FARMER_WORK_RANGE
} from '../constants';

export class Game extends Scene {
  private hero!: Hero;
  private midLayer!: Phaser.GameObjects.TileSprite;
  private coinPool!: Phaser.Physics.Arcade.Group;
  private dropKey!: Phaser.Input.Keyboard.Key;
  private dropKeyDown!: Phaser.Input.Keyboard.Key;

  // Phase 2 systems
  private economy!: EconomyManager;
  private structureManager!: StructureManager;
  private npcManager!: NPCManager;
  private hud!: HUD;

  // Role assignment listener references
  private onStructureBuilt!: (data: { buildPointId: string; type: string; x: number }) => void;

  constructor() {
    super('Game');
  }

  create() {
    // Physics world bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Sky layer
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLOR_SKY)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0);

    // Mid-ground parallax layer
    this.midLayer = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setTint(COLOR_MID);

    // Ground
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + GROUND_HEIGHT / 2, WORLD_WIDTH, GROUND_HEIGHT, GROUND_COLOR).setDepth(2);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y, WORLD_WIDTH, 2, GROUND_EDGE_COLOR).setDepth(2);

    // Hero
    this.hero = new Hero(this, HERO_START_X, GROUND_Y - HERO_BODY_HEIGHT / 2);
    this.hero.createAnimations();
    this.hero.sprite.setDepth(3);

    // Coin pool
    this.coinPool = createCoinPool(this);
    const coinSpacing = WORLD_WIDTH / (COIN_INITIAL_SPAWN_COUNT + 1);
    for (let i = 1; i <= COIN_INITIAL_SPAWN_COUNT; i++) {
      const cx = coinSpacing * i + Phaser.Math.Between(-50, 50);
      spawnCoin(this.coinPool, cx, GROUND_Y - COIN_SIZE * COIN_SCALE / 2, this);
    }

    // Phase 2 systems initialization
    this.economy = new EconomyManager();
    this.structureManager = new StructureManager(this);
    this.npcManager = new NPCManager(this, this.economy, this.structureManager);
    this.hud = new HUD(this);

    // Coin collection overlap -- now routes through EconomyManager
    this.physics.add.overlap(
      this.hero.sprite,
      this.coinPool,
      (_hero, coin) => {
        const c = coin as Phaser.Physics.Arcade.Sprite;
        if (!c.active) return;
        collectCoin(c, this.hero.sprite, this);
        this.economy.addCoins(1, 'pickup');
      }
    );

    // Drop key input
    this.dropKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.dropKeyDown = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Camera
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.hero.sprite, true, CAMERA_LERP, CAMERA_LERP);
    this.cameras.main.setDeadzone(CAMERA_DEADZONE_WIDTH, 0);

    // Role assignment: when a builder hut is built, convert nearest citizen to builder
    this.onStructureBuilt = (data) => {
      if (data.type === 'hut') {
        this.assignCitizenAsBuilder(data.x);
      }
    };
    EventBus.on('structure:built', this.onStructureBuilt);

    // Clean shutdown
    this.events.once('shutdown', () => {
      EventBus.off('structure:built', this.onStructureBuilt);
      EventBus.removeAllListeners();
      this.npcManager.destroy();
      this.structureManager.destroy();
      this.hud.destroy();
    });
  }

  update(time: number, delta: number) {
    this.hero.update();
    this.midLayer.tilePositionX = this.cameras.main.scrollX * PARALLAX_MID;

    // Update build point proximity via StructureManager
    this.structureManager.updateProximity(this.hero.sprite.x);

    // Update all NPCs
    this.npcManager.update(time, delta);

    // Auto-assign citizens near unmanned farms to farmer role (D-04)
    this.checkFarmProximity();

    // Coin drop / recruitment logic
    if (Phaser.Input.Keyboard.JustDown(this.dropKey) || Phaser.Input.Keyboard.JustDown(this.dropKeyDown)) {
      this.handleDrop();
    }
  }

  private handleDrop(): void {
    const heroX = this.hero.sprite.x;

    // Priority 1: Recruit nearby vagrant (D-01)
    const hasNearbyVagrant = this.npcManager.vagrants.some(
      v => Math.abs(v.sprite.x - heroX) <= VAGRANT_RECRUIT_RADIUS
    );
    if (hasNearbyVagrant) {
      if (this.npcManager.tryRecruitNearby(heroX)) {
        return; // Recruitment consumed the coin drop
      }
      // If tryRecruitNearby returned false (0 coins), fall through to red flash below
    }

    // Priority 2: Pay full cost at nearby build point (all-or-nothing)
    const nearBp = this.structureManager.buildPoints.find(
      bp => Math.abs(heroX - bp.x) <= BUILD_POINT_DETECT_RADIUS &&
            bp.state !== BuildPointState.Locked &&
            bp.state !== BuildPointState.Building &&
            bp.state !== BuildPointState.Complete
    );
    if (nearBp) {
      const cost = nearBp.cost;
      if (this.economy.coins >= cost) {
        // Can afford — spend all coins and fund immediately
        this.economy.spendCoins(cost);
        nearBp.fundFull(cost);
        // Visual: coins fly from hero to flag
        for (let i = 0; i < cost; i++) {
          const flyCoin = this.add.circle(
            this.hero.sprite.x, this.hero.sprite.y,
            COIN_SIZE * 0.5, COLOR_ACCENT
          ).setDepth(10);
          this.tweens.add({
            targets: flyCoin,
            x: nearBp.x + (i - cost / 2) * 6,
            y: GROUND_Y - 20,
            scaleX: 0.5, scaleY: 0.5,
            duration: COIN_DROP_BOUNCE_DURATION + i * 50,
            ease: 'Quad.easeIn',
            onComplete: () => flyCoin.destroy(),
          });
        }
        return;
      } else {
        // Can't afford — coins fall to ground, red flash
        this.hero.sprite.setTint(0xff0000);
        this.time.delayedCall(100, () => this.hero.sprite.clearTint());
        const coinCount = Math.max(1, this.economy.coins || 1);
        for (let i = 0; i < coinCount; i++) {
          const fallCoin = this.add.circle(
            heroX + (i - coinCount / 2) * 8,
            this.hero.sprite.y - 10,
            COIN_SIZE * 0.5, 0x888888
          ).setAlpha(0.6).setDepth(10);
          this.tweens.add({
            targets: fallCoin,
            y: GROUND_Y - COIN_SIZE,
            alpha: 0,
            duration: 300 + i * 60,
            ease: 'Bounce.easeOut',
            onComplete: () => fallCoin.destroy(),
          });
        }
        return;
      }
    }

    // No valid target nearby and 0 coins: red flash
    if (this.economy.coins === 0 && hasNearbyVagrant) {
      this.hero.sprite.setTint(0xff0000);
      this.time.delayedCall(100, () => this.hero.sprite.clearTint());
    }
  }

  /** Convert the nearest idle citizen into a Builder (D-04) */
  private assignCitizenAsBuilder(hutX: number): void {
    if (this.npcManager.citizens.length === 0) return;
    // Find nearest citizen
    let nearest = this.npcManager.citizens[0];
    let minDist = Math.abs(nearest.sprite.x - hutX);
    for (const c of this.npcManager.citizens) {
      const dist = Math.abs(c.sprite.x - hutX);
      if (dist < minDist) {
        minDist = dist;
        nearest = c;
      }
    }
    // Remove from citizens, create builder, add to builders
    const idx = this.npcManager.citizens.indexOf(nearest);
    if (idx >= 0) this.npcManager.citizens.splice(idx, 1);
    const builder = new Builder(this, nearest.sprite.x, this.structureManager);
    builder.sprite.body.setVelocityX(0);
    this.npcManager.builders.push(builder);
    nearest.destroy();
  }

  /** Auto-assign idle citizens near unmanned farms to farmer role (D-04) */
  private checkFarmProximity(): void {
    const farms = this.structureManager.getUnmannedFarms();
    if (farms.length === 0 || this.npcManager.citizens.length === 0) return;

    for (const farm of farms) {
      // Check if any farmer is already assigned to this farm
      const alreadyHasFarmer = this.npcManager.farmers.some(
        f => f instanceof Farmer && (f as Farmer).farm === farm
      );
      if (alreadyHasFarmer) continue;

      // Find a citizen near this farm
      for (let i = this.npcManager.citizens.length - 1; i >= 0; i--) {
        const citizen = this.npcManager.citizens[i];
        if (Math.abs(citizen.sprite.x - farm.x) <= FARMER_WORK_RANGE) {
          // Convert citizen to farmer
          this.npcManager.citizens.splice(i, 1);
          const farmer = new Farmer(this, citizen.sprite.x, farm, this.economy);
          this.npcManager.farmers.push(farmer);
          citizen.destroy();
          break; // one farmer per farm
        }
      }
    }
  }
}
