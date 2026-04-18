import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import { Vagrant } from '../entities/npc/Vagrant';
import { Citizen } from '../entities/npc/Citizen';
import { BaseNPC } from '../entities/npc/BaseNPC';
import {
  VAGRANT_INITIAL_COUNT, VAGRANT_RESPAWN_INTERVAL,
  VAGRANT_RECRUIT_RADIUS, WORLD_WIDTH,
} from '../constants';
import type { EconomyManager } from './EconomyManager';
import type { StructureManager } from './StructureManager';

export class NPCManager {
  private scene: Phaser.Scene;
  private economy: EconomyManager;
  // Stored for role assignment in Plan 05
  public structures: StructureManager;

  public vagrants: Vagrant[] = [];
  public citizens: Citizen[] = [];
  public builders: BaseNPC[] = []; // Will be Builder instances from Plan 05
  public farmers: BaseNPC[] = [];  // Will be Farmer instances from Plan 05
  public archers: BaseNPC[] = [];  // Will be Archer instances from Plan 03-03

  private respawnTimer: Phaser.Time.TimerEvent | null = null;
  private onArrivedAtBase: (data: { vagrant: Vagrant }) => void;

  private readonly baseX: number = 3000;

  constructor(
    scene: Phaser.Scene,
    economy: EconomyManager,
    structures: StructureManager
  ) {
    this.scene = scene;
    this.economy = economy;
    this.structures = structures;

    // Spawn initial vagrants (D-02)
    this.spawnInitialVagrants();

    // Vagrant respawn timer (D-02: ~60s)
    this.respawnTimer = scene.time.addEvent({
      delay: VAGRANT_RESPAWN_INTERVAL,
      callback: () => this.spawnVagrantAtEdge(),
      loop: true,
    });

    // Listen for vagrant arrival at base
    this.onArrivedAtBase = (data) => {
      this.convertVagrantToCitizen(data.vagrant);
    };
    EventBus.on('npc:arrived-at-base', this.onArrivedAtBase);
  }

  private spawnInitialVagrants(): void {
    // Scatter 4 vagrants across the map, biased toward edges per D-02
    const positions = [
      Phaser.Math.Between(400, 800),    // left edge area
      Phaser.Math.Between(500, 1000),   // left-center
      Phaser.Math.Between(5000, 5600),  // right-center
      Phaser.Math.Between(5200, 5800),  // right edge area
    ];
    for (let i = 0; i < VAGRANT_INITIAL_COUNT && i < positions.length; i++) {
      const vagrant = new Vagrant(this.scene, positions[i], this.baseX);
      this.vagrants.push(vagrant);
    }
  }

  private spawnVagrantAtEdge(): void {
    // Spawn at a random map edge
    const side = Phaser.Math.Between(0, 1);
    const x = side === 0
      ? Phaser.Math.Between(200, 600)
      : Phaser.Math.Between(WORLD_WIDTH - 600, WORLD_WIDTH - 200);
    const vagrant = new Vagrant(this.scene, x, this.baseX);
    this.vagrants.push(vagrant);
  }

  /** Try to recruit the nearest vagrant to heroX. Returns true if successful. */
  tryRecruitNearby(heroX: number): boolean {
    let nearest: Vagrant | null = null;
    let minDist = Infinity;
    for (const v of this.vagrants) {
      const dist = Math.abs(v.sprite.x - heroX);
      if (dist <= VAGRANT_RECRUIT_RADIUS && dist < minDist) {
        minDist = dist;
        nearest = v;
      }
    }
    if (!nearest) return false;
    if (!this.economy.spendCoins(1)) return false;
    nearest.recruit();
    return true;
  }

  private convertVagrantToCitizen(vagrant: Vagrant): void {
    // Remove from vagrants list
    const idx = this.vagrants.indexOf(vagrant);
    if (idx >= 0) this.vagrants.splice(idx, 1);
    // Create citizen at vagrant's position
    const citizen = new Citizen(this.scene, vagrant.sprite.x);
    this.citizens.push(citizen);
    // Destroy vagrant
    vagrant.destroy();
  }

  update(time: number, delta: number): void {
    // Update all NPCs
    for (const v of this.vagrants) v.update(time, delta);
    for (const c of this.citizens) c.update(time, delta);
    for (const b of this.builders) b.update(time, delta);
    for (const f of this.farmers) f.update(time, delta);
    for (const a of this.archers) a.update(time, delta);
  }

  /** Get all NPC sprites for physics overlap registration */
  getAllNPCSprites(): (Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body })[] {
    const all: BaseNPC[] = [...this.vagrants, ...this.citizens, ...this.builders, ...this.farmers, ...this.archers];
    return all.map(npc => npc.sprite);
  }

  destroy(): void {
    EventBus.off('npc:arrived-at-base', this.onArrivedAtBase);
    if (this.respawnTimer) this.respawnTimer.destroy();
    this.vagrants.forEach(v => v.destroy());
    this.vagrants.length = 0;
    this.citizens.forEach(c => c.destroy());
    this.citizens.length = 0;
    this.builders.forEach(b => b.destroy());
    this.builders.length = 0;
    this.farmers.forEach(f => f.destroy());
    this.farmers.length = 0;
    this.archers.forEach(a => a.destroy());
    this.archers.length = 0;
  }
}
