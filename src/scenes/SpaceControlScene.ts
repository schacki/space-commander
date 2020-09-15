import Phaser from 'phaser'
import Plane from '../objects/Plane';
export default class SpaceControlScene extends Phaser.Scene
{
	constructor()
	{
		super('space-control')
	}

	preload()
    {
        this.load.image('sky', 'http://labs.phaser.io/assets/skies/space3.png')
        this.load.image('logo', 'http://labs.phaser.io/assets/sprites/phaser3-logo.png')
        this.load.image('red', 'http://labs.phaser.io/assets/particles/red.png');
        this.load.image('arrow', 'assets/arrow.png')
    }

    create()
    {
        this.add.image(400, 300, 'sky')
        const plan = new Plane(this, 200, 150);
        // const particles = this.add.particles('red')

        // const emitter = particles.createEmitter({
        //     speed: 100,
        //     scale: { start: 1, end: 0 },
        //     blendMode: 'ADD'
        // })

        // const logo = this.physics.add.image(400, 100, 'logo')

        // logo.setVelocity(100, 200)
        // logo.setBounce(1, 1)
        // logo.setCollideWorldBounds(true)

        // emitter.startFollow(logo)
    }
}
