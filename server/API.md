# DIL Trade Bridge API Documentation

## Base URL
```
Production: https://api.diltradebridge.com
Development: http://localhost:3001
```

## Authentication
Currently uses API keys in headers. Production should use JWT Bearer tokens.

## Headers Required
```
Content-Type: application/json
X-Request-ID: (auto-generated UUID)
```

## Rate Limits
| Endpoint | Limit |
|----------|-------|
| General API | 100/minute |
| Payments | 20/minute |
| Webhooks | 50/minute |

Response Headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T12:00:00Z",
  "version": "1.0.0"
}
```

---

## Payments

### Create Stripe Payment Intent
```
POST /api/payments/stripe/create-intent
```

Request:
```json
{
  "amount": 4900,
  "currency": "usd",
  "reference": "order_123",
  "metadata": {
    "userId": "user_001",
    "orderId": "order_123"
  }
}
```

Response:
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "id": "pi_xxx"
}
```

### Initialize Paystack Payment
```
POST /api/payments/paystack/initialize
```

Request:
```json
{
  "amount": 490000,
  "currency": "NGN",
  "reference": "ref_123",
  "email": "customer@example.com"
}
```

### Verify Paystack Payment
```
GET /api/payments/paystack/verify/:reference
```

---

## Subscriptions

### Create Subscription
```
POST /api/subscriptions/stripe/create-subscription
```

Request:
```json
{
  "userId": "user_001",
  "planId": "starter",
  "amount": 4900
}
```

Response:
```json
{
  "success": true,
  "subscriptionId": "sub_xxx",
  "clientSecret": "pi_xxx_secret_xxx",
  "customerId": "cus_xxx",
  "tier": "starter"
}
```

### Cancel Subscription
```
POST /api/subscriptions/stripe/cancel
```

Request:
```json
{
  "subscriptionId": "sub_xxx",
  "immediately": false
}
```

### Get Subscription Status
```
GET /api/subscriptions/stripe/status/:subscriptionId
```

### Get User Subscription
```
GET /api/subscriptions/user/:userId
```

---

## Wallets & Payouts

### Get Wallet
```
GET /api/payouts/wallet/:userId
```

Response:
```json
{
  "success": true,
  "wallet": {
    "id": "wallet_user_001",
    "userId": "user_001",
    "currency": "USD",
    "balance": 5000,
    "availableBalance": 5000,
    "status": "active"
  }
}
```

### Deposit to Wallet
```
POST /api/payouts/wallet/deposit
```

Request:
```json
{
  "userId": "user_001",
  "amount": 1000,
  "currency": "USD",
  "reference": "deposit_123"
}
```

### Withdraw from Wallet
```
POST /api/payouts/wallet/withdraw
```

Request:
```json
{
  "userId": "user_001",
  "amount": 500,
  "bankAccountId": "bank_001"
}
```

### Get Bank Accounts
```
GET /api/payouts/bank-accounts/:userId
```

### Add Bank Account
```
POST /api/payouts/bank-accounts
```

Request:
```json
{
  "userId": "user_001",
  "bankName": "First Bank of Nigeria",
  "accountNumber": "1234567890",
  "accountHolderName": "Business Name",
  "bankCode": "011151515",
  "currency": "NGN"
}
```

### Create Payout
```
POST /api/payouts/payout/create
```

Request:
```json
{
  "userId": "user_001",
  "amount": 1000,
  "currency": "USD",
  "bankAccountId": "bank_001"
}
```

### Process Payout
```
POST /api/payouts/payout/process
```

Request:
```json
{
  "payoutId": "payout_xxx"
}
```

### Cancel Payout
```
POST /api/payouts/payout/:payoutId/cancel
```

### Get Platform Stats
```
GET /api/payouts/platform/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "totalPayouts": 10,
    "totalPayoutAmount": 50000,
    "pendingPayouts": 2,
    "totalWalletBalance": 100000
  }
}
```

---

## Webhooks

### Stripe Webhook
```
POST /api/webhooks/stripe
Headers:
  Stripe-Signature: (generated signature)
```

Events handled:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Paystack Webhook
```
POST /api/webhooks/paystack
Headers:
  X-Paystack-Signature: (SHA512 signature)
```

Events handled:
- `charge.success`
- `charge.failed`
- `transfer.success`
- `transfer.failed`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "errors": [
    { "field": "amount", "message": "Must be greater than 0" }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "path": "/api/invalid"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Please try again later",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "requestId": "uuid",
  "message": "An unexpected error occurred"
}
```

---

## Environment Variables

```env
# Required
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PAYSTACK_SECRET_KEY=sk_xxx
PAYSTACK_WEBHOOK_SECRET=xxx

# Optional
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxx
STRIPE_GROWTH_MONTHLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxx

NODE_ENV=development
PORT=3001
```

---

## Support
- Email: support@diltradebridge.com
- API Version: 1.0.0
