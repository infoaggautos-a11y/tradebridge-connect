# Master Architecture Roadmap - TradeBridge Connect

**Project:** TradeBridge Connect (DIL Trade Bridge)  
**Last Updated:** 2026-03-19  
**Status:** Pre-Production

---

## Executive Summary

This is a B2B trade matching platform connecting Nigerian/African businesses with Italian and European partners. The platform provides:
- Business directory and matching
- KYC verification
- Escrow-secured deals
- Subscription-based access tiers

**Current State:** Foundation layer exists but data is fragmented across Supabase tables, Express server, and frontend mocks.

**Target State:** Supabase-first architecture with one canonical data model per domain.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Member UI   │  │ Admin UI    │  │ Service Layer           │ │
│  │ Pages       │  │ Pages       │  │ Typed Supabase Clients  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Auth        │  │ Edge        │  │ Tables + RLS            │ │
│  │ Supabase    │  │ Functions   │  │ PostgreSQL              │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROVIDERS                            │
│  ┌─────────────┐  ┌─────────────┐                             │
│  │ Stripe       │  │ Paystack     │  (Express: Maintenance)     │
│  └─────────────┘  └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Team Structure

| Role | Agent | Primary Focus |
|------|-------|--------------|
| Chief Architect | Human | Schema approval, contract decisions |
| A1: Data Model | Agent | Supabase tables, migrations, RLS |
| A2: Backend | Agent | Express consolidation, payments |
| B1: Member UX | Agent | Directory, profiles, subscription UI |
| B2: Trust | Agent | KYC, deals, wallet, escrow |
| C1: Admin Ops | Agent | Admin pages, business review |
| D1: Quality | Agent | CI/CD, testing, deployment |
| D2: Security | Agent | RLS audit, webhooks, compliance |

---

## Phase Timeline

```
Week 1-2: Phase 0 - Control Plane
┌────────────────────────────────────────────────────────────────┐
│ A1: Schema audit + missing tables                              │
│ A2: Express route inventory + demo-memory removal               │
│ D1: Env setup + CI pipeline                                    │
│ D2: RLS audit                                                  │
└────────────────────────────────────────────────────────────────┘

Week 3-4: Phase 1 - Foundation
┌────────────────────────────────────────────────────────────────┐
│ B1: Directory, Business Profiles, Events → Real Data           │
│ C1: Admin dashboard, business registration review               │
│ A1: ERD finalized, seed data                                  │
└────────────────────────────────────────────────────────────────┘

Week 5-6: Phase 2 - Subscriptions
┌────────────────────────────────────────────────────────────────┐
│ A2: Webhook consolidation, subscription flow                  │
│ B1: Subscription page rewrite                                 │
│ C1: Admin subscription visibility                              │
└────────────────────────────────────────────────────────────────┘

Week 7-8: Phase 3 - KYC
┌────────────────────────────────────────────────────────────────┐
│ A1: KYC storage bucket                                        │
│ B2: KYC submission flow                                       │
│ C1: KYC admin queue                                           │
└────────────────────────────────────────────────────────────────┘

Week 9-10: Phase 4 - Deals & Wallet
┌────────────────────────────────────────────────────────────────┐
│ B2: Deal room, escrow, wallet, payouts                        │
│ C1: Admin disputes, finance dashboard                          │
└────────────────────────────────────────────────────────────────┘

Week 11-12: Phase 5 - Hardening
┌────────────────────────────────────────────────────────────────┐
│ D1: Test coverage, smoke tests, deployment                     │
│ D2: Security hardening                                         │
│ UAT + Launch                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Domain Models

### 1. User & Auth

```
User (Supabase Auth)
    │
    └── Profile (profiles table)
            │
            ├── membership_tier: 'free' | 'starter' | 'growth' | 'enterprise'
            ├── kyc_status: 'pending' | 'verified' | 'trade_ready'
            └── stripe_customer_id

    └── Business (businesses table)
            │
            ├── verification_level: 'basic' | 'verified' | 'premium'
            └── trade_readiness_score

    └── Subscription (subscriptions table)
            │
            ├── stripe_subscription_id
            ├── status: 'active' | 'past_due' | 'canceled'
            └── current_period_end

    └── KYC Application (kyc_applications table)
            │
            ├── status: 'not_started' | 'pending_review' | 'approved' | 'rejected'
            └── Documents (kyc_documents table)
```

### 2. Trade Matching

```
User
    └── Business
            │
            └── Match Requests (match_requests table)
                    │
                    ├── target_business_id
                    ├── match_score
                    └── status: 'pending' | 'approved' | 'rejected'
```

### 3. Deals & Escrow

```
Match Request
    └── Deal (deals table)
            │
            ├── buyer_id → Business
            ├── seller_id → Business
            ├── status: 'draft' | 'negotiating' | 'escrow_funded' | 'completed'
            │
            └── Milestones (deal_milestones table)
                    │
                    └── Escrow (escrows table)
                            │
                            ├── status: 'pending' | 'funded' | 'released' | 'refunded'
                            └── Commission tracking
```

### 4. Wallet & Payouts

```
User
    └── Wallet (wallets table)
            │
            ├── balance, pending_balance, available_balance
            │
            └── Transactions (wallet_transactions table)
                    │
                    └── Payouts (payouts table)
                            │
                            ├── status: 'pending' | 'processing' | 'completed' | 'failed'
                            └── Bank account details
```

---

## Table Catalog

| Table | Owner | Status | Notes |
|-------|-------|--------|-------|
| `profiles` | A1 | Done | In setup.sql |
| `subscriptions` | A1 | Done | In setup.sql |
| `payments` | A1 | Done | In setup.sql |
| `wallets` | A1 | Done | In setup.sql |
| `wallet_transactions` | A1 | Done | In setup.sql |
| `payouts` | A1 | Done | In setup.sql |
| `payment_methods` | A1 | Done | In setup.sql |
| `webhook_events` | A1 | Done | In setup.sql |
| `business_registrations` | A1 | Done | In migrations |
| `match_requests` | A1 | Done | In migrations |
| `businesses` | A1 | TODO | Needs migration |
| `kyc_applications` | A1 | TODO | Needs migration |
| `kyc_documents` | A1 | TODO | Needs migration |
| `deals` | A1 | TODO | Needs migration |
| `deal_milestones` | A1 | TODO | Needs migration |
| `escrows` | A1 | TODO | Needs migration |
| `events` | A1 | TODO | Needs migration |
| `activity_log` | A1 | TODO | Needs migration |
| `notifications` | A1 | TODO | Needs migration |

---

## Edge Functions

| Function | Owner | Status | Notes |
|----------|-------|--------|-------|
| `register-business` | A2 | Done | Works with Supabase auth |
| `check-subscription` | A2 | Done | Works with Stripe |
| `create-checkout` | A2 | Needs Test | Needs E2E verification |
| `customer-portal` | A2 | Needs Test | Needs E2E verification |
| `notify-match-request` | A2 | Done | Exists, needs wiring |

### Edge Functions to Create

| Function | Purpose | Owner |
|----------|---------|-------|
| `upload-kyc-document` | Document storage | B2 |
| `submit-kyc-application` | KYC submission | B2 |
| `create-deal` | Deal creation | B2 |
| `fund-escrow` | Escrow funding | B2 |
| `release-escrow` | Escrow release | B2 |
| `raise-dispute` | Dispute creation | B2 |

---

## Frontend Pages - Data Status

| Page | Current Source | Target Source | Agent |
|------|--------------|----------------|-------|
| Index | mockData | CMS/Events table | B1 |
| Directory | mockData | businesses table | B1 |
| BusinessProfile | mockData | businesses table | B1 |
| Events | mockData | events table | B1 |
| TradeMatch | mockData | match_requests | B1 |
| Membership | SUBSCRIPTION_PLANS | Stripe + DB | B1 |
| Subscription | mock | subscriptions table | B1 |
| KYCVerification | local state | kyc_applications | B2 |
| DealRoom | mock | deals table | B2 |
| Disputes | local state | disputes | B2 |
| Wallet | mock | wallets table | B2 |
| AdminDashboard | Supabase ✓ | Same | C1 |
| AdminBusinesses | mock | businesses | C1 |
| AdminKYCQueue | mock | kyc_applications | C1 |
| AdminMatches | mock | match_requests | C1 |
| AdminDisputes | mock | disputes | C1 |
| AdminFinance | mock | wallets, payouts | C1 |

---

## Security Model

### RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | User own | System | User own | - |
| businesses | Public | Admin | Business owner | Admin |
| subscriptions | User own | System | System | - |
| wallets | User own | System | System | - |
| kyc_applications | User own | User own | Admin | - |
| match_requests | User own / Admin | User own | Admin | - |
| deals | Participants / Admin | System | Participants | Admin |
| activity_log | Admin | System | - | - |

### Admin Access

- Admin role is determined canonically by the `user_roles` table
- `auth.users.app_metadata.role` may be mirrored later, but it is not authoritative
- All admin routes protected by `ProtectedRoute requireAdmin`
- RLS policies enforce server-side

---

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
```

### Server (.env)
```
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
FRONTEND_URL=
```

### Supabase (Secrets)
```
SUPABASE_SERVICE_ROLE_KEY= (in Supabase dashboard)
STRIPE_SECRET_KEY= (in Supabase Edge Function env)
```

---

## Testing Strategy

### Unit Tests
- `src/lib/planAccess.ts` - tier logic
- `src/hooks/useFeatureAccess.ts` - access hooks
- Edge function input validation

### Integration Tests
- Auth flow (signup, login, logout)
- Subscription checkout
- KYC submission
- Deal creation

### Smoke Tests
- Homepage loads
- Directory shows businesses
- Login works
- Subscription checkout completes

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL                                   │
│  Frontend React App                                              │
│  - Auto-deploys from main branch                                │
│  - Env vars from Vercel dashboard                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│  - PostgreSQL Database                                          │
│  - Auth                                                        │
│  - Edge Functions                                              │
│  - Storage                                                     │
│  - Realtime                                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STRIPE                                   │
│  - Subscriptions                                               │
│  - Payments                                                    │
│  - Webhooks → Supabase Edge Functions                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Blockers

1. **Missing tables** - businesses, KYC, deals, events, activity_log
2. **Mock data in pages** - Directory, BusinessProfile, TradeMatch, DealRoom, etc.
3. **Duplicate subscription code** - frontend mock + server + edge functions
4. **Demo-memory payouts** - Express server has in-memory state
5. **No CI pipeline** - can't verify changes automatically

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Pages using real data | 2 | 25 |
| Tables migrated | 10 | 20 |
| Edge functions working | 5 | 10 |
| Test coverage | 0% | 60% |
| Mock data imports in pages | ~20 | 0 |
| CI pipeline passing | No | Yes |

---

## Handoff Documents

| Document | Purpose |
|----------|---------|
| IMPLEMENTATION_BACKLOG.md | Detailed task list with SQL schemas |
| ARCHITECTURE_DECISION_RECORD.md | Governance rules and conventions |
| SPRINT_BOARD.md | Phase-by-phase tickets with dependencies |
| ARCHITECTURE_ROADMAP.md | This document - master reference |

---

## For New Agents

Start here:
1. Read `ARCHITECTURE_DECISION_RECORD.md` for rules
2. Check `SPRINT_BOARD.md` for your tickets
3. Reference `IMPLEMENTATION_BACKLOG.md` for SQL schemas
4. Don't touch anything in `/server/` without A2 approval
5. Don't add `mockData` imports anywhere
6. Ask Chief Architect before changing shared contracts

Questions? Check the ADR first.
