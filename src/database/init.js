const fs = require('fs');
const path = require('path');
const { pool } = require('../shared/db');
const logger = require('../shared/logger')('DatabaseInit');

const initDatabase = async () => {
  const sqlPath = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    logger.info('Running database initialization schema...');
    await pool.query(sql);
    logger.info('Database schema initialized successfully.');
    return true;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize database schema');
    throw err;
  }
};

// Execute directly if run via CLI
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('Database setup completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initDatabase;
