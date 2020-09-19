
interface Point {
    x: number;
    y: number;
}

interface RotatingPoint {
    x: number;
    y: number;
    rotation?: number;
}

type Points = Array<Point>;


enum PlaneState {
    FIXED = 'fixed',
    INIT_PATH = 'init_path',
    DEFINING_PATH = 'defining_path',
    FOLLOWING_PATH = 'following_path',

}

export default class Plane extends Phaser.Physics.Arcade.Sprite {
    state: PlaneState = PlaneState.FIXED;
    //followingState: FollowingPlaneState = FollowingPlaneState.UNDEFINED;
    scene: Phaser.Scene;
    activePointer: Phaser.Input.Pointer | undefined;
    // follower: FollowingPlane;
    speed = 200;

    graphics: Phaser.GameObjects.Graphics;
    path: Phaser.Curves.Path | undefined;
    pathPoints: Points = [];
    currentPathPointIndex: number = 0;
    timeline: Phaser.Tweens.Timeline;

    constructor(scene, x, y, texture: Phaser.Textures.Texture | string ="arrow") {
        super(scene, x, y, texture);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this)

        const rotation = Math.random() * 6 - 3;
        const v = this.scene.physics.velocityFromRotation(
            rotation,
            this.speed
        );
        this.setVelocity(v.x, v.y);
        this.setRotation(rotation);
        this.setInteractive();
        this.on('pointerdown',this.onPointerDown,this);
        this.on('pointerup',this.onPointerUp,this);
        this.scene.input.on('pointerup',this.onPointerUp,this);
        this.init();

    }

    init() {
        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(4, 0x00aa00);
        this.timeline = this.scene.tweens.createTimeline();
        this.state = PlaneState.FIXED;
    }

    reset() {
        this.timeline.destroy();
        if (this.path) {
            this.path.destroy();
            this.path = undefined;    
            this.graphics.destroy();
        }
        this.pathPoints = [];
        this.currentPathPointIndex = 0;
        this.init();
    }

    addPoint(point: Point) {
        if (this.pathPoints.length > 0) {
            const lastPoint = this.pathPoints[this.pathPoints.length - 1]
            if (lastPoint.x === point.x && lastPoint.y === point.y) {
                return;
            }
        }
        this.pathPoints.push(point);        

        if (!this.path){
            this.path = this.scene.add.path(point.x, point.y);
        } else {
            this.path.lineTo(point.x, point.y);
            this.path.draw(this.graphics);
        }

        if (this.state == PlaneState.FIXED || this.state == PlaneState.INIT_PATH) {
            if (this.pathPoints.length == 1) {
                this.state = PlaneState.INIT_PATH;    
            } else if (this.pathPoints.length > 1) {
                this.startFollow();  
            }
        } 
    }

    startFollow() {

        if (this.state !== PlaneState.FOLLOWING_PATH) {
            this.state = PlaneState.FOLLOWING_PATH;
        }

        const startPoint = <Point>this.pathPoints[this.currentPathPointIndex];
        this.currentPathPointIndex++;
        this.startTimeline(startPoint);        
    }
    
    startTimeline(lastPoint: RotatingPoint){
        let previousPoint: RotatingPoint = lastPoint;
        let rotation: number;

        while(this.pathPoints[this.currentPathPointIndex]) {
            const point = this.pathPoints[this.currentPathPointIndex];
            const dx = previousPoint.x - point.x;
            const dy = previousPoint.y - point.y;
            const time = Math.sqrt(dx * dx + dy * dy) / this.speed;
            rotation = Phaser.Math.Angle.Between(previousPoint.x, previousPoint.y, point.x, point.y);
            rotation = Phaser.Math.Angle.Wrap(rotation);
            if (previousPoint.rotation) {
                const rotationDelta = Math.abs(rotation - previousPoint.rotation)
                if (rotationDelta < 0.2) {
                    rotation = previousPoint.rotation;
                }
            } else {
                const rotationDelta = Math.abs(rotation - this.rotation)
                if (rotationDelta < 0.2) {
                    rotation = this.rotation;
                }
            }
            this.timeline.add({
                targets: this,
                x: point.x,
                y: point.y,
                rotation: rotation,
                ease: 'Power0',
                duration: time * 1000,
            });
            previousPoint = {...point, rotation};
            this.currentPathPointIndex++;        
        }
        this.timeline.setCallback('onComplete', () => {
            if (this.pathPoints.length - 1 >= this.currentPathPointIndex) {
                this.timeline.destroy();
                this.timeline = this.scene.tweens.createTimeline();
                this.startTimeline({
                    x: previousPoint.x,
                    y: previousPoint.y,
                    rotation
                });
            } else {
                this.reset();

                const v = this.scene.physics.velocityFromRotation(
                    this.rotation,
                    this.speed
                );
                this.setVelocity(v.x, v.y);
                this.state = PlaneState.FIXED;
            }
        });
        this.timeline.play();
    }


    preUpdate (time, delta) {
        super.preUpdate(time, delta);
        this.scene.physics.world.wrap(this, 0);
        if (this.activePointer) {
            this.addPoint({x: this.activePointer.x, y: this.activePointer.y});
        }
        
    }

    onPointerDown(pointer) {
        if (this.state == PlaneState.FIXED) {
            this.activePointer = this.scene.input.activePointer;
            this.state = PlaneState.INIT_PATH;
            this.addPoint({x: pointer.x, y: pointer.y});
        }
    }

    onPointerUp(pointer) {
        this.activePointer = undefined;
        if (this.state == PlaneState.INIT_PATH) {
            this.reset();
        } else if (this.state == PlaneState.DEFINING_PATH) {
            this.state = PlaneState.FOLLOWING_PATH;
        }
    }
}