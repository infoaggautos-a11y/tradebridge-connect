# Admin Access Model

Date: 2026-03-19
Ticket: D2-002
Status: Current-state documentation aligned to the approved ADR.

## Canonical rule

`user_roles` is the only canonical source of admin authority.

Per `ARCHITECTURE_DECISION_RECORD.md`:

- `public.user_roles` is authoritative.
- `auth.users.app_metadata.role` may exist as a mirror or convenience field, but it is not authoritative.
- Client code must rely on Supabase-backed role checks and RLS, not local role assumptions.

## Current authorization flow

### 1. Identity source

Authentication comes from Supabase Auth (`auth.users` plus session/JWT state).

Authentication answers:

- who the user is
- whether the request is signed in

Authentication does not answer:

- whether the user is an admin

### 2. Role source

Authorization comes from `public.user_roles`.

Schema:

- table: `public.user_roles`
- key fields:
  - `user_id UUID`
  - `role app_role`
- uniqueness: `(user_id, role)`

Supported roles currently defined in SQL:

- `admin`
- `moderator`
- `user`

Only `admin` is used as a meaningful elevated role in the current app.

### 3. Role check primitive

The canonical runtime check is the SQL function:

- `public.has_role(_user_id UUID, _role app_role) -> BOOLEAN`

Characteristics:

- `SECURITY DEFINER`
- `STABLE`
- reads `public.user_roles`
- safe to call from RLS policies and client RPC

This is the core primitive used both for frontend admin detection and for admin RLS policies.

### 4. Frontend admin detection

The frontend checks admin status in [src/contexts/AuthContext.tsx](C:/Users/flood/dauno-integrated/src/contexts/AuthContext.tsx) by calling:

```ts
supabase.rpc('has_role', {
  _user_id: userId,
  _role: 'admin',
})
```

The returned boolean is mapped into `user.role === 'admin'`, and route gating uses that local value in [src/components/auth/ProtectedRoute.tsx](C:/Users/flood/dauno-integrated/src/components/auth/ProtectedRoute.tsx).

Important boundary:

- this frontend check is only a UX gate
- the real enforcement must remain in RLS and trusted backend paths

If frontend state says a user is admin but RLS does not allow the action, the request must still fail. If frontend state says a user is not admin, that should only affect navigation and rendering, not database integrity.

### 5. Database enforcement

Current admin-scoped RLS policies use:

```sql
public.has_role(auth.uid(), 'admin')
```

This is the correct architectural pattern.

Examples in current migrations:

- admin management of `user_roles`
- admin read access on `activity_log`
- admin read access on `profiles`
- admin read access on `subscriptions`
- admin read access on `payments`
- admin read access on `payouts`
- admin read access on `wallets`
- admin read access on `platform_revenue`

## Current bootstrap behavior

Initial role assignment is performed by the trigger function `public.assign_admin_role()` in the migration `20260311203351_0e4adc4a-49f6-45d1-b234-a32f922f7390.sql`.

Current behavior on user creation:

- if `NEW.email` matches one of a hardcoded allowlist values, insert `admin`
- always insert `user`

Current hardcoded admin bootstrap emails:

- `admin@daunointegrated.com`
- `admin@dil.com`
- `admin@diltradebridge.com`

## Interpretation of that bootstrap

This trigger is a bootstrap mechanism, not the canonical authority.

The canonical authority remains:

- the persisted row in `public.user_roles`

That means:

- a user is admin because `user_roles` says so
- not because their JWT says so
- not because their email matches a pattern
- not because the frontend stored `isAdmin = true`

The email allowlist matters only because it seeds `user_roles` automatically on signup.

## What is not authoritative

The following must not be treated as the source of truth for admin authorization:

- `auth.users.app_metadata.role`
- frontend `user.role`
- route visibility or navigation state
- hardcoded email checks in client code
- inferred admin status from membership tier or profile fields

## Enforcement model by layer

### Supabase Auth

Responsible for:

- user identity
- session issuance

Not responsible for:

- admin authorization decisions

### `user_roles`

Responsible for:

- canonical admin role assignment
- durable role state

### `has_role`

Responsible for:

- a single reusable authorization primitive
- consistent checks in RLS and client RPC calls

### RLS policies

Responsible for:

- final read/write enforcement
- preventing non-admin users from exercising admin-only capabilities

### Frontend guards

Responsible for:

- navigation control
- page visibility
- reducing accidental access attempts

Not sufficient for:

- security enforcement

## Known gaps and risks

### 1. Bootstrap admin assignment is hardcoded by email

Risk:

- operationally brittle
- requires code/migration changes to change bootstrap admins
- can drift from explicit role-management workflows

Short-term interpretation:

- acceptable only as a bootstrap shortcut
- not acceptable as a long-term admin lifecycle model

### 2. Some RLS policies do not yet fully match the admin model

The D2-001 audit found multiple tables where non-admin users still have broader access than intended. That is not a flaw in the `user_roles` model itself; it is an incomplete rollout of that model to the rest of the schema.

### 3. Frontend admin routing is only advisory

[src/components/auth/ProtectedRoute.tsx](C:/Users/flood/dauno-integrated/src/components/auth/ProtectedRoute.tsx) correctly blocks non-admin users from admin pages in the UI, but this is not a security boundary. RLS must remain the actual enforcement layer.

## Required architectural rules going forward

- All admin-only table access must be expressed with RLS policies based on `public.has_role(auth.uid(), 'admin')` or service-role execution.
- No client-side admin check may be treated as sufficient authorization.
- No new admin path may rely on `app_metadata.role` as a source of truth.
- Server-owned fields and admin review actions must be writable only through service-role or tightly scoped admin policies.
- If a user-facing exception exists, it must be documented explicitly per table.

## Recommended follow-up

1. Keep `user_roles` as the sole canonical authority.
2. Remove or de-emphasize any future dependency on role mirrors in profile or auth metadata.
3. Replace email-based bootstrap with an explicit admin provisioning workflow when schema/security remediation is scheduled.
4. Apply the D2-001 RLS remediation plan so the broader schema consistently follows this admin model.
