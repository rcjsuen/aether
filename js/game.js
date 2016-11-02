var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Language;
(function (Language) {
    Language[Language["ENGLISH"] = 0] = "ENGLISH";
    Language[Language["JAPANESE"] = 1] = "JAPANESE";
})(Language || (Language = {}));
var Aether = (function (_super) {
    __extends(Aether, _super);
    function Aether() {
        _super.call(this, 360, 640, Phaser.CANVAS, '');
        this.wordManager = new WordManager();
        this.localization = new Localization();
        this.language = Language.JAPANESE;
        this.custom = false;
        this.lives = 2;
        this.state.add('boot', Boot, true);
        this.state.add('language', LanguageScreen);
        this.state.add('title', TitleScreen);
        this.state.add('level', Level);
        this.state.add('boss', BossStage);
        this.state.add('gameover', GameOver);
    }
    Aether.prototype.getWordManager = function () {
        return this.wordManager;
    };
    Aether.prototype.setLanguage = function (language) {
        this.language = language;
    };
    Aether.prototype.getLocalizedString = function (key) {
        return this.localization.getString(this.language, key);
    };
    Aether.prototype.setCustom = function (custom) {
        this.custom = custom;
    };
    Aether.prototype.isCustom = function () {
        return this.custom;
    };
    Aether.prototype.loseLife = function () {
        this.lives--;
    };
    Aether.prototype.getLives = function () {
        return this.lives;
    };
    return Aether;
}(Phaser.Game));
var Boot = (function (_super) {
    __extends(Boot, _super);
    function Boot() {
        _super.apply(this, arguments);
    }
    Boot.prototype.preload = function () {
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
    };
    Boot.prototype.create = function () {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.plugins.add(Phaser.Plugin.SaveCPU);
        this.game.state.start('language');
    };
    return Boot;
}(Phaser.State));
var LanguageScreen = (function (_super) {
    __extends(LanguageScreen, _super);
    function LanguageScreen() {
        _super.apply(this, arguments);
    }
    LanguageScreen.prototype.create = function () {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'sheet', 'Backgrounds/purple.png');
        this.background.autoScroll(0, 50);
        this.englishText = this.createText(this.game.height / 100 * 45, "English", Language.ENGLISH);
        this.japaneseText = this.createText(this.game.height / 100 * 55, "日本語", Language.JAPANESE);
    };
    LanguageScreen.prototype.createText = function (y, content, language) {
        var _this = this;
        var languageText = this.game.add.text(this.game.width / 2, y, content, { fontSize: '28px', fill: '#ffffff' });
        languageText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        languageText.anchor.setTo(0.5, 0.5);
        languageText.inputEnabled = true;
        languageText.events.onInputOver.add(function () {
            languageText.fill = "#88ff88";
        });
        languageText.events.onInputOut.add(function () {
            languageText.fill = "#ffffff";
        });
        languageText.events.onInputDown.add(function () {
            _this.fadeTexts();
            _this.game.setLanguage(language);
            setTimeout(function () {
                _this.tilePositionY = _this.background.tilePosition.y;
                _this.game.state.start('title', true, false, _this.tilePositionY);
            }, 1000);
        });
        return languageText;
    };
    LanguageScreen.prototype.fadeTexts = function () {
        this.game.add.tween(this.englishText).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
        this.game.add.tween(this.japaneseText).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
    };
    return LanguageScreen;
}(Phaser.State));
var TitleScreen = (function (_super) {
    __extends(TitleScreen, _super);
    function TitleScreen() {
        _super.apply(this, arguments);
        this.timeElapsed = -1;
    }
    TitleScreen.prototype.init = function (tilePositionY) {
        this.timeElapsed = -1;
        this.tilePositionY = tilePositionY;
    };
    TitleScreen.prototype.create = function () {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'sheet', 'Backgrounds/purple.png');
        this.background.tilePosition.y = this.tilePositionY;
        this.background.autoScroll(0, 50);
        this.titleText = this.game.add.text(this.game.width / 2, this.game.height / 4, "Aether", { fontSize: '64px', fill: '#ffffff' });
        this.titleText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.titleText.anchor.setTo(0.5, 0.5);
        var aether = this.game;
        this.easyText = this.createDifficultyText(aether.getLocalizedString(EASY), 300, Difficulty.EASY);
        this.normalText = this.createDifficultyText(aether.getLocalizedString(MEDIUM), 350, Difficulty.MEDIUM);
        this.hardText = this.createDifficultyText(aether.getLocalizedString(HARD), 400, Difficulty.HARD);
        this.customText = this.createCustomText(aether.getLocalizedString(CUSTOM), 450);
        this.ship = this.game.add.sprite(this.game.width / 2, 500, 'sheet', 'PNG/playerShip1_red.png');
        this.ship.scale.setTo(0.5, 0.5);
        this.ship.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.ship);
    };
    TitleScreen.prototype.fadeOut = function () {
        this.applyFade(this.titleText);
        this.applyFade(this.easyText);
        this.applyFade(this.normalText);
        this.applyFade(this.hardText);
        this.applyFade(this.customText);
        this.applyFade(this.background);
    };
    TitleScreen.prototype.applyFade = function (sprite) {
        this.game.add.tween(sprite).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
    };
    TitleScreen.prototype.createText = function (content, y) {
        var startText = this.game.add.text(this.game.width / 2, y, content, { fontSize: '28px', fill: '#ffffff' });
        startText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        startText.anchor.setTo(0.5, 0.5);
        startText.inputEnabled = true;
        startText.events.onInputOver.add(function () {
            startText.fill = "#88ff88";
        });
        startText.events.onInputOut.add(function () {
            startText.fill = "#ffffff";
        });
        return startText;
    };
    TitleScreen.prototype.createDifficultyText = function (content, y, difficulty) {
        var _this = this;
        var startText = this.createText(content, y);
        startText.events.onInputDown.add(function () {
            _this.ship.body.velocity.y = -300;
            _this.difficulty = difficulty;
            _this.game.setCustom(false);
        });
        return startText;
    };
    TitleScreen.prototype.createCustomText = function (content, y) {
        var _this = this;
        var text = this.createText(content, y);
        text.events.onInputDown.add(function () {
            var input = document.createElement("input");
            input.setAttribute("type", "file");
            input.addEventListener("change", function (event) {
                var aether = _this.game;
                var wordManager = aether.getWordManager();
                if (event.target.files.length !== 0) {
                    _this.difficulty = Difficulty.MEDIUM;
                    wordManager.readFiles(event.target.files, function () {
                        _this.ship.body.velocity.y = -300;
                        aether.setCustom(true);
                    });
                }
            });
            input.click();
        });
        return text;
    };
    TitleScreen.prototype.update = function () {
        if (this.ship !== null && !this.ship.inWorld) {
            this.timeElapsed = this.game.time.time;
            this.fadeOut();
            this.ship.kill();
            this.ship = null;
        }
        if (this.timeElapsed !== -1 && this.game.time.time > this.timeElapsed + 1000) {
            this.game.state.start('level', true, false, this.difficulty);
        }
    };
    return TitleScreen;
}(Phaser.State));
var Difficulty;
(function (Difficulty) {
    Difficulty[Difficulty["EASY"] = 0] = "EASY";
    Difficulty[Difficulty["MEDIUM"] = 1] = "MEDIUM";
    Difficulty[Difficulty["HARD"] = 2] = "HARD";
})(Difficulty || (Difficulty = {}));
var ENEMY_MOVE_SPEED = 10;
var ENEMY_BULLET_MOVE_SPEED = 40;
var ENEMY_MOVE_SPEED_FACTOR = 5;
var Stage = (function (_super) {
    __extends(Stage, _super);
    function Stage() {
        _super.apply(this, arguments);
        this.phaserKeys = [
            Phaser.Keyboard.A, Phaser.Keyboard.B, Phaser.Keyboard.C, Phaser.Keyboard.D, Phaser.Keyboard.E, Phaser.Keyboard.F,
            Phaser.Keyboard.G, Phaser.Keyboard.H, Phaser.Keyboard.I, Phaser.Keyboard.J, Phaser.Keyboard.K,
            Phaser.Keyboard.L, Phaser.Keyboard.M, Phaser.Keyboard.N, Phaser.Keyboard.O, Phaser.Keyboard.P,
            Phaser.Keyboard.Q, Phaser.Keyboard.R, Phaser.Keyboard.S, Phaser.Keyboard.T, Phaser.Keyboard.U,
            Phaser.Keyboard.V, Phaser.Keyboard.W, Phaser.Keyboard.X, Phaser.Keyboard.Y, Phaser.Keyboard.Z
        ];
        this.keys = [
            'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p',
            'q', 'r', 's', 't', 'u',
            'v', 'w', 'x', 'y', 'z',
        ];
        this.score = 0;
        this.shiftState = false;
        this.lives = [];
        this.player = null;
        this.shield = null;
        this.initialShieldHealth = 0;
        this.enemies = null;
    }
    Stage.prototype.preload = function () {
        var _this = this;
        this.backspaceListener = function (event) {
            if (event.keyCode == 8) {
                event.preventDefault();
                if (_this.inputText.text.length > 0) {
                    _this.inputText.text = _this.inputText.text.substring(0, _this.inputText.text.length - 1);
                }
            }
        };
        window.addEventListener("keydown", this.backspaceListener, false);
    };
    Stage.prototype.setInitialShieldHealth = function (initialShieldHealth) {
        this.initialShieldHealth = initialShieldHealth;
    };
    Stage.prototype.createAudio = function () {
        this.fire = this.game.add.audio('fire');
        this.explosion = this.game.add.audio('explosion');
        this.explosion.volume = 0.1;
        this.shieldUp = this.game.add.audio('shieldUp');
        this.shieldDown = this.game.add.audio('shieldDown');
    };
    Stage.prototype.createBackground = function () {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'sheet', 'Backgrounds/purple.png');
        this.startScrolling();
    };
    Stage.prototype.createScoreText = function () {
        this.scoreText = this.game.add.text(16, 16, this.game.getLocalizedString(SCORE) + ": " + this.score, { fontSize: '16px', fill: '#ffffff' });
    };
    Stage.prototype.updateScore = function (increment) {
        this.score += increment;
        this.scoreText.text = this.game.getLocalizedString(SCORE) + ": " + this.score;
    };
    Stage.prototype.createInputText = function () {
        this.inputText = this.game.add.text(this.game.width / 2, 460, null, { align: 'center', fontSize: '32px', fill: '#ffffff' });
        this.inputText.anchor.setTo(0.5, 0.5);
    };
    Stage.prototype.createLives = function () {
        var lives = this.game.getLives();
        if (lives === 1) {
            this.lives[0] = this.game.add.sprite(this.game.width - 50, 16, 'sheet', 'PNG/UI/playerLife1_red.png');
        }
        else if (lives === 2) {
            this.lives[0] = this.game.add.sprite(this.game.width - 50, 16, 'sheet', 'PNG/UI/playerLife1_red.png');
            this.lives[1] = this.game.add.sprite(this.game.width - 50, 48, 'sheet', 'PNG/UI/playerLife1_red.png');
        }
    };
    Stage.prototype.createPlayer = function () {
        this.player = this.game.add.sprite(this.game.width / 2, 400, 'sheet', 'PNG/playerShip1_red.png');
        this.player.health = 3;
        this.player.scale.setTo(0.5, 0.5);
        this.player.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.player);
    };
    Stage.prototype.createKeys = function () {
        this.buttons = this.game.add.group();
        this.buttons.enableBody = true;
        var scaling = 0.45;
        var scalingY = 0.50;
        var initialOffsetX = 0;
        var initialOffsetY = 480;
        var offset = 30 + 5;
        var row = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
        var row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
        var row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
        for (var i = 0; i < row.length; i++) {
            var button = this.buttons.create(initialOffsetX + (offset * i), initialOffsetY, 'sheet', 'keyboard/letters/Keyboard_White_' + row[i] + '.png');
            button.scale.setTo(scaling, scalingY);
            button.inputEnabled = true;
            var character = row[i];
            button.events.onInputDown.add(this.internalTyped(character), this);
        }
        for (var i = 0; i < row2.length; i++) {
            var button = this.buttons.create(initialOffsetX + 18 + (offset * i), initialOffsetY + 50, 'sheet', 'keyboard/letters/Keyboard_White_' + row2[i] + '.png');
            button.scale.setTo(scaling, scalingY);
            button.inputEnabled = true;
            var character = row2[i];
            button.events.onInputDown.add(this.internalTyped(character), this);
        }
        for (var i = 0; i < row3.length; i++) {
            var button = this.buttons.create(initialOffsetX + 35 + (offset * i), initialOffsetY + 100, 'sheet', 'keyboard/letters/Keyboard_White_' + row3[i] + '.png');
            button.scale.setTo(scaling, scalingY);
            button.inputEnabled = true;
            var character = row3[i];
            button.events.onInputDown.add(this.internalTyped(character), this);
        }
        var shiftButton = this.buttons.create(initialOffsetX, initialOffsetY + 100, 'sheet', 'keyboard/functions/Keyboard_White_Arrow_Up.png');
        shiftButton.scale.setTo(scaling, scalingY);
        shiftButton.inputEnabled = true;
        shiftButton.events.onInputDown.add(function () {
            this.shiftState = !this.shiftState;
        }, this);
        var backspaceButton = this.buttons.create(initialOffsetX + 40 + (offset * 7), initialOffsetY + 100, 'sheet', 'keyboard/functions/Keyboard_White_Backspace_Alt.png');
        backspaceButton.scale.setTo(scaling, scalingY);
        backspaceButton.inputEnabled = true;
        backspaceButton.events.onInputDown.add(function () {
            if (this.inputText.text.length > 0) {
                this.inputText.text = this.inputText.text.substring(0, this.inputText.text.length - 1);
            }
        }, this);
    };
    Stage.prototype.internalTyped = function (character) {
        var _this = this;
        return function () {
            _this.typed(_this.shiftState ? character.toUpperCase() : character.toLowerCase());
            _this.shiftState = false;
        };
    };
    Stage.prototype.createBackgroundAssets = function () {
        this.createAudio();
        this.createBackground();
    };
    Stage.prototype.createUI = function () {
        var _this = this;
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
        this.bullets.createMultiple(32, 'sheet', 'PNG/Lasers/laserBlue01.png', false);
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
        this.enemyBulletsGroup = this.game.add.physicsGroup();
        this.enemyBulletsGroup.createMultiple(32, 'sheet', 'PNG/Lasers/laserGreen13.png', false);
        this.enemyBulletsGroup.setAll('checkWorldBounds', true);
        this.enemyBulletsGroup.setAll('outOfBoundsKill', true);
        this.createKeys();
        for (var i = 0; i < this.keys.length; i++) {
            var key_1 = this.game.input.keyboard.addKey(this.phaserKeys[i]);
            var character = this.keys[i];
            key_1.onDown.add(this.internalTyped(character), this);
        }
        var key = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        key.onDown.add(function () {
            _this.shiftState = true;
        }, this);
        key.onUp.add(function () {
            _this.shiftState = false;
        }, this);
    };
    Stage.prototype.stopScrolling = function () {
        this.background.autoScroll(0, 0);
    };
    Stage.prototype.startScrolling = function () {
        this.background.autoScroll(0, 50);
    };
    Stage.prototype.createShieldPowerUp = function (enemy) {
        if (Math.random() > 0.1) {
            return;
        }
        var slope = (this.player.body.y - enemy.body.y) / (this.player.body.x - enemy.body.x);
        var powerUp = this.shields.create(enemy.body.x + (enemy.body.width / 2), enemy.body.y + (enemy.body.height / 2), 'sheet', 'PNG/Power-ups/shield_silver.png');
        this.game.physics.enable(powerUp);
        powerUp.anchor.setTo(0.5, 0.5);
        powerUp.scale.setTo(0.5, 0.5);
        powerUp.body.velocity.x = 100 / slope;
        powerUp.body.velocity.y = 100;
    };
    Stage.prototype.grantShield = function (health) {
        if (this.shield === null) {
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
    };
    Stage.prototype.grantShieldFromPowerUp = function (player, powerUp) {
        powerUp.kill();
        if (this.grantShield(3)) {
            this.shield.alpha = 0;
        }
        this.game.add.tween(this.shield).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);
        this.shieldUp.play();
    };
    Stage.prototype.decreaseShieldHealth = function () {
        this.shieldDown.play();
        this.shield.damage(1);
        var alpha = this.shield.health / this.shield.maxHealth;
        this.game.add.tween(this.shield).to({ alpha: alpha }, 1000, Phaser.Easing.Linear.None, true);
        if (this.shield.health === 0) {
            this.shield = null;
        }
    };
    Stage.prototype.animateDeath = function (enemy) {
        var smoke = this.game.add.sprite(enemy.body.x + (enemy.body.width / 2), enemy.body.y + (enemy.body.height / 2), 'sheet', 'PNG/Effects/spaceEffects_016.png');
        smoke.anchor.setTo(0.5, 0.5);
        smoke.animations.add('run', ['PNG/Effects/spaceEffects_015.png', 'PNG/Effects/spaceEffects_014.png', 'PNG/Effects/spaceEffects_013.png',
            'PNG/Effects/spaceEffects_012.png', 'PNG/Effects/spaceEffects_011.png', 'PNG/Effects/spaceEffects_010.png',
            'PNG/Effects/spaceEffects_009.png', 'PNG/Effects/spaceEffects_008.png',], 10, false);
        smoke.animations.play('run', 10, false, true);
        this.explosion.play();
    };
    Stage.prototype.loseLife = function () {
        this.game.loseLife();
        if (this.lives.length > 0) {
            this.lives[this.lives.length - 1].kill();
            this.lives.splice(this.lives.length - 1, 1);
            return true;
        }
        this.endGame();
        return false;
    };
    Stage.prototype.endGame = function () {
        this.game.state.start('gameover', true, false, this.difficulty, this.score);
    };
    Stage.prototype.shutdown = function () {
        window.removeEventListener("keydown", this.backspaceListener, false);
    };
    return Stage;
}(Phaser.State));
var Level = (function (_super) {
    __extends(Level, _super);
    function Level() {
        _super.apply(this, arguments);
        this.waitTime = 5000;
        this.wordCount = 0;
        this.words = [];
        this.sprites = [];
        this.enemyBullets = [];
        this.enemyLetters = [];
        this.targets = [];
        this.level = 1;
        this.finished = false;
        this.haltEnemySpawns = false;
    }
    Level.prototype.init = function (difficulty) {
        this.wordManager = this.game.getWordManager();
        if (this.player !== null) {
            this.enemyBulletsGroup.forEach(function (sprite) {
                sprite.kill();
            }, this);
            this.enemies.forEach(function (sprite) {
                sprite.kill();
            }, this);
            this.words.forEach(function (sprite) {
                sprite.kill();
            }, this);
            for (var i = 0; i < this.enemyLetters.length; i++) {
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
            this.enemyLetters = [];
            this.player = null;
            this.wordManager.reset();
        }
        this.difficulty = difficulty;
        this.wordManager.shouldUseWords(difficulty !== Difficulty.EASY);
    };
    Level.prototype.create = function () {
        this.createBackgroundAssets();
        this.createUI();
        this.gameTime = this.game.time.time;
    };
    Level.prototype.intercept = function (character) {
        if (this.inputText.text.trim().length > 0) {
            return false;
        }
        for (var i = 0; i < this.enemyLetters.length; i++) {
            if (this.enemyLetters[i] !== null && this.enemyLetters[i] !== undefined) {
                if (this.enemyLetters[i].text === character) {
                    for (var j = 0; j < this.targets.length; j++) {
                        if (this.targets[j] === this.enemyBullets[i]) {
                            return false;
                        }
                    }
                    this.inputText.text = "";
                    var bullet = this.bullets.getFirstExists(false);
                    if (bullet) {
                        this.player.angle = 0;
                        bullet.angle = 0;
                        this.fire.play();
                        bullet.scale.setTo(0.5, 0.5);
                        bullet.reset(this.player.x - 2, this.player.y - 12);
                        bullet.body.velocity.x = -this.enemyBullets[i].body.velocity.x * 3;
                        bullet.body.velocity.y = -this.enemyBullets[i].body.velocity.y * 3;
                        var index = this.bullets.getChildIndex(bullet);
                        this.targets[index] = this.enemyBullets[i];
                        this.enemyLetters[i].fill = "#ff8888";
                    }
                    return true;
                }
            }
        }
        return false;
    };
    Level.prototype.typed = function (character) {
        if (this.difficulty === Difficulty.EASY) {
            var word = this.wordManager.completed(character);
            if (word !== null) {
                for (var i = 0; i < this.words.length; i++) {
                    if (this.words[i] !== null && this.words[i].text === word) {
                        this.words[i].fill = "#ff8888";
                        this.fireBullet(this.sprites[i]);
                        break;
                    }
                }
            }
        }
        else {
            var prefix = this.inputText.text + character;
            if ((prefix.length === 1 && this.intercept(character)) ||
                !this.wordManager.isValidPrefix(prefix)) {
                return;
            }
            this.inputText.text = prefix;
            var word = this.wordManager.completed(this.inputText.text);
            if (word !== null) {
                for (var i = 0; i < this.words.length; i++) {
                    if (this.words[i] !== null && this.words[i].text === word) {
                        this.words[i].fill = "#ff8888";
                        this.fireBullet(this.sprites[i]);
                        this.inputText.text = "";
                        break;
                    }
                }
            }
        }
    };
    Level.prototype.update = function () {
        if (this.finished) {
            var cleared = true;
            for (var i_1 = 0; i_1 < this.sprites.length; i_1++) {
                if (this.sprites[i_1] !== null) {
                    cleared = false;
                    break;
                }
            }
            if (cleared) {
                for (var i_2 = 0; i_2 < this.enemyBullets.length; i_2++) {
                    if (this.enemyBullets[i_2] !== null) {
                        cleared = false;
                        break;
                    }
                }
            }
            if (cleared) {
                var shieldHealth = this.shield === null ? 0 : this.shield.health;
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
            var word = this.wordManager.getNextWord();
            if (word === null) {
                if (this.difficulty === Difficulty.EASY || !this.wordManager.goToNextSet()) {
                    this.finished = true;
                }
                word = this.wordManager.getNextWord();
            }
            if (!this.finished) {
                this.createEnemy(word);
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
            this.player.body.velocity.y = 0;
            this.player.body.y = 400;
            this.startScrolling();
            this.haltEnemySpawns = false;
            this.gameTime = this.game.time.time;
        }
        this.game.physics.arcade.overlap(this.bullets, this.sprites, this.destroy, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyBulletsGroup, this.destroy2, null, this);
        if (this.shield !== null) {
            this.game.physics.arcade.overlap(this.shield, this.sprites, this.shieldDamagedByShip, null, this);
            this.game.physics.arcade.overlap(this.shield, this.enemyBulletsGroup, this.shieldDamagedByBullet, null, this);
        }
        this.game.physics.arcade.overlap(this.player, this.sprites, this.damageShip, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyBulletsGroup, this.damage, null, this);
        this.game.physics.arcade.overlap(this.buttons, this.sprites, this.buttonsCollided, null, this);
        this.game.physics.arcade.overlap(this.player, this.shields, this.grantShieldFromPowerUp, null, this);
    };
    Level.prototype.fireEnemyBullet = function (attackingEnemy, letterIndex) {
        var rotate = Phaser.Math.angleBetween(attackingEnemy.body.x, attackingEnemy.body.y, this.player.body.x, this.player.body.y);
        rotate = Phaser.Math.radToDeg(rotate) + 90;
        var slope = (this.player.body.y - attackingEnemy.body.y) / (this.player.body.x - attackingEnemy.body.x);
        var enemyBullet = this.enemyBulletsGroup.getFirstExists(false);
        if (enemyBullet) {
            this.fire.play();
            enemyBullet.angle = rotate;
            enemyBullet.scale.setTo(0.5, 0.5);
            enemyBullet.reset(attackingEnemy.x + 20, attackingEnemy.y + 30);
            enemyBullet.body.velocity.y = ENEMY_BULLET_MOVE_SPEED + (this.level * ENEMY_BULLET_MOVE_SPEED);
            enemyBullet.body.velocity.x = enemyBullet.body.velocity.y / slope;
            var letter = this.game.add.text(0, 0, this.wordManager.getRandomLetter(), { font: 'bold 16pt Arial', fill: "#88FF88" });
            letter.anchor.set(0.5);
            letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
            this.enemyLetters[letterIndex] = letter;
        }
        return enemyBullet;
    };
    Level.prototype.createEnemy = function (word) {
        var _this = this;
        var x = Math.floor(Math.random() * (this.game.width - 150)) + 50;
        var enemy = this.enemies.create(x, 0, 'sheet', 'PNG/Enemies/enemyBlack1.png');
        enemy.scale.setTo(0.5, 0.5);
        enemy.body.velocity.y = ENEMY_BULLET_MOVE_SPEED + (this.level * ENEMY_MOVE_SPEED_FACTOR);
        this.words[this.wordCount] = this.game.add.text(0, 0, word, { font: 'bold 16pt Arial', fill: "#88FF88" });
        this.words[this.wordCount].anchor.set(0.5);
        this.words[this.wordCount].setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.sprites[this.wordCount] = enemy;
        if (this.difficulty === Difficulty.HARD) {
            var delay = 500 + (Math.random() * 1500);
            var timer = this.game.time.create(true);
            var index_1 = this.wordCount;
            timer.add(delay, function () {
                if (enemy.alive && !_this.haltEnemySpawns) {
                    _this.enemyBullets[index_1] = _this.fireEnemyBullet(enemy, index_1);
                }
            });
            timer.start();
        }
        this.wordCount++;
    };
    Level.prototype.shieldDamagedByShip = function (shield, enemy) {
        this.decreaseShieldHealth();
        this.animateDeath(enemy);
        this.kill(enemy);
    };
    Level.prototype.shieldDamagedByBullet = function (shield, bullet) {
        this.decreaseShieldHealth();
        var index = this.enemyBullets.indexOf(bullet);
        this.enemyBullets[index].kill();
        this.enemyLetters[index].kill();
        this.enemyBullets[index] = null;
        this.enemyLetters[index] = null;
        this.targets[index] = null;
    };
    Level.prototype.destroy = function (sprite, bullet) {
        var index = this.bullets.getChildIndex(bullet);
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i] === sprite && this.targets[index] === this.sprites[i]) {
                this.animateDeath(sprite);
                this.createShieldPowerUp(sprite);
                this.sprites[i].kill();
                this.words[i].kill();
                bullet.kill();
                this.sprites[i] = null;
                this.words[i] = null;
                this.targets[index] = null;
                this.updateScore(1);
                for (var j = 0; j < this.sprites.length; j++) {
                    if (this.sprites[j] !== null && this.sprites[j] !== undefined) {
                        this.waitTime = 5000;
                        return;
                    }
                }
                if (this.game.time.time - this.gameTime < 4000) {
                    this.waitTime = 1000;
                    this.gameTime = this.game.time.time;
                }
            }
        }
    };
    Level.prototype.destroy2 = function (bullet, enemyBullet) {
        var index = this.bullets.getChildIndex(bullet);
        for (var i = 0; i < this.enemyBullets.length; i++) {
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
    };
    Level.prototype.kill = function (enemy) {
        var index = this.sprites.indexOf(enemy);
        if (index !== -1) {
            this.wordManager.remove(this.words[index].text);
            this.sprites[index].kill();
            this.words[index].kill();
            this.sprites[index] = null;
            this.words[index] = null;
            this.targets[index] = null;
        }
    };
    Level.prototype.decreaseHealth = function () {
        var _this = this;
        if (this.player.health === 1) {
            this.haltEnemySpawns = true;
            this.inputText.text = "";
            this.stopScrolling();
            this.player.angle = 0;
            this.player.health = 3;
            this.player.body.y = this.game.height + 100;
            this.sprites.forEach(function (sprite) {
                if (sprite !== null && sprite !== undefined) {
                    sprite.body.velocity.y = sprite.body.velocity.y * 2;
                }
            });
            this.enemyBullets.forEach(function (sprite) {
                if (sprite !== null && sprite !== undefined) {
                    sprite.body.velocity.y = sprite.body.velocity.y * 2;
                }
            });
            if (this.loseLife()) {
                setTimeout(function () {
                    _this.player.body.velocity.y = -100;
                }, 3000);
            }
        }
        else {
            this.player.damage(1);
        }
    };
    Level.prototype.damageShip = function (player, enemy) {
        this.decreaseHealth();
        this.animateDeath(enemy);
        this.kill(enemy);
    };
    Level.prototype.damage = function (player, enemyBullet) {
        this.decreaseHealth();
        var index = this.enemyBullets.indexOf(enemyBullet);
        this.enemyBullets[index].kill();
        this.enemyLetters[index].kill();
        this.enemyBullets[index] = null;
        this.enemyLetters[index] = null;
        this.targets[index] = null;
    };
    Level.prototype.buttonsCollided = function (enemy, button) {
        this.animateDeath(enemy);
        this.kill(enemy);
    };
    Level.prototype.fireBullet = function (enemy) {
        var diff = ((enemy.body.x - this.player.body.x) / (enemy.body.y - this.player.body.y)) * -450;
        var bullet = this.bullets.getFirstExists(false);
        var index = this.bullets.getChildIndex(bullet);
        var rotate = Phaser.Math.angleBetween(this.player.body.x, this.player.body.y, enemy.body.x, enemy.body.y);
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
    };
    return Level;
}(Stage));
var BossStage = (function (_super) {
    __extends(BossStage, _super);
    function BossStage() {
        _super.apply(this, arguments);
        this.ships = [];
        this.projectiles = [];
        this.shipsFired = false;
        this.boss = null;
        this.bossLaunchpadHealth = 9;
        this.bossTurretsHealth = 9;
        this.fireTopMissile = true;
        this.shipsTextPromptCount = 0;
        this.bossTextPromptCount = 0;
        this.bossText = null;
        this.bossTargetX = 220;
    }
    BossStage.prototype.init = function (difficulty, score, initialShieldHealth) {
        this.difficulty = difficulty;
        this.setInitialShieldHealth(initialShieldHealth);
        this.score = score;
        this.wordManager = this.game.getWordManager();
        this.timer = this.game.time.create(false);
    };
    BossStage.prototype.create = function () {
        this.createBackgroundAssets();
        this.createBoss();
        this.createUI();
    };
    BossStage.prototype.update = function () {
        var _this = this;
        this.projectiles.forEach(function (projectile) {
            projectile.update();
        });
        if (this.shipsFired && this.projectiles.length === 0) {
            this.shipsTextPromptCount++;
            this.timer.add(1000, function () {
                _this.createShipTexts();
            });
            this.timer.start();
            this.shipsFired = false;
        }
        if (this.player.body.y < 400) {
            this.player.body.velocity.y = 0;
            this.player.body.y = 400;
            this.startScrolling();
            this.timer.resume();
        }
        if (this.shield !== null) {
            this.game.physics.arcade.overlap(this.shield, this.enemyBulletsGroup, this.shieldDamagedByBullet, null, this);
        }
        this.game.physics.arcade.overlap(this.bullets, this.enemies, this.hitEnemyShip, null, this);
        this.game.physics.arcade.overlap(this.boss, this.bullets, this.bossDamaged, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyBulletsGroup, this.damagedByProjectile, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyBulletsGroup, this.projectileIntercepted, null, this);
    };
    BossStage.prototype.shieldDamagedByBullet = function (shield, bullet) {
        if (this.shield !== null) {
            this.decreaseShieldHealth();
            this.removeProjectile(bullet);
        }
    };
    BossStage.prototype.createShipTexts = function () {
        var _this = this;
        var words = [];
        for (var i = 0; i < this.ships.length; i++) {
            words[i] = this.game.add.text(0, 0, this.wordManager.getRandomWord(false), { font: 'bold 16pt Arial', fill: "#88FF88" });
            words[i].anchor.set(0.5);
            words[i].setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
            this.ships[i].setText(words[i]);
        }
        this.timer.add(this.difficulty === Difficulty.HARD ? 9000 : 12000, function () {
            var attached = false;
            for (var i = 0; i < _this.ships.length; i++) {
                if (_this.ships[i].isAttachedTo(words[i])) {
                    _this.ships[i].detachText();
                    attached = true;
                }
            }
            if (attached) {
                _this.inputText.text = "";
                if (_this.shipsTextPromptCount === 4) {
                    _this.shipsTextPromptCount = 0;
                    _this.game.add.tween(_this.ships[0].sprite).to({ x: -100 }, 1000, Phaser.Easing.Linear.None, true, 500);
                    _this.game.add.tween(_this.ships[1].sprite).to({ y: -100 }, 1000, Phaser.Easing.Linear.None, true, 500);
                    _this.game.add.tween(_this.ships[2].sprite).to({ x: _this.game.width + 100 }, 1000, Phaser.Easing.Linear.None, true, 500);
                    _this.timer.add(2000, function () {
                        _this.ships.forEach(function (ship) {
                            ship.sprite.kill();
                        });
                        _this.ships = [];
                        _this.moveBossToLaunchMissiles();
                    });
                    _this.timer.start();
                }
                else {
                    _this.fireFromShips(1000);
                }
            }
        });
    };
    BossStage.prototype.bossDamaged = function (boss, projectile) {
        var _this = this;
        if (this.bossText !== null) {
            projectile.kill();
            this.bossText.kill();
            this.bossText = null;
            if (this.bossTargetX === 140) {
                this.bossTurretsHealth--;
            }
            else if (this.bossTargetX === 220) {
                this.bossLaunchpadHealth--;
            }
            if (this.bossTurretsHealth === 0 && this.bossLaunchpadHealth === 0) {
                this.updateScore(18);
                this.game.add.tween(this.boss).to({ angle: 30 }, 5000, Phaser.Easing.Linear.None, true);
                var fade = this.game.add.tween(this.boss).to({ alpha: 0 }, 10000, Phaser.Easing.Linear.None, true);
                fade.onComplete.add(function () {
                    _this.boss.kill();
                    _this.endGame();
                });
                this.boss.body.velocity.x = 10;
                this.boss.body.velocity.y = 20;
                return;
            }
            var timer = this.blink(this.boss, 200, 5);
            timer.onComplete.add(function () {
                _this.moveBoss();
            });
            timer.start();
        }
    };
    BossStage.prototype.hitEnemyShip = function (bullet, ship) {
        for (var i = 0; i < this.ships.length; i++) {
            if (this.ships[i].contains(ship) && this.ships[i].isInterceptedBy(bullet)) {
                this.ships[i].damage();
                if (!this.ships[i].alive()) {
                    this.animateDeath(ship);
                    this.ships.splice(i, 1);
                    if (this.ships.length === 0) {
                        this.promptLaunchpadBossText();
                        return;
                    }
                }
                break;
            }
        }
        for (var i = 0; i < this.ships.length; i++) {
            if (this.ships[i].hasTextAttached()) {
                return;
            }
        }
        this.fireFromShips(1000);
    };
    BossStage.prototype.removeProjectile = function (sprite) {
        for (var i = 0; i < this.projectiles.length; i++) {
            if (this.projectiles[i].contains(sprite)) {
                this.projectiles[i].damage();
                this.projectiles.splice(i, 1);
                this.animateDeath(sprite);
                return;
            }
        }
    };
    BossStage.prototype.damagedByProjectile = function (player, enemyBullet) {
        this.removeProjectile(enemyBullet);
        this.decreaseHealth();
    };
    BossStage.prototype.decreaseHealth = function () {
        var _this = this;
        if (this.player.health === 1) {
            this.timer.pause();
            this.inputText.text = "";
            this.stopScrolling();
            this.player.angle = 0;
            this.player.health = 3;
            this.player.body.y = this.game.height + 100;
            if (this.loseLife()) {
                setTimeout(function () {
                    _this.player.body.velocity.y = -100;
                }, 3000);
            }
        }
        else {
            this.player.damage(1);
        }
    };
    BossStage.prototype.projectileIntercepted = function (bullet, enemyBullet) {
        for (var i = 0; i < this.projectiles.length; i++) {
            if (this.projectiles[i].contains(enemyBullet) && this.projectiles[i].isInterceptedBy(bullet)) {
                this.removeProjectile(enemyBullet);
                break;
            }
        }
    };
    BossStage.prototype.launchShips = function () {
        var ship = this.enemies.create(this.boss.body.x, this.boss.y - 29, 'sheet', 'PNG/Enemies/enemyBlue1.png');
        ship.moveDown();
        this.ships.push(new EnemyShip(this.wordManager, ship, 2));
        this.game.add.tween(ship).to({ x: this.game.width / 2 - 100, y: 200, angle: 0 }, 1500, Phaser.Easing.Linear.None, true);
        ship = this.enemies.create(this.boss.body.x, this.boss.y - 29, 'sheet', 'PNG/Enemies/enemyBlue1.png');
        ship.alpha = 0;
        ship.moveDown();
        this.ships.push(new EnemyShip(this.wordManager, ship, 2));
        var s = ship;
        setTimeout(function () {
            s.alpha = 1;
        }, 1000);
        this.game.add.tween(ship).to({ x: this.game.width / 2, y: 200, angle: 0 }, 1500, Phaser.Easing.Linear.None, true, 1000);
        ship = this.enemies.create(this.boss.body.x, this.boss.y - 29, 'sheet', 'PNG/Enemies/enemyBlue1.png');
        ship.alpha = 0;
        ship.moveDown();
        this.ships.push(new EnemyShip(this.wordManager, ship, 2));
        var s2 = ship;
        setTimeout(function () {
            s2.alpha = 1;
        }, 2000);
        this.fireFromShips(4000);
        this.game.add.tween(ship).to({ x: this.game.width / 2 + 100, y: 200, angle: 0 }, 1500, Phaser.Easing.Linear.None, true, 2000);
    };
    BossStage.prototype.fireFromShips = function (timeout) {
        var _this = this;
        this.timer.add(4000, function () {
            _this.enemies.forEach(function (enemy) {
                var rotate = Phaser.Math.angleBetween(enemy.body.x, enemy.body.y, _this.player.body.x, _this.player.body.y);
                enemy.angle = Phaser.Math.radToDeg(rotate) - 90;
                var enemyBullet = _this.enemyBulletsGroup.getFirstExists(false);
                var timeToImpact = _this.difficulty === Difficulty.HARD ? 3000 : 4000;
                var projectile = new EnemyProjectile(_this.wordManager, _this.player, enemy, enemyBullet, timeToImpact);
                _this.projectiles.push(projectile);
                var timer = _this.game.time.create(true);
                timer.add(timeToImpact, function () {
                    if (enemyBullet.alive) {
                        _this.removeProjectile(enemyBullet);
                    }
                });
                timer.start();
                _this.fire.play();
            }, _this, true);
            _this.shipsFired = true;
        });
        this.timer.start();
    };
    BossStage.prototype.createMissiles = function () {
        var _this = this;
        var missile = this.game.add.sprite(170, this.fireTopMissile ? 92 : 102, 'sheet', "PNG/Missiles/spaceMissiles_040.png");
        var x = 200 + Math.floor(Math.random() * 130);
        var y = 100 + Math.floor(Math.random() * 50);
        this.enemyBulletsGroup.add(missile);
        var projectile = new EnemyMissile(this.wordManager, missile);
        projectile.fire(this.player, x, y, 1000, 3000, function () {
            if (missile.alive) {
                _this.removeProjectile(missile);
            }
        });
        this.projectiles.push(projectile);
        this.fireTopMissile = !this.fireTopMissile;
    };
    BossStage.prototype.createBoss = function () {
        this.boss = this.game.add.sprite(0, 0, 'sheet', 'PNG/Enemies/boss1.png');
        this.boss.scale.setTo(0.7, 0.7);
        this.game.physics.enable(this.boss);
        var dot = this.game.add.sprite(-12, -55, 'sheet', 'PNG/Effects/dot.png');
        this.game.add.tween(dot).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 100, -1, true);
        this.boss.addChild(dot);
        dot = this.game.add.sprite(-9, 29, 'sheet', 'PNG/Effects/dot.png');
        this.game.add.tween(dot).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 250, -1, true);
        this.boss.addChild(dot);
        dot = this.game.add.sprite(3, 124, 'sheet', 'PNG/Effects/dot.png');
        this.game.add.tween(dot).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
        this.boss.addChild(dot);
        this.boss.x = this.game.width / 2;
        this.boss.y = 125;
        this.boss.anchor.setTo(0.5, 0.5);
        this.moveBossToLaunchMissiles();
    };
    BossStage.prototype.launchMissiles = function () {
        var _this = this;
        for (var i = 0; i < 6; i++) {
            var delay_1 = this.difficulty === Difficulty.HARD ? i * 2000 : i * 3000;
            this.timer.add(delay_1 + 500, function () {
                _this.createMissiles();
            });
        }
        var delay = this.difficulty === Difficulty.HARD ? 12000 : 18000;
        this.timer.add(delay + 500, function () {
            _this.promptTurretBossText();
        });
        this.timer.start();
    };
    BossStage.prototype.promptTurretBossText = function () {
        this.bossTargetX = 140;
        this.promptBossText();
    };
    BossStage.prototype.promptLaunchpadBossText = function () {
        this.bossTargetX = 220;
        this.promptBossText();
    };
    BossStage.prototype.promptBossText = function () {
        var _this = this;
        this.bossText = this.game.add.text(this.bossTargetX, 70, this.wordManager.getRandomWord(false), { font: 'bold 16pt Arial', fill: "#88FF88" });
        this.bossText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.bossText.anchor.setTo(0.5);
        this.bossTextPromptCount++;
        if (this.bossTextPromptCount === 3) {
            var timer = this.game.time.create(true);
            timer.add(this.difficulty === Difficulty.HARD ? 3000 : 4000, function (text) {
                if (text.alive) {
                    text.kill();
                    _this.bossText = null;
                    _this.moveBoss();
                }
            }, this, this.bossText);
            timer.start();
        }
        else {
            var timer = this.game.time.create(true);
            timer.add(this.difficulty === Difficulty.HARD ? 3000 : 4000, function (text) {
                if (text.alive) {
                    _this.inputText.text = "";
                    text.kill();
                    _this.promptBossText();
                }
            }, this, this.bossText);
            timer.start();
        }
    };
    BossStage.prototype.moveBoss = function () {
        if (this.bossTargetX === 140) {
            if (this.bossTextPromptCount === 3) {
                this.bossTextPromptCount = 0;
                if (this.bossLaunchpadHealth === 0) {
                    this.launchMissiles();
                }
                else {
                    this.moveBossToLaunchShips();
                }
            }
            else if (this.bossTurretsHealth === 0) {
                this.moveBossToLaunchShips();
            }
            else {
                this.promptTurretBossText();
            }
        }
        else {
            if (this.bossTextPromptCount === 3) {
                this.bossTextPromptCount = 0;
                if (this.bossTurretsHealth === 0) {
                    this.launchShips();
                }
                else {
                    this.moveBossToLaunchMissiles();
                }
            }
            else if (this.bossLaunchpadHealth === 0) {
                this.moveBossToLaunchMissiles();
            }
            else {
                this.promptLaunchpadBossText();
            }
        }
    };
    BossStage.prototype.moveBossToLaunchShips = function () {
        var _this = this;
        var tween = this.game.add.tween(this.boss).to({ x: this.game.width / 2 + 120 }, 3000, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function () {
            _this.launchShips();
        });
    };
    BossStage.prototype.moveBossToLaunchMissiles = function () {
        var _this = this;
        var tween = this.game.add.tween(this.boss).to({ x: this.game.width / 2 - 120 }, 3000, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function () {
            _this.launchMissiles();
        });
    };
    BossStage.prototype.typed = function (character) {
        if (this.timer.paused) {
            return;
        }
        if (this.inputText.text.length === 0) {
            for (var i = 0; i < this.projectiles.length; i++) {
                if (!this.projectiles[i].isIntercepted() && this.projectiles[i].matchesText(character)) {
                    this.fireAt(this.projectiles[i]);
                    return;
                }
            }
        }
        var prefix = this.inputText.text + character;
        if (this.wordManager.isValidRandomPrefix(prefix)) {
            for (var i = 0; i < this.ships.length; i++) {
                if (!this.ships[i].isIntercepted() && this.ships[i].matchesText(prefix)) {
                    this.fireAt(this.ships[i]);
                    return;
                }
            }
            for (var i = 0; i < this.projectiles.length; i++) {
                if (!this.projectiles[i].isIntercepted() && this.projectiles[i].matchesText(prefix)) {
                    this.fireAt(this.projectiles[i]);
                    return;
                }
            }
            if (this.bossText !== null && this.wordManager.matchesRandom(prefix, this.bossText.text)) {
                this.inputText.text = "";
                var bullet = this.bullets.getFirstExists(false);
                bullet.scale.setTo(0.5, 0.5);
                bullet.reset(this.player.x - 2, this.player.y - 12);
                this.game.add.tween(bullet).to({ x: this.bossTargetX, y: 70 }, 500, Phaser.Easing.Linear.None, true);
                this.bossText.fill = "#ff8888";
                this.fire.play();
                var rotate = Phaser.Math.angleBetween(this.player.body.x, this.player.body.y, this.bossText.x, this.bossText.y);
                this.player.angle = Phaser.Math.radToDeg(rotate) + 90;
                bullet.angle = Phaser.Math.radToDeg(rotate) + 90;
                return;
            }
            this.inputText.text = prefix;
        }
    };
    BossStage.prototype.blink = function (sprite, delay, times) {
        var timer = this.game.time.create(true);
        for (var i = 0; i < times; i++) {
            timer.add(delay + (delay * 2 * i), function () {
                sprite.alpha = 0;
            });
            timer.add((delay * 2) + (delay * 2 * i), function () {
                sprite.alpha = 1;
            });
        }
        return timer;
    };
    BossStage.prototype.fireAt = function (sprite) {
        this.inputText.text = "";
        var bullet = this.bullets.getFirstExists(false);
        bullet.scale.setTo(0.5, 0.5);
        bullet.reset(this.player.x - 2, this.player.y - 12);
        sprite.interceptedBy(bullet);
        this.fire.play();
        var rotate = Phaser.Math.angleBetween(this.player.body.x, this.player.body.y, sprite.getX(), sprite.getY());
        this.player.angle = Phaser.Math.radToDeg(rotate) + 90;
        bullet.angle = Phaser.Math.radToDeg(rotate) + 90;
    };
    BossStage.prototype.shutdown = function () {
        this.timer.destroy();
        _super.prototype.shutdown.call(this);
    };
    return BossStage;
}(Stage));
var EnemySprite = (function () {
    function EnemySprite(wordManager, sprite, health) {
        this.text = null;
        this.interception = null;
        this.wordManager = wordManager;
        this.sprite = sprite;
        this.sprite.health = health;
    }
    EnemySprite.prototype.getX = function () {
        return this.sprite.body.x + (this.sprite.body.width / 2);
    };
    EnemySprite.prototype.getY = function () {
        return this.sprite.body.y + (this.sprite.body.height / 2);
    };
    EnemySprite.prototype.setText = function (text) {
        this.text = text;
        text.x = this.sprite.body.x;
        text.y = this.sprite.body.y - 25;
    };
    EnemySprite.prototype.matchesText = function (text) {
        return this.text.text === text;
    };
    EnemySprite.prototype.contains = function (sprite) {
        return this.sprite === sprite;
    };
    EnemySprite.prototype.isInterceptedBy = function (interception) {
        return this.interception === interception;
    };
    EnemySprite.prototype.isIntercepted = function () {
        return this.interception !== null;
    };
    EnemySprite.prototype.interceptedBy = function (interception) {
        this.interception = interception;
        this.sprite.game.add.tween(this.interception).to({ x: this.sprite.body.x + (this.sprite.body.width / 2),
            y: this.sprite.body.y + (this.sprite.body.height / 2) }, 500, Phaser.Easing.Linear.None, true);
        this.text.fill = "#ff8888";
    };
    EnemySprite.prototype.update = function () {
        if (this.text !== null) {
            this.text.x = this.sprite.body.x;
            this.text.y = this.sprite.body.y - 25;
        }
    };
    EnemySprite.prototype.damage = function () {
        this.sprite.damage(1);
        this.text.kill();
        this.text = null;
        if (this.interception !== null) {
            this.interception.kill();
            this.interception = null;
        }
    };
    EnemySprite.prototype.alive = function () {
        return this.sprite.health !== 0;
    };
    EnemySprite.prototype.detachText = function () {
        this.wordManager.removeRandom(this.text.text);
        this.text.kill();
        this.text = null;
    };
    EnemySprite.prototype.hasTextAttached = function () {
        return this.text !== null;
    };
    EnemySprite.prototype.isAttachedTo = function (text) {
        return this.text === text;
    };
    return EnemySprite;
}());
var EnemyShip = (function (_super) {
    __extends(EnemyShip, _super);
    function EnemyShip(wordManager, enemy, health) {
        _super.call(this, wordManager, enemy, 2);
        enemy.anchor.setTo(0.5);
        enemy.scale.setTo(0.3);
        enemy.angle = 90;
    }
    EnemyShip.prototype.matchesText = function (text) {
        return this.hasTextAttached() && this.wordManager.matchesRandom(text, this.text.text);
    };
    return EnemyShip;
}(EnemySprite));
var EnemyProjectile = (function (_super) {
    __extends(EnemyProjectile, _super);
    function EnemyProjectile(wordManager, player, enemy, projectile, timeToImpact) {
        _super.call(this, wordManager, projectile, 1);
        var rotate = Phaser.Math.angleBetween(enemy.body.x, enemy.body.y, player.body.x, player.body.y);
        projectile.angle = Phaser.Math.radToDeg(rotate) + 90;
        projectile.scale.setTo(0.5);
        projectile.anchor.setTo(0.5);
        projectile.reset(enemy.x, enemy.y);
        player.game.add.tween(projectile).to({ x: player.body.x + (player.body.width / 2),
            y: player.body.y + (player.body.height / 2) }, timeToImpact, Phaser.Easing.Linear.None, true);
        var letter = player.game.add.text(0, 0, player.game.getWordManager().getRandomLetter(), { font: 'bold 16pt Arial', fill: "#88FF88" });
        letter.anchor.set(0.5);
        letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.setText(letter);
    }
    return EnemyProjectile;
}(EnemySprite));
var EnemyMissile = (function (_super) {
    __extends(EnemyMissile, _super);
    function EnemyMissile(wordManager, missile) {
        _super.call(this, wordManager, missile, 1);
        missile.angle = 90;
        missile.anchor.setTo(0.5);
        missile.scale.setTo(0.8);
        missile.game.physics.arcade.enable(missile);
        this.smoke = missile.game.add.sprite(-3, 17, 'sheet', 'PNG/Effects/spaceEffects_007.png');
        this.smoke.alpha = 0;
        this.smoke.scale.setTo(0.5, 0.25);
        missile.addChild(this.smoke);
    }
    EnemyMissile.prototype.fire = function (player, x, y, moveDelay, fireDelay, callback) {
        var _this = this;
        var rotate = Phaser.Math.angleBetween(x, y, player.body.x, player.body.y);
        var angle = Phaser.Math.radToDeg(rotate) + 90;
        var moveTween = player.game.add.tween(this.sprite).to({ x: x, y: y, angle: angle }, moveDelay, Phaser.Easing.Linear.None, true);
        moveTween.onComplete.add(function () {
            var letter = _this.sprite.game.add.text(0, 0, _this.wordManager.getRandomWord(false), { font: 'bold 16pt Arial', fill: "#88FF88" });
            letter.anchor.set(0.5);
            letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
            _this.setText(letter);
            _this.fireAtPlayer(player, _this.sprite, fireDelay, moveDelay, callback);
        });
        player.game.add.tween(this.smoke).to({ alpha: 1 }, moveDelay / 2, Phaser.Easing.Linear.None, true, 0, 0, true);
    };
    EnemyMissile.prototype.fireAtPlayer = function (player, missile, fireDelay, moveDelay, callback) {
        var tween = player.game.add.tween(missile).to({ x: player.body.x + (player.body.width / 2),
            y: player.body.y + (player.body.height / 2),
        }, fireDelay, Phaser.Easing.Linear.None, true, moveDelay);
        tween.onComplete.add(callback);
        player.game.add.tween(this.smoke).to({ alpha: 1 }, fireDelay, Phaser.Easing.Linear.None, true, moveDelay);
    };
    EnemyMissile.prototype.matchesText = function (text) {
        return this.hasTextAttached() && this.wordManager.matchesRandom(text, this.text.text);
    };
    return EnemyMissile;
}(EnemySprite));
var GameOver = (function (_super) {
    __extends(GameOver, _super);
    function GameOver() {
        _super.apply(this, arguments);
        this.current = 0;
    }
    GameOver.prototype.init = function (difficulty, score) {
        if (this.game.isCustom()) {
            this.difficultyKey = DIFFICULTY_CUSTOM;
        }
        else {
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
    };
    GameOver.prototype.create = function () {
        var _this = this;
        var aether = this.game;
        var bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
        bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);
        var gameOverText = this.game.add.text(this.game.width / 2, this.game.height / 10 * 2, aether.getLocalizedString(GAME_OVER), { fontSize: '48px', fill: '#ffffff' });
        gameOverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        gameOverText.anchor.setTo(0.5, 0.5);
        var difficultyText = this.game.add.text(this.game.width / 2, this.game.height / 10 * 4, aether.getLocalizedString(this.difficultyKey), { fontSize: '28px', fill: '#ffffff', align: 'center' });
        difficultyText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        difficultyText.anchor.setTo(0.5, 0.5);
        this.scoreText = this.game.add.text(this.game.width / 2, this.game.height / 10 * 5, aether.getLocalizedString(SCORE) + ": 0", { fontSize: '28px', fill: '#ffffff', align: 'center' });
        this.scoreText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.scoreText.anchor.setTo(0.5, 0.5);
        var titleText = this.game.add.text(this.game.width / 2, this.game.height / 10 * 7, aether.getLocalizedString(RETURN_MAIN), { fontSize: '28px', fill: '#ffffff', align: 'center' });
        titleText.inputEnabled = true;
        titleText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        titleText.anchor.setTo(0.5, 0.5);
        titleText.events.onInputOver.add(function () {
            titleText.fill = "#88ff88";
        });
        titleText.events.onInputOut.add(function () {
            titleText.fill = "#ffffff";
        });
        titleText.events.onInputDown.add(function () {
            _this.game.state.start('title');
        });
    };
    GameOver.prototype.update = function () {
        if (this.current !== this.score) {
            this.current = this.current + this.increment;
            if (this.current > this.score) {
                this.current = this.score;
            }
            this.scoreText.text = this.game.getLocalizedString(SCORE) + ": " + Math.floor(this.current);
        }
    };
    return GameOver;
}(Phaser.State));
var WordManager = (function () {
    function WordManager() {
        this.englishNumbers = [
            "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"
        ];
        this.japaneseNumbers = [
            "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"
        ];
        this.englishColors = [
            "red", "blue", "green", "yellow", "black", "white", "brown", "purple", "pink", "orange"
        ];
        this.japaneseColors = [
            "赤い", "青い", "緑", "黄色", "黒い", "白い", "茶色", "紫", "ピンク", "オレンジ"
        ];
        this.englishSports = [
            "basketball", "tennis", "softball", "volleyball", "badminton", "baseball", "swimming"
        ];
        this.japaneseSports = [
            "バスケットボール", "テニス", "ソフトボール", "バレーボール", "バドミントン", "野球", "水泳"
        ];
        this.englishDays = [
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ];
        this.japaneseDays = [
            "日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"
        ];
        this.englishMonths = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.japaneseMonths = [
            "一月", "二月", "三月", "四月", "五月", "六月",
            "七月", "八月", "九月", "十月", "十一月", "十二月"
        ];
        this.englishWords = [
            this.englishNumbers, this.englishColors, this.englishSports, this.englishDays, this.englishMonths
        ];
        this.japaneseWords = [
            this.japaneseNumbers, this.japaneseColors, this.japaneseSports, this.japaneseDays, this.japaneseMonths
        ];
        this.englishAll = [];
        this.japaneseAll = [];
        this.done = [];
        this.allDone = [];
        this.pending = [];
        this.pendingTranslation = [];
        this.useWords = true;
        this.alphabet = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        ];
        this.reset();
        this.englishAll = this.englishAll.concat(this.englishNumbers, this.englishColors, this.englishSports, this.englishDays, this.englishMonths);
        this.japaneseAll = this.japaneseAll.concat(this.japaneseNumbers, this.japaneseColors, this.japaneseSports, this.japaneseDays, this.japaneseMonths);
        for (var i = 0; i < this.englishAll.length; i++) {
            this.allDone[i] = false;
        }
    }
    WordManager.prototype.reset = function () {
        this.set = 0;
        this.english = this.englishWords[this.set];
        this.japanese = this.japaneseWords[this.set];
        this.pending = [];
        this.pendingTranslation = [];
        this.done = [];
        for (var i = 0; i < this.english.length; i++) {
            this.done[i] = false;
        }
    };
    WordManager.prototype.shouldUseWords = function (useWords) {
        this.useWords = useWords;
        if (useWords) {
            this.english = this.englishWords[this.set];
        }
        else {
            this.english = this.alphabet;
        }
        this.done = [];
        for (var i = 0; i < this.english.length; i++) {
            this.done[i] = false;
        }
    };
    WordManager.prototype.isValidPrefix = function (prefix) {
        var valid = false;
        var length = prefix.length;
        for (var i = 0; i < this.pending.length; i++) {
            if (this.pending[i].substr(0, length) === prefix) {
                valid = true;
                break;
            }
        }
        return valid;
    };
    WordManager.prototype.completed = function (word) {
        var index = this.pending.indexOf(word);
        if (index === -1) {
            return null;
        }
        this.pending.splice(index, 1);
        return this.useWords ? this.pendingTranslation.splice(index, 1)[0] : word;
    };
    WordManager.prototype.remove = function (key) {
        if (this.useWords) {
            var index = this.pendingTranslation.indexOf(key);
            if (index !== -1) {
                this.pendingTranslation.splice(index, 1);
                this.pending.splice(index, 1);
            }
        }
        else {
            var index = this.pending.indexOf(key);
            if (index !== -1) {
                this.pending.splice(index, 1);
            }
        }
    };
    WordManager.prototype.goToNextSet = function () {
        this.set++;
        if (this.set === this.englishWords.length) {
            return false;
        }
        this.done = [];
        this.english = this.englishWords[this.set];
        this.japanese = this.japaneseWords[this.set];
        for (var i = 0; i < this.english.length; i++) {
            this.done[i] = false;
        }
        return true;
    };
    WordManager.prototype.getNextWord = function () {
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
        }
        else {
            return this.english[index];
        }
    };
    WordManager.prototype.getRandomLetter = function () {
        var index = Math.floor(Math.random() * 26);
        return this.alphabet[index];
    };
    WordManager.prototype.isValidRandomPrefix = function (prefix) {
        var length = prefix.length;
        for (var i = 0; i < this.pending.length; i++) {
            if (this.pending[i].substr(0, length) === prefix) {
                return true;
            }
        }
        return false;
    };
    WordManager.prototype.removeRandom = function (translation) {
        var index = this.pendingTranslation.indexOf(translation);
        if (index !== -1) {
            this.pendingTranslation.splice(index, 1);
            this.pending.splice(index, 1);
        }
    };
    WordManager.prototype.matchesRandom = function (input, translation) {
        var index = this.pending.indexOf(input);
        if (index === this.pendingTranslation.indexOf(translation)) {
            this.pending.splice(index, 1);
            this.pendingTranslation.splice(index, 1);
            return true;
        }
        return false;
    };
    WordManager.prototype.getRandomWord = function (repeats) {
        if (!this.useWords) {
            var letter = this.getRandomLetter();
            this.pending.push(letter);
            this.pendingTranslation.push(letter);
            return letter;
        }
        var index = Math.floor(Math.random() * this.englishAll.length);
        if (repeats) {
            var filled = true;
            for (var i = 0; i < this.allDone.length; i++) {
                if (!this.allDone[i]) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                for (var i = 0; i < this.allDone.length; i++) {
                    this.allDone[i] = false;
                }
            }
            else {
                while (this.allDone[index]) {
                    index = Math.floor(Math.random() * this.englishAll.length);
                }
            }
            this.allDone[index] = true;
        }
        this.pending.push(this.englishAll[index]);
        this.pendingTranslation.push(this.japaneseAll[index]);
        return this.japaneseAll[index];
    };
    WordManager.prototype.readFiles = function (files, callback) {
        var _this = this;
        var wordCounter = 0;
        var fileCounter = 0;
        var english = [];
        var japanese = [];
        var reader = new FileReader();
        reader.onload = function () {
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
            }
            else {
                _this.englishAll = english;
                _this.japaneseAll = japanese;
                _this.englishWords = [english];
                _this.japaneseWords = [japanese];
                _this.reset();
                callback.call(null);
            }
        };
        reader.readAsText(files[fileCounter], "UTF-8");
    };
    return WordManager;
}());
var EASY = "EASY";
var MEDIUM = "MEDIUM";
var HARD = "HARD";
var CUSTOM = "CUSTOM";
var DIFFICULTY_EASY = "DIFFICULTY_EASY";
var DIFFICULTY_MEDIUM = "DIFFICULTY_MEDIUM";
var DIFFICULTY_HARD = "DIFFICULTY_HARD";
var DIFFICULTY_CUSTOM = "DIFFICULTY_CUSTOM";
var SCORE = "SCORE";
var RETURN_MAIN = "RETURN_MAIN";
var GAME_OVER = "GAME_OVER";
var Localization = (function () {
    function Localization() {
        this.english = {
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
        this.japanese = {
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
    }
    Localization.prototype.getString = function (language, key) {
        switch (language) {
            case Language.ENGLISH:
                return this.english[key];
            case Language.JAPANESE:
                return this.japanese[key];
        }
        return null;
    };
    return Localization;
}());
window.onload = function () {
    var game = new Aether();
};
//# sourceMappingURL=game.js.map