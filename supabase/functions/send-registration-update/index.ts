import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stageLabels: Record<string, string> = {
  new_registration: "New Registration",
  under_review: "Under Review",
  qualified: "Qualified",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
  accepted: "Accepted",
  package_selected: "Package Selected",
  invoice_generated: "Invoice Generated",
  payment_confirmed: "Payment Confirmed",
  document_collection: "Document Collection",
  visa_support: "Visa Support",
  business_matching: "Business Matching",
  meeting_schedule_confirmed: "Meeting Schedule Confirmed",
  travel_confirmed: "Travel Confirmed",
  event_attended: "Event Attended",
  deal_follow_up: "Deal Follow-up",
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
  if (!resendApiKey) throw new Error("RESEND_API is not configured");

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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let registrationId = "";
  let workflowStage = "";
  let recipient = "";
  let subject = "";

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication is required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await supabaseUser.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access is required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    registrationId = body.registrationId;
    workflowStage = body.workflowStage;
    const customMessage = String(body.message || "").trim();

    if (!registrationId || !workflowStage) {
      return new Response(JSON.stringify({ error: "registrationId and workflowStage are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("event_registrations")
      .select("id, event_id, event_title, full_name, email, company")
      .eq("id", registrationId)
      .single();

    if (registrationError || !registration) throw registrationError || new Error("Registration not found");

    recipient = registration.email;
    const stageLabel = stageLabels[workflowStage] || workflowStage;
    subject = `Update on your registration: ${registration.event_title}`;
    const defaultMessage =
      workflowStage === "accepted"
        ? "Your registration has been accepted. Our team will communicate the next steps soon."
        : workflowStage === "document_collection"
          ? "Your registration is progressing to document collection. Our team will contact you with any outstanding requirements."
          : workflowStage === "business_matching"
            ? "Your registration is now in business matching. Our team will communicate meeting details as they are confirmed."
            : "More information will be communicated soon by our team.";
    const message = customMessage || defaultMessage;

    const text = `Dear ${registration.full_name},

Your registration for ${registration.event_title} has been updated.

Current status: ${stageLabel}

${message}

For further information, contact us on:
+2347075443656
Or info@daunointegrated.com`;

    const html = `
      <h2>Registration Update</h2>
      <p>Dear ${escapeHtml(registration.full_name)},</p>
      <p>Your registration for <strong>${escapeHtml(registration.event_title)}</strong> has been updated.</p>
      <p><strong>Current status:</strong> ${escapeHtml(stageLabel)}</p>
      <p>${escapeHtml(message)}</p>
      <p>For further information, contact us on:<br />
      <a href="tel:+2347075443656">+2347075443656</a><br />
      <a href="mailto:info@daunointegrated.com">info@daunointegrated.com</a></p>
    `;

    await sendEmail({ to: [recipient], subject, text, html });

    await supabaseAdmin.from("tmos_message_logs").insert({
      event_registration_id: registration.id,
      event_id: registration.event_id,
      channel: "email",
      recipient,
      subject,
      template_key: "registration_stage_update",
      workflow_stage: workflowStage,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    try {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      if (registrationId) {
        await supabaseAdmin.from("tmos_message_logs").insert({
          event_registration_id: registrationId,
          channel: "email",
          recipient,
          subject: subject || "Registration update",
          template_key: "registration_stage_update",
          workflow_stage: workflowStage || null,
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
        });
      }
    } catch (_) {
      // Preserve the original failure for the caller.
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unable to send update" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
