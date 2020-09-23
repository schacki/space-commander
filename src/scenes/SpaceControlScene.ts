import Phaser from 'phaser'
import Plane from '../objects/Plane'





export default class SpaceControlScene extends Phaser.Scene
{
    planes: Array<Plane> = []
    gameOver: boolean = false
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
        this.load.image('landebahn', 'assets/landebahn.png')
        this.load.image('strich', 'assets/strich.png')
    }

    create()
    {
        this.add.image(400, 300, 'sky')
       const landebahn = this.add.image(500, 200, 'landebahn');
       landebahn.setScale(0.25)
       const strich = this.add.sprite(500, 240, 'strich')
       strich.setScale(0.2)
       this.physics.add.overlap(strich, this.planes, this.landingPlane, undefined, this)
        
         

        for (let i=0; i<5; i++) {
            setTimeout(() => this.addPlane(), i*2000)
        }


    }

    landingPlane(strich, landingPlane){
        this.add.text(50, 60, 'Game Over')
        this.planes.forEach(
            (p: Plane) => {
                p.setVelocity(0,0);
                
            }
        )
        this.physics.pause();

        this.gameOver = true
    }

    addPlane() {
        const zufallszahl = Math.random()
        let x, y;
        if (zufallszahl < 0.25 ) {
            x = 0
            y = Math.random() * 600
        }
        else if (zufallszahl < 0.5){
            x = Math.random() * 800
            y = 0
        }
        else if (zufallszahl < 0.75){
            x = 800
            y = Math.random() * 600
        }
        else {
            x = Math.random() * 800
            y =  600
        }

        this.planes.push(new Plane(this, x ,y ))
        this.physics.add.overlap(this.planes, this.planes, this.oncrash, undefined, this)        
    }

    oncrash(crashplane1, crashplane2)
	{
        this.add.text(50, 60, 'Game Over')
        this.planes.forEach(
            (p: Plane) => {
                p.setVelocity(0,0);
                
            }
        )
        this.physics.pause();

        this.gameOver = true
    }
 
       
}
