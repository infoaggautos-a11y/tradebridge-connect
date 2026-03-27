# RLS Audit

Date: 2026-03-19
Ticket: D2-001
Scope: `supabase/setup.sql`, all files in `supabase/migrations/`, and app flows that currently query those tables.

## Governing assumptions

- `user_roles` is the canonical admin authority per `ARCHITECTURE_DECISION_RECORD.md`.
- This audit describes the effective policy state defined in the checked-in SQL, not the intended future model.
- Severity reflects both confidentiality and integrity risk.

## Executive summary

The current Supabase schema enables RLS on every audited table, but several policies are materially too broad for the app behavior they support.

Highest-risk issues:

- `subscriptions`: users can insert and update their own subscription rows without any restriction on `plan_id`, `status`, billing fields, or provider IDs.
- `profiles`: users can update their own rows with no column-level restriction, which lets them change server-owned fields such as `membership_tier`, `stripe_customer_id`, `paystack_customer_id`, and `kyc_status`.
- `match_requests`: any authenticated user can read all rows and update all rows, which defeats admin-only review and exposes requester data.
- `business_registrations`: any authenticated user can read all registrations, exposing business contact data broadly across the member base.
- `activity_log`: any authenticated user can insert arbitrary audit events, which undermines the integrity of the audit trail.

Additional structural gaps:

- `payment_methods` and `webhook_events` have RLS enabled but no policies. This is secure-by-default, but the behavior should be documented as service-role-only if that is intentional.
- A migration creates a policy on `public.escrow_deals`, but no audited schema file creates that table.
- Frontend admin pages assume admin read/write powers that the current RLS layer does not consistently provide.

## RLS matrix

| Table | Defined in | RLS | Policies present | Gaps | Severity |
|---|---|---:|---|---|---|
| `profiles` | `setup.sql` | Yes | `Users can view own profile`; `Users can update own profile`; `Admins can view all profiles` | Users can update all columns on their own row, including server-owned fields like `membership_tier`, payment IDs, and `kyc_status`. No admin update policy for review workflows. | High |
| `subscriptions` | `setup.sql` | Yes | `Users can view own subscriptions`; `Users can create own subscriptions`; `Users can update own subscriptions`; `Admins can view all subscriptions` | Self-service insert/update allows plan and status tampering unless all writes are forced through trusted code paths. No constraint limits which columns or values a member may change. | High |
| `payments` | `setup.sql` | Yes | `Users can view own payments`; `Admins can view all payments` | No member/admin write policies. Safe for confidentiality, but any direct client write path will fail and must use service role or trusted backend. | Low |
| `wallets` | `setup.sql` | Yes | `Users can view own wallets`; `Admins can view all wallets` | No write policies. Safe by default, but wallet mutation must stay server-side. | Low |
| `wallet_transactions` | `setup.sql` | Yes | `Users can view own wallet transactions` | No admin read policy even though finance/admin flows are implied elsewhere. No write policies, so only trusted backend can insert. | Medium |
| `payouts` | `setup.sql` | Yes | `Users can view own payouts`; `Users can create own payouts`; `Admins can view all payouts` | Insert policy only checks `auth.uid() = user_id`; it does not prove `wallet_id` belongs to the caller or that amount/reference/provider fields are trustworthy. No member update policy, which is good, but create policy is too loose. | High |
| `platform_revenue` | `setup.sql` | Yes | `Admins can view platform revenue` | No insert/update policy. Secure by default if only service role writes, but not documented. | Low |
| `webhook_events` | `setup.sql` | Yes | None | Table is fully inaccessible to anon/authenticated users. This is secure-by-default, but any operational workflow that expects dashboard access will fail. | Low |
| `payment_methods` | `setup.sql` | Yes | None | Users cannot read or manage their own stored payment methods. Safe by default, but likely a product gap if the table is intended for user-facing payment method management. | Medium |
| `business_registrations` | `20260306130903`, `20260306141200` | Yes | `Anyone can submit registration`; `Authenticated users can view registrations`; `Service role full access` | All authenticated users can read every registration, exposing PII and business data. No admin-scoped review/update policy. Current policy does not align with admin-only review screens. | High |
| `match_requests` | `20260310221720` | Yes | `Users can view their own match requests`; `Users can create match requests`; `Authenticated users can view all match requests`; `Authenticated users can update match requests` | Any authenticated user can read and modify every match request, including `status` and `admin_notes`. This defeats the intended admin workflow. | High |
| `user_roles` | `20260311203351` | Yes | `Users can view own roles`; `Admins can manage roles` | Core admin authority is in the right place, but bootstrap still depends on hardcoded email assignment in trigger logic. Review whether that is acceptable long term. | Medium |
| `activity_log` | `20260311203351` | Yes | `Admins can view activity log`; `System can insert activity log` | Insert policy is granted to all authenticated users with `WITH CHECK (true)`, so any signed-in user can forge audit events. This breaks audit-log trustworthiness. | High |

## Cross-check against app behavior

### Admin authority

The frontend correctly checks admin status through `supabase.rpc('has_role', ...)` in `src/contexts/AuthContext.tsx`, which is consistent with the ADR. The issue is not the admin check itself; the issue is that several tables still grant non-admin users powers the UI treats as admin-only.

### Places where client behavior outruns server enforcement

- `src/pages/AdminMatches.tsx` updates `match_requests.status` and `match_requests.admin_notes`, but current RLS lets any authenticated user perform the same update on any row.
- `src/pages/AdminBusinesses.tsx` reads all `business_registrations`, and current RLS also lets every authenticated non-admin user read all registrations.
- `src/pages/AdminDashboard.tsx` and `src/pages/AdminActivity.tsx` rely on `activity_log` as an audit source, but current RLS lets any authenticated user insert arbitrary log rows.
- `src/pages/FinanceDashboard.tsx` queries `payments`, `payouts`, `platform_revenue`, and `escrow_deals`. Admin read policies exist for the first three, but `escrow_deals` is not created in the audited SQL set.
- `src/contexts/AuthContext.tsx` and `supabase/functions/check-subscription/index.ts` both treat subscription/profile fields as trusted state, but `profiles` and `subscriptions` currently allow self-service writes that can tamper with that state.

## Schema and migration inconsistencies

- `20260311203738_c1dd9a77-4010-475c-8632-276dd4730685.sql` creates `Admins can view all escrow deals` on `public.escrow_deals`.
- None of `supabase/setup.sql` or the audited migrations creates `public.escrow_deals`.
- Generated Supabase types and `src/pages/FinanceDashboard.tsx` also reference `escrow_deals`, so the codebase currently assumes a table that is not present in the audited schema files.

## Recommended remediation order

1. Tighten `profiles` so members can only update safe profile fields such as `name`.
2. Remove member insert/update access on `subscriptions`; allow writes only from trusted backend or service-role paths.
3. Replace broad `match_requests` policies with:
   - member read/create on own rows
   - admin read/update via `has_role(auth.uid(), 'admin')`
4. Replace broad `business_registrations` read access with:
   - submit for public/anonymous users as needed
   - own-row read for submitter
   - admin read/update for review staff
5. Restrict `activity_log` inserts to trusted backend paths only; do not allow arbitrary authenticated inserts.
6. Tighten `payouts` insert policy so `wallet_id` must belong to `auth.uid()`.
7. Decide whether `payment_methods`, `webhook_events`, and `platform_revenue` are intentionally service-role-only and document that explicitly.
8. Resolve the `escrow_deals` schema mismatch before finance/admin work continues.

## Suggested follow-on tickets

- D2-002: document the canonical admin authorization flow around `user_roles`, `has_role`, and bootstrap.
- D2-003: review remaining client-side admin assumptions after the RLS fixes above land.
