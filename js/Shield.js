class Shield {
    constructor(durationSeconds) {
        this.maxDuration = durationSeconds * 1000;
        this.timeLeft = this.maxDuration;
        this.active = true;
        this.radius = 32;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.timeLeft -= deltaTime;
        if (this.timeLeft <= 0) {
            this.active = false;
        }
    }

    draw(ctx, playerX, playerY, playerWidth, playerHeight) {
        if (!this.active) return;

        const timeRatio = this.timeLeft / this.maxDuration; // 1.0 -> 0.0

        const blinkRate = 100 + (timeRatio * 400);

        const isVisible = Math.floor(Date.now() / blinkRate) % 2 === 0;

        if (isVisible) {
            const centerX = playerX + playerWidth / 2;
            const centerY = playerY + playerHeight / 2;

            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    isActive() {
        return this.active;
    }
}
