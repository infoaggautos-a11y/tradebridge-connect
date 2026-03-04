import process from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const OLD_URL = process.env.OLD_SUPABASE_URL || process.env.SOURCE_SUPABASE_URL || '';
const OLD_SERVICE_ROLE_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY || process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY || '';
const NEW_URL = process.env.NEW_SUPABASE_URL || process.env.TARGET_SUPABASE_URL || process.env.SUPABASE_URL || '';
const NEW_SERVICE_ROLE_KEY =
  process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

type TableConfig = {
  table: string;
  onConflict?: string;
};

const TABLES: TableConfig[] = [
  { table: 'profiles', onConflict: 'id' },
  { table: 'subscriptions', onConflict: 'id' },
  { table: 'payments', onConflict: 'id' },
  { table: 'wallets', onConflict: 'id' },
  { table: 'wallet_transactions', onConflict: 'id' },
  { table: 'payouts', onConflict: 'id' },
  { table: 'platform_revenue', onConflict: 'id' },
  { table: 'webhook_events', onConflict: 'id' },
  { table: 'payment_methods', onConflict: 'id' },

  { table: 'app_users', onConflict: 'user_id' },
  { table: 'app_subscriptions', onConflict: 'id' },
  { table: 'app_escrow_usage', onConflict: 'user_id,usage_month' },
  { table: 'app_wallets', onConflict: 'id' },
  { table: 'app_wallet_transactions', onConflict: 'id' },
  { table: 'app_bank_accounts', onConflict: 'id' },
  { table: 'app_payouts', onConflict: 'id' },
  { table: 'app_payments', onConflict: 'id' },
  { table: 'app_payment_methods', onConflict: 'id' },
  { table: 'app_webhook_events', onConflict: 'event_id' },
];

const PAGE_SIZE = 1000;

if (!OLD_URL || !OLD_SERVICE_ROLE_KEY || !NEW_URL || !NEW_SERVICE_ROLE_KEY) {
  console.error('Missing required env vars.');
  console.error('Set OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY, NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

function restBase(url: string) {
  return `${url.replace(/\/$/, '')}/rest/v1`;
}

function headers(key: string, extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function tableReachable(base: string, key: string, table: string): Promise<boolean> {
  const res = await fetch(`${base}/${table}?select=*&limit=1`, {
    method: 'GET',
    headers: headers(key),
  });

  return res.status !== 404;
}

async function fetchPage(base: string, key: string, table: string, from: number, to: number): Promise<any[]> {
  const res = await fetch(`${base}/${table}?select=*`, {
    method: 'GET',
    headers: headers(key, {
      Range: `${from}-${to}`,
      Prefer: 'count=exact',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch ${table} failed: ${res.status} ${text}`);
  }

  return (await res.json()) as any[];
}

async function upsertRows(base: string, key: string, cfg: TableConfig, rows: any[]): Promise<void> {
  if (rows.length === 0) return;

  const url = new URL(`${base}/${cfg.table}`);
  if (cfg.onConflict) url.searchParams.set('on_conflict', cfg.onConflict);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: headers(key, {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upsert ${cfg.table} failed: ${res.status} ${text}`);
  }
}

async function migrateTable(oldBase: string, oldKey: string, newBase: string, newKey: string, cfg: TableConfig) {
  const sourceOk = await tableReachable(oldBase, oldKey, cfg.table);
  const targetOk = await tableReachable(newBase, newKey, cfg.table);

  if (!sourceOk || !targetOk) {
    console.log(`- Skip ${cfg.table} (source=${sourceOk}, target=${targetOk})`);
    return;
  }

  let from = 0;
  let total = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const page = await fetchPage(oldBase, oldKey, cfg.table, from, to);

    if (page.length === 0) break;

    await upsertRows(newBase, newKey, cfg, page);
    total += page.length;

    console.log(`  ${cfg.table}: migrated ${total} rows...`);
    from += PAGE_SIZE;

    if (page.length < PAGE_SIZE) break;
  }

  console.log(`- ${cfg.table}: done (${total} rows)`);
}

async function main() {
  const oldBase = restBase(OLD_URL);
  const newBase = restBase(NEW_URL);

  console.log('Starting Supabase API migration...');
  console.log('Source:', OLD_URL);
  console.log('Target:', NEW_URL);

  for (const table of TABLES) {
    await migrateTable(oldBase, OLD_SERVICE_ROLE_KEY, newBase, NEW_SERVICE_ROLE_KEY, table);
  }

  console.log('API migration complete.');
  console.log('Note: auth.users is not migrated here.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
