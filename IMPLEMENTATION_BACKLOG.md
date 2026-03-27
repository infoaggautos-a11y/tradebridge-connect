# TradeBridge Connect - Implementation Backlog

## Architecture Decision

**APPROVED: Supabase-First Architecture**

| Component | Decision | Action |
|-----------|----------|--------|
| Backend | Supabase-first | Keep `/server/` in maintenance mode until A2 inventory and consolidation decisions are approved |
| Auth | Supabase Auth | Keep existing edge functions |
| Database | Supabase Postgres | Migrate schema from `setup.sql` + missing tables |
| Payments | Stripe via Edge Functions | Keep `check-subscription`, `create-checkout`, `customer-portal` |
| File Storage | Supabase Storage | Add buckets for KYC documents |
| Real-time | Supabase Realtime | Enable for notifications |
| Edge Functions | Deno | Keep, add missing ones |

---

## Phase 0: Foundation (Week 1-2)

### 0.1 Environment Setup
- [ ] Install `node_modules` for frontend (`npm install`)
- [ ] Install `node_modules` for server (or delete if retiring)
- [ ] Verify `vitest`, `eslint`, `vite build` work
- [ ] Document env vars in `.env.example` (copy from `.env`)
- [ ] Verify Supabase project link is configured

### 0.2 Database Schema Audit

Missing tables (referenced in code but not in `setup.sql`):

| Table | Purpose | Priority |
|-------|---------|----------|
| `profiles` | Already in setup.sql ✓ | Done |
| `subscriptions` | Already in setup.sql ✓ | Done |
| `payments` | Already in setup.sql ✓ | Done |
| `wallets` | Already in setup.sql ✓ | Done |
| `wallet_transactions` | Already in setup.sql ✓ | Done |
| `payouts` | Already in setup.sql ✓ | Done |
| `business_registrations` | In migrations ✓ | Done |
| `match_requests` | In migrations ✓ | Done |
| `businesses` | **MISSING** | High |
| `kyc_applications` | **MISSING** | High |
| `kyc_documents` | **MISSING** | High |
| `deals` | **MISSING** | Medium |
| `escrows` | **MISSING** | Medium |
| `events` | **MISSING** | Medium |
| `event_registrations` | **MISSING** | Low |
| `disputes` | **MISSING** | Medium |
| `activity_log` | **MISSING** | High |
| `notifications` | **MISSING** | Medium |
| `messages` | **MISSING** | Low |

### 0.3 Create Missing Tables

#### `businesses` table
```sql
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  website TEXT,
  sector TEXT,
  products_services TEXT,
  export_markets TEXT[],
  import_interests TEXT[],
  company_size TEXT,
  annual_revenue TEXT,
  registration_number TEXT,
  verification_level TEXT DEFAULT 'basic',
  verification_score INTEGER DEFAULT 0,
  trade_readiness_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `kyc_applications` table
```sql
CREATE TABLE public.kyc_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  current_tier TEXT DEFAULT 'basic',
  target_tier TEXT DEFAULT 'verified',
  status TEXT DEFAULT 'not_started',
  contact_person_name TEXT,
  contact_person_title TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  video_kyc_completed BOOLEAN DEFAULT false,
  platform_agreement_signed BOOLEAN DEFAULT false,
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `kyc_documents` table
```sql
CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.kyc_applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT,
  provider TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  metadata JSONB
);
```

#### `deals` table
```sql
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.businesses(id),
  seller_id UUID REFERENCES public.businesses(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'goods',
  status TEXT DEFAULT 'draft',
  total_amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

#### `deal_milestones` table
```sql
CREATE TABLE public.deal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  due_date TIMESTAMP WITH TIME ZONE,
  deliverables TEXT[],
  status TEXT DEFAULT 'pending',
  evidence TEXT[],
  delivered_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE
);
```

#### `escrows` table
```sql
CREATE TABLE public.escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_number TEXT UNIQUE NOT NULL,
  deal_id UUID REFERENCES public.deals(id),
  buyer_id UUID,
  seller_id UUID,
  amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  funded_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  commission INTEGER DEFAULT 0,
  commission_rate NUMERIC(5,4) DEFAULT 0.025,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `events` table
```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  country TEXT,
  status TEXT DEFAULT 'draft',
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `activity_log` table
```sql
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 0.4 RLS Policies for New Tables
Add appropriate RLS policies for each new table (user can CRUD own, admin can read all).

---

## Phase 1: Member Core (Week 3-4)

### 1.1 Directory & Business Profiles

| File | Task | Backend Needs |
|------|------|---------------|
| `src/pages/Directory.tsx` | Replace mock data with Supabase query | `businesses` table + filters |
| `src/pages/BusinessProfile.tsx` | Replace mock with real data | `businesses` table by ID |
| `src/components/...` | Business cards/list components | - |

**Tasks:**
- [ ] Query `businesses` table in Directory page
- [ ] Add sector/country filters
- [ ] Display business profile from real data
- [ ] Add "Request Match" button wired to `match_requests`

### 1.2 Trade Match System

| File | Task | Backend Needs |
|------|------|---------------|
| `src/pages/TradeMatch.tsx` | Replace mock with real matches | `match_requests` table |
| `supabase/functions/notify-match-request/` | Wire to actual notification | Email service |

**Tasks:**
- [ ] Create match request from UI → insert to `match_requests`
- [ ] Display user's match requests
- [ ] Add admin match approval workflow
- [ ] Wire notification edge function to email

### 1.3 Admin Business Review

| File | Task | Backend Needs |
|------|------|---------------|
| `src/pages/AdminBusinesses.tsx` | Replace mock with Supabase | `businesses` table |
| `src/pages/AdminKYCQueue.tsx` | Replace mock with Supabase | `kyc_applications` + `kyc_documents` |

**Tasks:**
- [ ] List all businesses with status filters
- [ ] View business details
- [ ] Approve/reject business verification
- [ ] List KYC applications
- [ ] View KYC application details + documents
- [ ] Approve/reject KYC with notes

---

## Phase 2: Subscriptions & Payments (Week 5-6)

### 2.1 Consolidate Stripe Integration

| File | Current State | Needed Action |
|------|--------------|--------------|
| `supabase/functions/check-subscription/` | Working ✓ | Add tier sync to `profiles` |
| `supabase/functions/create-checkout/` | Needs review | Verify works end-to-end |
| `supabase/functions/customer-portal/` | Needs review | Verify works end-to-end |
| `api/webhooks/stripe.ts` | Needs review | Verify webhook handler |

**Tasks:**
- [ ] Verify checkout flow end-to-end (test with Stripe CLI)
- [ ] Verify customer portal opens correctly
- [ ] Verify webhook updates `subscriptions` table
- [ ] Remove `src/services/subscriptionService.ts` mock arrays
- [ ] Remove `server/src/routes/subscriptionRoutes.ts` (duplicate)

### 2.2 Subscription Frontend

| File | Task |
|------|------|
| `src/pages/Subscription.tsx` | Replace mock plan display with real Stripe data |
| `src/pages/Membership.tsx` | Replace mock with real plans |
| `src/pages/MemberDashboard.tsx` | Show actual subscription status |

**Tasks:**
- [ ] Fetch actual subscription status on page load
- [ ] Display current plan with usage stats
- [ ] Handle upgrade/downgrade flows
- [ ] Show cancel at period end correctly

---

## Phase 3: KYC Workflow (Week 7-8)

### 3.1 KYC Tables & Edge Functions

**Tasks:**
- [ ] Create `kyc_applications` and `kyc_documents` tables
- [ ] Add Supabase Storage bucket for KYC documents
- [ ] Create edge function for document upload
- [ ] Create edge function for KYC submission

### 3.2 KYC Frontend

| File | Task | Notes |
|------|------|-------|
| `src/pages/KYCVerification.tsx` | Full workflow implementation | Replace local state |
| `src/pages/AdminKYCQueue.tsx` | Admin review queue | Already in Phase 1 |

**Tasks:**
- [ ] Step 1: Business info form → insert `kyc_applications`
- [ ] Step 2: Document upload → upload to Storage bucket
- [ ] Step 3: Video KYC placeholder (mock for now)
- [ ] Step 4: Bank account verification placeholder
- [ ] Progress indicator based on real data
- [ ] Admin can approve/reject with notes

### 3.3 Document Verification Flow
- [ ] Admin can view uploaded documents
- [ ] Approve/reject individual documents
- [ ] KYC status updates automatically

---

## Phase 4: Deal Room & Escrow (Week 9-10)

### 4.1 Deal Tables & Logic

**Tasks:**
- [ ] Create `deals`, `deal_milestones`, `escrows` tables
- [ ] Create edge functions for deal CRUD
- [ ] Create edge functions for escrow lifecycle

### 4.2 Deal Room Frontend

| File | Task |
|------|------|
| `src/pages/DealRoom.tsx` | Replace mock with real deals |
| `src/pages/Disputes.tsx` | Real dispute handling |

**Tasks:**
- [ ] List user's deals (as buyer and seller)
- [ ] Create new deal form
- [ ] Deal detail view with milestones
- [ ] Escrow funding flow
- [ ] Milestone acceptance flow
- [ ] Dispute initiation

### 4.3 Escrow Implementation
- [ ] Create escrow from deal
- [ ] Fund escrow from wallet
- [ ] Release escrow on milestone completion
- [ ] Refund escrow on cancellation

---

## Phase 5: Wallet & Payouts (Week 9-10, parallel with 4)

### 5.1 Wallet Persistence

**Tasks:**
- [ ] Verify `wallets` table schema matches setup.sql
- [ ] Create wallet on user signup
- [ ] Persist wallet transactions to `wallet_transactions`
- [ ] Remove server-side in-memory Map

### 5.2 Wallet Frontend

| File | Task |
|------|------|
| `src/pages/Wallet.tsx` | Replace mock with real data |

**Tasks:**
- [ ] Display wallet balance from database
- [ ] Show transaction history
- [ ] Add bank account
- [ ] Request payout → insert to `payouts`

---

## Phase 6: Events & Notifications (Week 11)

### 6.1 Events System

**Tasks:**
- [ ] Create `events` table
- [ ] Events list page → real data
- [ ] Event detail page → real data
- [ ] Event registration → `event_registrations`

### 6.2 Notifications

| File | Task |
|------|------|
| `src/services/notificationService.ts` | Wire to Supabase + email |

**Tasks:**
- [ ] Create `notifications` table
- [ ] Insert notifications on key events
- [ ] Real-time notification display (Supabase Realtime)
- [ ] Email notifications via Resend/SendGrid

---

## Phase 7: Testing & Hardening (Week 11-12)

### 7.1 Unit Tests

**Files to test:**
- [ ] `src/lib/planAccess.ts` - tier/access logic
- [ ] `src/hooks/useFeatureAccess.ts` - feature gate logic
- [ ] `src/services/kycService.ts` - KYC workflow (mock)
- [ ] `src/services/dealService.ts` - deal logic (mock)

### 7.2 Integration Tests

**Flows to test:**
- [ ] Auth: signup, login, logout, password reset
- [ ] Subscription: checkout, webhook, status
- [ ] KYC: submission, approval
- [ ] Deal: create, escrow, complete

### 7.3 Smoke Tests

**Pages to verify:**
- [ ] Homepage loads
- [ ] Directory loads
- [ ] Login works
- [ ] Member dashboard loads
- [ ] Admin dashboard loads

### 7.4 Security Hardening

**Tasks:**
- [ ] Verify all RLS policies are correct
- [ ] Add admin role checks
- [ ] Verify webhook signature checks
- [ ] Audit env vars (no secrets in code)
- [ ] Rate limiting on edge functions

---

## Phase 8: Deployment (Week 12)

### 8.1 Deploy Plan

1. [ ] Move all edge functions to production Supabase project
2. [ ] Run migrations on production database
3. [ ] Configure Stripe webhooks to production URLs
4. [ ] Deploy frontend to Vercel
5. [ ] Update DNS/domains
6. [ ] UAT with real data

### 8.2 Monitoring

- [ ] Set up Supabase dashboard alerts
- [ ] Add error tracking (Sentry)
- [ ] Set up uptime monitoring

---

## Task Assignment Matrix

| Agent | Phase | Tasks |
|-------|-------|-------|
| Agent-A | Phase 0 | Env setup, create all missing tables, RLS policies |
| Agent-B | Phase 1 | Directory, Business Profiles, Trade Match |
| Agent-C | Phase 2 | Subscriptions, Payments, Stripe webhook |
| Agent-D | Phase 3 | KYC workflow, document upload |
| Agent-E | Phase 4-5 | Deal Room, Escrow, Wallet, Payouts |
| Agent-F | Phase 6-7 | Events, Notifications, Testing |
| Agent-G | Phase 8 | Deployment, Monitoring |

---

## Gap Matrix: Pages → Tables → Edge Functions

| Page | Current Data | Target Table | Edge Function Needed |
|------|-------------|--------------|---------------------|
| Directory | mockData | `businesses` | - |
| BusinessProfile | mockData | `businesses` | - |
| TradeMatch | mockData | `match_requests` | `notify-match-request` (exists) |
| Membership | SUBSCRIPTION_PLANS | `subscriptions` | `create-checkout` (exists) |
| Subscription | subscriptionService mock | `subscriptions` | `check-subscription` (exists) |
| KYCVerification | local state | `kyc_applications`, `kyc_documents` | `upload-document` (new) |
| DealRoom | dealService mock | `deals`, `deal_milestones` | `create-deal` (new) |
| Disputes | local state | `deals`, `disputes` | `raise-dispute` (new) |
| Wallet | mockWallet | `wallets`, `wallet_transactions` | - |
| Events | mockData | `events` | - |
| AdminDashboard | Supabase ✓ | multiple | - |
| AdminBusinesses | mockData | `businesses` | - |
| AdminKYCQueue | mockData | `kyc_applications` | - |
| AdminMatches | mockData | `match_requests` | - |

---

## Quick Wins (Do First)

1. **Freeze `/server/` scope** - no new domain logic until A2 completes route inventory and consolidation decision
2. **Create `businesses` table** - unblocks Directory
3. **Wire Directory to Supabase** - visible progress
4. **Add `activity_log` table** - fixes AdminDashboard error
5. **Write first real test** - proves testing works

---

## Notes for Agents

- All Supabase operations use `src/integrations/supabase/client.ts`
- Edge functions run at `/functions/*` on Supabase
- Frontend calls edge functions via `supabase.functions.invoke()`
- Migration files go in `supabase/migrations/` with timestamp prefix
- No new Express domain ownership; `/server/` remains temporary integration infrastructure until retired by approved decision
