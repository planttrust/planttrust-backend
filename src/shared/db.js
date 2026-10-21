const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://planttrust:planttrust_dev@localhost:5432/planttrust',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
