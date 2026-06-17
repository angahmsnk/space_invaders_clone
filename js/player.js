class Player {
    constructor(game, x, y, image) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.image = image;
        this.width = 50;
        this.height = 50;

        this.speed = 300; // pixeli na sekundę
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };

        this.shield = null;
        this.lastShotTime = 0;
        this.shootDelay = 500;

        this.initInput();
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') this.keys.ArrowLeft = true;
            if (e.code === 'ArrowRight') this.keys.ArrowRight = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.keys.Space = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft') this.keys.ArrowLeft = false;
            if (e.code === 'ArrowRight') this.keys.ArrowRight = false;
            if (e.code === 'Space') this.keys.Space = false;
        });
    }

    activateShield(durationSeconds) {
        this.shield = new Shield(durationSeconds);
    }

    update(deltaTime) {
        const moveAmount = this.speed * (deltaTime / 1000);
        if (this.keys.ArrowLeft) {
            this.x -= moveAmount;
        }
        if (this.keys.ArrowRight) {
            this.x += moveAmount;
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width;
        }

        if (this.shield) {
            this.shield.update(deltaTime);
            if (!this.shield.isActive()) {
                this.shield = null;
            }
        }

        if (this.keys.Space) {
            const now = Date.now();
            if (now - this.lastShotTime > this.shootDelay) {
                this.shoot();
                this.lastShotTime = now;
            }
        }
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - (this.game.bulletImage ? this.game.bulletImage.width / 2 : 2.5);
        const bulletY = this.y;
        this.game.addPlayerBullet(bulletX, bulletY);
        this.game.assets.playSound('shoot', false, 0.3);
    }

    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        if (this.shield) {
            this.shield.draw(ctx, this.x, this.y, this.width, this.height);
        }
    }
}