import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const SOURCE_DB_URL = process.env.SOURCE_SUPABASE_DB_URL || process.env.OLD_SUPABASE_DB_URL || '';
const TARGET_DB_URL = process.env.TARGET_SUPABASE_DB_URL || process.env.NEW_SUPABASE_DB_URL || '';
const SCHEMA_SQL_PATH =
  process.env.SUPABASE_SCHEMA_SQL_PATH || path.resolve(process.cwd(), '../supabase/setup.sql');

if (!SOURCE_DB_URL || !TARGET_DB_URL) {
  console.error('Missing DB URLs. Set SOURCE_SUPABASE_DB_URL and TARGET_SUPABASE_DB_URL.');
  process.exit(1);
}

const source = new Pool({ connectionString: SOURCE_DB_URL });
const target = new Pool({ connectionString: TARGET_DB_URL });

const TABLES: string[] = [
  'public.profiles',
  'public.subscriptions',
  'public.payments',
  'public.wallets',
  'public.wallet_transactions',
  'public.payouts',
  'public.platform_revenue',
  'public.webhook_events',
  'public.payment_methods',

  'public.app_users',
  'public.app_subscriptions',
  'public.app_escrow_usage',
  'public.app_wallets',
  'public.app_wallet_transactions',
  'public.app_bank_accounts',
  'public.app_payouts',
  'public.app_payments',
  'public.app_payment_methods',
  'public.app_webhook_events',
];

function qIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function splitTable(full: string): { schema: string; table: string } {
  const [schema, table] = full.split('.');
  if (!schema || !table) throw new Error(`Invalid table format: ${full}`);
  return { schema, table };
}

async function tableExists(pool: Pool, schema: string, table: string): Promise<boolean> {
  const res = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = $2
      ) AS exists
    `,
    [schema, table]
  );
  return !!res.rows[0]?.exists;
}

async function getColumns(pool: Pool, schema: string, table: string): Promise<string[]> {
  const res = await pool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `,
    [schema, table]
  );
  return res.rows.map((r) => r.column_name as string);
}

async function getPrimaryKey(pool: Pool, schema: string, table: string): Promise<string[]> {
  const res = await pool.query(
    `
      SELECT a.attname AS column_name
      FROM pg_index i
      JOIN pg_class c ON c.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
      WHERE i.indisprimary
        AND n.nspname = $1
        AND c.relname = $2
      ORDER BY array_position(i.indkey, a.attnum)
    `,
    [schema, table]
  );
  return res.rows.map((r) => r.column_name as string);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function applySchema() {
  if (!fs.existsSync(SCHEMA_SQL_PATH)) {
    console.warn(`Schema file not found at ${SCHEMA_SQL_PATH}. Skipping schema apply.`);
    return;
  }
  const sql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  if (!sql.trim()) {
    console.warn('Schema SQL is empty. Skipping schema apply.');
    return;
  }

  console.log(`Applying schema from ${SCHEMA_SQL_PATH} to target...`);
  const statements = sql
    .split(/;\s*\n/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => `${s};`);

  for (const stmt of statements) {
    try {
      await target.query(stmt);
    } catch (error: any) {
      const msg = String(error?.message || '').toLowerCase();
      const ignorable =
        msg.includes('already exists') ||
        msg.includes('duplicate key') ||
        msg.includes('duplicate_object') ||
        msg.includes('multiple primary keys');
      if (!ignorable) throw error;
    }
  }
  console.log('Schema apply pass complete.');
}

async function copyTable(fullTable: string) {
  const { schema, table } = splitTable(fullTable);
  const existsSource = await tableExists(source, schema, table);
  const existsTarget = await tableExists(target, schema, table);

  if (!existsSource || !existsTarget) {
    console.log(`- Skip ${fullTable} (exists source=${existsSource}, target=${existsTarget})`);
    return;
  }

  const sourceCols = await getColumns(source, schema, table);
  const targetCols = await getColumns(target, schema, table);
  const cols = sourceCols.filter((c) => targetCols.includes(c));

  if (cols.length === 0) {
    console.log(`- Skip ${fullTable} (no shared columns)`);
    return;
  }

  const pk = await getPrimaryKey(target, schema, table);
  const onConflict = pk.length > 0 ? ` ON CONFLICT (${pk.map(qIdent).join(', ')}) DO NOTHING` : '';

  const selectSql = `SELECT ${cols.map(qIdent).join(', ')} FROM ${qIdent(schema)}.${qIdent(table)}`;
  const srcRows = await source.query(selectSql);
  if (srcRows.rows.length === 0) {
    console.log(`- ${fullTable}: 0 rows`);
    return;
  }

  const colSql = cols.map(qIdent).join(', ');
  const batches = chunk(srcRows.rows, 500);
  let inserted = 0;

  for (const batch of batches) {
    const values: any[] = [];
    const tuples: string[] = [];

    for (const row of batch) {
      const start = values.length;
      cols.forEach((c) => values.push((row as any)[c]));
      const refs = cols.map((_, i) => `$${start + i + 1}`).join(', ');
      tuples.push(`(${refs})`);
    }

    const insertSql = `
      INSERT INTO ${qIdent(schema)}.${qIdent(table)} (${colSql})
      VALUES ${tuples.join(', ')}
      ${onConflict}
    `;

    const result = await target.query(insertSql, values);
    inserted += result.rowCount || 0;
  }

  console.log(`- ${fullTable}: source=${srcRows.rows.length}, inserted=${inserted}`);
}

async function main() {
  try {
    console.log('Starting Supabase migration...');
    await applySchema();

    for (const table of TABLES) {
      await copyTable(table);
    }

    console.log('Migration complete.');
    console.log('Note: auth.users is not copied by this script. Migrate Auth users separately in Supabase dashboard/tools.');
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
