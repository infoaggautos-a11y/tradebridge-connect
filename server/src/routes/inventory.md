# Route Inventory

Status: `A2-001`
Date: `2026-03-19`
Authority: `ARCHITECTURE_DECISION_RECORD.md`

## Mounted route map

| Base path | Source file | Status |
|---|---|---|
| `/health` | `server/src/index.ts` | Mounted |
| `/api/payments` | `server/src/routes/paymentRoutes.ts` | Mounted |
| `/api/subscriptions` | `server/src/routes/subscriptionRoutes.ts` | Mounted |
| `/api/payouts` | `server/src/routes/payoutRoutes.ts` | Mounted |
| `/api/webhooks` | `server/src/routes/webhookRoutes.ts` | Mounted |
| Not mounted | `server/src/routes/walletRoutes.ts` | Dead route surface; not reachable from `server/src/index.ts` |

## ADR conflict summary

- `paymentRoutes.ts` uses in-memory `subscriptions` and `users` maps for subscription state. This duplicates Supabase-owned `subscriptions` and `profiles`.
- `payoutRoutes.ts` uses in-memory `payouts`, `wallets`, and `bankAccounts` maps plus seeded demo records. This is an explicit demo-memory hotspot.
- `walletRoutes.ts` uses in-memory `wallets` and `transactions` maps and is not mounted.
- `subscriptionService.ts` and `payoutService.ts` run cron-backed in-memory processing that does not survive restart.
- `subscriptionStore.ts` and `database.ts` create and manage `app_users`, `app_subscriptions`, `app_payments`, and `app_escrow_usage` via direct `pg` schema creation. That conflicts with the Supabase-first ADR because these domains are meant to be canonical in Supabase tables, not server-managed shadow tables.

## Recommendations legend

- `Keep`: allowed by ADR as a provider/integration endpoint, though implementation may still need follow-up cleanup.
- `Migrate`: move canonical state and domain ownership to Supabase tables or edge functions; keep server only if raw webhook/provider constraints require it.
- `Remove`: endpoint should be retired because it duplicates Supabase-owned state, is demo-only, or is unused.

## Route table

| File | Method | Full path | Purpose | Data owner | Recommendation | Notes |
|---|---|---|---|---|---|---|
| `server/src/index.ts` | GET | `/health` | Process and database health probe | Server runtime | Keep | Infra health endpoint; not a business-domain conflict. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/stripe/create-subscription` | Create Stripe customer and subscription, return client secret | Supabase `subscriptions` + Stripe | Migrate | Writes subscription state to in-memory maps instead of Supabase. Overlaps `subscriptionRoutes.ts` checkout flow. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/stripe/create-intent` | Create Stripe payment intent | Payments provider integration | Keep | Provider-facing integration endpoint is ADR-compatible if payment records move to Supabase. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/stripe/confirm-intent` | Confirm Stripe payment intent | Payments provider integration | Keep | Keep only if frontend cannot call canonical Supabase-owned flow directly. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/stripe/refund` | Create Stripe refund | Payments provider integration | Keep | Provider action is reasonable on server, but persistence/audit should be moved to Supabase. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/stripe/verify-card` | Attempt Stripe tokenization to validate card details | None canonical; provider probe | Remove | Card verification helper is risky, nonessential, and outside canonical domain flow. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/paystack/initialize` | Initialize Paystack payment | Payments provider integration | Keep | Keep as provider bridge if still needed; should not own canonical payment state. |
| `server/src/routes/paymentRoutes.ts` | GET | `/api/payments/paystack/verify/:reference` | Verify Paystack transaction by reference | Payments provider integration | Keep | Provider verification endpoint is acceptable, but result persistence should move to Supabase. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/paystack/check-card` | Test Paystack card validity | None canonical; provider probe | Remove | Demo/helper behavior, not canonical product flow. |
| `server/src/routes/paymentRoutes.ts` | POST | `/api/payments/paystack/resolve-account` | Resolve bank account details via Paystack | External provider data | Keep | Legitimate provider lookup endpoint if bank accounts remain part of payout flow. |
| `server/src/routes/subscriptionRoutes.ts` | GET | `/api/subscriptions/plans` | Return plan catalog | Subscription config | Keep | Read-only config endpoint. Follow-up: consolidate duplicate plan definitions per `A2-004`. |
| `server/src/routes/subscriptionRoutes.ts` | POST | `/api/subscriptions/stripe/checkout-session` | Create Stripe Checkout session for subscription | Supabase `subscriptions` + Stripe | Migrate | Business flow should become canonical Supabase + Stripe path; endpoint may remain temporarily if chosen in `A2-003`. |
| `server/src/routes/subscriptionRoutes.ts` | POST | `/api/subscriptions/stripe/customer-portal` | Create Stripe customer portal session | Supabase `subscriptions` + Stripe | Keep | Provider bridge is ADR-compatible if tied to canonical Supabase subscription records. |
| `server/src/routes/subscriptionRoutes.ts` | GET | `/api/subscriptions/status/:userId` | Return user subscription status and tier | Supabase `subscriptions` and `profiles` | Migrate | Reads server-managed `app_*` tables instead of Supabase canonical tables. |
| `server/src/routes/subscriptionRoutes.ts` | POST | `/api/subscriptions/stripe/cancel` | Cancel or end-at-period-end Stripe subscription | Supabase `subscriptions` + Stripe | Migrate | Writes to server `app_subscriptions`; should update canonical Supabase subscription record. |
| `server/src/routes/subscriptionRoutes.ts` | GET | `/api/subscriptions/access/:feature` | Evaluate feature access for a tier | Supabase `profiles` / `user_roles` | Migrate | Authorization and entitlements should be derived from canonical Supabase role/subscription data. |
| `server/src/routes/subscriptionRoutes.ts` | GET | `/api/subscriptions/usage/escrow` | Check monthly escrow usage limit | Supabase deals/escrows | Migrate | Uses server `app_escrow_usage`, which is shadow state outside ADR. |
| `server/src/routes/subscriptionRoutes.ts` | POST | `/api/subscriptions/usage/escrow/consume` | Increment monthly escrow usage | Supabase deals/escrows | Migrate | Canonical usage should be computed from Supabase escrow/deal data or persisted there. |
| `server/src/routes/payoutRoutes.ts` | GET | `/api/payouts/wallet/:userId` | Return wallet snapshot for a user | Supabase wallets | Remove | In-memory wallet map with seeded demo wallet; duplicates wallet domain. |
| `server/src/routes/payoutRoutes.ts` | POST | `/api/payouts/wallet/deposit` | Credit wallet balance and add transaction | Supabase wallets | Remove | Demo-memory wallet mutation; not canonical and survives only in process memory. |
| `server/src/routes/payoutRoutes.ts` | POST | `/api/payouts/wallet/withdraw` | Initiate withdrawal from wallet | Supabase wallets + payouts | Migrate | Real domain, but current implementation mutates in-memory wallet/payout state. |
| `server/src/routes/payoutRoutes.ts` | GET | `/api/payouts/wallet/:userId/transactions` | Return wallet transaction list | Supabase wallet transactions | Remove | Reads in-memory transactions attached to demo wallet object. |
| `server/src/routes/payoutRoutes.ts` | GET | `/api/payouts/bank-accounts/:userId` | List saved payout bank accounts | Supabase payout accounts or provider tokens | Migrate | Current storage is in-memory only. |
| `server/src/routes/payoutRoutes.ts` | POST | `/api/payouts/bank-accounts` | Add a bank account and optionally verify with Paystack | Supabase payout accounts or provider tokens | Migrate | Provider verification can stay, but canonical storage must move out of memory. |
| `server/src/routes/payoutRoutes.ts` | POST | `/api/payouts/payout/create` | Create payout request | Supabase payouts | Migrate | Core payout domain route, but backed by in-memory maps. |
| `server/src/routes/payoutRoutes.ts` | POST | `/api/payouts/payout/process` | Process payout through Paystack or simulated Stripe | Supabase payouts | Migrate | Legitimate provider integration, but current state machine is memory-backed and partially simulated. |
| `server/src/routes/payoutRoutes.ts` | GET | `/api/payouts/payout/:payoutId` | Fetch a payout by ID | Supabase payouts | Migrate | Should read canonical persisted payout record. |
| `server/src/routes/payoutRoutes.ts` | GET | `/api/payouts/payout/user/:userId` | List payouts for a user | Supabase payouts | Migrate | Should read canonical persisted payout records. |
| `server/src/routes/payoutRoutes.ts` | POST | `/api/payouts/payout/:payoutId/cancel` | Cancel pending payout and refund wallet | Supabase payouts + wallets | Migrate | Real payout action, but currently updates only in-memory state. |
| `server/src/routes/payoutRoutes.ts` | GET | `/api/payouts/platform/stats` | Aggregate payout and wallet totals | Supabase payouts + wallets | Remove | Dashboard stats from in-memory demo state are misleading and noncanonical. |
| `server/src/routes/webhookRoutes.ts` | POST | `/api/webhooks/stripe` | Receive Stripe webhooks with raw-body signature verification | Stripe webhook integration | Keep | Explicitly allowed by ADR. Follow-up: align writes to canonical Supabase tables during `A2-003`/`A2-006`. |
| `server/src/routes/webhookRoutes.ts` | POST | `/api/webhooks/paystack` | Receive Paystack webhook events | Paystack webhook integration | Keep | Provider integration endpoint is ADR-compatible, but downstream state should be canonical in Supabase. |
| `server/src/routes/walletRoutes.ts` | POST | `(unmounted) /create` | Create wallet | Supabase wallets | Remove | Dead route surface and in-memory storage. |
| `server/src/routes/walletRoutes.ts` | GET | `(unmounted) /:walletId` | Fetch wallet by ID | Supabase wallets | Remove | Unmounted, in-memory duplicate. |
| `server/src/routes/walletRoutes.ts` | POST | `(unmounted) /:walletId/deposit` | Deposit into wallet | Supabase wallets | Remove | Unmounted, in-memory duplicate. |
| `server/src/routes/walletRoutes.ts` | POST | `(unmounted) /:walletId/withdraw` | Withdraw from wallet | Supabase wallets | Remove | Unmounted, in-memory duplicate. |
| `server/src/routes/walletRoutes.ts` | GET | `(unmounted) /:walletId/transactions` | List wallet transactions | Supabase wallet transactions | Remove | Unmounted, in-memory duplicate. |
| `server/src/routes/walletRoutes.ts` | GET | `(unmounted) /user/:userId` | List wallets for a user | Supabase wallets | Remove | Unmounted, in-memory duplicate. |

## Demo-memory hotspots

| Location | Hotspot | Impact |
|---|---|---|
| `server/src/routes/paymentRoutes.ts` | `subscriptions` and `users` `Map`s | Subscription state diverges from canonical source and disappears on restart. |
| `server/src/routes/payoutRoutes.ts` | `payouts`, `wallets`, `bankAccounts` `Map`s plus `initDemoData()` | Wallets, payouts, bank accounts, and transactions are demo-only and nonpersistent. |
| `server/src/routes/walletRoutes.ts` | `wallets` and `transactions` `Map`s | Entire router is dead code and nonpersistent. |
| `server/src/services/subscriptionService.ts` | `subscriptions` `Map` | Cron renewal job operates on in-memory subscriptions only. |
| `server/src/services/payoutService.ts` | `pendingPayouts` `Map` | Scheduled payout processor uses nonpersistent random outcome simulation. |

## Follow-up notes for A2 track

- `A2-003` needs to choose the single canonical subscription path because both `paymentRoutes.ts` and `subscriptionRoutes.ts` initiate overlapping Stripe subscription flows.
- `subscriptionStore.ts` and `database.ts` should be treated as transitional conflict points, not target architecture, because they create server-owned `app_*` tables outside Supabase migrations.
- `walletRoutes.ts` appears to be abandoned code. It is not mounted and duplicates the wallet behavior already embedded in `payoutRoutes.ts`.
