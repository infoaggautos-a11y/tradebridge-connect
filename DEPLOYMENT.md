# Payment Server Deployment Guide

## The Problem
Vercel only hosts the frontend (React). The payment server is a **separate Node.js Express app** that must be deployed elsewhere.

## Quick Fix: Deploy Server to Render.com (Free)

1. **Push your code to GitHub** (you already did)

2. **Go to https://render.com** and sign up

3. **Create a new Web Service:**
   - Connect your GitHub repo
   - Branch: `full-platform`
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npx tsx src/index.ts`

4. **Add Environment Variables:**
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   PAYSTACK_SECRET_KEY=sk_test_xxx
   PAYSTACK_WEBHOOK_SECRET=xxx
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-domain.vercel.app
   ```

5. **Deploy** - Wait 2-3 minutes

6. **Get your server URL** (e.g., `https://your-app.onrender.com`)

7. **Update frontend** to point to your server:
   - Edit `src/pages/Subscription.tsx`
   - Change `http://localhost:3001` to your Render URL
   - Push changes

## Alternative: Use Vercel Serverless Functions

Convert endpoints to `/api/*.ts` files in the root for automatic deployment.

---

**Which option do you prefer?**
1. Deploy to Render (recommended - easier)
2. Convert to Vercel serverless functions
