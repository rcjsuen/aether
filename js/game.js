var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Aether = (function (_super) {
    __extends(Aether, _super);
    function Aether() {
        _super.call(this, 360, 640, Phaser.CANVAS, '');
        this.state.add('boot', Boot, true);
        this.state.add('title', TitleScreen);
        this.state.add('game', Game);
        this.state.add('gameover', GameOver);
    }
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
    };
    Boot.prototype.create = function () {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.plugins.add(Phaser.Plugin.SaveCPU);
        this.game.state.start('title');
    };
    return Boot;
}(Phaser.State));
var TitleScreen = (function (_super) {
    __extends(TitleScreen, _super);
    function TitleScreen() {
        _super.apply(this, arguments);
        this.timeElapsed = -1;
    }
    TitleScreen.prototype.init = function () {
        this.timeElapsed = -1;
    };
    TitleScreen.prototype.create = function () {
        var bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
        bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);
        this.titleText = this.game.add.text(this.game.width / 2, this.game.height / 4, "Aether", { fontSize: '64px', fill: '#ffffff' });
        this.titleText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.titleText.anchor.setTo(0.5, 0.5);
        this.easyText = this.createText("Easy", 300, Difficulty.Easy);
        this.normalText = this.createText("Normal", 350, Difficulty.Normal);
        this.hardText = this.createText("Hard", 400, Difficulty.Hard);
        this.ship = this.game.add.sprite(this.game.width / 2, 450, 'sheet', 'PNG/playerShip1_red.png');
        this.ship.scale.setTo(0.5, 0.5);
        this.ship.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.ship);
    };
    TitleScreen.prototype.fadeTexts = function () {
        this.applyFade(this.titleText);
        this.applyFade(this.easyText);
        this.applyFade(this.normalText);
        this.applyFade(this.hardText);
    };
    TitleScreen.prototype.applyFade = function (text) {
        this.game.add.tween(text).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
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
            this.fadeTexts();
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
    Difficulty[Difficulty["Easy"] = 0] = "Easy";
    Difficulty[Difficulty["Normal"] = 1] = "Normal";
    Difficulty[Difficulty["Hard"] = 2] = "Hard";
})(Difficulty || (Difficulty = {}));
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
        this.player = null;
        this.words = [];
        this.sprites = [];
        this.done = [];
        this.enemyBullets = [];
        this.enemyBulletTimes = [];
        this.enemyLetters = [];
        this.targets = [];
        this.english = ["apple", "cat", "car", "dog", "pen", "eraser"];
        this.japanese = ["りんご", "猫", "車", "犬", "ペン", "消しゴム"];
    }
    Game.prototype.init = function (difficulty) {
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
            this.words = [];
            this.sprites = [];
            this.done = [];
            this.enemyBullets = [];
            this.enemyBulletTimes = [];
            this.enemyLetters = [];
            this.player = null;
        }
        this.difficulty = difficulty;
        if (difficulty === Difficulty.Easy) {
            this.english = this.keys;
            this.japanese = this.keys;
        }
    };
    Game.prototype.preload = function () {
        var _this = this;
        window.addEventListener("keydown", function (event) {
            if (event.keyCode == 8) {
                event.preventDefault();
                if (_this.scoreText.text.length > 0) {
                    _this.scoreText.text = _this.scoreText.text.substring(0, _this.scoreText.text.length - 1);
                }
            }
        }, false);
        for (var i = 0; i < this.english.length; i++) {
            this.done[i] = false;
        }
    };
    Game.prototype.create = function () {
        var bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
        bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);
        this.bullets = this.game.add.physicsGroup();
        this.bullets.createMultiple(32, 'sheet', 'PNG/Lasers/laserBlue01.png', false);
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
        this.enemyBulletsGroup = this.game.add.physicsGroup();
        this.enemyBulletsGroup.createMultiple(32, 'sheet', 'PNG/Lasers/laserGreen13.png', false);
        this.enemyBulletsGroup.setAll('checkWorldBounds', true);
        this.enemyBulletsGroup.setAll('outOfBoundsKill', true);
        this.player = this.game.add.sprite(this.game.width / 2, 450, 'sheet', 'PNG/playerShip1_red.png');
        this.player.health = 3;
        this.player.scale.setTo(0.5, 0.5);
        this.player.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.fire = this.game.add.audio('fire');
        this.enemies = this.game.add.group();
        this.enemies.enableBody = true;
        this.wordsGroup = this.game.add.group();
        this.scoreText = this.game.add.text(16, 16, null, { fontSize: '32px', fill: '#ffffff' });
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
        this.scoreText.text = this.scoreText.text + char;
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
            if (this.scoreText.text.length > 0) {
                this.scoreText.text = this.scoreText.text.substring(0, this.scoreText.text.length - 1);
            }
        }, this);
    };
    Game.prototype.intercept = function (character) {
        if (this.scoreText.text.trim().length > 0) {
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
                    this.scoreText.text = "";
                    var bullet = this.bullets.getFirstExists(false);
                    if (bullet) {
                        this.fire.play();
                        bullet.scale.setTo(0.5, 0.5);
                        bullet.reset(this.player.x - 2, this.player.y - 12);
                        bullet.body.velocity.x = -this.enemyBullets[i].body.velocity.x;
                        bullet.body.velocity.y = -this.enemyBullets[i].body.velocity.y;
                        var index = this.bullets.getChildIndex(bullet);
                        this.targets[index] = this.enemyBullets[i];
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
            if (_this.difficulty === Difficulty.Easy) {
                for (var i = 0; i < _this.words.length; i++) {
                    if (_this.english[i].toLowerCase() === character) {
                        _this.fireBullet(_this.sprites[i]);
                        break;
                    }
                }
            }
            else {
                if (_this.intercept(character)) {
                    return;
                }
                _this.scoreText.text = _this.scoreText.text + character;
                for (var i = 0; i < _this.words.length; i++) {
                    if (_this.english[i].toLowerCase() === _this.scoreText.text.trim()) {
                        _this.fireBullet(_this.sprites[i]);
                        _this.scoreText.text = "";
                        break;
                    }
                }
            }
        };
    };
    Game.prototype.update = function () {
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i] !== null && this.sprites[i] !== undefined && !this.sprites[i].inWorld) {
                this.sprites[i].kill();
                this.words[i].kill();
                this.sprites[i] = null;
                this.words[i] = null;
                this.done[i] = false;
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
        if (this.game.time.time - this.gameTime > 2000) {
            this.gameTime = this.game.time.time;
            for (var i = 0; i < this.done.length; i++) {
                if (!this.done[i]) {
                    this.createEnemy();
                    break;
                }
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
                this.words[i].y = this.sprites[i].y - 25;
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
    };
    Game.prototype.fireEnemyBullet = function (attackingEnemy, letterIndex) {
        if (this.difficulty !== Difficulty.Hard) {
            return null;
        }
        var diffX = -(attackingEnemy.body.x - this.player.body.x) / 4;
        var diffY = -(attackingEnemy.body.y - this.player.body.y) / 4;
        var enemyBullet = this.enemyBulletsGroup.getFirstExists(false);
        if (enemyBullet) {
            this.fire.play();
            enemyBullet.scale.setTo(0.5, 0.5);
            enemyBullet.reset(attackingEnemy.x + 20, attackingEnemy.y + 30);
            enemyBullet.body.velocity.x = diffX;
            enemyBullet.body.velocity.y = diffY;
            var index = Math.floor(Math.random() * 26);
            var letter = this.game.add.text(0, 0, this.keys[index], { font: 'bold 16pt Arial', fill: "#88FF88" });
            letter.anchor.set(0.5);
            letter.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
            this.enemyLetters[letterIndex] = letter;
        }
        return enemyBullet;
    };
    Game.prototype.createEnemy = function () {
        var index = Math.floor(Math.random() * this.japanese.length);
        while (this.done[index]) {
            index = Math.floor(Math.random() * this.japanese.length);
        }
        var x = Math.floor(Math.random() * (this.game.width - 150)) + 50;
        var enemy = this.enemies.create(x, 0, 'sheet', 'PNG/Enemies/enemyBlack1.png');
        enemy.scale.setTo(0.5, 0.5);
        enemy.body.velocity.y = 50;
        this.words[index] = this.game.add.text(0, 0, this.japanese[index], { font: 'bold 16pt Arial', fill: "#88FF88" });
        this.words[index].anchor.set(0.5);
        this.words[index].setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        this.wordsGroup.add(this.words[index]);
        this.sprites[index] = enemy;
        this.enemyBulletTimes[index] = Math.random() * 2000 + this.game.time.time;
        this.done[index] = true;
    };
    Game.prototype.destroy = function (sprite, bullet) {
        var index = this.bullets.getChildIndex(bullet);
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i] === sprite && this.targets[index] === this.sprites[i]) {
                this.sprites[i].kill();
                this.words[i].kill();
                bullet.kill();
                this.sprites[i] = null;
                this.words[i] = null;
                this.targets[index] = null;
                this.enemyBulletTimes[i] = null;
                this.done[i] = false;
                break;
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
            }
        }
    };
    Game.prototype.damageShip = function (player, enemy) {
        player.damage(1);
        if (player.health === 0) {
            this.game.state.start('gameover');
        }
        var index = this.sprites.indexOf(enemy);
        this.sprites[index].kill();
        this.words[index].kill();
        this.sprites[index] = null;
        this.words[index] = null;
        this.targets[index] = null;
    };
    Game.prototype.damage = function (player, enemyBullet) {
        player.damage(1);
        if (player.health === 0) {
            this.game.state.start('gameover');
        }
        var index = this.enemyBullets.indexOf(enemyBullet);
        this.enemyBullets[index].kill();
        this.enemyLetters[index].kill();
        this.enemyBullets[index] = null;
        this.enemyLetters[index] = null;
        this.targets[index] = null;
    };
    Game.prototype.fireBullet = function (enemy) {
        var diff = ((enemy.body.x - this.player.body.x) / (enemy.body.y - this.player.body.y)) * -450;
        var bullet = this.bullets.getFirstExists(false);
        var index = this.bullets.getChildIndex(bullet);
        if (bullet) {
            this.fire.play();
            bullet.scale.setTo(0.5, 0.5);
            bullet.reset(this.player.x - 2, this.player.y - 12);
            bullet.body.velocity.x = diff;
            bullet.body.velocity.y = -450;
            this.targets[index] = enemy;
        }
    };
    return Game;
}(Phaser.State));
var GameOver = (function (_super) {
    __extends(GameOver, _super);
    function GameOver() {
        _super.apply(this, arguments);
    }
    GameOver.prototype.create = function () {
        var _this = this;
        var bg = this.game.add.sprite(0, 0, 'sheet', 'Backgrounds/purple.png');
        bg.scale.setTo(this.game.width / bg.width, this.game.height / bg.height);
        var gameOverText = this.game.add.text(this.game.width / 2, this.game.height / 3, "Game Over", { fontSize: '64px', fill: '#ffffff' });
        gameOverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
        gameOverText.anchor.setTo(0.5, 0.5);
        var titleText = this.game.add.text(this.game.width / 2, this.game.height / 3 * 2, "Return to the\nTitle Screen", { fontSize: '28px', fill: '#ffffff', align: 'center' });
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
    return GameOver;
}(Phaser.State));
window.onload = function () {
    var game = new Aether();
};
//# sourceMappingURL=game.js.map