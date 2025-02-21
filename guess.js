const http = require('http');
const Framework = require('./framework');
const Game = require('./Game');

const sql = require('better-sqlite3');

const db = sql('guess1-db');

/*
db.exec(`
    CREATE TABLE IF NOT EXISTS game (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT,
      score INTEGER
    );
  `);
  
*/
const games = [];
const guesses = [];

const game_lookup = (gameId) => {
    if (gameId >= 0 && gameId < games.length) {
        return games[gameId];
    } else {
        return undefined;
    }
}

const heading = () => {
    const html = `
        <!doctype html>
            <html>
                <head>
                    <title>Guess</title>
                </head>
                <body>
    `;
    return html;
}

const footing = () => {
    return `
        </body>
    </html>
    `;
}

const make_guess_page = (gameId, result) => {

    if (!gameId || isNaN(gameId)) {
        console.log("Warning: gameId is missing in make_guess_page!"); // Debugging
    }    
    const message = result === undefined ?
        `<p>I'm thinking of a number from 1-10!</p>` :
        `<p>Sorry your guess was ${result}, try again!</p>`;
    return `
        <form action="/" method="POST">
            ${message}
            <label for="guess">Enter your guess:</label>
            <input name="guess" placeholder="1-10" type="number" min="1" max="10"/>
            <input name="gameId" value="${gameId}" type="hidden"/>
            <button type="submit">Submit</button>
        </form>
        <a href="/history">Game History</a>
    `;
}

const send_page = (res, body) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(heading() + body + footing());
    res.end();
}

const start = (req, res) => {
    
    const game = new Game();

    const stmt = db.prepare('insert into game (secret, completed) values (?, ?)');
    const info = stmt.run(game.secret, game.complete);

    send_page(res, make_guess_page(info.lastInsertRowid));
}

const guess = async (req, res) => {

    console.log("Received body:", req.body);
    console.log("Received gameId:", req.body.gameId);

    const gameId = req.body.gameId;
    if (!gameId || isNaN(gameId)) {
        console.log("Error: gameId is missing or invalid!");
        res.writeHead(400);
        res.end("Invalid gameId");
        return;
    }

    const record = db.prepare('select * from game where id = ?').get(req.body.gameId);

    if(!record){
        res.writeHead(404);
        res.end();
        return;
    }

    // create a game instance from the record in the db
    const game = Game.fromRecord(record);
    const response = game.make_guess(req.body.guess);
    if (response) {
        if (!game.id) {
            console.log("Warning: game.id is missing before calling make_guess_page!");
        }
        send_page(res, make_guess_page(game.id, response)); 
    } else {
        send_page(res, `<h1>Great Job!</h1> <a href="/">Play again?</a>`);
    }
    

    // don't forget to update the database at this step!!
    const g = db.prepare('insert into guesses (game, guess, time) values (?, ?, ?)');
    g.run(game.id, req.body.guess, (new Date()).getTime());    


    const stmt = db.prepare('update game set completed = ?, time = ? where id = ?');
    stmt.run(game.complete, game.time, game.id);
}

const history = (req, res) => {

    // Before, the games array was just in memory. It's not anymore, we need to 
    // get all the completed games from the database, and build instances from 
    // the records.  Otherwise, the HTML is EXACTLY the same.
    const records = db.prepare('select * from game where completed = ?').all(1);
    for (const r of records) {
        r.guesses = db.prepare('select * from guesses where game = ? order by time').all(r.id).map(g => g.guess);
    }   
    const games = records.map(r => Game.fromRecord(r));

    const html = heading() +
        `
        <table>
            <thead>
                <tr>
                    <th>Game ID</th>
                    <th>Num Guesses</th>
                    <th>Completed</th>
                </tr>
            </thead>
            <tbody>
                ${games.filter(g => g.complete).map(g => `
                    <tr>
                        <td><a href="/history?gameId=${g.id}">${g.id}</a></td>
                        <td>${g.guesses.length}</td>
                        <td>${g.time}</td>
                    </tr>
                `).join('\n')}
            </tbody>
        </table>
        <a href="/">Play the game!</a>
        `
        + footing();
    send_page(res, html);
}

const game_history = (req, res) => {
    const game_guesses = guesses.filter(g => g.gameId == req.query.gameId);
    const html = heading() +
        `
        <table>
            <thead>
                <tr>
                    <th>Value</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                ${game_guesses.map(g => `
                    <tr>
                        <td>${g.value}</td>
                        <td>${g.time}</td>
                    </tr>
                `).join('\n')}
            </tbody>
        </table>
        <a href="/history">Game History</a>
        `
        + footing();
    send_page(res, html);
}

const bp = new Framework.BodyParser([
    { key: 'guess', type: 'int' },
    { key: 'gameId', type: 'int' }
]);

const qp = new Framework.QueryParser([
    { key: 'gameId', type: 'int' }
]);

const schema = [
    { key: 'guess', type: 'string', required: true } // Adjust as needed
];


const router = new Framework.Router(qp, bp);
router.get('/', start);
router.post('/', guess);
router.get('/history', history);
router.get('/history', game_history, true, [{ key: 'gameId', type: 'int', required: true }]);

// This is temporary.  We are issuing a select
// statement to get all the rows currently in game.
const r = db.prepare('select * from game').all();
console.log(r);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
