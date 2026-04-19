import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import { fireBullet } from './Bullet';
import {
  HERO_SPEED, HERO_SCALE, HERO_BODY_WIDTH, HERO_BODY_HEIGHT,
  HERO_IDLE_FRAMES_START, HERO_IDLE_FRAMES_END, HERO_IDLE_FPS,
  HERO_WALK_FRAMES_START, HERO_WALK_FRAMES_END, HERO_WALK_FPS,
  SPRITE_HERO, SPRITE_HERO_FRAME_WIDTH, SPRITE_HERO_FRAME_HEIGHT,
  HERO_HP, HERO_INVINCIBILITY_MS, HERO_FIRE_RATE,
  AMMO_CLIP_SIZE, GUN_SPRITE_WIDTH, GUN_SPRITE_HEIGHT, GUN_COLOR
} from '../constants';

export class Hero {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
  };
  private scene: Phaser.Scene;

  // Combat properties
  private gunSprite: Phaser.GameObjects.Rectangle;
  private hp: number = HERO_HP;
  private maxHp: number = HERO_HP;
  private ammo: number = 0;
  private lastFireTime: number = 0;
  private lastDamageTime: number = 0;
  private hasGun: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, SPRITE_HERO);
    this.sprite.setScale(HERO_SCALE);
    this.sprite.body!.setSize(HERO_BODY_WIDTH, HERO_BODY_HEIGHT);
    // Center body on the scaled sprite (48x32 * scale 2 = 96x64 visual)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setOffset(
      (SPRITE_HERO_FRAME_WIDTH - HERO_BODY_WIDTH) / 2,
      (SPRITE_HERO_FRAME_HEIGHT - HERO_BODY_HEIGHT) / 2
    );
    this.sprite.setCollideWorldBounds(true);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Gun sprite -- standalone Rectangle, NOT a Container child
    // Hidden until hero gets weapon from armory
    this.gunSprite = scene.add.rectangle(x, y, GUN_SPRITE_WIDTH, GUN_SPRITE_HEIGHT, GUN_COLOR)
      .setDepth(4)
      .setOrigin(0, 0.5)
      .setVisible(false);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D'
    }) as {
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
    };
  }

  createAnimations(): void {
    this.scene.anims.create({
      key: 'hero-idle',
      frames: this.scene.anims.generateFrameNumbers(SPRITE_HERO, {
        start: HERO_IDLE_FRAMES_START,
        end: HERO_IDLE_FRAMES_END
      }),
      frameRate: HERO_IDLE_FPS,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'hero-walk',
      frames: this.scene.anims.generateFrameNumbers(SPRITE_HERO, {
        start: HERO_WALK_FRAMES_START,
        end: HERO_WALK_FRAMES_END
      }),
      frameRate: HERO_WALK_FPS,
      repeat: -1
    });
  }

  update(): void {
    const leftDown = this.cursors.left.isDown || this.wasd.left.isDown;
    const rightDown = this.cursors.right.isDown || this.wasd.right.isDown;

    if (leftDown) {
      this.sprite.setVelocityX(-HERO_SPEED);
      this.sprite.setFlipX(true);
      this.sprite.play('hero-walk', true);
    } else if (rightDown) {
      this.sprite.setVelocityX(HERO_SPEED);
      this.sprite.setFlipX(false);
      this.sprite.play('hero-walk', true);
    } else {
      this.sprite.setVelocityX(0);
      this.sprite.play('hero-idle', true);
    }

    // Gun aim tracking (only when hero has a weapon)
    if (this.hasGun) {
      const pointer = this.scene.input.activePointer;
      pointer.updateWorldPoint(this.scene.cameras.main);
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        pointer.worldX, pointer.worldY
      );
      this.gunSprite.setPosition(this.sprite.x, this.sprite.y);
      this.gunSprite.setRotation(angle);

      // Flip gun when aiming left to prevent visual inversion
      // Rectangle doesn't have setFlipY, so use negative scaleY
      if (Math.abs(angle) > Math.PI / 2) {
        this.gunSprite.setScale(1, -1);
      } else {
        this.gunSprite.setScale(1, 1);
      }
    }
  }

  /** Fire a bullet from the hero toward the mouse cursor */
  shoot(bulletPool: Phaser.Physics.Arcade.Group, time: number): void {
    if (!this.hasGun || this.ammo <= 0 || time - this.lastFireTime < HERO_FIRE_RATE) return;
    const pointer = this.scene.input.activePointer;
    pointer.updateWorldPoint(this.scene.cameras.main);
    fireBullet(bulletPool, this.sprite.x, this.sprite.y, pointer.worldX, pointer.worldY, this.scene);
    this.ammo--;
    this.lastFireTime = time;
    EventBus.emit('hero:ammo-changed', { ammo: this.ammo, maxAmmo: AMMO_CLIP_SIZE });
  }

  /** Apply damage to the hero with invincibility frames */
  takeDamage(amount: number): void {
    const now = this.scene.time.now;
    if (now - this.lastDamageTime < HERO_INVINCIBILITY_MS) return;
    this.lastDamageTime = now;
    this.hp = Math.max(0, this.hp - amount);
    EventBus.emit('hero:hp-changed', { hp: this.hp, maxHp: this.maxHp });

    // Red flash feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });

    // Blink during invincibility frames
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      repeat: 4,
    });

    if (this.hp <= 0) {
      EventBus.emit('hero:died');
    }
  }

  /** Grant the hero a gun (called when armory is built or hero visits armory) */
  grantGun(): void {
    this.hasGun = true;
    this.gunSprite.setVisible(true);
    this.ammo = AMMO_CLIP_SIZE;
    EventBus.emit('hero:ammo-changed', { ammo: this.ammo, maxAmmo: AMMO_CLIP_SIZE });
  }

  /** Restock ammo to full clip */
  restockAmmo(): void {
    this.ammo = AMMO_CLIP_SIZE;
    EventBus.emit('hero:ammo-changed', { ammo: this.ammo, maxAmmo: AMMO_CLIP_SIZE });
  }

  // Public getters for Game.ts to check hero state
  get currentHp(): number { return this.hp; }
  get currentAmmo(): number { return this.ammo; }
  get isAlive(): boolean { return this.hp > 0; }
  get armed(): boolean { return this.hasGun; }

  /** Clean up gun sprite */
  destroy(): void {
    this.gunSprite.destroy();
  }
}
