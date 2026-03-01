import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Webhook handlers storage
const subscriptions: Map<string, any> = new Map();
const payments: Map<string, any> = new Map();
const users: Map<string, any> = new Map();

const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: 'Starter', tier: 'starter' },
  growth: { name: 'Growth', tier: 'growth' },
  enterprise: { name: 'Enterprise', tier: 'enterprise' },
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const payload = await req.text();
    
    let event: Stripe.Event;
    
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (webhookSecret && signature) {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        event = JSON.parse(payload) as Stripe.Event;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        
        const { userId, type, planId } = paymentIntent.metadata || {};
        
        // Save payment
        payments.set(paymentIntent.id, {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'completed',
          userId,
        });
        
        // Update user tier
        if (type === 'subscription' && userId && planId) {
          const planInfo = PLAN_MAP[planId];
          if (planInfo) {
            const user = users.get(userId) || {};
            user.membershipTier = planInfo.tier;
            users.set(userId, user);
            console.log('User tier updated:', { userId, tier: planInfo.tier });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        const payment = payments.get(paymentIntent.id);
        if (payment) {
          payment.status = 'failed';
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        console.log('Invoice paid:', invoice.id, 'subscription:', subscriptionId);
        
        if (subscriptionId) {
          const subscription = subscriptions.get(subscriptionId);
          if (subscription) {
            subscription.status = 'active';
            subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        console.log('Invoice payment failed:', invoice.id);
        
        if (subscriptionId) {
          const subscription = subscriptions.get(subscriptionId);
          if (subscription) {
            subscription.status = 'past_due';
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id, subscription.status);
        
        subscriptions.set(subscription.id, {
          ...subscriptions.get(subscription.id),
          id: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata,
        });
        
        const { userId, planId } = subscription.metadata || {};
        if (userId && planId) {
          const planInfo = PLAN_MAP[planId];
          const tier = subscription.status === 'active' ? planInfo?.tier : 'free';
          const user = users.get(userId) || {};
          user.membershipTier = tier;
          users.set(userId, user);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);
        
        const stored = subscriptions.get(subscription.id);
        if (stored) {
          stored.status = 'canceled';
          
          const user = users.get(stored.userId) || {};
          user.membershipTier = 'free';
          users.set(stored.userId, user);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export const config = {
  runtime: 'nodejs',
};
