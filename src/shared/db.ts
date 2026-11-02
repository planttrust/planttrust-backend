import { Pool, QueryResult, QueryResultRow } from 'pg';
import { DATABASE_URL } from './config';

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const query = <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export default {
  query,
  pool,
};
