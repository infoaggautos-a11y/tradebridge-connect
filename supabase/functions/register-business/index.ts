import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const {
      company_name, contact_person, email, phone, country, city, address,
      website, sector, products_services, export_markets, import_interests,
      company_size, annual_revenue, registration_number, additional_notes,
    } = body;

    if (!company_name || !contact_person || !email) {
      return new Response(JSON.stringify({ error: "Company name, contact person, and email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use inviteUserByEmail — this sends an invite email automatically
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name: contact_person },
    });

    if (authError) {
      // If user already exists, still save registration
      if (authError.message?.includes("already been registered")) {
        const { error: regError } = await supabaseAdmin.from("business_registrations").insert({
          company_name, contact_person, email, phone, country, city, address,
          website, sector, products_services, export_markets, import_interests,
          company_size, annual_revenue, registration_number, additional_notes,
          account_created: false,
        });
        if (regError) throw regError;
        return new Response(JSON.stringify({
          success: true,
          message: "Registration saved. An account with this email already exists. Please use your existing login credentials.",
          existing_account: true,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw authError;
    }

    const userId = authData.user.id;
    console.log(`Invite sent to ${email}, user ID: ${userId}`);

    // Save registration with user_id
    const { error: regError } = await supabaseAdmin.from("business_registrations").insert({
      company_name, contact_person, email, phone, country, city, address,
      website, sector, products_services, export_markets, import_interests,
      company_size, annual_revenue, registration_number, additional_notes,
      user_id: userId,
      account_created: true,
    });
    if (regError) console.error("Registration save error:", regError);

    // Update profile with additional info
    await supabaseAdmin.from("profiles").update({
      name: contact_person,
    }).eq("id", userId);

    return new Response(JSON.stringify({
      success: true,
      message: "Registration successful! An invitation email has been sent to set up your password.",
      email_sent: true,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
