import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.SUPABASE_URL || 'https://wihcbiminnorjuhffedb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { subscriptionId, immediately = false, userId } = body;

    if (!subscriptionId) {
      return new Response(JSON.stringify({ success: false, error: 'Subscription ID required' }), { status: 400 });
    }

    let result;

    if (immediately) {
      result = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      result = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    if (userId) {
      await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'canceling',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: result.id,
        status: result.status,
        cancel_at_period_end: result.cancel_at_period_end,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
