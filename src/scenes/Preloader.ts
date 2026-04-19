import { Scene } from 'phaser';
import { createCoinTexture } from '../entities/Coin';
import {
  COLOR_ZOMBIE, NPC_WIDTH, NPC_HEIGHT, SPRITE_ZOMBIE,
  BULLET_WIDTH, BULLET_HEIGHT, BULLET_COLOR, SPRITE_BULLET
} from '../constants';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        this.load.spritesheet('hero', 'gunner/Tiny Gunslinger 48x32.png', {
            frameWidth: 48,
            frameHeight: 32
        });
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        // Generate procedural coin texture before entering the game
        createCoinTexture(this);

        // Generate zombie texture (green rectangle)
        const gfxZ = this.add.graphics();
        gfxZ.fillStyle(COLOR_ZOMBIE, 1);
        gfxZ.fillRect(0, 0, NPC_WIDTH, NPC_HEIGHT);
        gfxZ.generateTexture(SPRITE_ZOMBIE, NPC_WIDTH, NPC_HEIGHT);
        gfxZ.destroy();

        // Generate bullet texture (small gray rectangle per D-06)
        const gfxB = this.add.graphics();
        gfxB.fillStyle(BULLET_COLOR, 1);
        gfxB.fillRect(0, 0, BULLET_WIDTH, BULLET_HEIGHT);
        gfxB.generateTexture(SPRITE_BULLET, BULLET_WIDTH, BULLET_HEIGHT);
        gfxB.destroy();

        this.scene.start('MainMenu');
    }
}
