# Team Kickoff

This document is the agent kickoff brief for Phase 0 execution.

Read these first:
- `ARCHITECTURE_DECISION_RECORD.md`
- `ARCHITECTURE_ROADMAP.md`
- `SPRINT_BOARD.md`
- `IMPLEMENTATION_BACKLOG.md`
- `DEPENDENCY_GRAPH.md`

## Core Rules

- Supabase is the canonical data system.
- `/server/` remains in maintenance mode until `A2-001` and `A2-003` are complete and approved.
- `user_roles` is the only canonical admin authority.
- Table naming is plural `snake_case`.
- No agent may invent new backend patterns.
- No agent may add new mock data.
- No shared contract changes without Chief Architect review.
- If a ticket exposes ADR conflict, stop and escalate instead of improvising.

## Day 1 Go Order

Start now:
- `D1-001 Dependency Audit`
- `D1-005 Environment Documentation`
- `A2-001 Route Inventory`
- `D2-001 RLS Inventory`

Hold until the first reviews are in:
- `A1-002 Businesses Table`

## Agent Briefs

### A1: Data Model & Supabase

Start with `A1-002` only after confirming the updated ADR and reviewing current schema from `A1-001` inputs.

Immediate objective:
- Create the canonical `businesses` migration in `supabase/migrations/`
- Use plural `snake_case`
- Include RLS and indexes
- Avoid schema drift against existing `profiles`, `business_registrations`, and `match_requests`

Acceptance:
- Migration file created
- Naming matches ADR
- Ownership and admin rules rely on `user_roles`
- Migration unblocks directory and business profile work

### A2: Backend Consolidation

Start `A2-001 Route Inventory`.

Immediate objective:
- Review all routes under `server/src`
- Produce `server/src/routes/inventory.md`
- For each route capture:
  - file
  - method
  - path
  - purpose
  - data owner
  - recommendation: keep, migrate, or remove

Focus:
- subscriptions
- payouts
- wallets
- webhooks
- any overlap with Supabase-owned domains

Acceptance:
- Every route classified
- Demo-memory hotspots called out explicitly
- No code changes yet unless needed to document reality

### D1: Quality & Release

Start `D1-001` and `D1-005` in sequence.

Immediate objective:
- Make local setup reproducible
- Verify install/build/lint/test path for the frontend
- Record blockers precisely
- Do not change architecture

Then:
- Update `.env.example`
- Group variables by runtime boundary:
  - frontend
  - server
  - Supabase secrets
  - Stripe

Acceptance:
- Documented status for `npm install`, `npm run build`, `npm run lint`, `npm run test`
- Cleaned `.env.example`

### D2: Security & Compliance

Start `D2-001 RLS Inventory`.

Immediate objective:
- Audit all tables and policies from `supabase/setup.sql` and `supabase/migrations/`
- Produce `docs/rls-audit.md`

For each table capture:
- RLS enabled status
- policies present
- gaps
- risk severity

Rules:
- Treat `user_roles` as canonical admin authority
- Flag any place where client behavior outruns server enforcement

Acceptance:
- Complete RLS matrix
- Actionable gaps identified

## Chief Architect Review Gate

Before Phase 1 opens, review and approve:
- `server/src/routes/inventory.md`
- `docs/rls-audit.md`
- updated `.env.example`
- D1 dependency audit result
- A1 `businesses` migration proposal

## Coordination Rules

- No agent changes shared contracts without review.
- No one deletes `/server/`.
- No one adds new mock data.
- Merge order remains:
  1. schema/contracts
  2. backend implementation
  3. frontend integration
  4. tests/docs
