import Phaser from 'phaser';
import {
  HERO_SPEED, HERO_SCALE, HERO_BODY_WIDTH, HERO_BODY_HEIGHT,
  HERO_IDLE_FRAMES_START, HERO_IDLE_FRAMES_END, HERO_IDLE_FPS,
  HERO_WALK_FRAMES_START, HERO_WALK_FRAMES_END, HERO_WALK_FPS,
  SPRITE_HERO
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

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, SPRITE_HERO);
    this.sprite.setScale(HERO_SCALE);
    this.sprite.body!.setSize(HERO_BODY_WIDTH, HERO_BODY_HEIGHT);
    this.sprite.setCollideWorldBounds(true);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

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
  }
}
