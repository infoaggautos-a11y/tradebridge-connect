# Supabase Migration Runbook

## 1) Update Env Names
Frontend now accepts both naming styles:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`

## 2) Prepare Old and New DB URLs
Set these in `server/.env` (or your shell):

```env
SOURCE_SUPABASE_DB_URL=postgresql://postgres:[OLD_PASSWORD]@db.[OLD_PROJECT].supabase.co:5432/postgres
TARGET_SUPABASE_DB_URL=postgresql://postgres:[NEW_PASSWORD]@db.[NEW_PROJECT].supabase.co:5432/postgres
```

Optional:
```env
SUPABASE_SCHEMA_SQL_PATH=../supabase/setup.sql
```

## 3) Run Schema + Data Migration
From project root:

```bash
npm --prefix server run migrate:supabase
```

This will:
1. Apply `supabase/setup.sql` to target DB.
2. Copy supported `public.*` and `public.app_*` tables from source to target.
3. Skip missing tables safely.
4. Use `ON CONFLICT DO NOTHING` for idempotent reruns.

## 3B) If You Do Not Have Old DB Password
Use API migration with service-role keys:

```env
OLD_SUPABASE_URL=https://[old-project].supabase.co
OLD_SUPABASE_SERVICE_ROLE_KEY=old_service_role_key
NEW_SUPABASE_URL=https://[new-project].supabase.co
NEW_SUPABASE_SERVICE_ROLE_KEY=new_service_role_key
```

Run:

```bash
npm --prefix server run migrate:supabase:api
```

This copies rows via Supabase REST (`/rest/v1`) with upsert semantics and no Postgres password.

## 4) Important Limitation
`auth.users` is not migrated by this script. Supabase Auth users need separate migration via Supabase Auth export/import tools or Admin API flow.

## 5) Point App to New Project
- Frontend: set `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` (or `VITE_*` equivalent).
- Backend: set `DATABASE_URL` to the new Supabase Postgres URL.

Restart both frontend and backend after env changes.
