class Aether extends Phaser.Game {

	/**
	 * WordManager instance for managing the set of words that the
	 * user is working on.
	 */
	private wordManager: WordManager = new WordManager();

	constructor() {
		super(360, 640, Phaser.CANVAS, '');
		this.state.add('boot', Boot, true);
		this.state.add('title', TitleScreen);
		this.state.add('game', Game);
		this.state.add('gameover', GameOver);
	}

	/**
	 * Returns the WordManager instance for this game.
	 */
	public getWordManager(): WordManager {
		return this.wordManager;
	}

}

class Boot extends Phaser.State {

	public preload(): void {
		this.load.atlasJSONHash('sheet', 'assets/sheet.png', 'assets/sheet.json');

		this.load.audio('fire', [
			'assets/audio/sfx_laser1.mp3',
			'assets/audio/sfx_laser1.ogg',
			'assets/audio/sfx_laser1.m4a'
		]);
	}

	public create(): void {
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignVertically = true;
		this.game.scale.pageAlignHorizontally  = true;

		this.game.plugins.add(Phaser.Plugin.SaveCPU);
		
		this.game.state.start('title');
	}
}

class TitleScreen extends Phaser.State {

	/**
	 * The banner logo at the top of the title screen.
	 */
	private titleText: Phaser.Text;

	/**
	 * The text for the Easy difficulty.
	 */
	private easyText: Phaser.Text;

	/**
	 * The text for the Normal difficulty.
	 */
	private normalText: Phaser.Text;

	/**
	 * The text for the Hard difficulty.
	 */
	private hardText: Phaser.Text;

	/**
	 * The difficulty of the game that the user has selected.
	 */
	private difficulty: Difficulty;

	/**
	 * The player's ship that is shown on the title screen.
	 */
	private ship: Phaser.Sprite;

	/**
	 * The time that has been elapsed since the ship left the screen during
	 * the intro transition.
	 */
	private timeElapsed: number = -1;

	public init(): void {
		this.timeElapsed = -1;
	}

	public create(): void {
		let bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
		bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);

		this.titleText = this.game.add.text(this.game.width / 2, this.game.height / 4, "Aether",  { fontSize: '64px', fill: '#ffffff' });
		this.titleText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		this.titleText.anchor.setTo(0.5, 0.5);

		this.easyText = this.createText("Easy", 300, Difficulty.EASY);
		this.normalText = this.createText("Normal", 350, Difficulty.NORMAL);
		this.hardText = this.createText("Hard", 400, Difficulty.HARD);
		
		this.ship = this.game.add.sprite(this.game.width / 2, 450, 'sheet', 'PNG/playerShip1_red.png');
		this.ship.scale.setTo(0.5, 0.5);
		this.ship.anchor.setTo(0.5);
		this.game.physics.arcade.enable(this.ship);
	}

	/**
	 * Fade out the texts on the screen.
	 */
	private fadeTexts(): void {
		this.applyFade(this.titleText);
		this.applyFade(this.easyText);
		this.applyFade(this.normalText);
		this.applyFade(this.hardText);
	}

	/**
	 * Applies a fade out effect to the given text.
	 * 
	 * @param text the text to fade out
	 */
	private applyFade(text: Phaser.Text): void {
		this.game.add.tween(text).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
	}

	private createText(content: string, y: number, difficulty: Difficulty): Phaser.Text {
		let startText = this.game.add.text(this.game.width / 2, y, content,  { fontSize: '28px', fill: '#ffffff' });
		startText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		startText.anchor.setTo(0.5, 0.5);
		startText.inputEnabled = true;
		startText.events.onInputOver.add(() => {
			startText.fill = "#88ff88";
		});
		startText.events.onInputOut.add(() => {
			startText.fill = "#ffffff";
		});
		startText.events.onInputDown.add(() => {
			this.ship.body.velocity.y = -300;
			this.difficulty = difficulty;
		});
		return startText;
	}

	public update(): void {
		if (this.ship !== null && !this.ship.inWorld) {
			this.timeElapsed = this.game.time.time;
			this.fadeTexts();
			this.ship.kill();
			this.ship = null;
		}

		if (this.timeElapsed !== -1 && this.game.time.time > this.timeElapsed + 1000) {
			this.game.state.start('game', true, false, this.difficulty);
		}
	}

}

enum Difficulty {
	EASY,
	NORMAL,
	HARD
}

/**
 * The base speed in which the enemy should move at.
 */
const ENEMY_MOVE_SPEED = 10;

/**
 * The base speed in which an enemy's bullet should move at.
 */
const ENEMY_BULLET_MOVE_SPEED = 40;

/**
 * The speed factor that should be used for scaling an enemy and an
 * enemy's bullet's speed based on the level the user is currently on.
 */
const ENEMY_MOVE_SPEED_FACTOR = 5;

class Game extends Phaser.State {
	
	private phaserKeys = [
		Phaser.Keyboard.A,
		Phaser.Keyboard.B,
		Phaser.Keyboard.C,
		Phaser.Keyboard.D,
		Phaser.Keyboard.E,
		Phaser.Keyboard.F,
		Phaser.Keyboard.G,
		Phaser.Keyboard.H,
		Phaser.Keyboard.I,
		Phaser.Keyboard.J,
		Phaser.Keyboard.K,
		Phaser.Keyboard.L,
		Phaser.Keyboard.M,
		Phaser.Keyboard.N,
		Phaser.Keyboard.O,
		Phaser.Keyboard.P,
		Phaser.Keyboard.Q,
		Phaser.Keyboard.R,
		Phaser.Keyboard.S,
		Phaser.Keyboard.T,
		Phaser.Keyboard.U,
		Phaser.Keyboard.V,
		Phaser.Keyboard.W,
		Phaser.Keyboard.X,
		Phaser.Keyboard.Y,
		Phaser.Keyboard.Z
	];

		private keys: string[] = [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'i',
		'j',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'q',
		'r',
		's',
		't',
		'u',
		'v',
		'w',
		'x',
		'y',
		'z',
	];

	private waitTime: number = 5000;

	/**
	 * The text field to display the user's score.
	 */
	private scoreText: Phaser.Text;

	/**
	 * The user's current score.
	 */
	private score: number = 0;

	/**
	 * The text field where the user's input will be displayed with.
	 */
	private inputText: Phaser.Text;
	private buttons: Phaser.Group;
	private bullets: Phaser.Group;
	
	private enemyBulletsGroup: Phaser.Group;
	private enemies: Phaser.Group;
	private wordsGroup: Phaser.Group;
	private player: Phaser.Sprite = null;
	private fire: Phaser.Sound;

	private wordCount: number = 0;

	private words: Phaser.Text[] = [];
	private sprites: Phaser.Sprite[] = [];
	private enemyBullets: Phaser.Sprite[] = [];
	private enemyBulletTimes: number[] = [];
	private enemyLetters: Phaser.Text[] = [];
	private gameTime: number;
	private targets: Phaser.Sprite[] = [];

	/**
	 * The level that the user is currently on.
	 */
	private level: number = 1;

	private difficulty: Difficulty;

	/**
	 * Whether the game has finished or not.
	 */
	private finished: boolean = false;

	private wordManager: WordManager;

	public init(difficulty: Difficulty) {
		this.wordManager = (this.game as Aether).getWordManager();
		if (this.player !== null) {
			this.enemyBulletsGroup.forEach((sprite) => {
				sprite.kill();
			}, this);
			this.enemies.forEach((sprite) => {
				sprite.kill();
			}, this);
			this.wordsGroup.forEach((sprite) => {
				sprite.kill();
			}, this);

			for (let i = 0; i < this.enemyLetters.length; i++) {
				if (this.enemyLetters[i] !== null && this.enemyLetters[i] !== undefined) {
					this.enemyLetters[i].kill();
				}
			}

			this.player.kill();

			this.wordCount = 0;
			this.level = 0;
			this.score = 0;
			this.finished = false;
			this.words = [];
			this.sprites = [];
			this.enemyBullets = [];
			this.enemyBulletTimes = [];
			this.enemyLetters = [];
			this.player = null;
			this.wordManager.reset();
		}

		this.difficulty = difficulty;

		// if we're on easy mode, then just use the alphabet
		this.wordManager.shouldUseWords(difficulty !== Difficulty.EASY);
	}

	public preload() {
		window.addEventListener("keydown", (event) => {
			if (event.keyCode == 8) {
				event.preventDefault();
				if (this.inputText.text.length > 0) {
					this.inputText.text = this.inputText.text.substring(0, this.inputText.text.length - 1);
				}
			}
		}, false);
	}

	public create() {
		let bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
		bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);

		this.bullets = this.game.add.physicsGroup();
		this.bullets.createMultiple(32,　'sheet', 'PNG/Lasers/laserBlue01.png', false);
		this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('outOfBoundsKill', true);

		this.enemyBulletsGroup = this.game.add.physicsGroup();
		this.enemyBulletsGroup.createMultiple(32,　'sheet', 'PNG/Lasers/laserGreen13.png', false);
		this.enemyBulletsGroup.setAll('checkWorldBounds', true);
		this.enemyBulletsGroup.setAll('outOfBoundsKill', true);

		this.player = this.game.add.sprite(this.game.width / 2, 415, 'sheet', 'PNG/playerShip1_red.png');
		this.player.health = 3;
		this.player.scale.setTo(0.5, 0.5);
		this.player.anchor.setTo(0.5);
		this.game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;

		this.fire = this.game.add.audio('fire');

		this.enemies = this.game.add.group();
		this.enemies.enableBody = true;
		this.wordsGroup = this.game.add.group();

		this.scoreText = this.game.add.text(16, 16, "Score: " + this.score, { fontSize: '16px', fill: '#ffffff' });
		this.inputText = this.game.add.text(this.game.width /  2, 460, null, { align: 'center', fontSize: '32px', fill: '#ffffff' });
		this.inputText.anchor.setTo(0.5, 0.5);

		this.buttons = this.game.add.group();
		this.buttons.enableBody = true;
		this.createKeys();
		this.gameTime = this.game.time.time;

		for (var i = 0; i < this.keys.length; i++) {
			var key = this.game.input.keyboard.addKey(this.phaserKeys[i]);
			var character = this.keys[i];
			key.onDown.add(this.typed(character), this);
		}
	}

	private append(char) {
		this.inputText.text = this.inputText.text + char;
	}

	private createKeys() {
		var scaling = 0.45;
		var scalingY = 0.50;
		var initialOffsetX = 0;
		var initialOffsetY = 480;
		var offset = 30 + 5;

		var row = [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ];
		var row2 = [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ];
		var row3 = [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ];

		for (var i = 0; i < row.length; i++) {
			var button = this.buttons.create(initialOffsetX + (offset * i), initialOffsetY, 'sheet', 'keyboard/letters/Keyboard_White_' + row[i] + '.png');
			button.scale.setTo(scaling, scalingY);
			button.inputEnabled = true;
			var character = row[i];
			button.events.onInputDown.add(this.typed(character.toLowerCase()), this);
		}
		
		for (var i = 0; i < row2.length; i++) {
			var button = this.buttons.create(initialOffsetX + 18 + (offset * i), initialOffsetY + 50, 'sheet', 'keyboard/letters/Keyboard_White_' + row2[i] + '.png');
			button.scale.setTo(scaling, scalingY);
			button.inputEnabled = true;
			var character = row2[i];
			button.events.onInputDown.add(this.typed(character.toLowerCase()), this);
		}
		
		for (var i = 0; i < row3.length; i++) {
			var button = this.buttons.create(initialOffsetX + 35 + (offset * i), initialOffsetY + 100, 'sheet', 'keyboard/letters/Keyboard_White_' + row3[i] + '.png');
			button.scale.setTo(scaling, scalingY);
			button.inputEnabled = true;
			var character = row3[i];
			button.events.onInputDown.add(this.typed(character.toLowerCase()), this);
		}

		var backspaceButton = this.buttons.create(initialOffsetX + 40 + (offset * 7), initialOffsetY + 100, 'sheet', 'keyboard/functions/Keyboard_White_Backspace_Alt.png');
		backspaceButton.scale.setTo(scaling, scalingY);
		backspaceButton.inputEnabled = true;
		backspaceButton.events.onInputDown.add(function() {
			if (this.inputText.text.length > 0) {
				this.inputText.text = this.inputText.text.substring(0, this.inputText.text.length - 1);
			}
		}, this);
	}

	private intercept(character): boolean {
		// only intercept if no word is being processed
		if (this.inputText.text.trim().length > 0) {
			return false;
		}

		for (var i = 0; i < this.enemyLetters.length; i++) {
			if (this.enemyLetters[i] !== null && this.enemyLetters[i] !== undefined) {
				if (this.enemyLetters[i].text === character) {
					for (var j = 0; j < this.targets.length; j++) {
						if (this.targets[j] === this.enemyBullets[i]) {
							// this letter is already being handled, don't intercept
							return false;
						}
					}

					this.inputText.text = "";
					let bullet = this.bullets.getFirstExists(false);

					if (bullet) {
						this.player.angle = 0;
						bullet.angle = 0;
						this.fire.play();
						bullet.scale.setTo(0.5, 0.5);
						bullet.reset(this.player.x - 2, this.player.y - 12);
						bullet.body.velocity.x = -this.enemyBullets[i].body.velocity.x * 3;
						bullet.body.velocity.y = -this.enemyBullets[i].body.velocity.y * 3;
						let index = this.bullets.getChildIndex(bullet);
						this.targets[index] = this.enemyBullets[i];
						this.enemyLetters[i].fill = "#ff8888";
					}
					return true;
				}
			}
		}
		return false;
	}

	private typed(character) {
		return () => {
			if (this.difficulty === Difficulty.EASY) {
				// on Easy mode, process all characters immediately
				let word = this.wordManager.completed(character);
				if (word !== null) {
					for (let i = 0; i < this.words.length; i++) {
						if (this.words[i] !== null && this.words[i].text === word) {
							this.words[i].fill = "#ff8888";
							this.fireBullet(this.sprites[i]);
							break;
						}
					}
				}
			} else {
				if (this.intercept(character)) {
					return;
				}

				this.inputText.text = this.inputText.text + character;
				let word = this.wordManager.completed(this.inputText.text);
				if (word !== null) {
					for (let i = 0; i < this.words.length; i++) {
						if (this.words[i] !== null && this.words[i].text === word) {
							this.words[i].fill = "#ff8888";
							this.fireBullet(this.sprites[i]);
							this.inputText.text = "";
							break;
						}
					}
				}
			}
		}
	}

	public update() {
		if (this.finished) {
			let cleared = true;
			for (let i = 0; i < this.sprites.length; i++) {
				if (this.sprites[i] !== null) {
					cleared = false;
					break;
				}
			}

			if (cleared) {
				for (let i = 0; i < this.enemyBullets.length; i++) {
					if (this.enemyBullets[i] !== null) {
						cleared = false;
						break;
					}
				}
			}

			if (cleared) {
				// all the enemies and lasers have been destroyed,
				// the game is over
				this.game.state.start('gameover');
				return;
			}
		}

		for (var i = 0; i < this.sprites.length; i++) {
			if (this.sprites[i] !== null && this.sprites[i] !== undefined && !this.sprites[i].inWorld) {
				this.wordManager.remove(this.words[i].text);
				this.sprites[i].kill();
				this.words[i].kill();
				this.sprites[i] = null;
				this.words[i] = null;
			}
		}

		for (var i = 0; i < this.enemyBullets.length; i++) {
			if (this.enemyBullets[i] !== null && this.enemyBullets[i] !== undefined && !this.enemyBullets[i].inWorld) {
				this.enemyBullets[i].kill();
				this.enemyLetters[i].kill();
				this.enemyBullets[i] = null;
				this.enemyLetters[i] = null;
			}
		}

		if (!this.finished && this.game.time.time - this.gameTime > this.waitTime) {
			this.waitTime = 5000;
			this.gameTime = this.game.time.time;
			
			let word = this.wordManager.getNextWord();
			// no words left, move to the next set
			if (word === null) {
				if (this.difficulty === Difficulty.EASY || !this.wordManager.goToNextSet()) {
					// can't move forward anymore, go to the next level
					this.level++;
					this.wordCount = 0;
					if (this.level === 6) {
						// end the game after five levels
						this.finished = true;
					} else {
						this.wordManager.reset();
						this.wordManager.shouldUseWords(this.difficulty !== Difficulty.EASY);
					}
				}
				word = this.wordManager.getNextWord();
			}

			if (!this.finished) {
				// game isn't finished, create an enemy
				this.createEnemy(word);
			}
		}

		for (var i = 0; i < this.enemyBulletTimes.length; i++) {
			if (this.enemyBulletTimes[i] !== null && this.enemyBulletTimes[i] !== undefined) {
				if (this.game.time.time > this.enemyBulletTimes[i] && this.sprites[i] != null) {
					this.enemyBulletTimes[i] = null;
					this.enemyBullets[i] = this.fireEnemyBullet(this.sprites[i], i);
				}
			}
		}

		for (var i = 0; i < this.words.length; i++) {
			if (this.words[i] !== null && this.words[i] !== undefined) {
				this.words[i].x = this.sprites[i].x;
				this.words[i].y = this.sprites[i].y + 60;
			}
		}

		for (var i = 0; i < this.enemyBullets.length; i++) {
			if (this.enemyBullets[i] !== null && this.enemyBullets[i] !== undefined) {
				this.enemyLetters[i].x = this.enemyBullets[i].x;
				this.enemyLetters[i].y = this.enemyBullets[i].y - 25;
			}
		}

		this.game.physics.arcade.overlap(this.bullets, this.sprites, this.destroy, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemyBulletsGroup, this.destroy2, null, this);
		this.game.physics.arcade.overlap(this.player, this.sprites, this.damageShip, null, this);
		this.game.physics.arcade.overlap(this.player, this.enemyBulletsGroup, this.damage, null, this);
		this.game.physics.arcade.overlap(this.buttons, this.sprites, this.buttonsCollided, null, this)
	}

	private fireEnemyBullet(attackingEnemy, letterIndex): Phaser.Sprite {
		if (this.difficulty !== Difficulty.HARD) {
			return null;
		}

		let rotate = Phaser.Math.angleBetween(attackingEnemy.body.x, attackingEnemy.body.y, this.player.body.x, this.player.body.y);
		rotate = Phaser.Math.radToDeg(rotate) + 90;

		let diffX = -(attackingEnemy.body.x - this.player.body.x) / 8;
		let enemyBullet = this.enemyBulletsGroup.getFirstExists(false);

		if (enemyBullet) {
			this.fire.play();
			enemyBullet.angle = rotate;
			enemyBullet.scale.setTo(0.5, 0.5);
			enemyBullet.reset(attackingEnemy.x + 20, attackingEnemy.y + 30);
			enemyBullet.body.velocity.x = diffX;
			enemyBullet.body.velocity.y = ENEMY_MOVE_SPEED + (this.level * ENEMY_MOVE_SPEED_FACTOR);

			var index = Math.floor(Math.random() * 26);
			var letter = this.game.add.text(0, 0, this.keys[index], { font: 'bold 16pt Arial', fill: "#88FF88" });
			letter.anchor.set(0.5);
			letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
			this.enemyLetters[letterIndex] = letter;
		}
		return enemyBullet;
	}

	private createEnemy(word: string) {
		let x = Math.floor(Math.random() * (this.game.width - 150)) + 50;
		var enemy = this.enemies.create(x, 0, 'sheet', 'PNG/Enemies/enemyBlack1.png');
		enemy.scale.setTo(0.5, 0.5);
		enemy.body.velocity.y = ENEMY_BULLET_MOVE_SPEED + (this.level * ENEMY_MOVE_SPEED_FACTOR);

		this.words[this.wordCount] = this.game.add.text(0, 0, word, { font: 'bold 16pt Arial', fill: "#88FF88" });
		this.words[this.wordCount].anchor.set(0.5);
		this.words[this.wordCount].setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		this.wordsGroup.add(this.words[this.wordCount]);

		this.sprites[this.wordCount] = enemy;
		this.enemyBulletTimes[this.wordCount] = 500 + (Math.random() * 1500) + this.game.time.time;
		this.wordCount++;
	}

	/**
	 * Add the given value to the current score.
	 * 
	 * @param increment the amount to add to the current total score,
	 * must be a positive number
	 */
	private updateScore(increment: number) {
		this.score += increment;
		this.scoreText.text = "Score: " + this.score;
	}

	private destroy(sprite, bullet) {
		let index = this.bullets.getChildIndex(bullet);
		for (let i = 0; i < this.sprites.length; i++) {
			if (this.sprites[i] === sprite && this.targets[index] === this.sprites[i]) {
				this.sprites[i].kill();
				this.words[i].kill();
				bullet.kill();

				this.sprites[i] = null;
				this.words[i] = null;
				this.targets[index] = null;
				this.enemyBulletTimes[i] = null;

				this.updateScore(1);

				for (let j = 0; j < this.sprites.length; j++) {
					if (this.sprites[j] !== null && this.sprites[j] !== undefined) {
						// another enemy already on the screen, set spawn time at five seconds
						this.waitTime = 5000;
						return;
					}
				}

				if (this.game.time.time - this.gameTime < 4000) {
					// no enemies on the screen and there's still a
					// long delay, spawn another one in one second
					this.waitTime = 1000;
					this.gameTime = this.game.time.time;
				}
			}
		}
	}
	
	private destroy2(bullet, enemyBullet) {
		let index = this.bullets.getChildIndex(bullet);
		for (let i = 0; i < this.enemyBullets.length; i++) {
			if (this.enemyBullets[i] === enemyBullet && this.targets[index] === this.enemyBullets[i]) {
				this.enemyBullets[i].kill();
				this.enemyLetters[i].kill();
				this.enemyBullets[i] = null;
				this.enemyLetters[i] = null;
				this.targets[index] = null;
				bullet.kill();

				this.updateScore(1);
			}
		}
	}

	/**
	 * Kills the given enemy sprite in addition to removing any other
	 * retained information about this enemy.
	 * 
	 * @param enemy the enemy to kill
	 */
	private kill(enemy: Phaser.Sprite) {
		let index = this.sprites.indexOf(enemy);
		// the enemy might have already been killed if it collided
		// with two keyboard buttons
		if (index !== -1) {
			this.wordManager.remove(this.words[index].text);
			this.sprites[index].kill();
			this.words[index].kill();
			this.sprites[index] = null;
			this.words[index] = null;
			this.targets[index] = null;
		}
	}

	private damageShip(player: Phaser.Sprite, enemy: Phaser.Sprite) {
		player.damage(1);
		if (player.health === 0) {
			this.game.state.start('gameover');
		}
		this.kill(enemy);
	}

	private damage(player: Phaser.Sprite, enemyBullet: Phaser.Sprite) {
		player.damage(1);
		if (player.health === 0) {
			this.game.state.start('gameover');
		}
		
		let index = this.enemyBullets.indexOf(enemyBullet);
		this.enemyBullets[index].kill();
		this.enemyLetters[index].kill();
		this.enemyBullets[index] = null;
		this.enemyLetters[index] = null;
		this.targets[index] = null;
	}

	/**
	 * Callback function for when an enemy collides with the virtual
	 * keyboard.
	 * 
	 * @param enemy the enemy sprite model
	 * @param button the keyboard button sprite model
	 */
	private buttonsCollided(enemy: Phaser.Sprite, button: Phaser.Sprite) {
		this.kill(enemy);
	}
	
	private fireBullet(enemy: Phaser.Sprite) {
		let diff = ((enemy.body.x - this.player.body.x) / (enemy.body.y - this.player.body.y)) * -450;
		let bullet = this.bullets.getFirstExists(false);
		let index = this.bullets.getChildIndex(bullet);
		let rotate = Phaser.Math.angleBetween(this.player.body.x, this.player.body.y, enemy.body.x, enemy.body.y);
		rotate = Phaser.Math.radToDeg(rotate) + 90;

		if (bullet) {
			this.fire.play();
			this.player.angle = rotate;
			bullet.angle = rotate;
			bullet.scale.setTo(0.5, 0.5);
			bullet.reset(this.player.x - 2, this.player.y - 12);
			bullet.body.velocity.x = diff;
			bullet.body.velocity.y = -450;
			this.targets[index] = enemy;
		}
	}

}

class GameOver extends Phaser.State {

	public create(): void {
		let bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
		bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);

		let gameOverText = this.game.add.text(this.game.width / 2, this.game.height / 3, "Game Over",  { fontSize: '64px', fill: '#ffffff' });
		gameOverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		gameOverText.anchor.setTo(0.5, 0.5);

		let titleText = this.game.add.text(this.game.width / 2, this.game.height / 3 * 2, "Return to the\nTitle Screen",  { fontSize: '28px', fill: '#ffffff', align: 'center' });
		titleText.inputEnabled = true;
		titleText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		titleText.anchor.setTo(0.5, 0.5);
		titleText.events.onInputOver.add(() => {
			titleText.fill = "#88ff88";
		});
		titleText.events.onInputOut.add(() => {
			titleText.fill = "#ffffff";
		});
		titleText.events.onInputDown.add(() => {
			this.game.state.start('title');
		});
	}
}

class WordManager {

	private englishNumbers = [
		"one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"
	];
	private japaneseNumbers = [
		"一", "二", "三", "四", "五", "六", "七", "八", "九", "十"
	];

	private englishColors = [
		"red", "blue", "green", "yellow", "black", "white", "brown", "purple", "pink", "orange"
	];
	private japaneseColors = [
		"赤い", "青い", "緑", "黄色", "黒い", "白い", "茶色", "紫", "ピンク", "オレンジ"
	];

	private englishSports = [
		"basketball", "tennis", "softball", "volleyball", "badminton", "baseball", "swimming"
	];
	private japaneseSports = [
		"バスケットボール", "テニス", "ソフトボール", "バレーボール", "バドミントン", "野球", "水泳"
	];
	
	private englishWords: string[][] = [ this.englishNumbers, this.englishColors, this.englishSports ];
	private japaneseWords: string[][] = [ this.japaneseNumbers, this.japaneseColors, this.japaneseSports ];
	private set: number;

	private done: boolean[] = [];

	private english: string[];
	private japanese: string[];
	
	private pending: string[] = [];
	private pendingTranslation: string[] = [];

	private useWords: boolean = true;

	private alphabet: string[] = [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
		'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	];

	constructor() {
		this.reset();
	}

	/**
	 * Resets the internal state of this manager for a new run.
	 */
	public reset(): void {
		this.set = 0;
		this.english  = this.englishWords[this.set];
		this.japanese  = this.japaneseWords[this.set];
		
		this.pending = [];
		this.pendingTranslation = [];
		this.done = [];
		for (let i = 0; i < this.english.length; i++) {
			this.done[i] = false;
		}
	}

	/**
	 * Defines whether words should be used or characters from the
	 * English alphabet should be used.
	 * 
	 * @param useWords <tt>true</tt> if complete words should be used,
	 * <tt>false</tt> if characters from the English alphabet should be
	 * used instead 
	 */
	public shouldUseWords(useWords: boolean) {
		this.useWords = useWords;

		if (useWords) {
			this.english = this.englishWords[this.set];
		} else {
			this.english = this.alphabet;
		}
		this.done = [];
		for (let i = 0; i < this.english.length; i++) {
			this.done[i] = false;
		}
	}

	/**
	 * Informs the manager that the given word has been completed and
	 * returns its corresponding translation if the given word is
	 * valid.
	 * 
	 * @param word the word that has been completed
	 * @return the given word's translation, or <tt>null</tt> if the
	 * given word is invalid and cannot be found by the manager
	 */
	public completed(word: string): string {
		let index = this.pending.indexOf(word);
		if (index === -1) {
			return null;
		}

		this.pending.splice(index, 1);
		return this.useWords ? this.pendingTranslation.splice(index, 1)[0] : word;
	}

	/**
	 * Removes the given key and associated word from the manager.
	 * 
	 * @param key the key and its associated word to remove
	 */
	public remove(key: string): void {
		if (this.useWords) {
			let index = this.pendingTranslation.indexOf(key);
			if (index !== -1) {
				this.pendingTranslation.splice(index, 1);
				this.pending.splice(index, 1);
			}
		} else {
			let index = this.pending.indexOf(key);
			if (index !== -1) {
				this.pending.splice(index, 1);
			}
		}
	}

	/**
	 * Asks the manager to move on to the next set of words and returns
	 * an indication of success.
	 * 
	 * @return <tt>true</tt> if the manager has internally moved on to
	 * process the next set of words, <tt>false</tt> if there are no
	 * other sets to process
	 * @see getNextWord
	 */
	public goToNextSet(): boolean {
		this.set++;
		if (this.set === this.englishWords.length) {
			return false;
		}

		this.done = [];
		this.english = this.englishWords[this.set];
		this.japanese = this.japaneseWords[this.set];

		for (let i = 0; i < this.english.length; i++) {
			this.done[i] = false;
		}
		return true;
	}

	/**
	 * Returns the next word that should be presented to the user.
	 * 
	 * @return the next word to show to the user, or <tt>null</tt> if
	 * the current set of words has been exhausted
	 * @see goToNextSet()
	 */
	public getNextWord(): string {
		if (this.done.indexOf(false) === -1) {
			return null;
		}

		var index = Math.floor(Math.random() * this.english.length);
		while (this.done[index]) {
			index = Math.floor(Math.random() * this.english.length);
		}

		this.done[index] = true;
		this.pending.push(this.english[index]);
		if (this.useWords) {
			this.pendingTranslation.push(this.japanese[index]);
			return this.japanese[index];
		} else {
			return this.english[index];
		}
	}

}

window.onload = () => {
	var game = new Aether();
}
