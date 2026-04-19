import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import { BuildPoint, BuildPointState } from '../entities/BuildPoint';
import { MainBase } from '../entities/structures/MainBase';
import { Wall } from '../entities/structures/Wall';
import { Tower } from '../entities/structures/Tower';
import { Farm } from '../entities/structures/Farm';
import { BuilderHut } from '../entities/structures/BuilderHut';
import { BaseStructure } from '../entities/structures/BaseStructure';
import { Armory } from '../entities/structures/Armory';
import {
  BUILD_POINT_LAYOUT, BUILD_POINT_DETECT_RADIUS,
  BASE_UPGRADE_COST_1, BASE_UPGRADE_COST_2, BASE_UPGRADE_COST_3,
  HERO_START_X,
} from '../constants';
import type { BuildPointType } from '../constants';

export class StructureManager {
  private scene: Phaser.Scene;
  public buildPoints: BuildPoint[] = [];
  public mainBase: MainBase;
  public structures: BaseStructure[] = [];

  // Event listener references for cleanup
  private onCoinDeposited: (data: { buildPointId: string; total: number; type: BuildPointType }) => void;
  private onBaseUpgraded: (data: { tier: number }) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create main base at world center
    this.mainBase = new MainBase(scene, HERO_START_X);

    // Create build points from layout
    for (const config of BUILD_POINT_LAYOUT) {
      const bp = new BuildPoint(scene, config);
      this.buildPoints.push(bp);
      if (config.type === 'base') {
        // base build point reference stored on bp.structureRef
        bp.state = BuildPointState.Empty; // base build point is always available
        bp.structureRef = this.mainBase;
      }
    }

    // Listen for coin deposits to check funding
    this.onCoinDeposited = (data) => {
      const bp = this.buildPoints.find(b => b.id === data.buildPointId);
      if (!bp) return;

      if (bp.type === 'base') {
        this.handleBaseUpgrade(bp);
      } else if (bp.state === BuildPointState.Empty && bp.coinsDeposited >= bp.cost) {
        bp.state = BuildPointState.Funded;
        EventBus.emit('structure:funded', { buildPointId: bp.id, type: bp.type, x: bp.x });
      } else if (bp.state === BuildPointState.Upgradeable && bp.structureRef instanceof Wall) {
        if (bp.coinsDeposited >= bp.cost) {
          bp.state = BuildPointState.Funded;
          EventBus.emit('structure:funded', { buildPointId: bp.id, type: bp.type, x: bp.x });
        }
      }
    };
    EventBus.on('coin:deposited', this.onCoinDeposited);

    // Listen for base upgrades to unlock build points
    this.onBaseUpgraded = (data) => {
      for (const bp of this.buildPoints) {
        bp.checkUnlock(data.tier);
      }
    };
    EventBus.on('base:upgraded', this.onBaseUpgraded);
  }

  private handleBaseUpgrade(bp: BuildPoint): void {
    const tier = this.mainBase.currentTier;
    let cost: number;
    switch (tier) {
      case 1: cost = BASE_UPGRADE_COST_1; break;
      case 2: cost = BASE_UPGRADE_COST_2; break;
      case 3: cost = BASE_UPGRADE_COST_3; break;
      default: return; // max tier
    }
    if (bp.coinsDeposited >= cost) {
      bp.coinsDeposited -= cost; // consume the cost, keep remainder
      this.mainBase.upgrade();
    }
  }

  /** Called by builder when construction completes at a build point */
  completeConstruction(buildPointId: string): void {
    const bp = this.buildPoints.find(b => b.id === buildPointId);
    if (!bp) return;

    let structure: BaseStructure;
    switch (bp.type) {
      case 'wall':
        if (bp.structureRef instanceof Wall && !bp.structureRef.isMaxTier) {
          // Upgrade existing wall
          bp.structureRef.upgradeToStone();
          bp.state = BuildPointState.Complete;
          bp.hideMarker();
          return;
        }
        structure = new Wall(this.scene, bp.x, bp.id);
        break;
      case 'tower':
        structure = new Tower(this.scene, bp.x, bp.id);
        break;
      case 'farm':
        structure = new Farm(this.scene, bp.x, bp.id);
        break;
      case 'hut':
        structure = new BuilderHut(this.scene, bp.x, bp.id);
        break;
      case 'armory':
        structure = new Armory(this.scene, bp.x, bp.id);
        break;
      default:
        return;
    }

    bp.structureRef = structure;
    bp.state = BuildPointState.Complete;
    bp.hideMarker();
    bp.coinsDeposited = 0; // reset for upgrade tracking
    this.structures.push(structure);
    EventBus.emit('structure:built', { buildPointId: bp.id, type: bp.type, x: bp.x });

    // Walls can be upgraded -- mark as upgradeable
    if (bp.type === 'wall' && structure instanceof Wall && !structure.isMaxTier) {
      bp.state = BuildPointState.Upgradeable;
      bp.showMarker();
    }
  }

  /** Find the nearest funded build point for a builder */
  getBuilderTarget(builderX: number): BuildPoint | null {
    let nearest: BuildPoint | null = null;
    let minDist = Infinity;
    for (const bp of this.buildPoints) {
      if (bp.state !== BuildPointState.Funded) continue;
      const dist = Math.abs(bp.x - builderX);
      if (dist < minDist) {
        minDist = dist;
        nearest = bp;
      }
    }
    return nearest;
  }

  /** Update hero proximity for all build points */
  updateProximity(heroX: number): void {
    for (const bp of this.buildPoints) {
      bp.setNearby(Math.abs(heroX - bp.x) <= BUILD_POINT_DETECT_RADIUS);
    }
  }

  /** Get the builder hut structure (for builder idle wander point) */
  getBuilderHut(): BuilderHut | null {
    return this.structures.find(s => s instanceof BuilderHut) as BuilderHut | null;
  }

  /** Get farms that have no assigned farmer */
  getUnmannedFarms(): Farm[] {
    return this.structures.filter(s => s instanceof Farm) as Farm[];
  }

  destroy(): void {
    EventBus.off('coin:deposited', this.onCoinDeposited);
    EventBus.off('base:upgraded', this.onBaseUpgraded);
    this.buildPoints.forEach(bp => bp.destroy());
    this.buildPoints.length = 0;
    this.structures.forEach(s => s.destroy());
    this.structures.length = 0;
    this.mainBase.destroy();
  }
}
