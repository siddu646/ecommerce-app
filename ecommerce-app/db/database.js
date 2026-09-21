// db/database.js
// Sets up a SQLite database (file-based, no external DB server required)
// and creates the schema if it doesn't already exist.

const path = require('path');
const Database = require('better-sqlite3');

// In production, point DB_PATH at a mounted persistent volume
// (e.g. /app/data/store.db on Railway) so the database survives restarts
// and redeploys. Defaults to a local file for development.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'store.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    price       REAL NOT NULL,
    image_url   TEXT NOT NULL,
    category    TEXT NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    total         REAL NOT NULL,
    status        TEXT NOT NULL DEFAULT 'placed',
    shipping_name TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    product_id  INTEGER NOT NULL REFERENCES products(id),
    name        TEXT NOT NULL,
    price       REAL NOT NULL,
    quantity    INTEGER NOT NULL
  );
`);

module.exports = db;
