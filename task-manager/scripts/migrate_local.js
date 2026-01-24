import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const MIGRATIONS_DIR = '../migrations';

/**
 * Runs all migrations under specified directory. If a migration has already been applied,
 * i.e. it is logged under the migrations table, it is skipped.
 */
function runMigrations() {
    db.exec(
        `CREATE TABLE IF NOT EXISTS Migrations (
        id TEXT PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
    )

    // track applied migrations
    const applied = new Set(
        db.prepare(`SELECT id FROM Migrations`).all().map(res => res.id)
    )

    const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

    const transaction = db.transaction(() => {
        for (const file of files) {
            // if migration already applied, skip it
            if (applied.has(file)) {
                console.log(`Migration ${file} has already been applied. Skipping...`)
                continue;
            }
            
            // apply migration
            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), { encoding: 'utf8' });
            db.exec(sql);

            // log migration as applied
            console.log(`Applying migration ${file}...`)
            db.prepare(`INSERT INTO Migrations (id) VALUES (?)`).run(file);
        }
        console.log(`Migration complete!`);
    })

    transaction();
}

runMigrations()