import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// Store the database file in the project root during development.
// In a real product you'd point this at a proper data directory.
// Use an in-memory database during tests so each test run is isolated
const DB_PATH =
  process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '..', 'leads.db');

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    mobile     TEXT    NOT NULL,
    postcode   TEXT    NOT NULL,
    services   TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

export default db;
