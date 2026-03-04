import { PoolConfig } from 'pg';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const PLACEHOLDER_USERS = new Set(['user', 'username']);
const PLACEHOLDER_PASSWORDS = new Set(['password', 'changeme', 'your_password']);

function isUsableConnectionString(connectionString: string | undefined): connectionString is string {
  if (!connectionString) return false;

  try {
    const url = new URL(connectionString);
    const user = decodeURIComponent(url.username || '').trim().toLowerCase();
    const password = decodeURIComponent(url.password || '').trim().toLowerCase();

    if (!user || !password) return false;
    if (PLACEHOLDER_USERS.has(user)) return false;
    if (PLACEHOLDER_PASSWORDS.has(password)) return false;

    return true;
  } catch {
    return false;
  }
}

function resolveConnectionString(): string | null {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.SUPABASE_CONNECTION_STRING,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.PG_CONNECTION_STRING,
  ];

  for (const candidate of candidates) {
    if (isUsableConnectionString(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function buildPgPoolConfig(): PoolConfig | null {
  const connectionString = resolveConnectionString();
  if (!connectionString) return null;

  const forceSsl = process.env.DB_FORCE_SSL === 'true';
  const disableSsl = process.env.DB_DISABLE_SSL === 'true';

  if (disableSsl) {
    return { connectionString };
  }

  if (forceSsl) {
    return {
      connectionString,
      ssl: { rejectUnauthorized: false },
    };
  }

  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get('sslmode');

    if (sslmode === 'disable' || LOCAL_HOSTS.has(url.hostname)) {
      return { connectionString };
    }

    return {
      connectionString,
      ssl: { rejectUnauthorized: false },
    };
  } catch {
    return {
      connectionString,
      ssl: { rejectUnauthorized: false },
    };
  }
}
