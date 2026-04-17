import { Scene } from "phaser";
import { Unit } from "../engine/units";
import { MainBase } from "../engine/buildings";
import { ResourceNode } from "../engine/resources";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.TileSprite;
  msg_text: Phaser.GameObjects.Text;
  player: Phaser.GameObjects.Sprite;
  gunner: Phaser.GameObjects.Sprite;
  gun: Phaser.GameObjects.Sprite;
  gunnerMale: Phaser.GameObjects.Sprite;
  lucy: Phaser.GameObjects.Sprite;
  units: Unit[] = [];
  harvesters: Unit[] = [];
  mainBase: MainBase;
  resources: ResourceNode[] = [];
  resourceText: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
    this.units = [];
    this.harvesters = [];

    // Lizzy - The Leader
    const lizzy = new Unit(this, {
      key: "gunner-lizzy",
      depth: 2,
      scale: 2,
      x: 290,
      y: 400,
      spritesheet: "/assets/gunner/lizzy.png",
      idle: {
        start: 0,
        end: 6,
        frameRate: 5,
      },
    });

    this.units.push(lizzy);

    // Create 5 gunner harvesters
    for (let i = 0; i < 5; i++) {
      const harvester = new Unit(this, {
        key: `harvester-${i}`,
        depth: 3,
        scale: 2,
        x: 200 + i * 40,
        y: 400,
        spritesheet: "/assets/gunner/Tiny Gunslinger 48x32.png",
        idle: {
          start: 0,
          end: 5,
          frameRate: 5,
        },
      });
      this.harvesters.push(harvester);
    }
  }

  preload() {
    this.load.image("background", "/assets/background.png");
    this.units.forEach((unit) => {
      unit.preload();
    });
    this.harvesters.forEach((harvester) => {
      harvester.preload();
    });
  }

  create() {
    this.camera = this.cameras.main;

    // Set up background
    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "background")
      .setOrigin(0, 0);

    // Create main base
    this.mainBase = new MainBase(this, 200, 300);
    this.mainBase.create();

    // Create resource nodes scattered around the map
    this.resources.push(
      new ResourceNode(this, {
        key: "resource-1",
        x: 600,
        y: 200,
        amount: 100,
      }).create()
    );

    this.resources.push(
      new ResourceNode(this, {
        key: "resource-2",
        x: 800,
        y: 400,
        amount: 100,
      }).create()
    );

    this.resources.push(
      new ResourceNode(this, {
        key: "resource-3",
        x: 500,
        y: 550,
        amount: 100,
      }).create()
    );

    this.resources.push(
      new ResourceNode(this, {
        key: "resource-4",
        x: 900,
        y: 150,
        amount: 100,
      }).create()
    );

    // Create all units
    this.units.forEach((unit) => {
      unit.create();
      unit.commands().idle();
    });

    // Enable physics for harvesters
    this.harvesters.forEach((harvester) => {
      harvester.create();
      harvester.commands().idle();
      this.physics.add.existing(harvester.unit);
      harvester.setMainBase(this.mainBase);
    });

    // Add UI for resource display
    this.resourceText = this.add.text(20, 20, "Resources: 0", {
      fontSize: "24px",
      color: "#00ffff",
      fontStyle: "bold",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    });
    this.resourceText.setDepth(100);

    // Add bottom UI panel
    this.add
      .rectangle(0, this.scale.height - 100, this.scale.width, 168, 0x000000)
      .setOrigin(0, 0)
      .setDepth(1);
  }

  update() {
    // Update all harvesters
    this.harvesters.forEach((harvester) => {
      harvester.update(this.resources);
    });

    // Update resource display
    if (this.mainBase && this.resourceText) {
      this.resourceText.setText(`Resources: ${this.mainBase.getResources()}`);
    }
  }
}
