import { Pool } from 'pg';

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false },
  // Transaction pooler (port 6543) does not support prepared statements
  max: 10,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
function sql(strings: TemplateStringsArray, ...values: any[]) {
  const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
  return pool.query({ text, values });
}
sql.query = (text: string) => pool.query(text);
/* eslint-enable @typescript-eslint/no-explicit-any */

export { sql };
