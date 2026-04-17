import { Scene } from "phaser";

export interface IBuildingProps {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  depth?: number;
}

export class Building {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  key: string;
  depth: number;
  scene: Phaser.Scene;
  building: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, props: IBuildingProps) {
    this.scene = scene;
    this.x = props.x;
    this.y = props.y;
    this.width = props.width;
    this.height = props.height;
    this.color = props.color;
    this.key = props.key;
    this.depth = props.depth || 1;
  }

  create() {
    this.building = this.scene.add.rectangle(
      this.x,
      this.y,
      this.width,
      this.height,
      this.color
    );
    this.building.setDepth(this.depth);
    this.building.setStrokeStyle(4, 0x333333);
    return this;
  }
}

export class MainBase extends Building {
  resources: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, {
      key: "main-base",
      x,
      y,
      width: 200,
      height: 150,
      color: 0x4a4a4a,
      depth: 1,
    });
  }

  create() {
    super.create();

    // Add a label to the base
    const label = this.scene.add.text(this.x, this.y - 90, "MAIN BASE", {
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    label.setOrigin(0.5);
    label.setDepth(this.depth + 1);

    return this;
  }

  depositResources(amount: number) {
    this.resources += amount;
  }

  getResources(): number {
    return this.resources;
  }
}
