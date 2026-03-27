# Sprint Board - Phase 0: Control Plane

**Sprint Duration:** 2 days  
**Goal:** Establish architecture control before parallel work begins

---

## Agent A1: Data Model & Supabase

### Ticket A1-001: Schema Inventory
```
File: supabase/migrations/audit.md
Type: Documentation
Description: List ALL existing tables, columns, indexes, and RLS from setup.sql and all migrations
Acceptance: One document listing every existing Supabase artifact
```

### Ticket A1-002: Missing Tables - Businesses
```
File: supabase/migrations/20260319200000_add_businesses.sql
Type: Migration
Description: Create businesses table (see IMPLEMENTATION_BACKLOG.md for schema)
Acceptance: Table created, RLS policies added, indexes created
Parent: A1-001
```

### Ticket A1-003: Missing Tables - KYC
```
File: supabase/migrations/20260319200001_add_kyc.sql
Type: Migration
Description: Create kyc_applications, kyc_documents tables
Acceptance: Tables created, RLS policies added, indexes created
Parent: A1-001
```

### Ticket A1-004: Missing Tables - Deals/Escrow
```
File: supabase/migrations/20260319200002_add_deals.sql
Type: Migration
Description: Create deals, deal_milestones, escrows tables
Acceptance: Tables created, RLS policies added, indexes created
Parent: A1-001
```

### Ticket A1-005: Missing Tables - Activity & Notifications
```
File: supabase/migrations/20260319200003_add_activity.sql
Type: Migration
Description: Create activity_log, notifications tables
Acceptance: Tables created, RLS policies added, indexes created
Parent: A1-001
```

### Ticket A1-005B: Missing Tables - Events
```
File: supabase/migrations/20260319200004_add_events.sql
Type: Migration
Description: Create events and event_registrations tables
Acceptance: Tables created, RLS policies added, indexes created
Parent: A1-001
```

### Ticket A1-006: Canonical ERD
```
File: docs/erd.md
Type: Documentation
Description: Produce entity relationship diagram showing all tables, relationships, ownership
Acceptance: Markdown diagram with table list and relationship arrows
Parent: A1-001, A1-002, A1-003, A1-004, A1-005
```

### Ticket A1-007: Dev Seed Data
```
File: supabase/seed.sql
Type: Seed Data
Description: Create seed data for local development (5 businesses, 2 users, sample events)
Acceptance: Running seed.sql populates dev database with usable test data
```

---

## Agent A2: Backend Consolidation

### Ticket A2-001: Route Inventory
```
File: server/src/routes/inventory.md
Type: Documentation
Description: List every Express route with file location, HTTP method, purpose, and Supabase overlap
Acceptance: Table listing each route with Keep/Migrate/Remove recommendation
```

### Ticket A2-002: Remove Demo-Memory State
```
Files: server/src/routes/payoutRoutes.ts, server/src/services/payoutService.ts
Type: Refactor
Description: Replace in-memory Map with Supabase table persistence
Acceptance: Payouts stored in database, survive server restart
Parent: A1-002
```

### Ticket A2-003: Subscription Flow Decision
```
File: docs/subscription-flow.md
Type: Architecture Decision
Description: Document which path for subscriptions:
  - Option A: Supabase edge functions + Stripe webhooks
  - Option B: Express API + DB persistence
Acceptance: One canonical path chosen with rationale
```

### Ticket A2-004: Consolidate Plan Definitions
```
Files: src/services/subscriptionService.ts, server/src/config/plans.ts
Type: Cleanup
Description: Remove duplicate SUBSCRIPTION_PLANS arrays, keep one source of truth
Acceptance: No duplicate plan definitions exist
```

### Ticket A2-005: Payout Persistence Model
```
File: docs/payout-model.md
Type: Architecture Decision
Description: Define payout states, processing flow, provider integration points
Acceptance: State machine documented with events and transitions
Parent: A2-002
```

---

## Agent D1: Quality & Release

### Ticket D1-001: Dependency Audit
```
File: package.json (reviewed)
Type: Investigation
Description: Verify all frontend dependencies install correctly, document missing node_modules
Acceptance: npm install succeeds, npm run build succeeds
```

### Ticket D1-002: Server Dependency Audit
```
File: server/package.json (reviewed)
Type: Investigation
Description: Verify server dependencies install correctly
Acceptance: npm install succeeds in /server
Note: May recommend server retirement
```

### Ticket D1-003: Standard Commands
```
File: package.json (updated scripts)
Type: Configuration
Description: Ensure standard scripts exist and work:
  - npm run dev
  - npm run build
  - npm run lint
  - npm run test
Acceptance: All commands succeed
```

### Ticket D1-004: CI Pipeline
```
File: .github/workflows/ci.yml
Type: CI/CD
Description: Create GitHub Actions workflow for:
  - npm install
  - npm run lint
  - npm run build
  - npm run test
Acceptance: CI passes on main branch
```

### Ticket D1-005: Environment Documentation
```
File: .env.example
Type: Documentation
Description: Document ALL required env vars with descriptions
Acceptance: New developer can set up from .env.example alone
```

---

## Agent D2: Security & Compliance

### Ticket D2-001: RLS Inventory
```
File: docs/rls-audit.md
Type: Documentation
Description: List all tables with RLS enabled, list all policies, identify gaps
Acceptance: Table showing table → policies → gaps
```

### Ticket D2-002: Admin Role Model
```
File: docs/admin-access.md
Type: Documentation
Description: Document how admin access is determined (RLS? app_metadata? RPC?)
Acceptance: Clear explanation of admin authorization flow
```

### Ticket D2-003: Client-Side Trust Audit
```
Type: Investigation
Description: Search for any client-side admin checks that should be server-side
Acceptance: List of found issues (if any)
```

---

## Sprint Completion Criteria

| Ticket | Status |
|--------|--------|
| A1-001 | Must be DONE |
| A1-002 | Must be DONE |
| A1-005 | Must be DONE |
| A2-001 to A2-005 | All must be DONE |
| D1-001 to D1-005 | All must be DONE |
| D2-001 to D2-003 | All must be DONE |
| A1-003, A1-004, A1-005B, A1-006, A1-007 | Can continue into Phase 1 if their dependent tracks are not starting yet |

**Before Phase 1 begins:** Chief Architect reviews and approves ERD and architecture decisions.

---

# Sprint Board - Phase 1: Foundation

**Sprint Duration:** 2-3 days  
**Goal:** Wire core read paths to real data

---

## Agent B1: Member Experience

### Ticket B1-001: Directory - Remove Mock Data
```
Files: src/pages/Directory.tsx, src/services/businessService.ts
Type: Feature Rewrite
Description:
  - Remove mockData import from Directory.tsx
  - Query businesses table from Supabase
  - Implement sector/country filters
  - Add search
Acceptance:
  - Directory loads from Supabase
  - Filters work
  - No mockData import remains
Parent: A1-002
```

### Ticket B1-002: Business Profile - Real Data
```
Files: src/pages/BusinessProfile.tsx
Type: Feature Rewrite
Description:
  - Remove mockData import
  - Load business by ID from Supabase
  - Display real verification level, sector, etc.
Acceptance:
  - Profile page shows real data
  - "Request Match" button creates match_request
Parent: B1-001
```

### Ticket B1-003: Events - Real Data
```
Files: src/pages/Events.tsx, src/pages/EventDetail.tsx
Type: Feature Rewrite
Description:
  - Remove mockData imports
  - Query events table
  - Handle event registration
Acceptance:
  - Events list from Supabase
  - Event detail page loads real data
Parent: A1-005B
```

### Ticket B1-004: Trade Match - Persistence
```
Files: src/pages/TradeMatch.tsx
Type: Feature Rewrite
Description:
  - Replace local calculateMatchScore with Supabase queries
  - Store match requests in match_requests table
  - Show user's match history
Acceptance:
  - Match requests saved to database
  - Match results persist on refresh
Parent: A1-001
```

### Ticket B1-005: Member Dashboard - Live Metrics
```
File: src/pages/MemberDashboard.tsx
Type: Feature Rewrite
Description: Replace hardcoded metrics with live Supabase queries
Acceptance: Dashboard shows real counts from database
```

---

## Agent C1: Admin Operations

### Ticket C1-001: Admin Dashboard - Data Integrity
```
File: src/pages/AdminDashboard.tsx
Type: Bug Fix
Description:
  - Fix queries for missing tables (activity_log)
  - Ensure all counts accurate
  - Add error handling
Acceptance: Dashboard loads without errors
Parent: A1-005
```

### Ticket C1-002: Business Registration Review
```
File: src/pages/AdminBusinesses.tsx
Type: Feature Rewrite
Description:
  - Load business_registrations from Supabase
  - Approve → creates business profile
  - Reject → marks registration
Acceptance: Admin can approve/reject registrations
Parent: A1-001, B1-001
```

### Ticket C1-003: Admin Match Management
```
File: src/pages/AdminMatches.tsx
Type: Feature Rewrite
Description:
  - Load match_requests from Supabase
  - View match details
  - Approve/reject match introductions
Acceptance: Admin can manage match requests
Parent: B1-004
```

---

## Sprint Completion Criteria

| Ticket | Status | Blocker |
|--------|--------|---------|
| B1-001 | Must complete | A1-002 |
| B1-002 | Must complete | B1-001 |
| B1-003 | Must complete | A1-005 |
| B1-004 | Must complete | A1-001 |
| B1-005 | Should complete | B1-001, B1-002 |
| C1-001 | Must complete | A1-005 |
| C1-002 | Should complete | A1-002 |
| C1-003 | Should complete | B1-004 |

---

# Sprint Board - Phase 2: Subscription & Payment

**Sprint Duration:** 3-4 days  
**Goal:** One canonical subscription flow

---

## Agent A2: Backend Consolidation

### Ticket A2-006: Webhook Consolidation
```
Files: api/webhooks/stripe.ts, supabase/functions (check-subscription)
Type: Refactor
Description:
  - Choose webhook handler location (Supabase or Express)
  - Remove duplicate handlers
  - Ensure subscription status syncs correctly
Acceptance: Webhooks work from one location only
Parent: A2-003
```

### Ticket A2-007: Checkout Flow End-to-End
```
Files: supabase/functions/create-checkout
Type: Feature Test
Description:
  - Test checkout with Stripe CLI
  - Verify subscription record created
  - Verify profile tier updated
Acceptance: Full checkout flow works
```

### Ticket A2-008: Customer Portal
```
Files: supabase/functions/customer-portal
Type: Feature Test
Description: Verify customer portal opens and manages subscription
Acceptance: Portal redirects correctly
```

---

## Agent B1: Member Experience

### Ticket B1-006: Subscription Page Rewrite
```
File: src/pages/Subscription.tsx
Type: Feature Rewrite
Description:
  - Replace subscriptionService mock with Supabase/Stripe data
  - Show actual current plan
  - Handle upgrade/downgrade flows
Acceptance: Subscription page shows real data
Parent: A2-006, A2-007
```

### Ticket B1-007: Access Gate Alignment
```
Files: src/lib/planAccess.ts, src/components/access/PlanProtectedRoute.tsx
Type: Bug Fix
Description: Ensure plan access logic matches canonical subscription model
Acceptance: Access restrictions work correctly
```

---

## Agent C1: Admin Operations

### Ticket C1-004: Admin Subscription Visibility
```
File: src/pages/AdminSubscriptions.tsx
Type: Feature Rewrite
Description: Load subscriptions from Supabase, show all paid subscriptions
Acceptance: Admin sees subscription data
```

---

# Sprint Board - Phase 3: KYC & Trust

**Sprint Duration:** 3-4 days  
**Goal:** Persistent KYC workflow

---

## Agent A1: Data Model

### Ticket A1-008: KYC Document Storage
```
File: supabase/storage/
Type: Configuration
Description: Create Supabase Storage bucket for KYC documents
Acceptance: Bucket exists with appropriate RLS
Parent: A1-003
```

---

## Agent B2: Trust & Transactions

### Ticket B2-001: KYC Submission Flow
```
File: src/pages/KYCVerification.tsx
Type: Feature Rewrite
Description:
  - Submit application to kyc_applications
  - Upload documents to storage
  - Track status
Acceptance: Full submission persists
Parent: A1-003, A1-008
```

### Ticket B2-002: KYC Status Display
```
File: src/pages/KYCVerification.tsx
Type: Feature Rewrite
Description: Show application status from database, progress indicators
Acceptance: Status updates on page refresh
```

---

## Agent C1: Admin Operations

### Ticket C1-005: KYC Queue
```
File: src/pages/AdminKYCQueue.tsx
Type: Feature Rewrite
Description:
  - Load kyc_applications from Supabase
  - View application and documents
  - Approve/reject with notes
Acceptance: Admin can review KYC applications
Parent: A1-003, B2-001
```

---

# Sprint Board - Phase 4: Deals, Escrow, Wallet

**Sprint Duration:** 4-5 days  
**Goal:** Persistent deal room and wallet

---

## Agent B2: Trust & Transactions

### Ticket B2-003: Deal Room - Real Deals
```
File: src/pages/DealRoom.tsx, src/services/dealService.ts
Type: Feature Rewrite
Description:
  - Remove dealService mock arrays
  - Query deals from Supabase
  - CRUD operations via edge functions or Supabase
Acceptance: Deals persist in database
Parent: A1-004
```

### Ticket B2-004: Escrow Lifecycle
```
File: src/pages/DealRoom.tsx
Type: Feature Rewrite
Description: Fund, release, refund escrows via escrows table
Acceptance: Escrow state transitions work
Parent: B2-003
```

### Ticket B2-005: Wallet - Real Balance
```
File: src/pages/Wallet.tsx, src/services/walletService.ts
Type: Feature Rewrite
Description:
  - Replace walletService mock
  - Query wallets from Supabase
  - Display real balance and transactions
Acceptance: Wallet shows real data
Parent: A1-002
```

### Ticket B2-006: Payout Flow
```
File: src/pages/Wallet.tsx
Type: Feature Rewrite
Description: Request payout, update payout status
Acceptance: Payout requests persist
```

### Ticket B2-007: Disputes
```
File: src/pages/Disputes.tsx
Type: Feature Rewrite
Description: Raise and track disputes for deals
Acceptance: Disputes persist
Parent: A1-004
```

---

## Agent C1: Admin Operations

### Ticket C1-006: Admin Disputes
```
File: src/pages/AdminDisputes.tsx
Type: Feature Rewrite
Description: View and resolve disputes
Acceptance: Admin can manage disputes
```

### Ticket C1-007: Admin Finance
```
File: src/pages/FinanceDashboard.tsx
Type: Feature Rewrite
Description: Revenue, escrow volume, payout status dashboard
Acceptance: Finance dashboard shows real data
```

---

# Sprint Board - Phase 5: Hardening & Release

**Sprint Duration:** 2-3 days  
**Goal:** Production-ready

---

## Agent D1: Quality & Release

### Ticket D1-006: Test Coverage
```
File: src/test/
Type: Testing
Description: Add tests for:
  - planAccess.ts logic
  - key service functions
  - auth flows
Acceptance: Tests exist for core paths
```

### Ticket D1-007: Smoke Tests
```
Type: Manual Testing
Description: Verify main flows work:
  - Signup/Login
  - Directory browsing
  - Subscription checkout
  - KYC submission
Acceptance: All flows documented and tested
```

### Ticket D1-008: Deployment Runbook
```
File: docs/DEPLOYMENT.md
Type: Documentation
Description: Complete deployment guide
Acceptance: New environment can be deployed from docs
```

### Ticket D1-009: Environment Checklist
```
File: docs/ENV_CHECKLIST.md
Type: Documentation
Description: Pre-launch environment validation
Acceptance: All env vars documented with validation
```

---

## Agent D2: Security & Compliance

### Ticket D2-004: Webhook Verification
```
Type: Security Review
Description: Verify Stripe webhook signature checks in place
Acceptance: Webhooks reject invalid signatures
Parent: A2-006
```

### Ticket D2-005: Secret Handling Review
```
Type: Security Review
Description: Ensure no secrets in code, proper env usage
Acceptance: No secret leakage found
```

### Ticket D2-006: Audit Logging Coverage
```
Type: Security Review
Description: Verify activity_log captures key events
Acceptance: Key actions logged
```

---

# Definition of Done Checklist

Every ticket must pass:

- [ ] No `mockData` imports in changed files
- [ ] Data persists after page refresh
- [ ] Data persists after server restart
- [ ] Error states handled in UI
- [ ] Loading states shown
- [ ] Empty states shown
- [ ] RLS policies enforced (no client-side admin trust)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] At least one test (for complex logic)
- [ ] Env requirements documented if added

---

# Dependency Graph

```
A1-001 ─┬─► A1-002 ─► B1-001 ─► B1-002 ─► B1-005
        ├─► A1-003 ─► A1-008 ─┬─► B2-001 ─► B2-002
        ├─► A1-004 ─┬─► B2-003 ─► B2-004
        ├─► A1-005 ─┬─► C1-001
        └─► A1-006

A2-001 ─► A2-002 ─► A2-005
A2-003 ─► A2-006 ─► A2-007 ─► A2-008 ─► B1-006 ─► B1-007

D1-001 ─► D1-002 ─► D1-003 ─► D1-004 ─► D1-005
                                        └─► D1-006 ─► D1-007 ─► D1-008 ─► D1-009

D2-001 ─► D2-002 ─► D2-003 ─► D2-004 ─► D2-005 ─► D2-006
```
