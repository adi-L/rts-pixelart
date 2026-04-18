import Phaser from 'phaser';
import EventBus from '../events/EventBus';
import { ZombieState } from '../entities/npc/Zombie';
import type { StructureManager } from './StructureManager';
import type { NPCManager } from './NPCManager';
import type { BaseStructure } from '../entities/structures/BaseStructure';
import {
  ZOMBIE_SPEED, ZOMBIE_HP, ZOMBIE_DAMAGE, ZOMBIE_ATTACK_INTERVAL,
  ZOMBIE_BASE_COUNT, ZOMBIE_GROWTH_PER_NIGHT, ZOMBIE_POOL_SIZE,
  ZOMBIE_SPAWN_MARGIN, ZOMBIE_CONTACT_DISTANCE, WORLD_WIDTH,
  NPC_WIDTH, NPC_HEIGHT, GROUND_Y, SPRITE_ZOMBIE, NIGHT_DURATION
} from '../constants';

export class WaveManager {
  private scene: Phaser.Scene;
  private structureManager: StructureManager;
  private npcManager: NPCManager;
  private zombiePool: Phaser.Physics.Arcade.Group;
  private activeZombies: Phaser.Physics.Arcade.Sprite[] = [];
  private currentNight: number = 0;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;

  // Bound listener references for cleanup
  private onNightStart: () => void;
  private onNightEnd: () => void;

  constructor(
    scene: Phaser.Scene,
    structureManager: StructureManager,
    npcManager: NPCManager
  ) {
    this.scene = scene;
    this.structureManager = structureManager;
    this.npcManager = npcManager;

    // Create zombie object pool -- pre-allocate all sprites inactive
    this.zombiePool = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: ZOMBIE_POOL_SIZE,
      runChildUpdate: false,
      allowGravity: false,
    });
    this.zombiePool.createMultiple({
      key: SPRITE_ZOMBIE,
      quantity: ZOMBIE_POOL_SIZE,
      active: false,
      visible: false,
    });

    // Register EventBus listeners
    this.onNightStart = () => this.startWave();
    this.onNightEnd = () => this.killAllZombies();
    EventBus.on('night:start', this.onNightStart);
    EventBus.on('night:end', this.onNightEnd);
  }

  /** Expose pool so Game.ts can register arrow-zombie physics overlap */
  get pool(): Phaser.Physics.Arcade.Group {
    return this.zombiePool;
  }

  // ---------------------------------------------------------------------------
  // Wave spawning
  // ---------------------------------------------------------------------------

  private startWave(): void {
    this.currentNight++;
    const totalZombies = ZOMBIE_BASE_COUNT + (this.currentNight - 1) * ZOMBIE_GROWTH_PER_NIGHT;

    // Spread spawns over 80% of night duration
    const interval = (NIGHT_DURATION * 0.8) / totalZombies;

    let spawned = 0;
    this.spawnTimer = this.scene.time.addEvent({
      delay: interval,
      repeat: totalZombies - 1,
      callback: () => {
        // Alternate spawn side: even from left edge, odd from right edge
        const x = spawned % 2 === 0
          ? ZOMBIE_SPAWN_MARGIN
          : WORLD_WIDTH - ZOMBIE_SPAWN_MARGIN;
        this.spawnZombie(x);
        spawned++;
      },
    });
  }

  private spawnZombie(x: number): void {
    const zombie = this.zombiePool.get(
      x, GROUND_Y - NPC_HEIGHT / 2, SPRITE_ZOMBIE
    ) as Phaser.Physics.Arcade.Sprite | null;

    if (!zombie) {
      console.warn('Zombie pool exhausted');
      return;
    }

    zombie.setActive(true).setVisible(true).setDepth(3);

    // Enable physics body
    this.scene.physics.world.enable(zombie);
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);

    // Set display size to match NPC dimensions
    zombie.setDisplaySize(NPC_WIDTH, NPC_HEIGHT);

    // Initialize per-zombie data
    zombie.setData('state', ZombieState.March);
    zombie.setData('hp', ZOMBIE_HP);
    zombie.setData('lastAttack', 0);

    // March toward center -- left-side zombies go right, right-side go left
    const velocity = x < WORLD_WIDTH / 2 ? ZOMBIE_SPEED : -ZOMBIE_SPEED;
    body.setVelocityX(velocity);

    this.activeZombies.push(zombie);
  }

  // ---------------------------------------------------------------------------
  // Per-frame update -- zombie AI
  // ---------------------------------------------------------------------------

  update(time: number, _delta: number): void {
    // Iterate backwards for safe removal
    for (let i = this.activeZombies.length - 1; i >= 0; i--) {
      const zombie = this.activeZombies[i];
      if (!zombie.active) {
        this.activeZombies.splice(i, 1);
        continue;
      }

      const state = zombie.getData('state') as ZombieState;
      if (state === ZombieState.Dying) continue;

      // --- Zombie-NPC contact kills (NPCs are killed in passing) ---
      this.checkNPCContact(zombie);

      // --- Zombie-Structure interaction ---
      const nearest = this.findNearestStructure(zombie.x);

      if (state === ZombieState.Attack) {
        // If attacking, check if target structure is still alive
        if (!nearest || Math.abs(zombie.x - nearest.x) > ZOMBIE_CONTACT_DISTANCE || nearest.isDestroyed) {
          // Structure gone or moved away -- resume marching
          zombie.setData('state', ZombieState.March);
          this.setMarchVelocity(zombie, nearest);
        } else {
          // Continue attacking on cooldown
          const body = zombie.body as Phaser.Physics.Arcade.Body;
          body.setVelocityX(0);
          const last = zombie.getData('lastAttack') as number || 0;
          if (time - last >= ZOMBIE_ATTACK_INTERVAL) {
            zombie.setData('lastAttack', time);
            nearest.takeDamage(ZOMBIE_DAMAGE);
          }
          // If structure just got destroyed, switch back to march
          if (nearest.isDestroyed) {
            zombie.setData('state', ZombieState.March);
            this.setMarchVelocity(zombie, this.findNearestStructure(zombie.x));
          }
        }
      } else {
        // ZombieState.March
        if (nearest && !nearest.isDestroyed && Math.abs(zombie.x - nearest.x) < ZOMBIE_CONTACT_DISTANCE) {
          // Arrived at structure -- start attacking
          const body = zombie.body as Phaser.Physics.Arcade.Body;
          body.setVelocityX(0);
          zombie.setData('state', ZombieState.Attack);
          zombie.setData('lastAttack', time);
          nearest.takeDamage(ZOMBIE_DAMAGE);
        } else {
          // Keep marching toward nearest structure
          this.setMarchVelocity(zombie, nearest);
        }
      }
    }
  }

  /** Set zombie velocity toward nearest structure, or toward world center if none */
  private setMarchVelocity(
    zombie: Phaser.Physics.Arcade.Sprite,
    nearest: BaseStructure | null
  ): void {
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    if (nearest && !nearest.isDestroyed) {
      const dx = nearest.x - zombie.x;
      body.setVelocityX(dx > 0 ? ZOMBIE_SPEED : -ZOMBIE_SPEED);
    } else {
      // No structures remain -- march toward world center
      const dx = WORLD_WIDTH / 2 - zombie.x;
      body.setVelocityX(dx > 0 ? ZOMBIE_SPEED : -ZOMBIE_SPEED);
    }
  }

  /** Check if zombie contacts any NPC and kill them */
  private checkNPCContact(zombie: Phaser.Physics.Arcade.Sprite): void {
    const arrays = [
      this.npcManager.vagrants,
      this.npcManager.citizens,
      this.npcManager.builders,
      this.npcManager.farmers,
    ];
    for (const arr of arrays) {
      for (let j = arr.length - 1; j >= 0; j--) {
        const npc = arr[j];
        if (
          Math.abs(zombie.x - npc.sprite.x) < ZOMBIE_CONTACT_DISTANCE &&
          Math.abs(zombie.y - npc.sprite.y) < NPC_HEIGHT
        ) {
          arr.splice(j, 1);
          npc.destroy();
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Structure finding
  // ---------------------------------------------------------------------------

  private findNearestStructure(x: number): BaseStructure | null {
    let nearest: BaseStructure | null = null;
    let minDist = Infinity;

    // Check all structures + main base
    const candidates: BaseStructure[] = [
      ...this.structureManager.structures,
      this.structureManager.mainBase,
    ];

    for (const s of candidates) {
      if (s.isDestroyed) continue;
      const dist = Math.abs(s.x - x);
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    }

    return nearest;
  }

  // ---------------------------------------------------------------------------
  // Damage / kill
  // ---------------------------------------------------------------------------

  /** Called from arrow-zombie overlap in Game.ts */
  damageZombie(zombie: Phaser.Physics.Arcade.Sprite, damage: number): void {
    const hp = (zombie.getData('hp') as number) - damage;
    zombie.setData('hp', hp);
    if (hp <= 0) {
      this.killZombie(zombie);
    }
  }

  private killZombie(zombie: Phaser.Physics.Arcade.Sprite): void {
    zombie.setData('state', ZombieState.Dying);
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    this.scene.tweens.add({
      targets: zombie,
      alpha: 0,
      duration: 300,
      onComplete: () => this.deactivateZombie(zombie),
    });
  }

  private deactivateZombie(zombie: Phaser.Physics.Arcade.Sprite): void {
    zombie.setActive(false).setVisible(false).setAlpha(1);
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    body.setVelocity(0, 0);
    // Remove from active tracking (if still present)
    const idx = this.activeZombies.indexOf(zombie);
    if (idx >= 0) this.activeZombies.splice(idx, 1);
  }

  // ---------------------------------------------------------------------------
  // Dawn kill-all
  // ---------------------------------------------------------------------------

  killAllZombies(): void {
    // Stop spawn timer
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }

    // Fade out all active zombies
    for (const zombie of [...this.activeZombies]) {
      if (!zombie.active) continue;
      zombie.setData('state', ZombieState.Dying);
      const body = zombie.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(0);

      this.scene.tweens.add({
        targets: zombie,
        alpha: 0,
        duration: 300,
        onComplete: () => this.deactivateZombie(zombie),
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  destroy(): void {
    EventBus.off('night:start', this.onNightStart);
    EventBus.off('night:end', this.onNightEnd);

    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }

    // Kill tweens and deactivate all zombies
    for (const zombie of this.activeZombies) {
      this.scene.tweens.killTweensOf(zombie);
    }
    this.activeZombies.length = 0;

    this.zombiePool.destroy(true);
  }
}
