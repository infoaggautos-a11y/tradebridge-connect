import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { constructWebhookEvent } from '../services/stripeService.js';
import { logger } from '../services/logger.js';

const router = Router();

const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: 'Starter', tier: 'starter' },
  growth: { name: 'Growth', tier: 'growth' },
  enterprise: { name: 'Enterprise', tier: 'enterprise' },
};

// In-memory storage (replace with database)
const subscriptions: Map<string, any> = new Map();
const payments: Map<string, any> = new Map();
const users: Map<string, any> = new Map();

router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const payload = Buffer.from(JSON.stringify(req.body));
    
    let event;
    try {
      event = constructWebhookEvent(payload, sig);
    } catch (err: any) {
      logger.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logger.info('Payment succeeded', { 
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        });
        await handlePaymentSuccess({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata,
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        logger.warn('Payment failed', { 
          paymentIntentId: failedPayment.id,
          error: failedPayment.last_payment_error?.message,
        });
        await handlePaymentFailure({
          paymentIntentId: failedPayment.id,
          error: failedPayment.last_payment_error?.message,
        });
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        logger.info('Invoice paid', { 
          invoiceId: invoice.id,
          subscription: subId,
          amount: invoice.amount_paid,
        });
        await handleSubscriptionPayment({
          subscriptionId: subId,
          status: 'paid',
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
        });
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        const failedSubId = failedInvoice.subscription as string;
        logger.warn('Invoice payment failed', { 
          invoiceId: failedInvoice.id,
          subscription: failedSubId,
        });
        await handleSubscriptionPayment({
          subscriptionId: failedSubId,
          status: 'failed',
          invoiceId: failedInvoice.id,
        });
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Subscription updated', { 
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        await handleSubscriptionUpdated({
          subscriptionId: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata,
        });
        break;

      case 'customer.subscription.deleted':
        const cancelledSubscription = event.data.object as Stripe.Subscription;
        logger.info('Subscription cancelled', { subscriptionId: cancelledSubscription.id });
        await handleSubscriptionCancelled({
          subscriptionId: cancelledSubscription.id,
        });
        break;

      default:
        logger.info('Unhandled event type', { type: event.type });
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Stripe webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/paystack', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    logger.info('Paystack webhook received', { event: event.event });

    switch (event.event) {
      case 'charge.success':
        const chargeData = event.data;
        logger.info('Paystack charge success', { 
          reference: chargeData.reference,
          amount: chargeData.amount,
        });
        await handlePaymentSuccess({
          paymentIntentId: chargeData.reference,
          amount: chargeData.amount,
          metadata: chargeData.metadata,
        });
        break;

      case 'charge.failed':
        const failedCharge = event.data;
        logger.warn('Paystack charge failed', { 
          reference: failedCharge.reference,
        });
        await handlePaymentFailure({
          paymentIntentId: failedCharge.reference,
          error: 'Payment failed',
        });
        break;

      case 'transfer.success':
        const transferData = event.data;
        logger.info('Paystack transfer success', { 
          reference: transferData.reference,
        });
        break;

      case 'transfer.failed':
        const failedTransfer = event.data;
        logger.warn('Paystack transfer failed', { 
          reference: failedTransfer.reference,
        });
        break;

      default:
        logger.info('Unhandled Paystack event', { event: event.event });
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Paystack webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function handlePaymentSuccess(params: {
  paymentIntentId: string;
  amount: number;
  metadata?: Record<string, any>;
}): Promise<void> {
  logger.info('Processing payment success', params);
  
  const { paymentIntentId, amount, metadata } = params;
  const userId = metadata?.userId;
  const type = metadata?.type;
  const planId = metadata?.planId;
  
  // Save payment
  payments.set(paymentIntentId, {
    id: paymentIntentId,
    amount: Math.round(amount / 100),
    currency: 'USD',
    status: 'completed',
    type: type || 'subscription',
    userId,
    createdAt: new Date(),
  });
  
  // Update user tier
  if (type === 'subscription' && userId && planId) {
    const planInfo = PLAN_MAP[planId];
    if (planInfo) {
      const user = users.get(userId) || {};
      user.membershipTier = planInfo.tier;
      users.set(userId, user);
      logger.info('User tier updated', { userId, tier: planInfo.tier });
    }
  }
}

async function handlePaymentFailure(params: {
  paymentIntentId: string;
  error?: string;
}): Promise<void> {
  logger.warn('Processing payment failure', params);
  
  const { paymentIntentId } = params;
  
  const payment = payments.get(paymentIntentId);
  if (payment) {
    payment.status = 'failed';
    payment.failureReason = params.error;
  }
}

async function handleSubscriptionPayment(params: {
  subscriptionId: string;
  status: string;
  invoiceId?: string;
  amount?: number;
}): Promise<void> {
  logger.info('Processing subscription payment', params);
  
  const { subscriptionId, status } = params;
  
  const subscription = subscriptions.get(subscriptionId);
  if (subscription) {
    subscription.status = status === 'paid' ? 'active' : 'past_due';
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    logger.info('Subscription updated', { subscriptionId, status: subscription.status });
  }
}

async function handleSubscriptionUpdated(params: {
  subscriptionId: string;
  status: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  logger.info('Processing subscription update', params);
  
  const { subscriptionId, status, metadata } = params;
  const userId = metadata?.userId;
  const planId = metadata?.planId;
  
  const subscription = subscriptions.get(subscriptionId);
  if (subscription) {
    subscription.status = status;
    subscriptions.set(subscriptionId, subscription);
  }
  
  // Update user tier
  if (userId && planId) {
    const planInfo = PLAN_MAP[planId];
    if (planInfo) {
      const tier = status === 'active' ? planInfo.tier : 'free';
      const user = users.get(userId) || {};
      user.membershipTier = tier;
      users.set(userId, user);
      logger.info('User tier updated based on subscription', { userId, tier });
    }
  }
}

async function handleSubscriptionCancelled(params: {
  subscriptionId: string;
}): Promise<void> {
  logger.info('Processing subscription cancellation', params);
  
  const { subscriptionId } = params;
  
  const subscription = subscriptions.get(subscriptionId);
  if (subscription) {
    subscription.status = 'canceled';
    subscriptions.set(subscriptionId, subscription);
    
    // Downgrade user
    const user = users.get(subscription.userId) || {};
    user.membershipTier = 'free';
    users.set(subscription.userId, user);
  }
}

export default router;
