class GroupBullet extends Phaser.Scene {
    constructor() {
        super("groupBullet");

        // Initialize a class variable "my" which is an object.
        // The object has one property, "sprite" which is also an object.
        // This will be used to hold bindings (pointers) to created sprites.
        this.my = {sprite: {}};
        this.bulletCooldown = 3;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;
        
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("elephant", "elephant.png");
        this.load.image("heart", "heart.png");
        this.load.image("gator", "crocodile.png")
    }

    create() {
        let my = this.my;

        this.gatre = this.add.sprite(285, 550, "gator").setScale(0.5);
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.GameOver = this.add.bitmapText(200, 250, "rocketSquare", "Game Over!");
        
        document.getElementById('description').innerHTML = '<h2>Game Over!</h2><br>Press Space to Continue...'

    }

    update() {
        let my = this.my;
        

        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start("singleBullet");
        }

    }
}
         