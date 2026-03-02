import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const PRODUCT_TO_TIER: Record<string, string> = {
  [Deno.env.get('STRIPE_STARTER_PRODUCT_ID') ?? 'prod_U4cYy6J41GDHGw']: 'starter',
  [Deno.env.get('STRIPE_GROWTH_PRODUCT_ID') ?? 'prod_U4cYGtrCr3CGsu']: 'growth',
};

const PRICE_TO_TIER: Record<string, string> = {
  [Deno.env.get('STRIPE_STARTER_MONTHLY_PRICE_ID') ?? 'price_1T6TJpEPAQKb2xdh60Q4Juwp']: 'starter',
  [Deno.env.get('STRIPE_STARTER_ANNUAL_PRICE_ID') ?? 'price_1T6TJqEPAQKb2xdhETUXy6Sy']: 'starter',
  [Deno.env.get('STRIPE_GROWTH_MONTHLY_PRICE_ID') ?? 'price_1T6TJrEPAQKb2xdh3LmM48gg']: 'growth',
  [Deno.env.get('STRIPE_GROWTH_ANNUAL_PRICE_ID') ?? 'price_1T6TJrEPAQKb2xdhBB3j1taO']: 'growth',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Also check trialing
    const trialingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });

    const allSubs = [...subscriptions.data, ...trialingSubs.data];
    const hasActiveSub = allSubs.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let status = null;

    if (hasActiveSub) {
      const subscription = allSubs[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const subPrice = subscription.items.data[0].price;
      productId = subPrice.product;
      status = subscription.status;
      logStep("Active subscription found", { subscriptionId: subscription.id, productId, status });

      const resolvedTier =
        PRODUCT_TO_TIER[String(productId)] ||
        PRICE_TO_TIER[subPrice.id] ||
        'free';

      await supabaseClient.from('profiles').update({
        membership_tier: resolvedTier,
        stripe_customer_id: customerId,
      }).eq('id', user.id);
      logStep("Profile updated", { tier: resolvedTier, priceId: subPrice.id });
    } else {
      logStep("No active subscription found");
      await supabaseClient.from('profiles').update({
        membership_tier: 'free',
        stripe_customer_id: customerId,
      }).eq('id', user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
