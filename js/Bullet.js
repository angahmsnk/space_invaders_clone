class Bullet {
    constructor(x, y, speed, isEnemy, image) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.isEnemy = isEnemy;
        this.image = image;
        // Wymiary pocisku ustalone sztywno
        this.width = 5;
        this.height = 15;
        this.active = true;
    }

    update(deltaTime) {
        if (this.isEnemy) {
            this.y += this.speed * (deltaTime / 1000);
        } else {
            this.y -= this.speed * (deltaTime / 1000);
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Lekka poświata dla widoczności
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.isEnemy ? 'red' : 'yellow';

        if (this.image) {
            if (this.isEnemy) {
                // Obrót o 180 stopni
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(Math.PI);
                ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.isEnemy ? 'red' : 'yellow';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}
