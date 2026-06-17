class Game {
    constructor(canvas, assetLoader) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assets = assetLoader;

        this.width = canvas.width;
        this.height = canvas.height;

        this.state = 'MENU'; // MENU, PLAYING, GAME_OVER, SETTINGS, HIGHSCORES
        this.difficulty = 1; // 0: Easy, 1: Normal, 2: Hard

        this.bgY = 0;
        this.bgSpeed = 50;

        this.player = null;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.particles = [];

        this.score = 0;
        this.lives = 3;

        this.enemyDirection = 1;
        this.enemySpeedX = 50;
        this.enemySpeedY = 20;
        this.enemyFireRate = 0.005;

        this.lastTime = 0;
        this.bgMusic = null;

        this.bulletImage = this.assets.getImage('bullet');

        this.highscores = new HighscoreManager();
        this.highscoreViewDifficulty = 1;

        this.initInput();
        requestAnimationFrame((t) => this.loop(t));
    }

    initInput() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            if (this.state === 'MENU') {
                if (mouseX >= 300 && mouseX <= 500 && mouseY >= 330 && mouseY <= 380) {
                    this.assets.playSound('start_game');
                    this.startGame();
                }
                if (mouseX >= 300 && mouseX <= 500 && mouseY >= 400 && mouseY <= 450) {
                    this.assets.playSound('choose_option');
                    this.state = 'SETTINGS';
                }
                if (mouseX >= 300 && mouseX <= 500 && mouseY >= 470 && mouseY <= 520) {
                    this.assets.playSound('choose_option');
                    this.highscoreViewDifficulty = this.difficulty;
                    this.state = 'HIGHSCORES';
                }
                if (mouseX >= 300 && mouseX <= 500 && mouseY >= 540 && mouseY <= 590) {
                    this.assets.playSound('decide_option');
                    if (!document.fullscreenElement) {
                        this.canvas.requestFullscreen().catch(err => {
                            console.log(`Błąd wchodzenia w tryb pełnoekranowy: ${err.message}`);
                        });
                    } else {
                        document.exitFullscreen();
                    }
                }
            } else if (this.state === 'SETTINGS') {
                if (mouseX >= 250 && mouseX <= 550 && mouseY >= 200 && mouseY <= 250) {
                    this.assets.playSound('choose_option');
                    this.difficulty = (this.difficulty + 1) % 3;
                }
                if (mouseX >= 250 && mouseX <= 300 && mouseY >= 280 && mouseY <= 330) {
                    this.assets.playSound('choose_option');
                    this.assets.updateMusicVolume(Math.max(0, this.assets.musicVolume - 0.1), this.bgMusic);
                }
                if (mouseX >= 500 && mouseX <= 550 && mouseY >= 280 && mouseY <= 330) {
                    this.assets.playSound('choose_option');
                    this.assets.updateMusicVolume(Math.min(1, this.assets.musicVolume + 0.1), this.bgMusic);
                }
                if (mouseX >= 250 && mouseX <= 300 && mouseY >= 360 && mouseY <= 410) {
                    this.assets.updateSfxVolume(Math.max(0, this.assets.sfxVolume - 0.1));
                    this.assets.playSound('choose_option');
                }
                if (mouseX >= 500 && mouseX <= 550 && mouseY >= 360 && mouseY <= 410) {
                    this.assets.updateSfxVolume(Math.min(1, this.assets.sfxVolume + 0.1));
                    this.assets.playSound('choose_option');
                }
                if (mouseX >= 300 && mouseX <= 500 && mouseY >= 480 && mouseY <= 530) {
                    this.assets.playSound('decide_option');
                    this.state = 'MENU';
                }
            } else if (this.state === 'HIGHSCORES') {
                if (mouseY >= 150 && mouseY <= 190) {
                    if (mouseX >= 150 && mouseX <= 280) { this.highscoreViewDifficulty = 0; this.assets.playSound('choose_option'); }
                    if (mouseX >= 330 && mouseX <= 460) { this.highscoreViewDifficulty = 1; this.assets.playSound('choose_option'); }
                    if (mouseX >= 510 && mouseX <= 640) { this.highscoreViewDifficulty = 2; this.assets.playSound('choose_option'); }
                }

                if (mouseY >= 500 && mouseY <= 550) {
                    if (mouseX >= 150 && mouseX <= 380) {
                        this.assets.playSound('decide_option');
                        this.state = 'MENU';
                    }
                    if (mouseX >= 410 && mouseX <= 640) {
                        this.assets.playSound('choose_option');
                        if (window.confirm('Czy na pewno chcesz wyczyścić wyniki dla tego poziomu trudności?')) {
                            this.highscores.clearScores(this.highscoreViewDifficulty);
                        }
                    }
                }
            } else if (this.state === 'PAUSED') {
                if (mouseX >= 300 && mouseX <= 500 && mouseY >= 300 && mouseY <= 350) {
                    this.assets.playSound('decide_option');
                    this.state = 'MENU';
                }
            } else if (this.state === 'GAME_OVER') {
                if (mouseX >= 300 && mouseX <= 500 && mouseY >= 400 && mouseY <= 450) {
                    this.state = 'MENU';
                }
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.state === 'PLAYING') {
                    this.state = 'PAUSED';
                    if (this.bgMusic) this.bgMusic.pause();
                } else if (this.state === 'PAUSED') {
                    this.state = 'PLAYING';
                    this.lastTime = 0;
                    if (this.bgMusic) this.bgMusic.play().catch(() => { });
                }
            }
        });
    }

    startGame() {
        this.state = 'PLAYING';
        this.score = 0;
        this.lives = 3;

        if (this.difficulty === 0) {
            this.enemySpeedX = 30;
            this.enemyFireRate = 0.002;
        } else if (this.difficulty === 1) {
            this.enemySpeedX = 60;
            this.enemyFireRate = 0.005;
        } else {
            this.enemySpeedX = 100;
            this.enemyFireRate = 0.01;
        }

        const playerImg = this.assets.getImage('player');
        this.player = new Player(this, this.width / 2 - 25, this.height - 70, playerImg);
        this.player.activateShield(8);

        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.enemyDirection = 1;

        this.initEnemies();

        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
        this.bgMusic = this.assets.playSound('bg_music', true, true);
    }

    initEnemies() {
        const rows = 4;
        const cols = 8;
        const spacingX = 60;
        const spacingY = 50;
        const startX = 50;
        const startY = 50;

        const enemyImages = [
            this.assets.getImage('enemy1'),
            this.assets.getImage('enemy2'),
            this.assets.getImage('enemy3'),
            this.assets.getImage('enemy4')
        ];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const img = enemyImages[row % enemyImages.length];
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;
                this.enemies.push(new Enemy(this, x, y, img, row, col));
            }
        }
    }

    addPlayerBullet(x, y) {
        this.playerBullets.push(new Bullet(x, y, 400, false, this.bulletImage));
    }

    addEnemyBullet(x, y) {
        this.enemyBullets.push(new Bullet(x, y, 200 + this.difficulty * 50, true, this.bulletImage));
        this.assets.playSound('enemy_shoot');
    }

    createExplosion(x, y, color) {
        const particleCount = Math.floor(Math.random() * 9) + 8;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, color, 0.8));
        }
    }

    loop(timestamp) {
        if (this.lastTime === 0) this.lastTime = timestamp;
        let deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (deltaTime > 100) deltaTime = 16;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        if (this.state === 'PLAYING') {
            const bgImg = this.assets.getImage('background');
            let bgHeight = this.height;
            if (bgImg) {
                const scale = Math.max(this.width / bgImg.width, this.height / bgImg.height);
                bgHeight = bgImg.height * scale;
            }

            this.bgY += this.bgSpeed * (deltaTime / 1000);
            if (this.bgY >= bgHeight) {
                this.bgY = 0;
            }

            this.player.update(deltaTime);

            let moveDown = false;
            let edgeReached = false;

            for (const enemy of this.enemies) {
                if ((enemy.x + enemy.width >= this.width - 10 && this.enemyDirection === 1) ||
                    (enemy.x <= 10 && this.enemyDirection === -1)) {
                    edgeReached = true;
                    break;
                }
            }

            if (edgeReached) {
                this.enemyDirection *= -1;
                moveDown = true;
            }

            const dx = this.enemySpeedX * this.enemyDirection * (deltaTime / 1000);
            const dy = moveDown ? this.enemySpeedY : 0;

            for (const enemy of this.enemies) {
                enemy.update(dx, dy);

                if (Math.random() < this.enemyFireRate * (deltaTime / 16)) {
                    this.addEnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height);
                }

                if (this.checkCollision(enemy, this.player)) {
                    this.handlePlayerHit();
                }
            }

            this.playerBullets.forEach(b => b.update(deltaTime));
            this.enemyBullets.forEach(b => b.update(deltaTime));

            this.playerBullets = this.playerBullets.filter(b => b.y + b.height > 0);
            this.enemyBullets = this.enemyBullets.filter(b => b.y < this.height);

            for (let i = this.playerBullets.length - 1; i >= 0; i--) {
                let hit = false;
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    if (this.checkCollision(this.playerBullets[i], this.enemies[j])) {
                        this.createExplosion(this.enemies[j].x + this.enemies[j].width / 2, this.enemies[j].y + this.enemies[j].height / 2, 'orange');
                        this.assets.playSound('enemy_ship_destroyed');
                        this.enemies.splice(j, 1);
                        this.score += 10;
                        hit = true;
                        break;
                    }
                }
                if (hit) {
                    this.playerBullets.splice(i, 1);
                }
            }

            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                if (this.checkCollision(this.enemyBullets[i], this.player)) {
                    this.enemyBullets.splice(i, 1);
                    this.handlePlayerHit();
                }
            }

            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => !p.isDead());

            if (this.enemies.length === 0) {
                this.difficulty = Math.min(2, this.difficulty + 1);
                this.initEnemies();
            }
        }
    }

    handlePlayerHit() {
        if (this.player.shield && this.player.shield.isActive()) {
            this.assets.playSound('shield_lost');
            this.player.shield.active = false;
            this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 'cyan');
        } else {
            this.assets.playSound('life_lost');
            this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 'red');
            this.lives -= 1;

            if (this.lives <= 0) {
                this.state = 'GAME_OVER';
                this.highscores.addScore(this.difficulty, this.score);
                if (this.bgMusic) this.bgMusic.pause();
            } else {
                this.player.activateShield(8);
            }
        }
    }

    checkCollision(rect1, rect2) {
        // Tolerancja hitboxa: odcinamy "puste" przezroczyste fragmenty skrzydeł (25% z każdej strony)
        const m1x = rect1.width * 0.15;
        const m1y = rect1.height * 0.15;

        const m2x = rect2.width * 0.25;
        const m2y = rect2.height * 0.25;

        return (rect1.x + m1x) < (rect2.x + rect2.width - m2x) &&
            (rect1.x + rect1.width - m1x) > (rect2.x + m2x) &&
            (rect1.y + m1y) < (rect2.y + rect2.height - m2y) &&
            (rect1.y + rect1.height - m1y) > (rect2.y + m2y);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.state === 'MENU' || this.state === 'SETTINGS' || this.state === 'HIGHSCORES') {
            const menuImg = this.assets.getImage('main_menu');
            if (menuImg) {
                this.ctx.drawImage(menuImg, 0, 0, this.width, this.height);
            } else {
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            if (this.state === 'MENU' || this.state === 'SETTINGS') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(200, 150, 400, 450);
            } else {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(100, 100, 600, 470);
            }

            const glowAmount = Math.abs(Math.sin(Date.now() / 500)) * 20 + 10;
            this.ctx.save();
            this.ctx.shadowBlur = glowAmount;
            this.ctx.shadowColor = '#00ffff';
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 50px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SPACE INVADERS', this.width / 2, 80);
            this.ctx.restore();

            if (this.state === 'MENU') {
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(300, 330, 200, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.font = '30px sans-serif';
                this.ctx.fillText('START GAME', this.width / 2, 367);

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(300, 400, 200, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('SETTINGS', this.width / 2, 437);

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(300, 470, 200, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('HIGHSCORES', this.width / 2, 507);

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(300, 540, 200, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN', this.width / 2, 577);
            } else if (this.state === 'SETTINGS') {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '30px sans-serif';
                this.ctx.fillText('SETTINGS', this.width / 2, 180);

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(250, 200, 300, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.font = '24px sans-serif';
                const diffText = this.difficulty === 0 ? 'EASY' : (this.difficulty === 1 ? 'NORMAL' : 'HARD');
                this.ctx.fillText(`DIFFICULTY: ${diffText}`, this.width / 2, 235);

                this.ctx.fillText('Music Volume:', this.width / 2, 275);
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(250, 280, 50, 50);
                this.ctx.fillRect(500, 280, 50, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('-', 275, 315);
                this.ctx.fillText('+', 525, 315);
                this.ctx.fillText(`${Math.round(this.assets.musicVolume * 100)}%`, this.width / 2, 315);

                this.ctx.fillText('SFX Volume:', this.width / 2, 355);
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(250, 360, 50, 50);
                this.ctx.fillRect(500, 360, 50, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('-', 275, 395);
                this.ctx.fillText('+', 525, 395);
                this.ctx.fillText(`${Math.round(this.assets.sfxVolume * 100)}%`, this.width / 2, 395);

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(300, 480, 200, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('BACK', this.width / 2, 515);
            } else if (this.state === 'HIGHSCORES') {
                const diffs = ['EASY', 'NORMAL', 'HARD'];
                for (let i = 0; i < 3; i++) {
                    this.ctx.fillStyle = this.highscoreViewDifficulty === i ? '#666' : '#333';
                    this.ctx.fillRect(150 + i * 180, 150, 130, 40);
                    this.ctx.fillStyle = this.highscoreViewDifficulty === i ? 'cyan' : 'white';
                    this.ctx.font = '20px sans-serif';
                    this.ctx.fillText(diffs[i], 150 + i * 180 + 65, 178);
                }

                const scores = this.highscores.getScores(this.highscoreViewDifficulty);
                this.ctx.fillStyle = 'white';
                this.ctx.font = '24px sans-serif';
                if (scores.length === 0) {
                    this.ctx.fillText('No scores yet!', this.width / 2, 320);
                } else {
                    for (let i = 0; i < 5; i++) {
                        this.ctx.fillStyle = 'white';
                        this.ctx.textAlign = 'left';
                        this.ctx.fillText(`${i + 1}.`, 180, 240 + i * 45);

                        if (i < scores.length) {
                            const entry = scores[i];
                            this.ctx.fillText(`${entry.score} pts`, 220, 240 + i * 45);
                            this.ctx.textAlign = 'right';
                            this.ctx.fillStyle = '#ccc';
                            this.ctx.fillText(`${entry.date}, ${entry.time}`, 620, 240 + i * 45);
                        } else {
                            this.ctx.fillStyle = 'gray';
                            this.ctx.fillText(`---`, 220, 240 + i * 45);
                        }
                    }
                    this.ctx.textAlign = 'center';
                }

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(150, 500, 230, 50);
                this.ctx.fillRect(410, 500, 230, 50);

                this.ctx.fillStyle = 'white';
                this.ctx.font = '24px sans-serif';
                this.ctx.fillText('BACK TO MENU', 265, 533);
                this.ctx.fillStyle = '#ff5555';
                this.ctx.fillText('CLEAR SCORES', 525, 533);
                this.ctx.textAlign = 'center'; // restore
            }

        } else if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            const bgImg = this.assets.getImage('background');
            if (bgImg) {
                const scale = Math.max(this.width / bgImg.width, this.height / bgImg.height);
                const drawWidth = bgImg.width * scale;
                const drawHeight = bgImg.height * scale;
                const offsetX = (this.width - drawWidth) / 2;

                this.ctx.drawImage(bgImg, offsetX, this.bgY, drawWidth, drawHeight);
                this.ctx.drawImage(bgImg, offsetX, this.bgY - drawHeight, drawWidth, drawHeight);

                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.fillRect(0, 0, this.width, this.height);
            } else {
                this.ctx.fillStyle = '#111';
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            this.player.draw(this.ctx);
            this.enemies.forEach(e => e.draw(this.ctx));
            this.playerBullets.forEach(b => b.draw(this.ctx));
            this.enemyBullets.forEach(b => b.draw(this.ctx));
            this.particles.forEach(p => p.draw(this.ctx));

            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Lives: ${this.lives}`, this.width - 10, 30);

            if (this.state === 'PAUSED') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.width, this.height);

                this.ctx.fillStyle = 'white';
                this.ctx.font = '50px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('PAUSED', this.width / 2, this.height / 2 - 50);

                this.ctx.font = '20px sans-serif';
                this.ctx.fillText('Press ESC to Resume', this.width / 2, this.height / 2 - 10);

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(300, 300, 200, 50);
                this.ctx.fillStyle = 'white';
                this.ctx.font = '24px sans-serif';
                this.ctx.fillText('EXIT TO MENU', this.width / 2, 332);
            }

        } else if (this.state === 'GAME_OVER') {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = 'red';
            this.ctx.font = '50px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);

            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px sans-serif';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2);

            this.ctx.fillStyle = 'gray';
            this.ctx.fillRect(300, 400, 200, 50);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px sans-serif';
            this.ctx.fillText('BACK TO MENU', this.width / 2, 432);
        }
    }
}
