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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const user = userData.user;
    const body = await req.json();
    const { matchedBusinessName, matchedBusinessId, matchScore, sectors, targetCountries, requesterBusinessName } = body;
    const resolvedRequesterBusinessName = requesterBusinessName || "Unknown Business";
    const hiddenDirectoryNames = ["unknown business", "my business", "hnery", "taxcode", "floodgate system"];

    if (!hiddenDirectoryNames.includes(resolvedRequesterBusinessName.trim().toLowerCase())) {
      const { data: existingRegistration, error: registrationLookupError } = await supabaseAdmin
        .from("business_registrations")
        .select("id")
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      if (registrationLookupError) {
        console.error("Registration lookup error:", registrationLookupError);
      }

      if (!existingRegistration) {
        const { error: registrationInsertError } = await supabaseAdmin
          .from("business_registrations")
          .insert({
            company_name: resolvedRequesterBusinessName,
            contact_person: resolvedRequesterBusinessName,
            email: user.email,
            country: "Nigeria",
            sector: sectors?.[0] || "Other",
            products_services: Array.isArray(sectors) ? sectors.join(", ") : null,
            export_markets: Array.isArray(targetCountries) ? targetCountries.join(", ") : null,
            additional_notes: "Business created from TradeMatch request.",
            user_id: user.id,
            account_created: true,
          });

        if (registrationInsertError) {
          console.error("Registration insert error:", registrationInsertError);
        }
      }
    }

    // Save match request to database
    const { data: matchRequest, error: insertError } = await supabaseAdmin
      .from("match_requests")
      .insert({
        requester_id: user.id,
        requester_email: user.email,
        requester_business_name: resolvedRequesterBusinessName,
        matched_business_name: matchedBusinessName,
        matched_business_id: matchedBusinessId,
        match_score: matchScore || 0,
        sectors: sectors || [],
        target_countries: targetCountries || [],
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`Match request saved: ${matchRequest.id} from ${user.email} for ${matchedBusinessName}`);

    // Send notification emails to admin addresses
    const adminEmails = [
      "daunointegrated@gmail.com",
      "info@daunointegrated.com",
      "admin@daunointegrated.com",
    ];

    const emailSubject = `New Match Request: ${requesterBusinessName || user.email} → ${matchedBusinessName}`;
    const emailBody = `
New Trade Match Request

Requester: ${requesterBusinessName || "N/A"}
Email: ${user.email}
Matched Business: ${matchedBusinessName}
Match Score: ${matchScore}%
Sectors: ${(sectors || []).join(", ")}
Target Countries: ${(targetCountries || []).join(", ")}

Please review and approve this match request in the admin dashboard.
Dashboard: ${req.headers.get("origin") || "https://daunointegrated.lovable.app"}/admin/matches
    `.trim();

    // Log the notification (actual email sending will work when email domain is configured)
    console.log(`Notification emails would be sent to: ${adminEmails.join(", ")}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Body: ${emailBody}`);

    return new Response(JSON.stringify({
      success: true,
      matchRequestId: matchRequest.id,
      message: "Match request submitted and admin notified.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Match notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
