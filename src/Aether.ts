enum Language {
	ENGLISH,
	JAPANESE
}

class Aether extends Phaser.Game {

	/**
	 * WordManager instance for managing the set of words that the
	 * user is working on.
	 */
	private wordManager: WordManager = new WordManager();

	private localization: Localization = new Localization();

	private language: Language = Language.JAPANESE;

	/**
	 * Whether the game is a custom game with the word list supplied
	 * by the player.
	 */
	private custom: boolean = false;

	/**
	 * The number of lives that the player has.
	 */
	private lives: number = 2;

	constructor() {
		super(360, 640, Phaser.CANVAS, '');
		this.state.add('boot', Boot, true);
		this.state.add('language', LanguageScreen);
		this.state.add('title', TitleScreen);
		this.state.add('level', Level);
		this.state.add('boss', BossStage);
		this.state.add('gameover', GameOver);
	}

	/**
	 * Returns the WordManager instance for this game.
	 */
	public getWordManager(): WordManager {
		return this.wordManager;
	}

	public setLanguage(language: Language): void {
		this.language = language;
	}

	public getLocalizedString(key: string): string {
		return this.localization.getString(this.language, key);
	}

	/**
	 * Sets whether this is a custom game or not.
	 * 
	 * @param custom <tt>true</tt> if this is a custom game,
	 * <tt>false</tt> otherwise
	 */
	public setCustom(custom: boolean): void {
		this.custom = custom;
	}

	/**
	 * Returns whether this game instance uses words supplied by the
	 * player or not.
	 * 
	 * @return whether the game is running custom words from the player
	 * or not 
	 */
	public isCustom(): boolean {
		return this.custom;
	}

	/**
	 * Informs the game that the player has lost one life.
	 */
	public loseLife(): void {
		this.lives--;
	}

	/**
	 * Returns the number of lives that the player currently has.
	 * 
	 * @return the number of lives the player has remaining
	 */
	public getLives(): number {
		return this.lives;
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
		this.load.audio('explosion', [
			'assets/audio/8bit_bomb_explosion.mp3',
			'assets/audio/8bit_bomb_explosion.ogg',
			'assets/audio/8bit_bomb_explosion.m4a'
		]);
		this.load.audio('shieldUp', [
			'assets/audio/sfx_shieldUp.mp3',
			'assets/audio/sfx_shieldUp.ogg',
			'assets/audio/sfx_shieldUp.m4a'
		]);
		this.load.audio('shieldDown', [
			'assets/audio/sfx_shieldDown.mp3',
			'assets/audio/sfx_shieldDown.ogg',
			'assets/audio/sfx_shieldDown.m4a'
		]);
	}

	public create(): void {
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignVertically = true;
		this.game.scale.pageAlignHorizontally  = true;

		this.game.plugins.add(Phaser.Plugin.SaveCPU);
		
		this.game.state.start('language');
	}
}

class LanguageScreen extends Phaser.State {

	private background: Phaser.TileSprite;

	private englishText: Phaser.Text;

	private japaneseText: Phaser.Text;

	private tilePositionY: number;

	public create(): void {
		this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'sheet', 'Backgrounds/purple.png');
		this.background.autoScroll(0, 50);

		this.englishText = this.createText(this.game.height / 100 * 45, "English", Language.ENGLISH);
		this.japaneseText = this.createText(this.game.height / 100 * 55, "日本語", Language.JAPANESE);
	}

	private createText(y: number, content: string, language: Language): Phaser.Text {
		let languageText = this.game.add.text(this.game.width / 2, y, content,  { fontSize: '28px', fill: '#ffffff' });
		languageText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		languageText.anchor.setTo(0.5, 0.5);
		languageText.inputEnabled = true;
		languageText.events.onInputOver.add(() => {
			languageText.fill = "#88ff88";
		});
		languageText.events.onInputOut.add(() => {
			languageText.fill = "#ffffff";
		});
		languageText.events.onInputDown.add(() => {
			this.fadeTexts();
			(this.game as Aether).setLanguage(language);
			setTimeout(() => {
				this.tilePositionY = this.background.tilePosition.y;
				this.game.state.start('title', true, false, this.tilePositionY);
			}, 1000);
		});
		return languageText;
	}

	private fadeTexts(): void {
		this.game.add.tween(this.englishText).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		this.game.add.tween(this.japaneseText).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
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
	 * The text for allowing the user to pick and use a custom word
	 * list.
	 */
	private customText: Phaser.Text;

	private background: Phaser.TileSprite;

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

	private tilePositionY: number;

	public init(tilePositionY: number): void {
		this.timeElapsed = -1;
		this.tilePositionY = tilePositionY;
	}

	public create(): void {
		this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'sheet', 'Backgrounds/purple.png');
		this.background.tilePosition.y = this.tilePositionY;
		this.background.autoScroll(0, 50);

		this.titleText = this.game.add.text(this.game.width / 2, this.game.height / 4, "Aether",  { fontSize: '64px', fill: '#ffffff' });
		this.titleText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		this.titleText.anchor.setTo(0.5, 0.5);

		
		let aether = this.game as Aether;
		this.easyText = this.createDifficultyText(aether.getLocalizedString(EASY), 300, Difficulty.EASY);
		this.normalText = this.createDifficultyText(aether.getLocalizedString(MEDIUM), 350, Difficulty.MEDIUM);
		this.hardText = this.createDifficultyText(aether.getLocalizedString(HARD), 400, Difficulty.HARD);
		this.customText = this.createCustomText(aether.getLocalizedString(CUSTOM), 450);
		
		this.ship = this.game.add.sprite(this.game.width / 2, 500, 'sheet', 'PNG/playerShip1_red.png');
		this.ship.scale.setTo(0.5, 0.5);
		this.ship.anchor.setTo(0.5);
		this.game.physics.arcade.enable(this.ship);
	}

	/**
	 * Fade out the texts on the screen.
	 */
	private fadeOut(): void {
		this.applyFade(this.titleText);
		this.applyFade(this.easyText);
		this.applyFade(this.normalText);
		this.applyFade(this.hardText);
		this.applyFade(this.customText);
		this.applyFade(this.background);
	}

	/**
	 * Applies a fade out effect to the given text.
	 * 
	 * @param text the text to fade out
	 */
	private applyFade(sprite: PIXI.Sprite): void {
		this.game.add.tween(sprite).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
	}

	private createText(content: string, y: number): Phaser.Text {
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
		return startText;
	}

	private createDifficultyText(content: string, y: number, difficulty: Difficulty): Phaser.Text {
		let startText = this.createText(content, y);
		startText.events.onInputDown.add(() => {
			this.ship.body.velocity.y = -300;
			this.difficulty = difficulty;
			(this.game as Aether).setCustom(false);
		});
		return startText;
	}

	private createCustomText(content: string, y: number): Phaser.Text {
		let text = this.createText(content, y);
		text.events.onInputDown.add(() => {
			let input = document.createElement("input");
			input.setAttribute("type", "file");
			input.addEventListener("change", (event: any) => {
				let aether = this.game as Aether;
				let wordManager = aether.getWordManager();
				if (event.target.files.length !== 0) {
					this.difficulty = Difficulty.MEDIUM;
					wordManager.readFiles(event.target.files, () => {
						this.ship.body.velocity.y = -300;
						aether.setCustom(true);
					});
				}
			});
			input.click();
		});
		return text;
	}

	public update(): void {
		if (this.ship !== null && !this.ship.inWorld) {
			this.timeElapsed = this.game.time.time;
			this.fadeOut();
			this.ship.kill();
			this.ship = null;
		}

		if (this.timeElapsed !== -1 && this.game.time.time > this.timeElapsed + 1000) {
			this.game.state.start('level', true, false, this.difficulty);
		}
	}

}

enum Difficulty {
	EASY,
	MEDIUM,
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

abstract class Stage extends Phaser.State {
	private phaserKeys = [
		Phaser.Keyboard.A, Phaser.Keyboard.B, Phaser.Keyboard.C, Phaser.Keyboard.D, Phaser.Keyboard.E, Phaser.Keyboard.F,
		Phaser.Keyboard.G, Phaser.Keyboard.H, Phaser.Keyboard.I, Phaser.Keyboard.J, Phaser.Keyboard.K,
		Phaser.Keyboard.L, Phaser.Keyboard.M, Phaser.Keyboard.N, Phaser.Keyboard.O, Phaser.Keyboard.P,
		Phaser.Keyboard.Q, Phaser.Keyboard.R, Phaser.Keyboard.S, Phaser.Keyboard.T, Phaser.Keyboard.U,
		Phaser.Keyboard.V, Phaser.Keyboard.W, Phaser.Keyboard.X, Phaser.Keyboard.Y, Phaser.Keyboard.Z
	];

	private keys: string[] = [
		'a', 'b', 'c', 'd', 'e', 'f',
		'g', 'h', 'i', 'j', 'k',
		'l', 'm', 'n', 'o', 'p',
		'q', 'r', 's', 't', 'u',
		'v', 'w', 'x', 'y', 'z',
	];

	/**
	 * The background sprite that is tiled and moving.
	 */
	private background: Phaser.TileSprite;

	/**
	 * The text field to display the user's score.
	 */
	private scoreText: Phaser.Text;

	/**
	 * The user's current score.
	 */
	protected score: number = 0;

	/**
	 * The text field where the user's input will be displayed with.
	 */
	protected inputText: Phaser.Text;

	private shiftState: boolean = false;

	/**
	 * The sprites that represent the player's remaining number of
	 * lives.
	 */
	private lives: Phaser.Sprite[] = [];

	protected buttons: Phaser.Group;

	/**
	 * The group of shield power ups.
	 */
	protected shields: Phaser.Group;

	protected player: Phaser.Sprite = null;

	/**
	 * The player's shield if one is up and operational.
	 */
	protected shield: Phaser.Sprite = null;

	private initialShieldHealth: number = 0;
	
	protected bullets: Phaser.Group;

	protected enemies: Phaser.Group = null;

	protected enemyBulletsGroup: Phaser.Group;
	
	protected fire: Phaser.Sound;
	protected explosion: Phaser.Sound;
	protected shieldUp: Phaser.Sound;
	protected shieldDown: Phaser.Sound;

	/**
	 * The listener to prevent the 'Backspace' key from moving back in
	 * the browser's history. The key should instead be used for
	 * removing the user's input into the game.9
	 */
	private backspaceListener;

	protected difficulty: Difficulty;

	public preload() {
		this.backspaceListener = (event) => {
			if (event.keyCode == 8) {
				event.preventDefault();
				if (this.inputText.text.length > 0) {
					this.inputText.text = this.inputText.text.substring(0, this.inputText.text.length - 1);
				}
			}
		};
		window.addEventListener("keydown", this.backspaceListener, false);
	}

	public setInitialShieldHealth(initialShieldHealth: number) {
		this.initialShieldHealth = initialShieldHealth;
	}

	private createAudio(): void {
		this.fire = this.game.add.audio('fire');
		this.explosion = this.game.add.audio('explosion');
		this.explosion.volume = 0.1;
		this.shieldUp = this.game.add.audio('shieldUp');
		this.shieldDown = this.game.add.audio('shieldDown');
	}

	private createBackground(): void {
		this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'sheet', 'Backgrounds/purple.png');
		this.startScrolling();
	}

	private createScoreText(): void {
		this.scoreText = this.game.add.text(16, 16,  (this.game as Aether).getLocalizedString(SCORE) + ": " + this.score, { fontSize: '16px', fill: '#ffffff' });
	}

	/**
	 * Add the given value to the current score.
	 * 
	 * @param increment the amount to add to the current total score,
	 * must be a positive number
	 */
	protected updateScore(increment: number) {
		this.score += increment;
		this.scoreText.text = (this.game as Aether).getLocalizedString(SCORE) + ": " + this.score;
	}

	private createInputText(): void {
		this.inputText = this.game.add.text(this.game.width /  2, 460, null, { align: 'center', fontSize: '32px', fill: '#ffffff' });
		this.inputText.anchor.setTo(0.5, 0.5);
	}

	private createLives(): void {
		let lives = (this.game as Aether).getLives();
		if (lives === 1) {
			this.lives[0] = this.game.add.sprite(this.game.width - 50, 16, 'sheet', 'PNG/UI/playerLife1_red.png');
		} else if (lives === 2) {
			this.lives[0] = this.game.add.sprite(this.game.width - 50, 16, 'sheet', 'PNG/UI/playerLife1_red.png');
			this.lives[1] = this.game.add.sprite(this.game.width - 50, 48, 'sheet', 'PNG/UI/playerLife1_red.png');
		}
	}

	private createPlayer(): void {
		this.player = this.game.add.sprite(this.game.width / 2, 400, 'sheet', 'PNG/playerShip1_red.png');
		this.player.health = 3;
		this.player.scale.setTo(0.5, 0.5);
		this.player.anchor.setTo(0.5);
		this.game.physics.arcade.enable(this.player);
	}

	private createKeys() {
		this.buttons = this.game.add.group();
		this.buttons.enableBody = true;

		var scaling = 0.45;
		var scalingY = 0.50;
		var initialOffsetX = 0;
		var initialOffsetY = 480;
		var offset = 30 + 5;

		let row = [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ];
		let row2 = [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ];
		let row3 = [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ];

		for (let i = 0; i < row.length; i++) {
			let button = this.buttons.create(initialOffsetX + (offset * i), initialOffsetY, 'sheet', 'keyboard/letters/Keyboard_White_' + row[i] + '.png');
			button.scale.setTo(scaling, scalingY);
			button.inputEnabled = true;
			let character = row[i];
			button.events.onInputDown.add(this.internalTyped(character), this);
		}
		
		for (let i = 0; i < row2.length; i++) {
			let button = this.buttons.create(initialOffsetX + 18 + (offset * i), initialOffsetY + 50, 'sheet', 'keyboard/letters/Keyboard_White_' + row2[i] + '.png');
			button.scale.setTo(scaling, scalingY);
			button.inputEnabled = true;
			let character = row2[i];
			button.events.onInputDown.add(this.internalTyped(character), this);
		}
		
		for (let i = 0; i < row3.length; i++) {
			let button = this.buttons.create(initialOffsetX + 35 + (offset * i), initialOffsetY + 100, 'sheet', 'keyboard/letters/Keyboard_White_' + row3[i] + '.png');
			button.scale.setTo(scaling, scalingY);
			button.inputEnabled = true;
			let character = row3[i];
			button.events.onInputDown.add(this.internalTyped(character), this);
		}

		let shiftButton = this.buttons.create(initialOffsetX, initialOffsetY + 100, 'sheet', 'keyboard/functions/Keyboard_White_Arrow_Up.png');
		shiftButton.scale.setTo(scaling, scalingY);
		shiftButton.inputEnabled = true;
		shiftButton.events.onInputDown.add(function() {
			this.shiftState = !this.shiftState;
		}, this);

		let backspaceButton = this.buttons.create(initialOffsetX + 40 + (offset * 7), initialOffsetY + 100, 'sheet', 'keyboard/functions/Keyboard_White_Backspace_Alt.png');
		backspaceButton.scale.setTo(scaling, scalingY);
		backspaceButton.inputEnabled = true;
		backspaceButton.events.onInputDown.add(function() {
			if (this.inputText.text.length > 0) {
				this.inputText.text = this.inputText.text.substring(0, this.inputText.text.length - 1);
			}
		}, this);
	}

	private internalTyped(character: string): Function {
		return () => {
			this.typed(this.shiftState ? character.toUpperCase() : character.toLowerCase());
			this.shiftState = false;
		};
	}

	protected abstract typed(character: string): void;

	protected createBackgroundAssets(): void {
		this.createAudio();
		this.createBackground();
	}

	public createUI(): void {
		this.createScoreText();
		this.createInputText();
		this.createLives();

		this.createPlayer();
		if (this.initialShieldHealth !== 0) {
			this.grantShield(this.initialShieldHealth);
			this.shield.alpha = this.shield.health / 3;
		}
		this.shields = this.game.add.group();
		this.shields.enableBody = true;
		this.enemies = this.game.add.group();
		this.enemies.enableBody = true;

		this.bullets = this.game.add.physicsGroup();
		this.bullets.createMultiple(32,　'sheet', 'PNG/Lasers/laserBlue01.png', false);
		this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('outOfBoundsKill', true);

		this.enemyBulletsGroup = this.game.add.physicsGroup();
		this.enemyBulletsGroup.createMultiple(32,　'sheet', 'PNG/Lasers/laserGreen13.png', false);
		this.enemyBulletsGroup.setAll('checkWorldBounds', true);
		this.enemyBulletsGroup.setAll('outOfBoundsKill', true);

		this.createKeys();
		
		for (let i = 0; i < this.keys.length; i++) {
			let key = this.game.input.keyboard.addKey(this.phaserKeys[i]);
			let character = this.keys[i];
			key.onDown.add(this.internalTyped(character), this);
		}

		let key = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
		key.onDown.add(() => {
			this.shiftState = true;
		}, this);
		key.onUp.add(() => {
			this.shiftState = false;
		}, this);
	}

	protected stopScrolling(): void {
		this.background.autoScroll(0, 0);
	}

	protected startScrolling(): void {
		this.background.autoScroll(0, 50);
	}

	/**
	 * Create a shield power up at the location of the given enemy if
	 * the system allows it.
	 */
	protected createShieldPowerUp(enemy: Phaser.Sprite) {
		// give enemies a 10% chance of dropping a shield power up
		if (Math.random() > 0.1) {
			return;
		}

		let slope = (this.player.body.y - enemy.body.y) / (this.player.body.x - enemy.body.x);
		let powerUp = this.shields.create(
			enemy.body.x + (enemy.body.width / 2), enemy.body.y + (enemy.body.height / 2),
			'sheet', 'PNG/Power-ups/shield_silver.png');
		this.game.physics.enable(powerUp);
		powerUp.anchor.setTo(0.5, 0.5);
		powerUp.scale.setTo(0.5, 0.5);
		powerUp.body.velocity.x = 100 / slope; 
		powerUp.body.velocity.y = 100;
	}

	/**
	 * Grants the player a shield with the given health.
	 */
	protected grantShield(health: number): boolean {
		if (this.shield === null) {
			// shield doesn't exist, create one
			this.shield = this.game.add.sprite(this.game.width / 2, 400, 'sheet', 'PNG/Effects/shield3.png');
			this.shield.maxHealth = 3;
			this.shield.health = health;
			this.shield.scale.setTo(0.5, 0.5);
			this.shield.anchor.setTo(0.5);
			this.game.physics.enable(this.shield);
			return true;
		}
		this.shield.health = health;
		return false;
	}
	
	/**
	 * Grants the player a shield.
	 */
	protected grantShieldFromPowerUp(player: Phaser.Sprite, powerUp: Phaser.Sprite) {
		// destroy the power up
		powerUp.kill();

		if (this.grantShield(3)) {
			this.shield.alpha = 0;
		}
		this.game.add.tween(this.shield).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);
		this.shieldUp.play();
	}

	/**
	 * Decrease the shield of the player. If the player's shield's
	 * health is dropped to zero, it will be destroyed.
	 */
	protected decreaseShieldHealth() {
		this.shieldDown.play();
		this.shield.damage(1);
		let alpha = this.shield.health / this.shield.maxHealth;
		this.game.add.tween(this.shield).to({ alpha: alpha }, 1000, Phaser.Easing.Linear.None, true);
		if (this.shield.health === 0) {
			this.shield = null;
		}
	}

	protected animateDeath(enemy: Phaser.Sprite) {
		let smoke = this.game.add.sprite(enemy.body.x + (enemy.body.width / 2),
			enemy.body.y + (enemy.body.height / 2), 'sheet', 'PNG/Effects/spaceEffects_016.png');
		smoke.anchor.setTo(0.5, 0.5);
		smoke.animations.add('run',
			[ 'PNG/Effects/spaceEffects_015.png', 'PNG/Effects/spaceEffects_014.png', 'PNG/Effects/spaceEffects_013.png',
			'PNG/Effects/spaceEffects_012.png', 'PNG/Effects/spaceEffects_011.png', 'PNG/Effects/spaceEffects_010.png',
			'PNG/Effects/spaceEffects_009.png', 'PNG/Effects/spaceEffects_008.png', ],
			10, false);
		smoke.animations.play('run', 10, false, true);
		this.explosion.play();
	}

	protected loseLife(): boolean {
		(this.game as Aether).loseLife();
		if (this.lives.length > 0) {
			this.lives[this.lives.length - 1].kill();
			this.lives.splice(this.lives.length - 1, 1);
			return true;
		}
		this.endGame();
		return false;
	}

	protected endGame(): void {
		this.game.state.start('gameover', true, false, this.difficulty, this.score);
	}

	public shutdown(): void {
		window.removeEventListener("keydown", this.backspaceListener, false);
	}

}

class Level extends Stage {

	private waitTime: number = 5000;
	
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

	/**
	 * Whether the game has finished or not.
	 */
	private finished: boolean = false;

	/**
	 * Whether the game should stop spawning enemies or not.
	 */
	private haltEnemySpawns: boolean = false;

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
			this.words.forEach((sprite) => {
				sprite.kill();
			}, this);

			for (let i = 0; i < this.enemyLetters.length; i++) {
				if (this.enemyLetters[i] !== null && this.enemyLetters[i] !== undefined) {
					this.enemyLetters[i].kill();
				}
			}

			this.player.kill();

			this.wordCount = 0;
			this.level = 1;
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

	public create() {
		this.createBackgroundAssets();
		this.createUI();

		this.gameTime = this.game.time.time;
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

	protected typed(character): void {
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
			let prefix = this.inputText.text + character;
			if ((prefix.length === 1 && this.intercept(character)) ||
					!this.wordManager.isValidPrefix(prefix)) {
				return;
			}

			this.inputText.text = prefix;
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
				// go fight the boss
				let shieldHealth = this.shield === null ? 0 : this.shield.health;
				this.game.state.start('boss', true, false, this.difficulty, this.score, shieldHealth);
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

		if (!this.finished && this.game.time.time - this.gameTime > this.waitTime && !this.haltEnemySpawns) {
			this.waitTime = 5000;
			this.gameTime = this.game.time.time;
			
			let word = this.wordManager.getNextWord();
			// no words left, move to the next set
			if (word === null) {
				if (this.difficulty === Difficulty.EASY || !this.wordManager.goToNextSet()) {
					// can't move forward anymore, stage is completed, fight the boss
					this.finished = true;
				}
				word = this.wordManager.getNextWord();
			}

			if (!this.finished) {
				// game isn't finished, create an enemy
				this.createEnemy(word);
			}
		}

		if (this.difficulty === Difficulty.HARD && !this.haltEnemySpawns) {
			for (var i = 0; i < this.enemyBulletTimes.length; i++) {
				if (this.enemyBulletTimes[i] !== null && this.enemyBulletTimes[i] !== undefined) {
					if (this.game.time.time > this.enemyBulletTimes[i] && this.sprites[i] != null) {
						this.enemyBulletTimes[i] = null;
						this.enemyBullets[i] = this.fireEnemyBullet(this.sprites[i], i);
					}
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

		if (this.player.body.y < 400) {
			// stop moving the new ship
			this.player.body.velocity.y = 0;
			this.player.body.y = 400;
			// scroll the background again now that the ship is in
			// position
			this.startScrolling();
			// start respawning enemies
			this.haltEnemySpawns = false;
			this.gameTime = this.game.time.time;
		}

		this.game.physics.arcade.overlap(this.bullets, this.sprites, this.destroy, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemyBulletsGroup, this.destroy2, null, this);
		if (this.shield !== null) {
			// check for shield collision
			this.game.physics.arcade.overlap(this.shield, this.sprites, this.shieldDamagedByShip, null, this);
			this.game.physics.arcade.overlap(this.shield, this.enemyBulletsGroup, this.shieldDamagedByBullet, null, this);
		}
		this.game.physics.arcade.overlap(this.player, this.sprites, this.damageShip, null, this);
		this.game.physics.arcade.overlap(this.player, this.enemyBulletsGroup, this.damage, null, this);
		this.game.physics.arcade.overlap(this.buttons, this.sprites, this.buttonsCollided, null, this)
		this.game.physics.arcade.overlap(this.player, this.shields, this.grantShieldFromPowerUp, null, this)
	}

	private fireEnemyBullet(attackingEnemy, letterIndex): Phaser.Sprite {
		let rotate = Phaser.Math.angleBetween(attackingEnemy.body.x, attackingEnemy.body.y, this.player.body.x, this.player.body.y);
		rotate = Phaser.Math.radToDeg(rotate) + 90;

		let slope = (this.player.body.y - attackingEnemy.body.y) / (this.player.body.x - attackingEnemy.body.x);
		let enemyBullet = this.enemyBulletsGroup.getFirstExists(false);

		if (enemyBullet) {
			this.fire.play();
			enemyBullet.angle = rotate;
			enemyBullet.scale.setTo(0.5, 0.5);
			enemyBullet.reset(attackingEnemy.x + 20, attackingEnemy.y + 30);
			enemyBullet.body.velocity.y = ENEMY_BULLET_MOVE_SPEED + (this.level * ENEMY_BULLET_MOVE_SPEED);
			enemyBullet.body.velocity.x = enemyBullet.body.velocity.y / slope; 

			let letter = this.game.add.text(0, 0, this.wordManager.getRandomLetter(), { font: 'bold 16pt Arial', fill: "#88FF88" });
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

		this.sprites[this.wordCount] = enemy;
		if (this.difficulty === Difficulty.HARD) {
			this.enemyBulletTimes[this.wordCount] = 500 + (Math.random() * 1500) + this.game.time.time;
		}
		this.wordCount++;
	}

	private shieldDamagedByShip(shield: Phaser.Sprite, enemy: Phaser.Sprite) {
		this.decreaseShieldHealth();
		this.animateDeath(enemy);
		this.kill(enemy);
	}

	private shieldDamagedByBullet(shield: Phaser.Sprite, bullet: Phaser.Sprite) {
		this.decreaseShieldHealth();
		let index = this.enemyBullets.indexOf(bullet);
		this.enemyBullets[index].kill();
		this.enemyLetters[index].kill();
		this.enemyBullets[index] = null;
		this.enemyLetters[index] = null;
		this.targets[index] = null;
	}

	private destroy(sprite, bullet) {
		let index = this.bullets.getChildIndex(bullet);
		for (let i = 0; i < this.sprites.length; i++) {
			if (this.sprites[i] === sprite && this.targets[index] === this.sprites[i]) {
				this.animateDeath(sprite);
				this.createShieldPowerUp(sprite);
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

	private decreaseHealth() {
		if (this.player.health === 1) {
			this.haltEnemySpawns = true;
			this.inputText.text = "";
			this.stopScrolling();

			this.player.angle = 0;
			this.player.health = 3;
			this.player.body.y = this.game.height + 100;

			this.sprites.forEach((sprite) => {
				if (sprite !== null && sprite !== undefined) {
					sprite.body.velocity.y = sprite.body.velocity.y * 2;
				}
			});
			this.enemyBullets.forEach((sprite) => {
				if (sprite !== null && sprite !== undefined) {
					sprite.body.velocity.y = sprite.body.velocity.y * 2;
				}
			});

			
			if (this.loseLife()) {
				setTimeout(() => {
					this.player.body.velocity.y = -100;
				}, 3000);
			}
		} else {
			this.player.damage(1);
		}
	}

	private damageShip(player: Phaser.Sprite, enemy: Phaser.Sprite) {
		this.decreaseHealth();
		this.animateDeath(enemy);
		this.kill(enemy);
	}

	private damage(player: Phaser.Sprite, enemyBullet: Phaser.Sprite) {
		this.decreaseHealth();
		
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
		this.animateDeath(enemy);
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

class BossStage extends Stage {

	private wordManager: WordManager;

	private ships: EnemyShip[] = [];

	private projectiles: EnemyProjectile[] = [];

	private shipsFired: boolean = false;

	private boss: Phaser.Sprite = null;
	private bossLaunchpadHealth = 9;
	private bossTurretsHealth = 9;
	private fireTopMissile: boolean = true;

	private shipsTextPromptCount = 0;
	private bossTextPromptCount = 0;

	private bossText: Phaser.Text = null;
	private bossTargetX: number = 220;

	private timer: Phaser.Timer;

	public init(difficulty: Difficulty, score: number, initialShieldHealth: number): void {
		this.difficulty = difficulty;
		this.setInitialShieldHealth(initialShieldHealth);
		this.score = score;

		this.wordManager = (this.game as Aether).getWordManager();
		this.timer = this.game.time.create(false);
	}

	public create(): void {
		this.createBackgroundAssets();
		this.createBoss();
		this.createUI();
	}

	public update(): void {
		this.projectiles.forEach((projectile: EnemyProjectile) => {
			projectile.update();
		});

		if (this.shipsFired && this.projectiles.length === 0) {
			// ships fired and all the projectiles are gone, give the
			// player a chance to destroy the ships
			this.shipsTextPromptCount++;
			this.timer.add(1000, () => {
				this.createShipTexts();
			});
			this.timer.start();
			this.shipsFired = false;
		}

		if (this.player.body.y < 400) {
			// stop moving the new ship
			this.player.body.velocity.y = 0;
			this.player.body.y = 400;
			// scroll the background again now that the ship is in
			// position
			this.startScrolling();
			// resume time
			this.timer.resume();
		}

		if (this.shield !== null) {
			// check for shield collision
			this.game.physics.arcade.overlap(this.shield, this.enemyBulletsGroup, this.shieldDamagedByBullet, null, this);
		}
		this.game.physics.arcade.overlap(this.bullets, this.enemies, this.hitEnemyShip, null, this);
		this.game.physics.arcade.overlap(this.boss, this.bullets, this.bossDamaged, null, this);
		this.game.physics.arcade.overlap(this.player, this.enemyBulletsGroup, this.damagedByProjectile, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemyBulletsGroup, this.projectileIntercepted, null, this);
	}

	private shieldDamagedByBullet(shield: Phaser.Sprite, bullet: Phaser.Sprite) {
		if (this.shield !== null) {
			this.decreaseShieldHealth();
			this.removeProjectile(bullet);
		}
	}

	private createShipTexts(): void {
		let words = [];
		for (let i = 0; i < this.ships.length; i++) {
			words[i] = this.game.add.text(
				0, 0, this.wordManager.getRandomWord(false),
				{ font: 'bold 16pt Arial', fill: "#88FF88" }
			);
			words[i].anchor.set(0.5);
			words[i].setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
			this.ships[i].setText(words[i]);
		}

		this.timer.add(this.difficulty === Difficulty.HARD ? 9000 : 12000, () => {
			let attached = false;
			for (let i = 0; i < this.ships.length; i++) {
				if (this.ships[i].isAttachedTo(words[i])) {
					this.ships[i].detachText();
					attached = true;
				}
			}

			// the user couldn't type all three words in time
			if (attached) {
				// if the user's currently typing something, clear it
				this.inputText.text = "";

				if (this.shipsTextPromptCount === 4) {
					// after four chances, send the ships away
					this.shipsTextPromptCount = 0;

					this.game.add.tween(this.ships[0].sprite).to({ x: -100}, 1000, Phaser.Easing.Linear.None, true, 500);
					this.game.add.tween(this.ships[1].sprite).to({ y: -100}, 1000, Phaser.Easing.Linear.None, true, 500);
					this.game.add.tween(this.ships[2].sprite).to({ x: this.game.width + 100}, 1000, Phaser.Easing.Linear.None, true, 500);

					this.timer.add(2000, () => {
						this.ships.forEach((ship: EnemyShip) => {
							ship.sprite.kill();
						});
						this.ships = [];
						// move the boss after the ships are gone
						this.moveBossToLaunchMissiles();
					});
					this.timer.start();
				} else {
					// after wiping the text, fire in one second
					this.fireFromShips(1000);
				}
			}
		});
	}

	private bossDamaged(boss: Phaser.Sprite, projectile: Phaser.Sprite) {
		// the boss can't be damaged unless it has text on it
		if (this.bossText !== null) {
			projectile.kill();
			this.bossText.kill();
			this.bossText = null;

			if (this.bossTargetX === 140) {
				this.bossTurretsHealth--;
			} else if (this.bossTargetX === 220) {
				this.bossLaunchpadHealth--;
			}

			if (this.bossTurretsHealth === 0 && this.bossLaunchpadHealth === 0) {
				this.updateScore(18);
				this.game.add.tween(this.boss).to({ angle: 30 }, 5000,
					Phaser.Easing.Linear.None, true);
				let fade = this.game.add.tween(this.boss).to({ alpha: 0 }, 10000,
					Phaser.Easing.Linear.None, true);
				fade.onComplete.add(() => {
					this.boss.kill();
					this.endGame();
				});
				this.boss.body.velocity.x = 10;
				this.boss.body.velocity.y = 20;
				return;
			}
			
			let timer = this.blink(this.boss, 200, 5);
			timer.onComplete.add(() => {
				this.moveBoss();
			});
			timer.start();
		}
	}

	private hitEnemyShip(bullet: Phaser.Sprite, ship: Phaser.Sprite) {
		for (let i = 0; i < this.ships.length; i++) {
			if (this.ships[i].contains(ship) && this.ships[i].isInterceptedBy(bullet)) {
				this.ships[i].damage();

				if (!this.ships[i].alive()) {
					this.animateDeath(ship);
					this.ships.splice(i, 1);

					if (this.ships.length === 0) {
						// all ships dead, expose the boss to damage
						this.promptLaunchpadBossText();
						return;
					}
				}
				break;
			}
		}

		for (let i = 0; i < this.ships.length; i++) {
			if (this.ships[i].hasTextAttached()) {
				return;
			}
		}

		// no ships have any text on them, fire again
		this.fireFromShips(1000);
	}

	private removeProjectile(sprite: Phaser.Sprite) {
		for (let i = 0; i < this.projectiles.length; i++) {
			if (this.projectiles[i].contains(sprite)) {
				this.projectiles[i].damage();
				this.projectiles.splice(i, 1);
				this.animateDeath(sprite);
				return;
			}
		}
	}

	private damagedByProjectile(player: Phaser.Sprite, enemyBullet: Phaser.Sprite): void {
		this.removeProjectile(enemyBullet);
		this.decreaseHealth();
	}

	private decreaseHealth() {
		if (this.player.health === 1) {
			this.timer.pause();
			this.inputText.text = "";
			this.stopScrolling();

			this.player.angle = 0;
			this.player.health = 3;
			this.player.body.y = this.game.height + 100;

			if (this.loseLife()) {
				setTimeout(() => {
					this.player.body.velocity.y = -100;
				}, 3000);
			}
		} else {
			this.player.damage(1);
		}
	}
	
	private projectileIntercepted(bullet, enemyBullet) {
		for (let i = 0; i < this.projectiles.length; i++) {
			if (this.projectiles[i].contains(enemyBullet) && this.projectiles[i].isInterceptedBy(bullet)) {
				this.removeProjectile(enemyBullet);
				break;
			}
		}
	}

	private launchShips() {
		let ship = this.enemies.create(this.boss.body.x, this.boss.y - 29, 'sheet', 'PNG/Enemies/enemyBlue1.png');
		ship.moveDown();
		this.ships.push(new EnemyShip(this.wordManager, ship, 2));

		this.game.add.tween(ship).to(
			{ x: this.game.width / 2 - 100, y: 200, angle: 0 }, 1500, Phaser.Easing.Linear.None, true
		);

		ship = this.enemies.create(this.boss.body.x, this.boss.y - 29, 'sheet', 'PNG/Enemies/enemyBlue1.png');
		ship.alpha = 0;
		ship.moveDown();
		this.ships.push(new EnemyShip(this.wordManager, ship, 2));

		let s = ship;
		setTimeout(() => {
			s.alpha = 1;
		}, 1000);
		this.game.add.tween(ship).to(
			{ x: this.game.width / 2, y: 200, angle: 0 }, 1500, Phaser.Easing.Linear.None, true, 1000
		);

		ship = this.enemies.create(this.boss.body.x, this.boss.y - 29, 'sheet', 'PNG/Enemies/enemyBlue1.png');
		ship.alpha = 0;
		ship.moveDown();
		this.ships.push(new EnemyShip(this.wordManager, ship, 2));

		let s2 = ship;
		setTimeout(() => {
			s2.alpha = 1;
		}, 2000);

		this.fireFromShips(4000);
		this.game.add.tween(ship).to(
			{ x: this.game.width / 2 + 100, y: 200, angle: 0 }, 1500, Phaser.Easing.Linear.None, true, 2000
		);
	}

	private fireFromShips(timeout: number) {
		this.timer.add(4000, () => {
			this.enemies.forEach((enemy: Phaser.Sprite) => {
				let rotate = Phaser.Math.angleBetween(enemy.body.x, enemy.body.y, this.player.body.x, this.player.body.y);
				enemy.angle = Phaser.Math.radToDeg(rotate) - 90;
				let enemyBullet = this.enemyBulletsGroup.getFirstExists(false);
				let timeToImpact = this.difficulty === Difficulty.HARD ? 3000 : 4000;
				let projectile = new EnemyProjectile(this.wordManager, this.player, enemy, enemyBullet, timeToImpact);
				this.projectiles.push(projectile);
				
				let timer = this.game.time.create(true);
				timer.add(timeToImpact, () => {
					if (enemyBullet.alive) {
						this.removeProjectile(enemyBullet);
					}
				});
				timer.start(); 
				this.fire.play();
			}, this, true);
			this.shipsFired = true;
		});
		this.timer.start();
	}

	private createMissiles() {
		let missile = this.game.add.sprite(170, this.fireTopMissile ? 92 : 102, 'sheet', "PNG/Missiles/spaceMissiles_040.png");
		let x = 200 + Math.floor(Math.random() * 130);
		let y = 100 + Math.floor(Math.random() * 50);
		this.enemyBulletsGroup.add(missile);
		let projectile = new EnemyMissile(this.wordManager, missile);
		projectile.fire(this.player, x, y, 1000, 3000, () => {
			if (missile.alive) {
				this.removeProjectile(missile);
			}
		});
		this.projectiles.push(projectile);
		this.fireTopMissile = !this.fireTopMissile;
	}

	private createBoss() {
		this.boss = this.game.add.sprite(0, 0, 'sheet', 'PNG/Enemies/boss1.png');
		this.boss.scale.setTo(0.7, 0.7);
		this.game.physics.enable(this.boss);

		let dot = this.game.add.sprite(-12, -55, 'sheet', 'PNG/Effects/dot.png');
		this.game.add.tween(dot).to(
			{ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 100, -1, true
		);
		this.boss.addChild(dot);

		dot = this.game.add.sprite(-9, 29, 'sheet', 'PNG/Effects/dot.png');
		this.game.add.tween(dot).to(
			{ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 250, -1, true
		);
		this.boss.addChild(dot);

		dot = this.game.add.sprite(3, 124, 'sheet', 'PNG/Effects/dot.png');
		this.game.add.tween(dot).to(

			{ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, -1, true
		);
		this.boss.addChild(dot);
		this.boss.x = this.game.width / 2;
		this.boss.y = 125;
		this.boss.anchor.setTo(0.5, 0.5);

		this.moveBossToLaunchMissiles();
	}

	private launchMissiles() {
		for (let i = 0; i < 6; i++) {
			let delay = this.difficulty === Difficulty.HARD ? i * 2000 : i * 3000;
			this.timer.add(delay + 500, () => {
				this.createMissiles();
			});
		}
		let delay = this.difficulty === Difficulty.HARD ? 12000 : 18000;
		this.timer.add(delay + 500, () => {
			this.promptTurretBossText();
		});
		this.timer.start();
	}

	private promptTurretBossText() {
		this.bossTargetX = 140;
		this.promptBossText();
	}

	private promptLaunchpadBossText() {
		this.bossTargetX = 220;
		this.promptBossText();
	}

	private promptBossText() {
		this.bossText = this.game.add.text(
			this.bossTargetX, 70, this.wordManager.getRandomWord(false), { font: 'bold 16pt Arial', fill: "#88FF88" });
		this.bossText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		this.bossText.anchor.setTo(0.5);

		this.bossTextPromptCount++;

		if (this.bossTextPromptCount === 3) {
			let timer = this.game.time.create(true);
			timer.add(this.difficulty === Difficulty.HARD ? 3000 : 4000, (text: Phaser.Sprite) => {
				if (text.alive) {
					text.kill();
					this.bossText = null;
					this.moveBoss();
				}
			}, this, this.bossText);
			timer.start();
		} else {
			let timer = this.game.time.create(true);
			timer.add(this.difficulty === Difficulty.HARD ? 3000 : 4000, (text: Phaser.Sprite) => {
				if (text.alive) {
					this.inputText.text = "";
					text.kill();
					this.promptBossText();
				}
			}, this, this.bossText);
			timer.start();
		}
	}

	private moveBoss(): void {
		// boss turrets are currently the target
		if (this.bossTargetX === 140) {
			if (this.bossTextPromptCount === 3) {
				this.bossTextPromptCount = 0;
				// prompted three times, but launchpads already down, repeat
				if (this.bossLaunchpadHealth === 0) {
					this.launchMissiles();
				} else {
					// otherwise, move
					this.moveBossToLaunchShips();
				}
			} else if (this.bossTurretsHealth === 0) {
				// turrets down, launch ships exclusively
				this.moveBossToLaunchShips();
			} else {
				this.promptTurretBossText();
			}
		} else {
			if (this.bossTextPromptCount === 3) {
				this.bossTextPromptCount = 0;
				// prompted three times, but turrets already down, repeat
				if (this.bossTurretsHealth === 0) {
					this.launchShips();
				} else {
					// otherwise, move
					this.moveBossToLaunchMissiles();
				}
			} else if (this.bossLaunchpadHealth === 0) {
				// launchpads down, launch missiles exclusively
				this.moveBossToLaunchMissiles();
			} else {
				this.promptLaunchpadBossText();
			}
		}
	}

	private moveBossToLaunchShips(): void {
		let tween = this.game.add.tween(this.boss).to(
			{x: this.game.width / 2 + 120 }, 3000, Phaser.Easing.Linear.None, true
		);
		tween.onComplete.add(() => {
			this.launchShips();
		});
	}

	private moveBossToLaunchMissiles(): void {
		let tween = this.game.add.tween(this.boss).to(
			{x: this.game.width / 2 - 120 }, 3000, Phaser.Easing.Linear.None, true
		);
		tween.onComplete.add(() => {
			this.launchMissiles();
		});
	}

	protected typed(character: string): void {
		if (this.timer.paused) {
			// game is paused, ignore all input
			return;
		}

		if (this.inputText.text.length === 0) {
			for (let i = 0; i < this.projectiles.length; i++) {
				if (!this.projectiles[i].isIntercepted() && this.projectiles[i].matchesText(character)) {
					this.fireAt(this.projectiles[i]);
					return;
				}
			}
		}

		let prefix = this.inputText.text + character;
		if (this.wordManager.isValidRandomPrefix(prefix)) {
			for (let i = 0; i < this.ships.length; i++) {
				if (!this.ships[i].isIntercepted() && this.ships[i].matchesText(prefix)) {
					this.fireAt(this.ships[i]);
					return;
				}
			}
			
			for (let i = 0; i < this.projectiles.length; i++) {
				if (!this.projectiles[i].isIntercepted() && this.projectiles[i].matchesText(prefix)) {
					this.fireAt(this.projectiles[i]);
					return;
				}
			}

			if (this.bossText !== null && this.wordManager.matchesRandom(prefix, this.bossText.text)) {
				this.inputText.text = "";
				let bullet = this.bullets.getFirstExists(false);
				bullet.scale.setTo(0.5, 0.5);
				bullet.reset(this.player.x - 2, this.player.y - 12);
				this.game.add.tween(bullet).to(
					{ x: this.bossTargetX, y: 70 }, 500, Phaser.Easing.Linear.None, true
				);
				this.bossText.fill = "#ff8888";
				this.fire.play();

				let rotate = Phaser.Math.angleBetween(
					this.player.body.x, this.player.body.y, this.bossText.x, this.bossText.y);
				this.player.angle = Phaser.Math.radToDeg(rotate) + 90;
				bullet.angle = Phaser.Math.radToDeg(rotate) + 90;
				return;
			}

			this.inputText.text = prefix;
		}
	}

	private blink(sprite: Phaser.Sprite, delay: number, times: number): Phaser.Timer {
		let timer = this.game.time.create(true);
		for (let i = 0; i < times; i++) {
			timer.add(delay + (delay * 2* i), () => {
				sprite.alpha = 0;
			});
			timer.add((delay * 2) + (delay * 2 * i), () => {
				sprite.alpha = 1;
			});
		}
		return timer;
	}

	private fireAt(sprite: EnemySprite): void {
		this.inputText.text = "";
		let bullet = this.bullets.getFirstExists(false);
		bullet.scale.setTo(0.5, 0.5);
		bullet.reset(this.player.x - 2, this.player.y - 12);
		sprite.interceptedBy(bullet);
		this.fire.play();
		
		let rotate = Phaser.Math.angleBetween(this.player.body.x, this.player.body.y, sprite.getX(), sprite.getY());
		this.player.angle = Phaser.Math.radToDeg(rotate) + 90;
		bullet.angle = Phaser.Math.radToDeg(rotate) + 90;
	}

	public shutdown(): void {
		this.timer.destroy();
		super.shutdown();
	}

}

class EnemySprite {

	protected wordManager: WordManager;

	public sprite: Phaser.Sprite;

	protected text: Phaser.Text = null;

	private interception: Phaser.Sprite = null;

	constructor(wordManager: WordManager, sprite: Phaser.Sprite, health: number) {
		this.wordManager = wordManager;
		this.sprite = sprite;
		this.sprite.health = health;
	}

	public getX(): number {
		return this.sprite.body.x + (this.sprite.body.width / 2);
	}

	public getY(): number {
		return this.sprite.body.y + (this.sprite.body.height / 2);
	}

	public setText(text: Phaser.Text): void {
		this.text = text;
		text.x = this.sprite.body.x;
		text.y = this.sprite.body.y - 25;
	}

	public matchesText(text: string): boolean {
		return this.text.text === text;
	}

	public contains(sprite: Phaser.Sprite): boolean {
		return this.sprite === sprite;
	}

	public isInterceptedBy(interception: Phaser.Sprite): boolean {
		return this.interception === interception;
	}

	public isIntercepted(): boolean {
		return this.interception !== null;
	}

	public interceptedBy(interception: Phaser.Sprite): void {
		this.interception = interception;
		this.sprite.game.add.tween(this.interception).to(
			{ x: this.sprite.body.x + (this.sprite.body.width / 2),
				y: this.sprite.body.y + (this.sprite.body.height / 2) },
			500, Phaser.Easing.Linear.None, true
		);
		this.text.fill = "#ff8888";
	}

	public update(): void {
		if (this.text !== null) {
			this.text.x = this.sprite.body.x;
			this.text.y = this.sprite.body.y - 25;
		}
	}

	public damage(): void {
		this.sprite.damage(1);
		this.text.kill();
		this.text = null;
		if (this.interception !== null) {
			this.interception.kill();
			this.interception = null;
		}
	}

	public alive(): boolean {
		return this.sprite.health !== 0;
	}

	public detachText(): void {
		this.wordManager.removeRandom(this.text.text);
		this.text.kill();
		this.text = null;
	}

	public hasTextAttached(): boolean {
		return this.text !== null;
	}

	public isAttachedTo(text: Phaser.Text): boolean {
		return this.text === text;
	}
}

class EnemyShip extends EnemySprite {

	constructor(wordManager: WordManager, enemy: Phaser.Sprite, health: number) {
		super(wordManager, enemy, 2);
		enemy.anchor.setTo(0.5);
		enemy.scale.setTo(0.3);
		enemy.angle = 90;
	}

	public matchesText(text: string): boolean {
		return this.hasTextAttached() && this.wordManager.matchesRandom(text, this.text.text);
	}
}

class EnemyProjectile extends EnemySprite {

	constructor(wordManager: WordManager, player: Phaser.Sprite, enemy: Phaser.Sprite, projectile: Phaser.Sprite, timeToImpact: number) {
		super(wordManager, projectile, 1);

		let rotate = Phaser.Math.angleBetween(enemy.body.x, enemy.body.y, player.body.x, player.body.y);
		projectile.angle = Phaser.Math.radToDeg(rotate) + 90;
		projectile.scale.setTo(0.5);
		projectile.anchor.setTo(0.5);
		projectile.reset(enemy.x, enemy.y);
		player.game.add.tween(projectile).to(
			{ x: player.body.x + (player.body.width / 2),
				y: player.body.y + (player.body.height / 2) },
			timeToImpact, Phaser.Easing.Linear.None, true
		);

		let letter = player.game.add.text(
			0, 0, (player.game as Aether).getWordManager().getRandomLetter(),
			{ font: 'bold 16pt Arial', fill: "#88FF88" }
		);
		letter.anchor.set(0.5);
		letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		this.setText(letter);
	}
}

class EnemyMissile extends EnemySprite {
	
	private smoke: Phaser.Sprite;

	constructor(wordManager: WordManager, missile: Phaser.Sprite) {
		super(wordManager, missile, 1);
		
		missile.angle = 90;
		missile.anchor.setTo(0.5);
		missile.scale.setTo(0.8);
		missile.game.physics.arcade.enable(missile);

		this.smoke = missile.game.add.sprite(-3, 17, 'sheet', 'PNG/Effects/spaceEffects_007.png');
		this.smoke.alpha = 0;
		this.smoke.scale.setTo(0.5, 0.25);
		missile.addChild(this.smoke);
	}

	public fire(player: Phaser.Sprite, x: number, y: number, moveDelay: number, fireDelay: number, callback: Function) {
		let rotate = Phaser.Math.angleBetween(x, y, player.body.x, player.body.y);
		let angle = Phaser.Math.radToDeg(rotate) + 90;
		let moveTween = player.game.add.tween(this.sprite).to(
			{ x: x, y: y, angle: angle }, moveDelay, Phaser.Easing.Linear.None, true);

		moveTween.onComplete.add(() => {
			let letter = this.sprite.game.add.text(0, 0, this.wordManager.getRandomWord(false),
				{ font: 'bold 16pt Arial', fill: "#88FF88" }
			);
			letter.anchor.set(0.5);
			letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
			this.setText(letter);
			this.fireAtPlayer(player, this.sprite, fireDelay, moveDelay, callback);
		});

		player.game.add.tween(this.smoke).to({ alpha: 1 }, moveDelay / 2, Phaser.Easing.Linear.None, true, 0, 0, true);
	}

	private fireAtPlayer(player: Phaser.Sprite, missile: Phaser.Sprite, fireDelay, moveDelay, callback: Function) {
		let tween = player.game.add.tween(missile).to(
			{ x: player.body.x + (player.body.width / 2),
				y: player.body.y + (player.body.height / 2),
					},
			fireDelay, Phaser.Easing.Linear.None, true, moveDelay
		);
		tween.onComplete.add(callback);
		player.game.add.tween(this.smoke).to({ alpha: 1 }, fireDelay, Phaser.Easing.Linear.None, true, moveDelay);
	}

	public matchesText(text: string): boolean {
		return this.hasTextAttached() && this.wordManager.matchesRandom(text, this.text.text);
	}
}

class GameOver extends Phaser.State {

	/**
	 * The text field to display the user's score.
	 */
	private scoreText: Phaser.Text;

	private difficultyKey: string;

	/**
	 * The user's score.
	 */
	private score: number;

	/**
	 * The current number that is being displayed to the user.
	 */
	private current: number = 0;

	/**
	 * The amount that should be used to increment the rendered score
	 * before stopping at the user's final score.
	 */
	private increment: number;

	public init(difficulty: Difficulty, score: number) {
		if ((this.game as Aether).isCustom()) {
			this.difficultyKey = DIFFICULTY_CUSTOM;
		} else {
			switch (difficulty) {
				case Difficulty.EASY:
					this.difficultyKey = DIFFICULTY_EASY;
					break;
				case Difficulty.MEDIUM:
					this.difficultyKey = DIFFICULTY_MEDIUM;
					break;
				case Difficulty.HARD:
					this.difficultyKey = DIFFICULTY_HARD;
					break;
			}
		}
		this.score = score;
		this.increment = this.score / 100;
	}

	public create(): void {
		let aether = (this.game as Aether);
		let bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
		bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);

		let gameOverText = this.game.add.text(
			this.game.width / 2, this.game.height / 10 * 2,
			aether.getLocalizedString(GAME_OVER),
			{ fontSize: '48px', fill: '#ffffff' });
		gameOverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		gameOverText.anchor.setTo(0.5, 0.5);

		let difficultyText = this.game.add.text(
			this.game.width / 2, this.game.height / 10 * 4,
			aether.getLocalizedString(this.difficultyKey),
			{ fontSize: '28px', fill: '#ffffff', align: 'center' });
		difficultyText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		difficultyText.anchor.setTo(0.5, 0.5);

		this.scoreText = this.game.add.text(
			this.game.width / 2, this.game.height / 10 * 5,
			aether.getLocalizedString(SCORE) + ": 0",
			{ fontSize: '28px', fill: '#ffffff', align: 'center' });
		this.scoreText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		this.scoreText.anchor.setTo(0.5, 0.5);

		let titleText = this.game.add.text(
			this.game.width / 2, this.game.height / 10 * 7,
			aether.getLocalizedString(RETURN_MAIN),
			{ fontSize: '28px', fill: '#ffffff', align: 'center' });
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

	public update(): void {
		if (this.current !== this.score) {
			// increment the score
			this.current = this.current + this.increment;
			if (this.current > this.score) {
				// set the score definitely due to decimals
				this.current = this.score;
			}
			// don't show decimals to the user
			this.scoreText.text = (this.game as Aether).getLocalizedString(SCORE) + ": " + Math.floor(this.current);
		}
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

	private englishDays = [
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	];
	private japaneseDays = [
		"日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"
	];

	private englishMonths = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];
	private japaneseMonths = [
		"一月", "二月", "三月", "四月", "五月", "六月",
		"七月", "八月", "九月", "十月", "十一月", "十二月"
	];
	
	private englishWords: string[][] = [
		this.englishNumbers, this.englishColors, this.englishSports, this.englishDays, this.englishMonths
	];
	private japaneseWords: string[][] = [
		this.japaneseNumbers, this.japaneseColors, this.japaneseSports, this.japaneseDays, this.japaneseMonths
	];
	private set: number;

	private englishAll: string[] = [];
	private japaneseAll: string[] = [];

	/**
	 * An array that corresponds to the words that have already been
	 * processed.
	 */
	private done: boolean[] = [];

	private allDone: boolean[] = [];

	private english: string[];
	private japanese: string[];
	
	private pending: string[] = [];
	private pendingTranslation: string[] = [];

	/**
	 * Whether words should be used or just the characters from the
	 * English alphabet.
	 */
	private useWords: boolean = true;

	private alphabet: string[] = [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
		'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	];

	constructor() {
		this.reset();

		this.englishAll = this.englishAll.concat(
			this.englishNumbers, this.englishColors, this.englishSports, this.englishDays, this.englishMonths
		);
		this.japaneseAll = this.japaneseAll.concat(
			this.japaneseNumbers, this.japaneseColors, this.japaneseSports, this.japaneseDays, this.japaneseMonths
		);
		
		for (let i = 0; i < this.englishAll.length; i++) {
			this.allDone[i] = false;	
		}
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
	 * Checks whether the given string is a valid prefix of a pending
	 * word.
	 * 
	 * @param prefix the string the check
	 * @return <tt>true</tt> if the string is a prefix of a pending
	 * word, <tt>false</tt> otherwise
	 */
	public isValidPrefix(prefix: string): boolean {
		let valid = false;
		let length = prefix.length;
		for (let i = 0; i < this.pending.length; i++) {
			if (this.pending[i].substr(0, length) === prefix) {
				valid = true;
				break;
			}
		}
		return valid;
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

	/**
	 * Returns a random lowercased letter from the English alphabet.
	 * 
	 * @return a random lowercased letter in the English alphabet 
	 */
	public getRandomLetter(): string {
		let index = Math.floor(Math.random() * 26);
		return this.alphabet[index];
	}

	public isValidRandomPrefix(prefix: string): boolean {
		let length = prefix.length;
		for (let i = 0; i < this.pending.length; i++) {
			if (this.pending[i].substr(0, length) === prefix) {
				return true;
			}
		}
		return false;
	}

	public removeRandom(translation: string): void {
		let index = this.pendingTranslation.indexOf(translation);
		if (index !== -1) {
			this.pendingTranslation.splice(index, 1);
			this.pending.splice(index, 1);
		}
	}

	public matchesRandom(input: string, translation: string): boolean {
		let index = this.pending.indexOf(input);
		if (index === this.pendingTranslation.indexOf(translation)) {
			this.pending.splice(index, 1);
			this.pendingTranslation.splice(index, 1);
			return true;
		}
		return false;
	}

	public getRandomWord(repeats: boolean): string {
		if (!this.useWords) {
			let letter = this.getRandomLetter();
			this.pending.push(letter);
			this.pendingTranslation.push(letter);
			return letter;
		}

		let index = Math.floor(Math.random() * this.englishAll.length);
		if (repeats) {
			let filled = true;
			for (let i = 0; i < this.allDone.length; i++) {
				if (!this.allDone[i]) {
					filled = false;
					break;
				}
			}

			if (filled) {
				for (let i = 0; i < this.allDone.length; i++) {
					this.allDone[i] = false;
				}
			} else {
				while (this.allDone[index]) {
					index = Math.floor(Math.random() * this.englishAll.length);
				}
			}
			this.allDone[index] = true;
		}
		this.pending.push(this.englishAll[index]);
		this.pendingTranslation.push(this.japaneseAll[index]);
		return this.japaneseAll[index];
	}

	/**
	 * Reads the given set of files and uses those words as the word
	 * list.
	 * 
	 * @param files the list of files to read, must not be <tt>null</tt>
	 * @param callback the callback to execute, must not be
	 * <tt>null</tt>
	 */
	public readFiles(files: Blob[], callback: Function) {
		let wordCounter = 0;
		let fileCounter = 0;
		let english = [];
		let japanese = [];
		let reader = new FileReader();
		
		reader.onload = () => {
			var text = reader.result;
			var strings = text.split("\r");
			for (var i = 0; i < strings.length / 2; i++) {
				english[wordCounter] = strings[i * 2].trim();
				japanese[wordCounter] = strings[(i * 2) + 1].trim();
				wordCounter++;
			}

			fileCounter++;

			if (fileCounter !== files.length) {
				reader.readAsText(files[fileCounter], "UTF-8");
			} else {
				this.englishAll = english;
				this.japaneseAll = japanese;
				this.englishWords = [ english ];
				this.japaneseWords = [ japanese ];
				this.reset();
				callback.call(null);
			}
		};

		reader.readAsText(files[fileCounter], "UTF-8");
	}

}

const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const CUSTOM = "CUSTOM";
const DIFFICULTY_EASY = "DIFFICULTY_EASY";
const DIFFICULTY_MEDIUM = "DIFFICULTY_MEDIUM";
const DIFFICULTY_HARD = "DIFFICULTY_HARD";
const DIFFICULTY_CUSTOM = "DIFFICULTY_CUSTOM";
const SCORE = "SCORE";
const RETURN_MAIN = "RETURN_MAIN";
const GAME_OVER = "GAME_OVER";

class Localization {

	english = {
		EASY: "Easy",
		MEDIUM: "Medium",
		HARD: "Hard",
		CUSTOM: "Custom",
		DIFFICULTY_EASY: "Difficulty: Easy",
		DIFFICULTY_MEDIUM: "Difficulty: Medium",
		DIFFICULTY_HARD: "Difficulty: Hard",
		DIFFICULTY_CUSTOM: "Difficulty: Custom",
		SCORE: "Score",
		RETURN_MAIN: "Return to Main Menu",
		GAME_OVER: "Game Over"
	};

	japanese = {
		EASY: "易しい",
		MEDIUM: "普通",
		HARD: "難しい",
		CUSTOM: "カスタム",
		DIFFICULTY_EASY: "難易度: 易しい",
		DIFFICULTY_MEDIUM: "難易度: 普通",
		DIFFICULTY_HARD: "難易度: 難しい",
		DIFFICULTY_CUSTOM: "難易度: カスタム",
		SCORE: "スコア",
		RETURN_MAIN: "メインメニューに戻る",
		GAME_OVER: "ゲームオーバー"
	};

	public getString(language: Language, key: string): string {
		switch (language) {
			case Language.ENGLISH:
				return this.english[key];
			case Language.JAPANESE:
				return this.japanese[key];
		}
		return null;
	}
}

window.onload = () => {
	var game = new Aether();
}
