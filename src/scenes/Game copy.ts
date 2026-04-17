import { Scene } from "phaser";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  player: Phaser.GameObjects.Sprite;
  soldier: Phaser.GameObjects.Sprite;
  worker: Phaser.GameObjects.Sprite;
  soldier2: Phaser.GameObjects.Sprite;
  constructor() {
    super("Game");
  }
  preload() {
    this.load.spritesheet("miniWorker", "/assets/Outline/MiniWorker.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("solider2", "/assets/players blue x1.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet(
      "soldier",
      "/assets/Characters(100x100)/Soldier/Soldier/Soldier-Idle.png",
      {
        frameWidth: 100,
        frameHeight: 100,
      }
    );
    this.load.spritesheet(
      "soldier-idle",
      "/assets/Characters(100x100)/Soldier/Soldier/Soldier-Idle.png",
      {
        frameWidth: 100,
        frameHeight: 100,
      }
    );
    this.load.spritesheet(
      "soldier-walk",
      "/assets/Characters(100x100)/Soldier/Soldier/Soldier-Walk.png",
      {
        frameWidth: 100,
        frameHeight: 100,
      }
    );
    this.load.spritesheet(
      "soldier-attack-1",
      "/assets/Characters(100x100)/Soldier/Soldier/Soldier-Attack01.png",
      {
        frameWidth: 100,
        frameHeight: 100,
      }
    );
    this.load.spritesheet(
      "soldier-attack-2",
      "/assets/Characters(100x100)/Soldier/Soldier/Soldier-Attack02.png",
      {
        frameWidth: 100,
        frameHeight: 100,
      }
    );
    this.load.spritesheet(
      "soldier-attack-3",
      "/assets/Characters(100x100)/Soldier/Soldier/Soldier-Attack03.png",
      {
        frameWidth: 100,
        frameHeight: 100,
      }
    );
  }

  create() {
    this.camera = this.cameras.main;
    this.worker = this.add.sprite(80, 500, "miniWorker");
    this.worker.setScale(2);

    this.anims.create({
      key: "soldier2-idle",
      frames: this.anims.generateFrameNumbers("solider2", {
        start: 3,
        end: 7,
      }),
      frameRate: 3,
      repeat: -1,
    });


    this.anims.create({
      key: "miniWorker-idle",
      frames: this.anims.generateFrameNumbers("miniWorker", {
        start: 0,
        end: 3,
      }),
      frameRate: 3,
      repeat: -1,
    });

      this.soldier = this.add.sprite(100, 500, "soldier");
    this.soldier2 = this.add.sprite(300, 500, "soldier2");
    this.soldier.setScale(2);
    this.anims.create({
      key: "soldier-idle",
      frames: this.anims.generateFrameNumbers("soldier-idle", {
        start: 4,
        end: 6,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("soldier-walk", {
        start: 0,
        end: 7,
      }),
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "attack1",
      frames: this.anims.generateFrameNumbers("soldier-attack-1", {
        start: 0,
        end: 5, 
      }),
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "attack2",
      frames: this.anims.generateFrameNumbers("soldier-attack-2", {
        start: 0,
        end: 5,
      }),
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "attack3",
      frames: this.anims.generateFrameNumbers("soldier-attack-3", {
        start: 0,
        end: 7,
      }),
      frameRate: 7,
      repeat: -1,
    });
    this.soldier.anims.play("walk", true);
    this.worker.anims.play("miniWorker-idle", true);
    this.soldier2.anims.play("soldier2-idle", true);
  }
}
