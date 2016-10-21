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
        this.state.add('boot', Boot, true);
        this.state.add('language', LanguageScreen);
        this.state.add('title', TitleScreen);
        this.state.add('game', Game);
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
        this.easyText = this.createText(aether.getLocalizedString(EASY), 300, Difficulty.EASY);
        this.normalText = this.createText(aether.getLocalizedString(MEDIUM), 350, Difficulty.MEDIUM);
        this.hardText = this.createText(aether.getLocalizedString(HARD), 400, Difficulty.HARD);
        this.ship = this.game.add.sprite(this.game.width / 2, 450, 'sheet', 'PNG/playerShip1_red.png');
        this.ship.scale.setTo(0.5, 0.5);
        this.ship.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.ship);
    };
    TitleScreen.prototype.fadeOut = function () {
        this.applyFade(this.titleText);
        this.applyFade(this.easyText);
        this.applyFade(this.normalText);
        this.applyFade(this.hardText);
        this.applyFade(this.background);
    };
    TitleScreen.prototype.applyFade = function (sprite) {
        this.game.add.tween(sprite).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
    };
    TitleScreen.prototype.createText = function (content, y, difficulty) {
        var _this = this;
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
        startText.events.onInputDown.add(function () {
            _this.ship.body.velocity.y = -300;
            _this.difficulty = difficulty;
        });
        return startText;
    };
    TitleScreen.prototype.update = function () {
        if (this.ship !== null && !this.ship.inWorld) {
            this.timeElapsed = this.game.time.time;
            this.fadeOut();
            this.ship.kill();
            this.ship = null;
        }
        if (this.timeElapsed !== -1 && this.game.time.time > this.timeElapsed + 1000) {
            this.game.state.start('game', true, false, this.difficulty);
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
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        _super.apply(this, arguments);
        this.phaserKeys = [
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
        this.keys = [
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
        this.waitTime = 5000;
        this.score = 0;
        this.player = null;
        this.shield = null;
        this.wordCount = 0;
        this.words = [];
        this.sprites = [];
        this.enemyBullets = [];
        this.enemyBulletTimes = [];
        this.enemyLetters = [];
        this.targets = [];
        this.lives = [];
        this.level = 1;
        this.finished = false;
        this.haltEnemySpawns = false;
    }
    Game.prototype.init = function (difficulty) {
        this.wordManager = this.game.getWordManager();
        if (this.player !== null) {
            this.enemyBulletsGroup.forEach(function (sprite) {
                sprite.kill();
            }, this);
            this.enemies.forEach(function (sprite) {
                sprite.kill();
            }, this);
            this.wordsGroup.forEach(function (sprite) {
                sprite.kill();
            }, this);
            for (var i = 0; i < this.enemyLetters.length; i++) {
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
        this.wordManager.shouldUseWords(difficulty !== Difficulty.EASY);
    };
    Game.prototype.preload = function () {
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
    Game.prototype.create = function () {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'sheet', 'Backgrounds/purple.png');
        this.background.autoScroll(0, 50);
        this.bullets = this.game.add.physicsGroup();
        this.bullets.createMultiple(32, 'sheet', 'PNG/Lasers/laserBlue01.png', false);
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
        this.enemyBulletsGroup = this.game.add.physicsGroup();
        this.enemyBulletsGroup.createMultiple(32, 'sheet', 'PNG/Lasers/laserGreen13.png', false);
        this.enemyBulletsGroup.setAll('checkWorldBounds', true);
        this.enemyBulletsGroup.setAll('outOfBoundsKill', true);
        this.player = this.game.add.sprite(this.game.width / 2, 400, 'sheet', 'PNG/playerShip1_red.png');
        this.player.health = 3;
        this.player.scale.setTo(0.5, 0.5);
        this.player.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.player);
        this.fire = this.game.add.audio('fire');
        this.explosion = this.game.add.audio('explosion');
        this.shieldUp = this.game.add.audio('shieldUp');
        this.shieldDown = this.game.add.audio('shieldDown');
        this.enemies = this.game.add.group();
        this.enemies.enableBody = true;
        this.shields = this.game.add.group();
        this.shields.enableBody = true;
        this.wordsGroup = this.game.add.group();
        this.scoreText = this.game.add.text(16, 16, this.game.getLocalizedString(SCORE) + ": " + this.score, { fontSize: '16px', fill: '#ffffff' });
        this.inputText = this.game.add.text(this.game.width / 2, 460, null, { align: 'center', fontSize: '32px', fill: '#ffffff' });
        this.inputText.anchor.setTo(0.5, 0.5);
        this.lives[0] = this.game.add.sprite(this.game.width - 50, 16, 'sheet', 'PNG/UI/playerLife1_red.png');
        this.lives[1] = this.game.add.sprite(this.game.width - 50, 48, 'sheet', 'PNG/UI/playerLife1_red.png');
        this.buttons = this.game.add.group();
        this.buttons.enableBody = true;
        this.createKeys();
        this.gameTime = this.game.time.time;
        for (var i = 0; i < this.keys.length; i++) {
            var key = this.game.input.keyboard.addKey(this.phaserKeys[i]);
            var character = this.keys[i];
            key.onDown.add(this.typed(character), this);
        }
    };
    Game.prototype.append = function (char) {
        this.inputText.text = this.inputText.text + char;
    };
    Game.prototype.createKeys = function () {
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
        backspaceButton.events.onInputDown.add(function () {
            if (this.inputText.text.length > 0) {
                this.inputText.text = this.inputText.text.substring(0, this.inputText.text.length - 1);
            }
        }, this);
    };
    Game.prototype.intercept = function (character) {
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
    Game.prototype.typed = function (character) {
        var _this = this;
        return function () {
            if (_this.difficulty === Difficulty.EASY) {
                var word = _this.wordManager.completed(character);
                if (word !== null) {
                    for (var i = 0; i < _this.words.length; i++) {
                        if (_this.words[i] !== null && _this.words[i].text === word) {
                            _this.words[i].fill = "#ff8888";
                            _this.fireBullet(_this.sprites[i]);
                            break;
                        }
                    }
                }
            }
            else {
                var prefix = _this.inputText.text + character;
                if ((prefix.length === 1 && _this.intercept(character)) ||
                    !_this.wordManager.isValidPrefix(prefix)) {
                    return;
                }
                _this.inputText.text = prefix;
                var word = _this.wordManager.completed(_this.inputText.text);
                if (word !== null) {
                    for (var i = 0; i < _this.words.length; i++) {
                        if (_this.words[i] !== null && _this.words[i].text === word) {
                            _this.words[i].fill = "#ff8888";
                            _this.fireBullet(_this.sprites[i]);
                            _this.inputText.text = "";
                            break;
                        }
                    }
                }
            }
        };
    };
    Game.prototype.update = function () {
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
                this.endGame();
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
                    this.level++;
                    this.wordCount = 0;
                    if (this.level === 6) {
                        this.finished = true;
                    }
                    else {
                        this.wordManager.reset();
                        this.wordManager.shouldUseWords(this.difficulty !== Difficulty.EASY);
                    }
                }
                word = this.wordManager.getNextWord();
            }
            if (!this.finished) {
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
            this.player.body.velocity.y = 0;
            this.player.body.y = 400;
            this.background.autoScroll(0, 50);
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
        this.game.physics.arcade.overlap(this.player, this.shields, this.grantShield, null, this);
    };
    Game.prototype.fireEnemyBullet = function (attackingEnemy, letterIndex) {
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
            var index = Math.floor(Math.random() * 26);
            var letter = this.game.add.text(0, 0, this.keys[index], { font: 'bold 16pt Arial', fill: "#88FF88" });
            letter.anchor.set(0.5);
            letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
            this.enemyLetters[letterIndex] = letter;
        }
        return enemyBullet;
    };
    Game.prototype.createEnemy = function (word) {
        var x = Math.floor(Math.random() * (this.game.width - 150)) + 50;
        var enemy = this.enemies.create(x, 0, 'sheet', 'PNG/Enemies/enemyBlack1.png');
        enemy.scale.setTo(0.5, 0.5);
        enemy.body.velocity.y = ENEMY_BULLET_MOVE_SPEED + (this.level * ENEMY_MOVE_SPEED_FACTOR);
        this.words[this.wordCount] = this.game.add.text(0, 0, word, { font: 'bold 16pt Arial', fill: "#88FF88" });
        this.words[this.wordCount].anchor.set(0.5);
        this.words[this.wordCount].setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.wordsGroup.add(this.words[this.wordCount]);
        this.sprites[this.wordCount] = enemy;
        if (this.difficulty === Difficulty.HARD) {
            this.enemyBulletTimes[this.wordCount] = 500 + (Math.random() * 1500) + this.game.time.time;
        }
        this.wordCount++;
    };
    Game.prototype.createShieldPowerUp = function (enemy) {
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
    Game.prototype.decreaseShieldHealth = function () {
        this.shieldDown.play();
        this.shield.damage(1);
        this.shield.alpha = this.shield.health / this.shield.maxHealth;
        if (this.shield.health === 0) {
            this.shield = null;
        }
    };
    Game.prototype.shieldDamagedByShip = function (shield, enemy) {
        this.decreaseShieldHealth();
        this.kill(enemy);
    };
    Game.prototype.shieldDamagedByBullet = function (shield, bullet) {
        this.decreaseShieldHealth();
        var index = this.enemyBullets.indexOf(bullet);
        this.enemyBullets[index].kill();
        this.enemyLetters[index].kill();
        this.enemyBullets[index] = null;
        this.enemyLetters[index] = null;
        this.targets[index] = null;
    };
    Game.prototype.updateScore = function (increment) {
        this.score += increment;
        this.scoreText.text = this.game.getLocalizedString(SCORE) + ": " + this.score;
    };
    Game.prototype.animateDeath = function (enemy) {
        var smoke = this.game.add.sprite(enemy.body.x + (enemy.body.width / 2), enemy.body.y + (enemy.body.height / 2), 'sheet', 'PNG/Effects/spaceEffects_016.png');
        smoke.anchor.setTo(0.5, 0.5);
        smoke.animations.add('run', ['PNG/Effects/spaceEffects_015.png', 'PNG/Effects/spaceEffects_014.png', 'PNG/Effects/spaceEffects_013.png',
            'PNG/Effects/spaceEffects_012.png', 'PNG/Effects/spaceEffects_011.png', 'PNG/Effects/spaceEffects_010.png',
            'PNG/Effects/spaceEffects_009.png', 'PNG/Effects/spaceEffects_008.png',], 10, false);
        smoke.animations.play('run', 10, false, true);
        this.explosion.play();
    };
    Game.prototype.destroy = function (sprite, bullet) {
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
                this.enemyBulletTimes[i] = null;
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
    Game.prototype.destroy2 = function (bullet, enemyBullet) {
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
    Game.prototype.kill = function (enemy) {
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
    Game.prototype.decreaseHealth = function () {
        var _this = this;
        if (this.player.health === 1) {
            this.haltEnemySpawns = true;
            this.background.autoScroll(0, 0);
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
            setTimeout(function () {
                _this.player.body.velocity.y = -100;
            }, 3000);
            if (this.lives.length > 0) {
                this.lives[this.lives.length - 1].kill();
                this.lives.splice(this.lives.length - 1, 1);
            }
            else {
                this.endGame();
            }
        }
        else {
            this.player.damage(1);
        }
    };
    Game.prototype.damageShip = function (player, enemy) {
        this.decreaseHealth();
        this.animateDeath(enemy);
        this.kill(enemy);
    };
    Game.prototype.damage = function (player, enemyBullet) {
        this.decreaseHealth();
        var index = this.enemyBullets.indexOf(enemyBullet);
        this.enemyBullets[index].kill();
        this.enemyLetters[index].kill();
        this.enemyBullets[index] = null;
        this.enemyLetters[index] = null;
        this.targets[index] = null;
    };
    Game.prototype.buttonsCollided = function (enemy, button) {
        this.animateDeath(enemy);
        this.kill(enemy);
    };
    Game.prototype.grantShield = function (player, powerUp) {
        powerUp.kill();
        if (this.shield === null) {
            this.shield = this.game.add.sprite(this.game.width / 2, 410, 'sheet', 'PNG/Effects/shield3.png');
            this.shield.maxHealth = 3;
            this.shield.scale.setTo(0.5, 0.5);
            this.shield.anchor.setTo(0.5);
            this.game.physics.enable(this.shield);
        }
        else {
            this.shield.alpha = 1;
        }
        this.shield.health = 3;
        this.shieldUp.play();
    };
    Game.prototype.fireBullet = function (enemy) {
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
    Game.prototype.endGame = function () {
        window.removeEventListener("keydown", this.backspaceListener, false);
        this.game.state.start('gameover', true, false, this.difficulty, this.score);
    };
    return Game;
}(Phaser.State));
var GameOver = (function (_super) {
    __extends(GameOver, _super);
    function GameOver() {
        _super.apply(this, arguments);
        this.current = 0;
    }
    GameOver.prototype.init = function (difficulty, score) {
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
            this.scoreText.text = this.game.getLocalizedString(SCORE) + ": " + this.current;
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
        this.englishWords = [this.englishNumbers, this.englishColors, this.englishSports];
        this.japaneseWords = [this.japaneseNumbers, this.japaneseColors, this.japaneseSports];
        this.done = [];
        this.pending = [];
        this.pendingTranslation = [];
        this.useWords = true;
        this.alphabet = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        ];
        this.reset();
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
    return WordManager;
}());
var EASY = "EASY";
var MEDIUM = "MEDIUM";
var HARD = "HARD";
var DIFFICULTY_EASY = "DIFFICULTY_EASY";
var DIFFICULTY_MEDIUM = "DIFFICULTY_MEDIUM";
var DIFFICULTY_HARD = "DIFFICULTY_HARD";
var SCORE = "SCORE";
var RETURN_MAIN = "RETURN_MAIN";
var GAME_OVER = "GAME_OVER";
var Localization = (function () {
    function Localization() {
        this.english = {
            EASY: "Easy",
            MEDIUM: "Medium",
            HARD: "Hard",
            DIFFICULTY_EASY: "Difficulty: Easy",
            DIFFICULTY_MEDIUM: "Difficulty: Medium",
            DIFFICULTY_HARD: "Difficulty: Hard",
            SCORE: "Score",
            RETURN_MAIN: "Return to Main Menu",
            GAME_OVER: "Game Over"
        };
        this.japanese = {
            EASY: "易しい",
            MEDIUM: "普通",
            HARD: "難しい",
            DIFFICULTY_EASY: "難易度: 易しい",
            DIFFICULTY_MEDIUM: "難易度: 普通",
            DIFFICULTY_HARD: "難易度: 難しい",
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