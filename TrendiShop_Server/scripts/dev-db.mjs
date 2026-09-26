/**
 * A local MongoDB for development, with no system install.
 *
 * mongodb-memory-server ships a real mongod binary and runs it as a child
 * process. Pointing it at a dbPath on disk — rather than letting it default to
 * a temp folder it wipes on exit — makes it an ordinary local database that
 * survives restarts. The data lives in .devdb/, which is gitignored.
 *
 *   npm run db          start it (first run downloads mongod, ~100 MB)
 *   Ctrl-C              stop it; the data stays
 *
 * Connect with:  mongodb://127.0.0.1:27017/trendyshops
 *
 * This is for local work only. Production points DATABASE_URL at Atlas.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DB_PATH = resolve(ROOT, '.devdb');
const PORT = 27017;

mkdirSync(DB_PATH, { recursive: true });

console.log('Starting local MongoDB…');
console.log(`  data: ${DB_PATH}`);

const mongod = await MongoMemoryServer.create({
    instance: {
        port: PORT,
        dbPath: DB_PATH,
        storageEngine: 'wiredTiger',
        // Without this the server drops the database directory when it exits.
        auth: false,
    },
});

console.log(`\n  ready: ${mongod.getUri()}`);
console.log(`  use:   mongodb://127.0.0.1:${PORT}/trendyshops\n`);
console.log('Ctrl-C to stop. Data is kept.');

const shutdown = async () => {
    console.log('\nStopping MongoDB (keeping the data)…');
    // doCleanup: false — otherwise stop() deletes dbPath and every restart
    // would come up with an empty database.
    await mongod.stop({ doCleanup: false, force: false });
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
