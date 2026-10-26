
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const dataDirectory = join(process.cwd(), "data");

mkdirSync(dataDirectory, { recursive: true });

const db = new Database(join(dataDirectory, "nexora.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'note',
    url TEXT,
    created_at TEXT NOT NULL DEFAULT (
      strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    )
  );
`);

export default db;
