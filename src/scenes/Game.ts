import { Scene } from 'phaser';

export class Game extends Scene {

    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x202020);
    }

    update() {
        // Game loop — hero, coins, and world will be added in Plan 02
    }
}
