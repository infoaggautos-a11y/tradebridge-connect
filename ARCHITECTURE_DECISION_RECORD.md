# Architecture Decision Record: Supabase-First

**Status:** APPROVED  
**Date:** 2026-03-19  
**Owner:** Chief Architect

---

## Governing Directives

### 1. System of Record
Supabase owns the canonical state for:
- `auth` - user accounts and sessions
- `profiles` - user metadata including membership_tier
- `user_roles` - role assignments (admin, member)
- `business_registrations` - new business signups
- `businesses` - verified business profiles
- `match_requests` - trade partner introductions
- `subscriptions` - subscription state synced from Stripe
- `kyc_applications` / `kyc_documents` - verification workflow
- `deals` / `deal_milestones` / `escrows` - trade deals
- `disputes` - deal conflicts
- `events` / `event_registrations` - events
- `activity_log` - audit trail
- `notifications` - user notifications

### 2. Express Server Policy
The Express server (`/server/`) is in **maintenance mode**:
- **Keep:** Payment provider webhook handlers that need raw body verification
- **Keep:** Integration endpoints for providers with no Supabase SDK
- **Remove:** Any endpoint that duplicates Supabase table ownership
- **Remove:** All demo-memory state (in-memory Maps, arrays)
- **Remove:** Overlapping subscription/payment routes
- **Do not delete `/server/`:** No agent may retire the server until `A2-001 Route Inventory` and `A2-003 Subscription Flow Decision` are completed and approved

### 3. Frontend Policy
- No `mockData` imports in production pages
- No in-memory service arrays in production code
- Services must call Supabase or approved backend endpoints
- Typed service layer only

### 4. Data Authority Matrix

| Domain | Canonical Model | Backend Owner |
|--------|----------------|---------------|
| Auth | Supabase Auth | A1 |
| Subscriptions | Supabase + Stripe | A2 |
| Payments | Supabase + Stripe | A2 |
| Wallets | Supabase | A2 |
| KYC | Supabase | A1 |
| Business Data | Supabase | A1 |
| Matching | Supabase | A1 |
| Deals/Escrow | Supabase | A1 |

---

## Naming Conventions

### Tables
- plural snake_case: `business_registrations`, `wallet_transactions`, `businesses`
- Timestamps: `created_at`, `updated_at`

### Columns
- snake_case: `membership_tier`, `stripe_customer_id`
- Foreign keys: `{table_singular}_id`: `user_id`, `business_id`
- Status enums: `status TEXT` with values: `'pending'`, `'active'`, `'completed'`, `'cancelled'`, `'failed'`

### Edge Functions
- kebab-case: `register-business`, `check-subscription`, `create-checkout`
- Nouns for queries, verbs for actions

### TypeScript Types
- PascalCase interfaces: `BusinessProfile`, `Subscription`
- Suffix enums: `DealStatus`, `EscrowStatus`
- Located in: `src/types/{domain}.ts`

### Frontend Services
- camelCase files: `dealService.ts`, `walletService.ts`
- Named exports: `export const dealService = {...}`

---

## Migration Rules

1. All schema changes go in `supabase/migrations/` with timestamp prefix
2. Each migration file = one logical change
3. Migrations are additive only (no column drops in production)
4. RLS policies must accompany new tables
5. A1 must approve all schema changes

---

## Authorization Rules

- `user_roles` is the single canonical source for admin authorization
- `auth.users.app_metadata.role` may be mirrored for convenience, but it is not authoritative
- Client code must rely on Supabase-backed role checks and RLS, not local role assumptions

---

## PR Merge Order

```
1. Schema/contracts (A1)
2. Edge functions (A2)
3. Server cleanup (A2)
4. Data services (B1/B2)
5. Page rewrites (B1/B2)
6. Admin pages (C1)
7. Tests (D1)
8. Security review (D2)
9. Deployment (D1)
```

---

## File Ownership

| Path | Owner | Notes |
|------|-------|-------|
| `supabase/migrations/*` | A1 | Schema changes |
| `supabase/functions/*` | A2 | Edge functions |
| `supabase/config.toml` | A1 | Supabase config |
| `server/src/*` | A2 | Express server |
| `src/types/*` | A1 | Type definitions |
| `src/services/*` | B1/B2 | Service layer |
| `src/pages/*Member*.tsx` | B1 | Member pages |
| `src/pages/*Trade*.tsx` | B1 | Trade pages |
| `src/pages/*Admin*.tsx` | C1 | Admin pages |
| `src/pages/KYC*.tsx` | B2 | KYC pages |
| `src/pages/*Wallet*.tsx` | B2 | Wallet pages |
| `src/pages/*Deal*.tsx` | B2 | Deal pages |
| `src/lib/*` | A1 | Shared utilities |
| `src/components/access/*` | B1 | Access control |
| `src/test/*` | D1 | Tests |
| `.github/workflows/*` | D1 | CI/CD |
| `*.md` | All | Documentation |

---

## Dependency Board

```
Phase 0 (Control Plane)
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ A1: Canonical Schema ──────────────────────────────┐    │
│ A2: Backend Consolidation                          │    │
│ D1: Env/CI Setup                                  │    │
│ D2: RLS Audit                                     │    │
└─────────────────────────────────────────────────────────┘
    │           │           │           │
    ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ B1:     │ │ B2:     │ │ C1:     │ │ D2:     │
│ Member  │ │ Trust   │ │ Admin   │ │ Security│
│ Flows   │ │ Layer   │ │ Ops     │ │ Review  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
    │           │           │
    └─────┬─────┘           │
          ▼                 ▼
┌─────────────────────────────────────────┐
│ D1: Hardening + Release                 │
└─────────────────────────────────────────┘
```
