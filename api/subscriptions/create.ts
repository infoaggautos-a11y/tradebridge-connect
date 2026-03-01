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

async function getOrCreateProfile(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return profile;
}

async function updateProfile(userId: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function createSubscriptionRecord(subscription: any, userId: string, planId: string, planInfo: { name: string; tier: string }, customerId: string) {
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      plan_name: planInfo.name,
      status: 'active',
      stripe_subscription_id: subscription.id,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { userId, planId, amount } = body;
    
    if (!userId || !planId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    const planInfo = PLAN_MAP[planId] || { name: planId, tier: planId };
    const customerEmail = `user_${userId}@diltradebridge.com`;
    
    let customerId = `cus_${userId}_${Date.now()}`;
    try {
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: { userId, planId },
      });
      customerId = customer.id;
    } catch (err) {
      console.error('Customer creation error:', err);
    }

    const priceId = `price_${planId}_monthly`;
    let subscriptionPriceId = priceId;
    
    try {
      await stripe.prices.retrieve(priceId);
    } catch {
      const newPrice = await stripe.prices.create({
        unit_amount: amount || 4900,
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: { name: `DIL ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan` },
      });
      subscriptionPriceId = newPrice.id;
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: subscriptionPriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId, planId },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

    await updateProfile(userId, {
      membership_tier: planInfo.tier,
      stripe_customer_id: customerId,
    });

    await createSubscriptionRecord(subscription, userId, planId, planInfo, customerId);

    console.log('Subscription created:', { subscriptionId: subscription.id, userId, planId });

    return new Response(JSON.stringify({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret || null,
      customerId,
      tier: planInfo.tier,
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
