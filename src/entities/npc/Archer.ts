import Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import EventBus from '../../events/EventBus';
import { fireArrow } from '../Arrow';
import type { EconomyManager } from '../../systems/EconomyManager';
import {
  COLOR_ARCHER, ARCHER_RANGE, ARCHER_FIRE_RATE,
  ARCHER_HUNT_COIN_INTERVAL, ARCHER_WANDER_DISTANCE,
  ARCHER_RETURN_SPEED, FARMER_WALK_SPEED, NPC_HEIGHT
} from '../../constants';

export enum ArcherState {
  Hunt,
  Returning,
  Defend,
}

export class Archer extends BaseNPC {
  private state: ArcherState = ArcherState.Hunt;
  private towerX: number;
  private arrowPool: Phaser.Physics.Arcade.Group;
  private economy: EconomyManager;
  private zombiePoolGetter: () => Phaser.Physics.Arcade.Group;

  private lastFireTime: number = 0;
  private lastHuntCoinTime: number = 0;
  private wanderTarget: number;

  // EventBus listener references for cleanup
  private onNightWarning: () => void;
  private onNightStart: () => void;
  private onDayStart: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    towerX: number,
    arrowPool: Phaser.Physics.Arcade.Group,
    economy: EconomyManager,
    zombiePoolGetter: () => Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, COLOR_ARCHER);
    this.towerX = towerX;
    this.arrowPool = arrowPool;
    this.economy = economy;
    this.zombiePoolGetter = zombiePoolGetter;
    this.wanderTarget = towerX;

    // Register EventBus listeners for day/night cycle transitions
    this.onNightWarning = () => {
      this.state = ArcherState.Returning;
    };

    this.onNightStart = () => {
      this.state = ArcherState.Defend;
      this.sprite.body.setVelocityX(0);
      this.sprite.setPosition(this.towerX, this.sprite.y);
    };

    this.onDayStart = () => {
      this.state = ArcherState.Hunt;
      this.wanderTarget = this.towerX;
    };

    EventBus.on('night:warning', this.onNightWarning);
    EventBus.on('night:start', this.onNightStart);
    EventBus.on('day:start', this.onDayStart);
  }

  update(time: number, _delta: number): void {
    if (this.destroyed) return;

    switch (this.state) {
      case ArcherState.Hunt:
        this.huntBehavior(time);
        break;
      case ArcherState.Returning:
        if (this.moveToward(this.towerX, ARCHER_RETURN_SPEED)) {
          this.state = ArcherState.Defend;
        }
        break;
      case ArcherState.Defend:
        this.defendBehavior(time);
        break;
    }
  }

  private huntBehavior(time: number): void {
    // Wander near tower
    if (this.moveToward(this.wanderTarget, FARMER_WALK_SPEED)) {
      // Pick new random target within tower +/- ARCHER_WANDER_DISTANCE
      this.wanderTarget = this.towerX +
        Phaser.Math.Between(-ARCHER_WANDER_DISTANCE, ARCHER_WANDER_DISTANCE);
    }

    // Generate coin periodically
    if (time - this.lastHuntCoinTime >= ARCHER_HUNT_COIN_INTERVAL) {
      this.economy.addCoins(1, 'archer-hunt');
      this.lastHuntCoinTime = time;
    }
  }

  private defendBehavior(time: number): void {
    // Stay at tower position (no movement)
    this.sprite.body.setVelocityX(0);

    // Scan for nearest active zombie within range
    const zombiePool = this.zombiePoolGetter();
    const children = zombiePool.getChildren();
    let nearestZombie: Phaser.Physics.Arcade.Sprite | null = null;
    let nearestDist = Infinity;

    for (const child of children) {
      const zombie = child as Phaser.Physics.Arcade.Sprite;
      if (!zombie.active) continue;

      const dist = Math.abs(zombie.x - this.towerX);
      if (dist <= ARCHER_RANGE && dist < nearestDist) {
        nearestDist = dist;
        nearestZombie = zombie;
      }
    }

    // Fire arrow at nearest zombie if cooldown elapsed
    if (nearestZombie && time - this.lastFireTime >= ARCHER_FIRE_RATE) {
      fireArrow(
        this.arrowPool,
        this.sprite.x,
        this.sprite.y - NPC_HEIGHT / 2,
        nearestZombie.x,
        nearestZombie.y,
        this.scene
      );
      this.lastFireTime = time;
    }
  }

  destroy(): void {
    EventBus.off('night:warning', this.onNightWarning);
    EventBus.off('night:start', this.onNightStart);
    EventBus.off('day:start', this.onDayStart);
    super.destroy();
  }
}
