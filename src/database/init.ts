import fs from 'fs';
import path from 'path';
import { pool } from '../shared/db';
import createLogger from '../shared/logger';

const logger = createLogger('DatabaseInit');

export const initDatabase = async (): Promise<boolean> => {
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

export default initDatabase;
