/**
 * Zombie state enum and type definitions.
 *
 * Zombies are NOT class instances extending BaseNPC -- they are pooled
 * Phaser.Physics.Arcade.Sprite objects managed by WaveManager.  This file
 * provides shared types so both WaveManager and Game.ts can reference them.
 *
 * Per-zombie state is stored on the sprite via setData/getData:
 *   sprite.setData('state', ZombieState.March)
 *   sprite.getData('state') as ZombieState
 */

export enum ZombieState {
  March = 0,
  Attack = 1,
  Dying = 2,
}
