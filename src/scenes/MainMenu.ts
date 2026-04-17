import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'DEAD CITY', {
            fontFamily: '"Courier New", monospace', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 510, 'Press ENTER to begin', {
            fontFamily: '"Courier New", monospace',
            fontSize: '14px',
            color: '#e2b714'
        }).setOrigin(0.5);

        this.input.keyboard!.once('keydown-ENTER', () => {
            this.scene.start('Game');
        });
    }
}
