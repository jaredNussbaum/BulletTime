class SingleBullet extends Phaser.Scene {
    constructor() {
        super("singleBullet");

        // Initialize a class variable "my" which is an object.
        // The object has one property, "sprite" which is also an object.
        // This will be used to hold bindings (pointers) to created sprites.
        this.my = {sprite: {}};   
        
        // Create a flag to determine if the "bullet" is currently active and moving
        this.bulletActive = false;
    }

    preload() {
        
        this.load.setPath("./assets/");
        this.load.image("elephant", "elephant.png");
        this.load.image("heart", "heart.png");
        this.load.image("gator", "crocodile.png");
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        let my = this.my;
        this.gatr = this.add.sprite(285, 550, "gator").setScale(0.5);
        //this.StartGame = this.add.bitmapText(200, 250, "rocketSquare", "Gator Gamble!");
        this.GameStart = this.add.bitmapText(150, 250, "rocketSquare", "Gator Gamble!");

        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        document.getElementById('description').innerHTML = '<h2>Start Menu</h2><br>Press Space To Start!'
    }

    update() {
        let my = this.my;

       
        
            // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start("arrayBoom");
        }
    }
}
