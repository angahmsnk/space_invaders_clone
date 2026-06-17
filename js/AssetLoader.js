class AssetLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
        
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Błąd ładowania obrazu: ${src}`));
            img.src = src;
        });
    }

    loadSound(key, src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', () => {
                this.sounds[key] = audio;
                resolve(audio);
            }, { once: true });
            audio.onerror = () => reject(new Error(`Błąd ładowania dźwięku: ${src}`));
            audio.src = src;
            audio.load();
        });
    }

    async loadAll(imageSources, soundSources) {
        const imagePromises = Object.entries(imageSources).map(([key, src]) => this.loadImage(key, src));
        const soundPromises = Object.entries(soundSources).map(([key, src]) => this.loadSound(key, src));
        
        await Promise.all([...imagePromises, ...soundPromises]);
    }

    getImage(key) {
        return this.images[key];
    }

    getSound(key) {
        return this.sounds[key];
    }

    playSound(key, loop = false, isMusic = false) {
        const sound = this.sounds[key];
        if (sound) {
            const soundClone = sound.cloneNode();
            soundClone.volume = isMusic ? this.musicVolume : this.sfxVolume;
            soundClone.loop = loop;
            
            const playPromise = soundClone.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Ignorujemy błędy DOMException (związane najczęściej z brakiem interakcji i AbortError)
                    if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
                        console.log('Audio play error:', e);
                    }
                });
            }
            return soundClone;
        }
        return null;
    }

    updateMusicVolume(volume, activeMusicElement) {
        this.musicVolume = volume;
        if (activeMusicElement) {
            activeMusicElement.volume = volume;
        }
    }

    updateSfxVolume(volume) {
        this.sfxVolume = volume;
    }
}
