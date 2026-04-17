import { Scene } from 'phaser';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);

    this.add.text(this.scale.width / 2, this.scale.height / 2 - 20, 'YOUR CITY HAS FALLEN', {
      fontFamily: '"Courier New", monospace',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, 'Press ENTER to restart', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Restart on ENTER key or click
    this.input.keyboard!.once('keydown-ENTER', () => {
      this.scene.start('Game');
    });
    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
