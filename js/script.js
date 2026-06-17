const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Rysowanie ekranu ładowania
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'white';
ctx.font = '30px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Loading assets...', canvas.width / 2, canvas.height / 2);

const loader = new AssetLoader();

const imagesToLoad = {
    'main_menu': 'graphics/main_menu.png',
    'background': 'graphics/background.jpg',
    'player': 'graphics/player.png',
    'enemy1': 'graphics/enemy1.png',
    'enemy2': 'graphics/enemy2.png',
    'enemy3': 'graphics/enemy3.png',
    'enemy4': 'graphics/enemy4.png',
    'bullet': 'graphics/bullet.png'
};

const soundsToLoad = {
    'bg_music': 'sounds/own_bg_music.wav',
    'choose_option': 'sounds/own_choose_option.wav',
    'decide_option': 'sounds/own_decide_option.wav',
    'enemy_ship_destroyed': 'sounds/own_enemy_ship_destroyed.wav',
    'enemy_shoot': 'sounds/own_enemy_shoot.wav',
    'life_lost': 'sounds/own_life_lost.wav',
    'shield_lost': 'sounds/own_shield_lost.wav',
    'shoot': 'sounds/own_shoot.wav',
    'start_game': 'sounds/own_start_game.wav'
};

loader.loadAll(imagesToLoad, soundsToLoad).then(() => {
    // Rozpoczęcie gry
    const game = new Game(canvas, loader);
}).catch(err => {
    console.error('Failed to load assets:', err);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillText('Error loading assets. Check console.', canvas.width / 2, canvas.height / 2);
});
