class HighscoreManager {
    constructor() {
        this.storageKey = 'space_invaders_highscores';
        this.scores = this.loadScores();
    }

    loadScores() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error("Failed to parse highscores from local storage.", e);
            }
        }
        return {
            0: [], // Easy
            1: [], // Normal
            2: []  // Hard
        };
    }

    saveScores() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    }

    addScore(difficulty, score) {
        // Formatowanie daty i czasu
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const dateStr = `${day}.${month}.${year}`;
        const timeStr = `${hours}:${minutes}`;

        this.scores[difficulty].push({
            score: score,
            date: dateStr,
            time: timeStr
        });

        // Sortowanie malejąco
        this.scores[difficulty].sort((a, b) => b.score - a.score);

        // Zachowanie tylko top 5
        if (this.scores[difficulty].length > 5) {
            this.scores[difficulty] = this.scores[difficulty].slice(0, 5);
        }

        this.saveScores();
    }

    getScores(difficulty) {
        return this.scores[difficulty] || [];
    }

    clearScores(difficulty) {
        this.scores[difficulty] = [];
        this.saveScores();
    }
}
