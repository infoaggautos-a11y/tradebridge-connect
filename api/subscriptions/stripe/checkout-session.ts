import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.SUPABASE_URL || 'https://wihcbiminnorjuhffedb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const STRIPE_PRICES = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_1T6TJpEPAQKb2xdh60Q4Juwp',
    annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_1T6TJqEPAQKb2xdhETUXy6Sy',
  },
  growth: {
    monthly: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || 'price_1T6TJrEPAQKb2xdh3LmM48gg',
    annual: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || 'price_1T6TJrEPAQKb2xdhBB3j1taO',
  },
};

const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: 'Starter', tier: 'starter' },
  growth: { name: 'Growth', tier: 'growth' },
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { userId, email, planTier, billingCycle = 'annual' } = body;

    if (!userId || !planTier) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    if (planTier !== 'starter' && planTier !== 'growth') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid plan tier' }), { status: 400 });
    }

    const priceId = STRIPE_PRICES[planTier][billingCycle];
    if (!priceId) {
      return new Response(JSON.stringify({ success: false, error: 'Price ID not found' }), { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const userEmail = email || `user_${userId}@diltradebridge.com`;

    let customerId: string | undefined;
    try {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    } catch (err) {
      console.error('Customer lookup error:', err);
    }

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId },
        });
        customerId = customer.id;
      } catch (err) {
        console.error('Customer creation error:', err);
        customerId = `cus_${userId}_${Date.now()}`;
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/subscription?success=true`,
      cancel_url: `${origin}/subscription?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId, planTier, billingCycle },
      },
    });

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);

    return new Response(JSON.stringify({
      success: true,
      url: session.url,
      sessionId: session.id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
