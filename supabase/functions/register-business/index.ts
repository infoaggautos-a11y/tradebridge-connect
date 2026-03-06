import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Generate a random password
    const password = crypto.randomUUID().slice(0, 12) + "Aa1!";

    // Create user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: contact_person },
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

    // Send login credentials email via Supabase's built-in email (using password reset as delivery)
    // Since auto-confirm is on, we'll use the invite approach
    console.log(`Account created for ${email} with temporary password`);

    return new Response(JSON.stringify({
      success: true,
      message: "Registration successful! Your account has been created.",
      credentials: { email, temporary_password: password },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
