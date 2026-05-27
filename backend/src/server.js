import { createApp } from './app.js';
import { config } from './config/env.js';
import { assertDbConnection, pool } from './config/db.js';

const app = createApp();

async function start() {
  try {
    await assertDbConnection();
    console.log('✅ Connected to MariaDB');
  } catch (err) {
    console.error('❌ Could not connect to the database:', err.message);
    process.exit(1);
  }

  const server = app.listen(config.PORT, () => {
    console.log(`🚀 Spotlight API listening on http://localhost:${config.PORT}`);
  });

  // Ομαλός τερματισμός: κλείσιμο του server και του pool της βάσης
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
