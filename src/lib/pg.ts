import { Pool } from 'pg';

// Supabase's pooled connection string works over plain TLS Postgres wire
// protocol, so a standard `pg` Pool is all that's needed here (unlike
// Vercel Postgres/Neon, which required a proprietary fetch/ws driver).
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false },
});

/* eslint-disable @typescript-eslint/no-explicit-any */
// Tagged-template helper matching the subset of the @vercel/postgres `sql`
// API this project relies on: `sql\`...${value}...\`` and `sql.query(text)`.
function sql(strings: TemplateStringsArray, ...values: any[]) {
  const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
  return pool.query(text, values);
}
sql.query = (text: string) => pool.query(text);
/* eslint-enable @typescript-eslint/no-explicit-any */

export { sql };
