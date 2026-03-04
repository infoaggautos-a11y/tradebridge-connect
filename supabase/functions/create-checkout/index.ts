import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const ZOOM_MODEL_PRICING = {
  starter: {
    monthly: {
      priceId: Deno.env.get("STRIPE_STARTER_MONTHLY_PRICE_ID") ?? "price_1T6TJpEPAQKb2xdh60Q4Juwp",
      amount: 1600,
    },
    annual: {
      priceId: Deno.env.get("STRIPE_STARTER_ANNUAL_PRICE_ID") ?? "price_1T6TJqEPAQKb2xdhETUXy6Sy",
      amount: 15600,
    },
  },
  growth: {
    monthly: {
      priceId: Deno.env.get("STRIPE_GROWTH_MONTHLY_PRICE_ID") ?? "price_1T6TJrEPAQKb2xdh3LmM48gg",
      amount: 2400,
    },
    annual: {
      priceId: Deno.env.get("STRIPE_GROWTH_ANNUAL_PRICE_ID") ?? "price_1T6TJrEPAQKb2xdhBB3j1taO",
      amount: 22800,
    },
  },
} as const;

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
    const { data, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planTier, billingCycle } = await req.json();
    if (!planTier || !billingCycle) throw new Error("planTier and billingCycle are required");
    if (planTier !== "starter" && planTier !== "growth") throw new Error("Invalid plan tier");
    if (billingCycle !== "monthly" && billingCycle !== "annual") throw new Error("Invalid billing cycle");

    const pricing = ZOOM_MODEL_PRICING[planTier][billingCycle];
    if (!pricing.priceId) {
      throw new Error(`Stripe price ID is not configured for ${planTier} ${billingCycle}`);
    }
    logStep("Creating checkout", { planTier, billingCycle, priceId: pricing.priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://id-preview--4ae2a6c5-87d1-4ff3-87e7-9a5e37d2625d.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: pricing.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/subscription?success=true`,
      cancel_url: `${origin}/subscription?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: user.id, planTier, billingCycle },
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
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
