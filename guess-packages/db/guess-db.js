const sql = require('better-sqlite3');

class GuessDatabase {
    #db
    constructor(db_filename) {
        console.log("Initializing GuessDatabase with file:", db_filename);
        console.log("Database Instance in Constructor:", this.#db);    
        try {
            this.#db = sql(db_filename);
            console.log("✅ Database initialized successfully.");
            console.log("DB Instance Created:", this.#db);
            console.log("Type of this.#db:", typeof this.#db);
            console.log("Methods available:", Object.keys(this.#db));
        } catch (error) {
            console.error(" ERROR: Failed to initialize better-sqlite3:", error);
        }
        
    
        if (!this.#db || typeof this.#db.prepare !== 'function') {
            throw new Error("ERROR: Database instance not initialized properly!");
        }
    
        this.#bootstrap();
        this.#sweep_incomplete();
    }

    /** Creates the tables */
    #bootstrap() {
        const game = `create table if not exists game (id integer primary key, secret integer, completed integer, time text)`;
        const guess = `create table if not exists guesses (
                         game integer, 
                         guess integer, 
                         time integer, 
                         foreign key(game) references game(id) on delete cascade
                       )`;
        this.#db.prepare(game).run();
        this.#db.prepare(guess).run();
    }

    /** Deletes the incomplete games */
    #sweep_incomplete() {
        this.#db.prepare('delete from game where completed = ?').run(0);
    }

    /** inserts a game, assigns game.id to the created
     *  primary key
     */
    add_game(game) {
        if (!this.#db) {
            console.error("ERROR: Database instance is not initialized!");
            return;
        }
    
        console.log("Adding game:", game);
    
        const stmt = this.#db.prepare('INSERT INTO game (secret, completed) VALUES (?, ?)');
        const info = stmt.run(game.secret, game.complete);
        game.id = info.lastInsertRowid;
    
        console.log("Game added with ID:", game.id);
    }
    

    /** Updates the completed, time values of the game */
    update_game(game) {
        const stmt = this.#db.prepare('update game set completed = ?, time = ? where id = ?');
        stmt.run(game.complete, game.time, game.id)
    }

    /** Adds a guess record for the game */
    add_guess(game, guess) {
        const g = this.#db.prepare('insert into guesses (game, guess, time) values (?, ?, ?)');
        g.run(game.id, guess, (new Date()).getTime());
    }

    /* Finds the game record for the game, by id - and populates
    *  the guesses array with the guesses for the game.
    */
    get_game(game_id) {
        const record = this.#db.prepare('select * from game where id = ?').get(game_id);
        record.guesses = this.#db.prepare('select * from guesses where game = ? order by time').all(record.id).map(g => g.guess);
        return record;
    }

    /** Returns all the (complete) games */
    get_games() {
        const records = this.#db.prepare('select * from game where completed = ?').all(1);
        for (const r of records) {
            r.guesses = this.#db.prepare('select * from guesses where game = ? order by time').all(r.id).map(g => g.guess);
        }
        return records
    }
}


exports.GuessDatabase = GuessDatabase;