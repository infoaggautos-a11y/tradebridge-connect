import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = process.env.SUPABASE_URL || 'https://wihcbiminnorjuhffedb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: 'Starter', tier: 'starter' },
  growth: { name: 'Growth', tier: 'growth' },
  enterprise: { name: 'Enterprise', tier: 'enterprise' },
};

async function updateProfile(userId: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) console.error('Profile update error:', error);
  return data;
}

async function updateSubscription(stripeSubscriptionId: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .select()
    .single();
  
  if (error) console.error('Subscription update error:', error);
  return data;
}

async function createPayment(payment: any) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
  
  if (error) console.error('Payment insert error:', error);
  return data;
}

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
        
        await createPayment({
          user_id: userId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'completed',
          type: type || 'subscription',
          provider: 'stripe',
          reference: paymentIntent.id,
          stripe_payment_id: paymentIntent.id,
        });
        
        if (type === 'subscription' && userId && planId) {
          const planInfo = PLAN_MAP[planId];
          if (planInfo) {
            await updateProfile(userId, { membership_tier: planInfo.tier });
            console.log('User tier updated:', { userId, tier: planInfo.tier });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_id', paymentIntent.id);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        console.log('Invoice paid:', invoice.id, 'subscription:', subscriptionId);
        
        if (subscriptionId) {
          const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await updateSubscription(subscriptionId, {
            status: 'active',
            current_period_end: periodEnd.toISOString(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        console.log('Invoice payment failed:', invoice.id);
        
        if (subscriptionId) {
          await updateSubscription(subscriptionId, { status: 'past_due' });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id, subscription.status);
        
        const { userId, planId } = subscription.metadata || {};
        
        await updateSubscription(subscription.id, {
          status: subscription.status,
        });
        
        if (userId && planId) {
          const planInfo = PLAN_MAP[planId];
          const tier = subscription.status === 'active' ? planInfo?.tier : 'free';
          await updateProfile(userId, { membership_tier: tier });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);
        
        await updateSubscription(subscription.id, { status: 'canceled' });
        
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (subData?.user_id) {
          await updateProfile(subData.user_id, { membership_tier: 'free' });
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
