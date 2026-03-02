import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { constructWebhookEvent } from '../services/stripeService.js';
import { logger } from '../services/logger.js';
import {
  ensureSubscriptionSchema,
  getSubscriptionPool,
  persistStripeSubscription,
  upsertUserTier,
} from '../services/subscriptionStore.js';

const router = Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

function getStripeClient(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing on backend');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
}

router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));

    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(payload, signature);
    } catch (err: any) {
      logger.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await ensureSubscriptionSchema();
    const stripe = getStripeClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeSubscriptionId = session.subscription as string | null;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (!stripeSubscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
          expand: ['items.data.price.product'],
        });
        await persistStripeSubscription(subscription, userId || undefined);

        logger.info('Checkout session completed and subscription persisted', {
          sessionId: session.id,
          subscriptionId: stripeSubscriptionId,
          userId: userId || null,
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await persistStripeSubscription(subscription);

        logger.info('Subscription event persisted', {
          eventType: event.type,
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price.product'],
        });
        await persistStripeSubscription(subscription);

        logger.info('Invoice event persisted', {
          eventType: event.type,
          invoiceId: invoice.id,
          subscriptionId,
          status: subscription.status,
        });
        break;
      }

      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info('Payment intent event received', {
          eventType: event.type,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        });
        break;
      }

      default:
        logger.info('Unhandled Stripe event type', { type: event.type });
    }

    return res.json({ received: true });
  } catch (error: any) {
    logger.error('Stripe webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/paystack', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    logger.info('Paystack webhook received', { event: event.event });

    if (event.event === 'charge.success') {
      const metadata = event.data?.metadata;
      const userId = metadata?.userId;
      const tier = metadata?.membershipTier;

      if (userId && (tier === 'starter' || tier === 'growth' || tier === 'enterprise' || tier === 'free')) {
        await upsertUserTier(userId, tier);
      }
    }

    if (event.event === 'subscription.disable') {
      const subscriptionCode = event.data?.subscription_code;
      if (subscriptionCode) {
        const pool = getSubscriptionPool();
        if (pool) {
          await ensureSubscriptionSchema();
          const subRes = await pool.query(`SELECT user_id FROM app_subscriptions WHERE id = $1 LIMIT 1`, [subscriptionCode]);
          const userId = subRes.rows[0]?.user_id;

          await pool.query(
            `UPDATE app_subscriptions SET status = 'canceled', updated_at = NOW() WHERE id = $1`,
            [subscriptionCode]
          );

          if (userId) {
            await upsertUserTier(userId, 'free');
          }
        }
      }
    }

    return res.json({ received: true });
  } catch (error: any) {
    logger.error('Paystack webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
