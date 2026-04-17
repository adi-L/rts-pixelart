import { Scene } from "phaser";

export interface IResourceNodeProps {
  key: string;
  x: number;
  y: number;
  amount: number;
}

export class ResourceNode {
  x: number;
  y: number;
  amount: number;
  key: string;
  scene: Phaser.Scene;
  node: Phaser.GameObjects.Container;
  amountText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, props: IResourceNodeProps) {
    this.scene = scene;
    this.x = props.x;
    this.y = props.y;
    this.amount = props.amount;
    this.key = props.key;
  }

  create() {
    this.node = this.scene.add.container(this.x, this.y);

    // Create resource visual (crystal/mineral look)
    const crystal = this.scene.add.circle(0, 0, 25, 0x00ffff);
    crystal.setStrokeStyle(3, 0x0088aa);

    // Add amount text
    this.amountText = this.scene.add.text(0, 0, this.amount.toString(), {
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    this.amountText.setOrigin(0.5);

    this.node.add([crystal, this.amountText]);
    this.node.setDepth(1);

    return this;
  }

  harvest(amount: number = 10): number {
    const harvested = Math.min(amount, this.amount);
    this.amount -= harvested;

    if (this.amountText) {
      this.amountText.setText(this.amount.toString());
    }

    if (this.amount <= 0) {
      this.destroy();
    }

    return harvested;
  }

  destroy() {
    if (this.node) {
      this.node.destroy();
    }
  }

  isEmpty(): boolean {
    return this.amount <= 0;
  }
}
