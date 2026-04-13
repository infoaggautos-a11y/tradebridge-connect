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

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { subscriptionId, priceId, userId } = body;

    if (!subscriptionId || !priceId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
      proration_behavior: 'create_prorations',
    });

    if (userId) {
      await supabase
        .from('profiles')
        .update({ 
          plan_tier: body.planTier || 'starter',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_end: updatedSubscription.current_period_end,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
