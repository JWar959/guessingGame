# Guessing Game

A simple web-based number guessing game implemented in **Node.js** with a custom routing framework and SQLite database for game tracking.

## 📌 Features
- Allows players to guess a secret number between **1-10**.
- Tracks player guesses and stores game history in an SQLite database.
- Provides feedback on whether a guess is **too high, too low, or correct**.
- Saves completed games with timestamps for review.
- Supports a simple web interface for user interaction.

## 🛠️ Setup and Installation

### **1. Clone the Repository**
```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### **2. Install Dependencies**
```sh
npm install
```
This will install:
- `better-sqlite3` (for database management)
- `dotenv` (for environment variable management)
- `sqlite-async` (for async SQLite handling)

### **3. Set Up Environment Variables**
Create a `.env` file in the project root and add:
```
DBPATH=./guess.db
```
This sets up the SQLite database path.

### **4. Run the Game Server**
Start the server using:
```sh
node guess.js
```
The server will be accessible at `http://localhost:3000`.

---

## 🚀 How to Play
1. Open `http://localhost:3000` in your browser.
2. Enter a guess between **1 and 10**.
3. The game will tell you if your guess is:
   - **Too Low**
   - **Too High**
   - **Correct!**
4. You can view your **guess history** after completing a game.

---

## 📂 Project Structure
```
📁 project-folder
│── .env                  # Environment variables (database path)
│── framework.js           # Custom web framework for handling routes
│── Game.js                # Game logic (generating secret numbers, checking guesses)
│── guess.js               # Main server logic (handles user requests)
│── package.json           # Node.js dependencies and scripts
│── package-lock.json      # Locked dependency versions
```

- **`framework.js`**: Implements a basic routing framework for handling HTTP requests.
- **`Game.js`**: Defines the `Game` class for handling game logic.
- **`guess.js`**: Acts as the main server file, handling game state, database operations, and user interactions.

---

## ⚡ Future Improvements
- Add user authentication for tracking individual player scores.
- Expand game difficulty settings.
- Improve UI with CSS styling.

---

## 📝 License
This project is for educational purposes and follows an **open-source** approach. Feel free to modify and contribute!

---

👨‍💻 Developed by **John Warren**
