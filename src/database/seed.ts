import fs from 'fs';
import path from 'path';
import { pool } from '../shared/db';
import createLogger from '../shared/logger';

const logger = createLogger('DatabaseSeed');

export const runSeeds = async (): Promise<boolean> => {
  const seedsDir = path.join(__dirname, 'seeds');
  const files = [
    '01_users.sql',
    '02_projects.sql',
    '03_scam_typologies.sql',
    '04_geofences.sql',
    '05_audit_genesis.sql',
  ];

  logger.info('Starting database seed sequence...');

  for (const file of files) {
    const filePath = path.join(seedsDir, file);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf8');
      logger.info({ file }, 'Executing seed file...');
      try {
        await pool.query(sql);
        logger.info({ file }, 'Seed file applied successfully.');
      } catch (err: any) {
        logger.warn({ file, error: err.message }, 'Seed step encountered notice/error (continuing)');
      }
    } else {
      logger.warn({ file }, 'Seed file not found, skipping');
    }
  }

  logger.info('Database seeding sequence completed.');
  return true;
};

if (require.main === module) {
  runSeeds()
    .then(() => {
      logger.info('Seed runner finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed runner failed:', err);
      process.exit(1);
    });
}

export default runSeeds;
