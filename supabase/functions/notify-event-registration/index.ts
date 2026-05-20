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
      eventId, eventTitle, fullName, email, phone, company,
      country, ticketTier, notes,
    } = body;

    if (!eventId || !eventTitle || !fullName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: eventId, eventTitle, fullName, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabaseAnon = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const token = authHeader.replace("Bearer ", "");
        const { data: u } = await supabaseAnon.auth.getUser(token);
        if (u?.user) userId = u.user.id;
      } catch (_) { /* guest */ }
    }

    const { data: registration, error: insertError } = await supabaseAdmin
      .from("event_registrations")
      .insert({
        event_id: eventId,
        event_title: eventTitle,
        full_name: fullName,
        email,
        phone: phone || null,
        company: company || null,
        country: country || null,
        ticket_tier: ticketTier || null,
        notes: notes || null,
        user_id: userId,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const adminEmails = [
      "info@daunointegrated.com",
      "admin@daunointegrated.com",
      "daunointegrated@gmail.com",
    ];

    const subject = `New Event Registration: ${fullName} — ${eventTitle}`;
    const message = `New Event Registration

Event: ${eventTitle}
Name: ${fullName}
Email: ${email}
Phone: ${phone || "—"}
Company: ${company || "—"}
Country: ${country || "—"}
Ticket: ${ticketTier || "Standard"}
Notes: ${notes || "—"}

Manage: ${req.headers.get("origin") || "https://daunointegrated.lovable.app"}/admin/events`;

    console.log(`Notify -> ${adminEmails.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(message);

    return new Response(
      JSON.stringify({ success: true, registrationId: registration.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Event registration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
