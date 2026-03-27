# Dependency Graph - What Can Run In Parallel

## Legend

```
[XXX-001] ────► [YYY-002]    Hard dependency: YYY-002 cannot start until XXX-001 completes
[XXX-001] - - ► [YYY-002]    Soft dependency: YYY-002 can start but benefits from XXX-001
[XXX-001] ~~~► [YYY-002]    Informational: XXX-001 provides context for YYY-002
```

---

## Phase 0: Control Plane

```
[A1-001 Schema Audit]
         │
         ├──► [A1-002 Businesses Table]
         ├──► [A1-003 KYC Tables]
         ├──► [A1-004 Deals Tables]
         ├──► [A1-005 Activity Tables]
         └──► [A1-005B Events Tables]
                   │
                   └──► [A1-006 Canonical ERD]

[A2-001 Route Inventory]
         │
         ├──► [A2-002 Remove Demo-Memory]
         ├──► [A2-003 Subscription Decision]
         ├──► [A2-004 Plan Consolidation]
         └──► [A2-005 Payout Model]

[D1-001 Dep Audit] ──► [D1-002 Server Dep Audit]
         │
         ├──► [D1-003 Standard Commands]
         ├──► [D1-004 CI Pipeline]
         └──► [D1-005 Env Docs]

[D2-001 RLS Inventory]
         │
         ├──► [D2-002 Admin Role Model]
         └──► [D2-003 Client Trust Audit]
```

### Phase 0 Parallel Opportunities

| Agents Can Work Together | Because |
|-------------------------|---------|
| A1-002 + A1-003 + A1-004 + A1-005 | Independent table migrations |
| D1-001 + D1-002 | Both investigate dependencies |
| D2-001 + D2-002 + D2-003 | All audit current state |
| A2-001 + A2-003 + A2-004 | All plan/explore before coding |

---

## Phase 1: Foundation

```
[A1-002 Businesses Table] ──► [B1-001 Directory Rewrite]
         │                            │
[A1-006 Canonical ERD] ─────────► [B1-002 Business Profile]
         │
[A1-005 Activity Tables] ─────► [C1-001 Admin Dashboard Fix]
         │
[A1-002 Businesses Table] ─────► [C1-002 Business Review]

[A1-005B Events Tables] ─────► [B1-003 Events Rewrite]

[B1-001 Directory Rewrite] ──► [B1-004 Trade Match Rewrite]
         │
[B1-004 Trade Match] ───────► [C1-003 Admin Match Mgmt]

[A1-001 Schema Audit] - - - - ► [B1-005 Member Dashboard]
```

### Phase 1 Parallel Opportunities

| Agents Can Work Together | Dependency |
|-------------------------|------------|
| B1-001 + B1-002 + B1-003 | All read from independent tables |
| C1-001 + C1-002 | Both fix admin pages |
| B1-001 (done) ──► B1-002 | Sequential per page |
| B1-001 + B1-003 | Parallel - different pages |

---

## Phase 2: Subscriptions

```
[A2-003 Subscription Decision] ──► [A2-006 Webhook Consolidation]
         │                                │
[A2-006 Webhook Consolidation] ──► [A2-007 Checkout E2E Test]
         │                                │
[A2-007 Checkout E2E] ─────────► [A2-008 Customer Portal]
         │                                │
[A2-008 Customer Portal] - - - - ► [B1-006 Subscription Page]
         │
[B1-006 Subscription Page] ────► [B1-007 Access Gate Alignment]

[A2-006 Webhook Consolidation] - - ► [C1-004 Admin Subscriptions]
```

### Phase 2 Parallel Opportunities

| Agents Can Work Together | Dependency |
|-------------------------|------------|
| A2-006 + A2-007 + A2-008 | Sequential - each tests previous |
| B1-006 + C1-004 | Parallel - different pages |
| A2-006 blocks B1-006 | A2 must finish first |

---

## Phase 3: KYC

```
[A1-003 KYC Tables] ──────────► [A1-008 KYC Storage Bucket]
         │                            │
[A1-008 KYC Storage Bucket] ──► [B2-001 KYC Submission Flow]
         │                            │
[B2-001 KYC Submission] ───────► [B2-002 KYC Status Display]
         │
[B2-001 KYC Submission] - - - - ► [C1-005 KYC Queue]
```

### Phase 3 Parallel Opportunities

| Agents Can Work Together | Dependency |
|-------------------------|------------|
| A1-008 can start immediately | Only needs A1-003 |
| B2-001 + C1-005 | Can coordinate but work separately |

---

## Phase 4: Deals & Wallet

```
[A1-004 Deals Tables] ─────────► [B2-003 Deal Room Rewrite]
         │                            │
[B2-003 Deal Room] ───────────► [B2-004 Escrow Lifecycle]
         │
[B2-003 Deal Room] ───────────► [B2-007 Disputes]

[A1-002 Businesses Table] ────► [B2-005 Wallet Rewrite]
         │                            │
[B2-005 Wallet Rewrite] ──────► [B2-006 Payout Flow]

[B2-003 Deal Room] - - - - - ► [C1-006 Admin Disputes]
[B2-005 Wallet] - - - - - - ► [C1-007 Admin Finance]
```

### Phase 4 Parallel Opportunities

| Agents Can Work Together | Dependency |
|-------------------------|------------|
| B2-003 + B2-004 + B2-007 | B2 owns - sequential within track |
| B2-005 + B2-006 | B2 owns - can split by wallet vs payout |
| C1-006 + C1-007 | C1 owns - can split by feature |

---

## Phase 5: Hardening

```
[D1-004 CI Pipeline] ─────────► [D1-006 Test Coverage]
         │                            │
[D1-006 Test Coverage] ────────► [D1-007 Smoke Tests]
         │                            │
[D1-007 Smoke Tests] ─────────► [D1-008 Deployment Runbook]
         │                            │
[D1-008 Deployment Runbook] ──► [D1-009 Env Checklist]

[A2-006 Webhook Consolidation] - - ► [D2-004 Webhook Verification]
[D2-001 RLS Inventory] - - - - ► [D2-005 Secret Review]
[A1-006 Canonical ERD] - - - - ► [D2-006 Audit Logging]
```

### Phase 5 Parallel Opportunities

| Agents Can Work Together | Dependency |
|-------------------------|------------|
| D1-006 + D1-007 | Sequential within D1 |
| D2-004 + D2-005 + D2-006 | All security - can run parallel |
| D1 + D2 must finish before launch | Sequential phase |

---

## Cross-Track Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                         A1 (Schema)                             │
│  Must finish before: B1, B2, C1 can fully integrate            │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    B1 (Member)  │ │    B2 (Trust)   │ │    C1 (Admin)   │
│  Directory,     │ │  KYC, Deals,    │ │  Admin pages    │
│  Profiles,      │ │  Wallet         │ │  review queues  │
│  Subscriptions  │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┴───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    D1 + D2 (Quality)                            │
│  Must pass before production release                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critical Path (Longest Chain)

```
[A2-001 Route Inventory]
         │
         ▼
[A2-003 Subscription Decision]
         │
         ▼
[A2-006 Webhook Consolidation]
         │
         ▼
[A2-007 Checkout E2E Test]
         │
         ▼
[B1-006 Subscription Page]
         │
         ▼
[B1-007 Access Gate Alignment]
         │
         ▼
[D1-006 Test Coverage]
         │
         ▼
[D1-007 Smoke Tests]
         │
         ▼
[D1-008 Deployment Runbook]
         │
         ▼
[LAUNCH]
```

**Critical path length:** ~8 weeks if sequential  
**Can be shortened by:** Running A2, B1 in parallel with other tracks

---

## Agent Parallelism Matrix

| Agent | Can Run With | Should Not Run With |
|-------|-------------|-------------------|
| A1 | A1 tasks (parallel tables) | B1, B2, C1 (schema first) |
| A2 | A2 tasks | A1 on schema decisions |
| B1 | C1, D1 | A1 if schema blocked |
| B2 | C1, D1 | A1 if schema blocked |
| C1 | B1, B2 | A1 if schema blocked |
| D1 | B1, B2, C1 | A2 on server work |
| D2 | D1 | Anyone during review |

---

## Quick Wins (Day 1)

1. **D1-001** - Run `npm install`, verify build works (2 hours)
2. **D1-005** - Update `.env.example` (1 hour)
3. **A1-002** - Create `businesses` table migration (2 hours)
4. **A2-001** - Inventory Express routes (2 hours)
5. **D2-001** - Audit RLS policies (2 hours)

These 5 tasks can run completely in parallel on Day 1.
