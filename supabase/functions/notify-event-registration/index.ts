import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (value: string | null | undefined) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string[];
  subject: string;
  text: string;
  html: string;
}) => {
  const resendApiKey = Deno.env.get("RESEND_API") ?? Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    throw new Error("RESEND_API is not configured");
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "Dauno Integrated <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text, html }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const {
      eventId,
      eventTitle,
      fullName,
      email,
      phone,
      company,
      country,
      notes,
    } = body;

    if (!eventId || !eventTitle || !fullName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: eventId, eventTitle, fullName, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabaseAnon = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        );
        const token = authHeader.replace("Bearer ", "");
        const { data: u } = await supabaseAnon.auth.getUser(token);
        if (u?.user) userId = u.user.id;
      } catch (_) {
        // Guest registrations are allowed.
      }
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
        ticket_tier: null,
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
      "infodauno@gmail.com",
    ];
    const origin = req.headers.get("origin") || "https://www.daunointegrated.com";
    const adminSubject = `New Event Registration: ${fullName} - ${eventTitle}`;
    const adminText = `New Event Registration

Event: ${eventTitle}
Name: ${fullName}
Email: ${email}
Phone: ${phone || "-"}
Company: ${company || "-"}
Country: ${country || "-"}
Notes: ${notes || "-"}

Manage: ${origin}/admin/events`;
    const adminHtml = `
      <h2>New Event Registration</h2>
      <p><strong>Event:</strong> ${escapeHtml(eventTitle)}</p>
      <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "-")}</p>
      <p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>
      <p><strong>Country:</strong> ${escapeHtml(country || "-")}</p>
      <p><strong>Notes:</strong> ${escapeHtml(notes || "-")}</p>
      <p><a href="${escapeHtml(origin)}/admin/events">Manage event registrations</a></p>
    `;

    const userSubject = `Registration received: ${eventTitle}`;
    const userText = `Dear ${fullName},

Thank you for registering your interest in ${eventTitle}.

Our team has received your details and will contact you with further information.

For further information, contact us on:
+2347075443656
Or infodauno@gmail.com

Dauno Integrated Ltd`;
    const userHtml = `
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>Thank you for registering your interest in <strong>${escapeHtml(eventTitle)}</strong>.</p>
      <p>Our team has received your details and will contact you with further information.</p>
      <p>For further information, contact us on:<br />
      <strong>+2347075443656</strong><br />
      Or <a href="mailto:infodauno@gmail.com">infodauno@gmail.com</a></p>
      <p>Dauno Integrated Ltd</p>
    `;

    await Promise.all([
      sendEmail({ to: adminEmails, subject: adminSubject, text: adminText, html: adminHtml }),
      sendEmail({ to: [email], subject: userSubject, text: userText, html: userHtml }),
    ]);

    return new Response(
      JSON.stringify({ success: true, registrationId: registration.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Event registration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
