import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.SUPABASE_URL || 'https://kaelxkayllqlkzsgauyz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { userId, amount, currency = 'usd' } = body;

    if (!userId || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId && profile?.email) {
      const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || `user_${userId}@diltradebridge.com`,
        metadata: { userId },
      });
      customerId = customer.id;
      
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        userId,
        type: 'wallet_topup',
      },
      automatic_payment_methods: { enabled: true },
    });

    const reference = `DIL-${Date.now().toString(36).toUpperCase()}`;
    
    await supabase.from('payments').insert({
      user_id: userId,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: 'pending',
      type: 'wallet_topup',
      provider: 'stripe',
      reference,
      stripe_payment_id: paymentIntent.id,
      metadata: { wallet_topup: true },
    });

    return new Response(JSON.stringify({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      reference,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
