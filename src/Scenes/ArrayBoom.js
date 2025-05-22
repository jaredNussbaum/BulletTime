class ArrayBoom extends Phaser.Scene {
    constructor() {
        super("arrayBoom");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}, enemies: []};


        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.bullet = [];   
        this.maxBullets = 3;           // Don't create more than this many bullets
        
        this.pointsa;
        this.pointsb;
        this.curvea;
        this.curveb;
        this.lives = 5;
        this.chickens = [];
        this.ducks = [];
        this.maxDucks = 3;
        this.ducksOnScreen = 0;
        this.my.sprite.duckbullet = [];


        this.timer = 0;
        this.myScore = 0;       // record a score as a class variable
        this.scoreThreshold = 750;
        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("gator", "crocodile.png");
        this.load.image("heart", "heart.png");
        this.load.image("duck", "duck.png");
        this.load.image("duckSq", "duckSq.png");
        this.load.image("chicken", "chicken.png");


        // For animation
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound asset from the Kenny Music Jingles pack
        // https://kenney.nl/assets/music-jingles
        this.load.audio("dadada", "jingles_NES13.ogg");
    }

    create() {
        this.my.sprite.bullet = [];
        let my = this.my;
        this.maxDucks = 3;
        this.ducksOnScreen = 0;
        my.sprite.gator = this.add.sprite(game.config.width/2, game.config.height - 40, "gator");
        my.sprite.gator.setScale(0.25);
        this.lives = 5;
        this.chickens = [];
        this.ducks = [];
        my.sprite.chicken = this.add.sprite(game.config.width/2, 80, "chicken");
        my.sprite.chicken.setScale(0.25);
        my.sprite.chicken.scorePoints = 25;

        // Notice that in this approach, we don't create any bullet sprites in create(),
        // and instead wait until we need them, based on the number of space bar presses

        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,    // Note: case sensitive (thank you Ivy!)
            repeat: 5,
            hideOnComplete: true
        });
        this.chickens.push(my.sprite.chicken);
        this.my.enemies.push(my.sprite.chicken)
        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.myScore = 0;
        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 5;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Gator Gamble: Level 1</h2><br>A: left // D: right // Space: fire/emit'

        // Put score on screen
        my.text.score = this.add.bitmapText(350, 0, "rocketSquare", "Score " + this.myScore);
        my.text.lives = this.add.bitmapText(0, 0, "rocketSquare", "Lives: " + this.lives);
        // Put title on screen
        /*this.add.text(10, 5, "Gator Gamble!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });
*/
        this.pointsa = [
            318, 6,
            284, 71,
            331, 122,
            287, 185,
            320, 244,
            318, 291
        ];


        
        this.curvea = new Phaser.Curves.Spline(this.pointsa);


    }

    update() {
        let my = this.my;

        this.timerLogic();

        this.checkScoreAndLives();

        this.spawnDucks();

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.gator.x > (my.sprite.gator.displayWidth/2)) {
                my.sprite.gator.x -= this.playerSpeed;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.gator.x < (game.config.width - (my.sprite.gator.displayWidth/2))) {
                my.sprite.gator.x += this.playerSpeed;
            }
        }

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.gator.x, my.sprite.gator.y-(my.sprite.gator.displayHeight/2), "heart")
                );
            }
        }
        for (let du of this.ducks){
            if (this.timer % du.shootTimer == 0){
                my.sprite.duckbullet.push(this.add.sprite(
                    du.x, du.y, "duckSq").setScale(0.125));

            }
        }
        // Remove all of the bullets which are offscreen
        // filter() goes through all of the elements of the array, and
        // only returns those which **pass** the provided test (conditional)
        // In this case, the condition is, is the y value of the bullet
        // greater than zero minus half the display height of the bullet? 
        // (i.e., is the bullet fully offscreen to the top?)
        // We store the array returned from filter() back into the bullet
        // array, overwriting it. 
        // This does have the impact of re-creating the bullet array on every 
        // update() call. 
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));
        this.moveChickensDownwards();
        // Check for collision with the hippo
        for (let bullet of my.sprite.bullet) {
            for (let chicken of this.my.enemies){
            if (this.collides(chicken, bullet)) {
                // start animation
                this.puff = this.add.sprite(chicken.x, chicken.y, "whitePuff03").setScale(0.25).play("puff");
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                chicken.visible = false;
                chicken.x = -100;
                
                
                if (this.chickens.includes(chicken)){
                    this.chickens.splice(this.chickens.indexOf(chicken), 1);
                    this.myScore += 25;
                }
                if (this.ducks.includes(chicken)){
                    this.ducks.splice(this.ducks.indexOf(chicken), 1);
                    this.ducksOnScreen -= 1;
                    this.myScore += 50;
                }
                
                this.my.enemies.splice(this.my.enemies.indexOf(chicken), 1);
                // Update score
                this.updateScore();
                // Play sound
                chicken.setActive(false);
                this.sound.play("dadada", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });

            }
        }
        }

        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }
        for (let bullet of my.sprite.duckbullet) {
            bullet.y += this.bulletSpeed;
            if (this.collides(bullet, my.sprite.gator)){
                bullet.y = -100;
                this.lives -= 1;
                this.updateScore();
            }
        }
        for (let chicken of this.chickens) {
            
            if (this.collides(chicken, my.sprite.gator)){
                chicken.y = -100;
                this.lives -= 1;
                this.updateScore();
            }
        }

       // if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
        //    this.scene.start("fixedArrayBullet");
       // }

    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
        my.text.lives.setText("Lives: " + this.lives);





    }


    timerLogic(){
        if (this.timer % 240 == 0){
            this.spawnChickens();
        }
        this.timer++;
    }
    moveChickensDownwards(){
        for (let c of this.chickens){
            c.y += 3;
        }
    }
    spawnChickens(){
        for (let step = 0; step < 3; step++) {
            let ch = this.add.sprite(Math.floor(Math.random() * game.config.width), 80, "chicken");
            ch.setScale(0.25);
            ch.scorePoints = 25;
            this.chickens.push(ch);
            this.my.enemies.push(ch);
          }
 
    }
    spawnDucks(){
        if (this.ducksOnScreen < this.maxDucks){
           let d = 0;
            
            if(this.curvea.points.length > 0){
                d = this.add.follower(this.curvea, 10, 10, "duck");
                d.setVisible(true);  
                d.x = Math.floor(Math.random() * game.config.width);   
                d.y = this.curvea.points[0].y;

                d.startFollow({
                         from: 0,
                         to: 1,
                         delay: 0,
                         duration: 2000,
                         ease: 'Sine.easeInOut',
                         repeat: 0,
                         yoyo: false,
                         rotateToPath: false,
                         rotationOffset: -90
                 });        
            }
            d.shootTimer = 180 + Math.floor(Math.random() * 40)
            d.setScale(0.5);
            d.scorePoints = 25;
            this.ducks.push(d);
            this.my.enemies.push(d);
            this.ducksOnScreen += 1;
        }
    }
    checkScoreAndLives(){
        if (this.lives <= 0){
            this.scene.start("groupBullet");
        }
        if (this.myScore >= this.scoreThreshold){
            this.scene.start("fixedArrayBullet");
        }
    }
}
         