class Game {

    static fromRecord(record) {
        const game = new Game();
        game.id = record.id;
        game.secret = record.secret;
        game.guesses = record.guesses;
        game.complete = record.completed;
        game.time = record.time;
        game.guesses = record.guesses;
        return game;
    }

    constructor() {
        // Create the secret number
        this.secret = Math.floor(Math.random() * 10) + 1;
        this.guesses = [];
        this.complete = 0;
    }

    guess_response(user_guess) {
        if (user_guess > this.secret) {
            return "too high";
        } else if (user_guess < this.secret) {
            return "too low";
        } else {
            return undefined;
        }
    }

    make_guess(user_guess) {
        if (user_guess === this.secret) {
            this.complete = 1;
            this.time = (new Date()).toLocaleDateString();
        }
        return this.guess_response(user_guess);
    }
}


exports.Game = Game;