import { Scene } from "phaser";
import { ResourceNode } from "../resources";
import { MainBase } from "../buildings";

export interface IUnitProps {
  key: string;
  depth?: number;
  scale?: number;
  x: number;
  y: number;
  spritesheet: string;
  idle: {
    start: number;
    end: number;
    frameRate?: number;
  };
}

export enum UnitState {
  IDLE = "idle",
  MOVING_TO_RESOURCE = "moving_to_resource",
  HARVESTING = "harvesting",
  RETURNING_TO_BASE = "returning_to_base",
  MOVING_TO_POSITION = "moving_to_position",
}

export class Unit {
  x: number;
  y: number;
  spritesheet: string;
  scale: number;
  key: string;
  depth: number;
  scene: Phaser.Scene;
  idle: {
    start: number;
    end: number;
    frameRate?: number;
  };
  unit: Phaser.GameObjects.Sprite;
  state: UnitState = UnitState.IDLE;
  targetResource: ResourceNode | null = null;
  carryingResources: number = 0;
  maxCarryCapacity: number = 10;
  mainBase: MainBase | null = null;
  speed: number = 100;
  isSelected: boolean = false;
  selectionCircle: Phaser.GameObjects.Arc | null = null;
  targetPosition: { x: number; y: number } | null = null;
  isHarvester: boolean = false;
  constructor(scene: Phaser.Scene, props: IUnitProps) {
    this.scene = scene;
    this.x = props.x;
    this.scale = props.scale || 1;
    this.depth = props.depth || 0;
    this.idle = props.idle;
    this.y = props.y;
    this.spritesheet = props.spritesheet;
    this.key = props.key;
  }
  preload() {
    this.scene.load.spritesheet(this.key, this.spritesheet, {
      frameWidth: 48,
      frameHeight: 32,
    });
    return this;
  }
  create() {
    this.unit = this.scene.add.sprite(this.x, this.y, this.key);
    this.unit.setDepth(this.depth);
    this.unit.setScale(this.scale);
    this.unit.setInteractive();

    // Create selection circle
    this.selectionCircle = this.scene.add.circle(
      this.unit.x,
      this.unit.y,
      30,
      0x00ff00,
      0
    );
    this.selectionCircle.setStrokeStyle(2, 0x00ff00);
    this.selectionCircle.setDepth(this.depth - 0.1);

    if (this.idle) {
      this.scene.anims.create({
        key: `${this.key}-idle`,
        frames: this.scene.anims.generateFrameNumbers(this.key, {
          start: this.idle.start,
          end: this.idle.end,
        }),
        frameRate: this.idle.frameRate || 10,
        repeat: -1,
      });
    }
    return this;
  }
  commands() {
    const cmmds = {
      idle: () => {
        this.unit.anims.play(`${this.key}-idle`);
        return cmmds;
      },
      shoot: (scene: Scene) => {

      },
    };
    return cmmds;
  }

  setMainBase(base: MainBase) {
    this.mainBase = base;
  }

  setAsHarvester(isHarvester: boolean) {
    this.isHarvester = isHarvester;
  }

  select() {
    this.isSelected = true;
    if (this.selectionCircle) {
      this.selectionCircle.setAlpha(1);
    }
  }

  deselect() {
    this.isSelected = false;
    if (this.selectionCircle) {
      this.selectionCircle.setAlpha(0);
    }
  }

  moveTo(x: number, y: number) {
    this.targetPosition = { x, y };
    this.state = UnitState.MOVING_TO_POSITION;
    // Stop harvesting behavior when manually controlled
    this.targetResource = null;
  }

  findNearestResource(resources: ResourceNode[]): ResourceNode | null {
    let nearest: ResourceNode | null = null;
    let minDistance = Infinity;

    for (const resource of resources) {
      if (!resource.isEmpty()) {
        const distance = Phaser.Math.Distance.Between(
          this.unit.x,
          this.unit.y,
          resource.x,
          resource.y
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = resource;
        }
      }
    }

    return nearest;
  }

  update(resources: ResourceNode[]) {
    if (!this.unit || !this.mainBase) return;

    switch (this.state) {
      case UnitState.IDLE:
        if (this.carryingResources === 0) {
          const nearestResource = this.findNearestResource(resources);
          if (nearestResource) {
            this.targetResource = nearestResource;
            this.state = UnitState.MOVING_TO_RESOURCE;
          }
        }
        break;

      case UnitState.MOVING_TO_RESOURCE:
        if (this.targetResource && !this.targetResource.isEmpty()) {
          const distance = Phaser.Math.Distance.Between(
            this.unit.x,
            this.unit.y,
            this.targetResource.x,
            this.targetResource.y
          );

          if (distance > 40) {
            this.scene.physics.moveTo(
              this.unit,
              this.targetResource.x,
              this.targetResource.y,
              this.speed
            );
            this.updateFlip();
          } else {
            this.unit.setVelocity(0, 0);
            this.state = UnitState.HARVESTING;
          }
        } else {
          this.state = UnitState.IDLE;
          this.targetResource = null;
        }
        break;

      case UnitState.HARVESTING:
        if (this.targetResource && !this.targetResource.isEmpty()) {
          const harvested = this.targetResource.harvest(this.maxCarryCapacity);
          this.carryingResources = harvested;
          this.state = UnitState.RETURNING_TO_BASE;
        } else {
          this.state = UnitState.IDLE;
          this.targetResource = null;
        }
        break;

      case UnitState.RETURNING_TO_BASE:
        const baseDistance = Phaser.Math.Distance.Between(
          this.unit.x,
          this.unit.y,
          this.mainBase.x,
          this.mainBase.y
        );

        if (baseDistance > 120) {
          this.scene.physics.moveTo(
            this.unit,
            this.mainBase.x,
            this.mainBase.y,
            this.speed
          );
          this.updateFlip();
        } else {
          this.unit.setVelocity(0, 0);
          this.mainBase.depositResources(this.carryingResources);
          this.carryingResources = 0;
          this.state = UnitState.IDLE;
        }
        break;
    }
  }

  updateFlip() {
    const body = this.unit.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.x < 0) {
      this.unit.setFlipX(true);
    } else if (body.velocity.x > 0) {
      this.unit.setFlipX(false);
    }
  }
}
