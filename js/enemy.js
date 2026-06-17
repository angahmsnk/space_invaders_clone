class Enemy {
    constructor(game, x, y, image, row, col) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.image = image;
        this.width = 40;
        this.height = 40;
        
        // Przechowujemy pozycję w siatce do ustalenia logiki (np. kto strzela)
        this.row = row;
        this.col = col;
        
        this.markedForDeletion = false;
    }

    update(xOffset, yOffset) {
        // Wróg porusza się razem z całą formacją zarządzaną przez Game.js
        this.x += xOffset;
        this.y += yOffset;
    }

    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}