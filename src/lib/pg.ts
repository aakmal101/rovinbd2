import { Pool } from 'pg';

// Prefer explicit params to avoid pg-connection-string URL parsing issues.
// Falls back to connection string if explicit params aren't set.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const useExplicit = process.env.DB_PASSWORD;

const pool = new Pool(
  useExplicit
    ? {
        host: 'aws-0-eu-west-1.pooler.supabase.com',
        port: 6543,
        user: 'postgres.mgxhqsoaefbfmspurqun',
        password: process.env.DB_PASSWORD,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        max: 10,
      }
    : {
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
      }
);

/* eslint-disable @typescript-eslint/no-explicit-any */
function sql(strings: TemplateStringsArray, ...values: any[]) {
  const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
  return pool.query({ text, values });
}
sql.query = (text: string) => pool.query(text);
/* eslint-enable @typescript-eslint/no-explicit-any */

export { sql };
