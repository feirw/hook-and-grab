const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { seedIfEmpty } = require('./seed');

const dbDir = path.resolve(__dirname, '../database');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(__dirname, '../database/db.sqlite');

function initializeDatabase() {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT UNIQUE,
        firstName TEXT,
        lastName TEXT,
        dateOfBirth TEXT,
        phone TEXT,
        profilePicture TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        price REAL,
        isFree INTEGER,
        isOpenToTrade INTEGER,
        images TEXT,
        datePosted TEXT,
        sellerId INTEGER,
        FOREIGN KEY (sellerId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS boats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ownerId INTEGER,
        title TEXT,
        description TEXT,
        pricePerDay REAL,
        location TEXT,
        images TEXT,
        datePosted TEXT,
        FOREIGN KEY (ownerId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boatId INTEGER,
        renterId INTEGER,
        startDate TEXT,
        endDate TEXT,
        status TEXT,
        FOREIGN KEY (boatId) REFERENCES boats(id),
        FOREIGN KEY (renterId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS forum_discussions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        body TEXT,
        authorId INTEGER,
        createdAt TEXT,
        views INTEGER DEFAULT 0,
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discussionId INTEGER,
        authorId INTEGER,
        body TEXT,
        createdAt TEXT,
        FOREIGN KEY (discussionId) REFERENCES forum_discussions(id),
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);

    seedIfEmpty(db, () => db.close());
  });
}

function getDatabaseConnection() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  initializeDatabase,
  getDatabaseConnection,
};
