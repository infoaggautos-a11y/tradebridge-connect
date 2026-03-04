import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.SUPABASE_URL || 'https://kaelxkayllqlkzsgauyz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        console.log('No webhook secret, parsing as test event');
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
        
        const { userId, type, planId, subscriptionId } = paymentIntent.metadata || {};
        
        await supabase.from('payments').insert({
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
            await supabase.from('profiles').update({ 
              membership_tier: planInfo.tier 
            }).eq('id', userId);
            console.log('User tier updated:', { userId, tier: planInfo.tier });
          }
        }
        
        if (type === 'wallet_topup' && userId) {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'main')
            .single();
          
          if (wallet) {
            await supabase.from('wallet_transactions').insert({
              wallet_id: wallet.id,
              type: 'deposit',
              amount: paymentIntent.amount,
              balance_after: paymentIntent.amount,
              reference: paymentIntent.id,
              description: 'Wallet top-up via Stripe',
              status: 'completed',
            });
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
        console.log('Invoice paid:', invoice.id);
        
        const subscriptionId = (invoice as any).subscription as string;
        if (subscriptionId) {
          const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_end: periodEnd.toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', invoice.id);
        
        const subscriptionId = (invoice as any).subscription as string;
        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id, subscription.status);
        
        const { userId, planId } = subscription.metadata || {};
        
        await supabase
          .from('subscriptions')
          .update({ status: subscription.status })
          .eq('stripe_subscription_id', subscription.id);
        
        if (userId && planId) {
          const planInfo = PLAN_MAP[planId];
          const tier = subscription.status === 'active' ? planInfo?.tier : 'free';
          await supabase.from('profiles').update({ membership_tier: tier }).eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);
        
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);
        
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (subData?.user_id) {
          await supabase.from('profiles').update({ membership_tier: 'free' }).eq('id', subData.user_id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    await supabase.from('webhook_events').insert({
      event_type: event.type,
      event_data: event,
      processed: true,
    });

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
