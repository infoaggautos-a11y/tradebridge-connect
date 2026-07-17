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

type ApplicationPayload = {
  sector?: string;
  productService?: string;
  annualTurnover?: string;
  employeeCount?: string;
  exportExperience?: string;
  certifications?: string;
  businessObjective?: string;
  lookingFor?: string[];
  targetCountries?: string;
  expectedMeetings?: string;
  companyProfileUrl?: string;
  documentReadiness?: {
    passportReady?: boolean;
    companyProfileReady?: boolean;
    productCatalogueReady?: boolean;
    certificationReady?: boolean;
  };
};

const hasText = (value?: string) => Boolean(value && value.trim().length > 1);

const calculateScore = (payload: ApplicationPayload) => {
  const exportReadiness = Math.min(
    (payload.exportExperience === "active_exporter" ? 12 : 0) +
      (payload.exportExperience === "previous_exporter" ? 9 : 0) +
      (payload.exportExperience === "export_ready" ? 6 : 0) +
      (hasText(payload.certifications) ? 5 : 0) +
      (payload.documentReadiness?.passportReady ? 2 : 0) +
      (hasText(payload.companyProfileUrl) ? 3 : 0),
    20,
  );

  const companyCapacityMap: Record<string, number> = {
    "1-10": 3,
    "10-25": 6,
    "25-50": 9,
    "50-100": 12,
    "100+": 15,
  };
  const financialCapacityMap: Record<string, number> = {
    under_50k: 5,
    "50k_250k": 10,
    "250k_1m": 15,
    above_1m: 20,
  };

  const companyCapacity = companyCapacityMap[payload.employeeCount || ""] || 4;
  const financialCapacity = financialCapacityMap[payload.annualTurnover || ""] || 6;
  const intentClarity = Math.min(
    (hasText(payload.businessObjective) ? 8 : 0) +
      ((payload.lookingFor || []).length > 0 ? 6 : 0) +
      (hasText(payload.targetCountries) ? 3 : 0) +
      (hasText(payload.expectedMeetings) ? 3 : 0),
    20,
  );
  const productQuality = Math.min(
      (hasText(payload.productService) ? 10 : 0) +
      (hasText(payload.sector) ? 5 : 0) +
      (hasText(payload.certifications) ? 5 : 0) +
      ((hasText(payload.companyProfileUrl) || payload.documentReadiness?.companyProfileReady) ? 5 : 0),
    25,
  );
  const total = exportReadiness + companyCapacity + financialCapacity + intentClarity + productQuality;
  const outcome = total >= 75 ? "accepted" : total >= 55 ? "needs_review" : total >= 40 ? "waitlisted" : "rejected";

  return {
    total,
    breakdown: {
      exportReadiness,
      companyCapacity,
      financialCapacity,
      intentClarity,
      productQuality,
      outcome,
    },
  };
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
      applicationPayload,
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

    const { total, breakdown } = calculateScore(applicationPayload || {});

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
        workflow_stage: "new_registration",
        application_payload: applicationPayload || {},
        qualification_score: total,
        score_breakdown: breakdown,
        user_id: userId,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const documentRequirements = [
      {
        document_code: "passport",
        label: "International Passport",
        status: applicationPayload?.documentReadiness?.passportReady ? "submitted" : "not_submitted",
      },
      {
        document_code: "company_profile",
        label: "Company Profile",
        status: applicationPayload?.documentReadiness?.companyProfileReady ? "submitted" : "not_submitted",
      },
      {
        document_code: "product_catalogue",
        label: "Product Catalogue",
        status: applicationPayload?.documentReadiness?.productCatalogueReady ? "submitted" : "not_submitted",
      },
      {
        document_code: "certifications",
        label: "Certifications",
        status: applicationPayload?.documentReadiness?.certificationReady ? "submitted" : "not_submitted",
      },
    ];

    const { error: documentError } = await supabaseAdmin
      .from("tmos_delegate_documents")
      .upsert(
        documentRequirements.map((document) => ({
          event_registration_id: registration.id,
          event_id: eventId,
          ...document,
          uploaded_at: document.status === "submitted" ? new Date().toISOString() : null,
        })),
        { onConflict: "event_registration_id,document_code" },
      );

    if (documentError) console.error("Document checklist creation error:", documentError);

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

Thank you for registering for ${eventTitle}. This email acknowledges that we have received your registration.

More information will be communicated soon by our team.

For further information, contact us on:
+2347075443656
Or infodauno@gmail.com

Dauno Integrated Ltd`;
    const userHtml = `
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>Thank you for registering for <strong>${escapeHtml(eventTitle)}</strong>. This email acknowledges that we have received your registration.</p>
      <p>More information will be communicated soon by our team.</p>
      <p>For further information, contact us on:<br />
      <strong>+2347075443656</strong><br />
      Or <a href="mailto:infodauno@gmail.com">infodauno@gmail.com</a></p>
      <p>Dauno Integrated Ltd</p>
    `;

    const emailJobs = [
      {
        to: adminEmails,
        recipient: adminEmails.join(","),
        subject: adminSubject,
        text: adminText,
        html: adminHtml,
        template_key: "event_registration_admin_notification",
      },
      {
        to: [email],
        recipient: email,
        subject: userSubject,
        text: userText,
        html: userHtml,
        template_key: "event_registration_delegate_acknowledgement",
      },
    ];

    await Promise.all(emailJobs.map(async (job) => {
      try {
        const providerResponse = await sendEmail(job);
        await supabaseAdmin.from("tmos_message_logs").insert({
          event_registration_id: registration.id,
          event_id: eventId,
          channel: "email",
          recipient: job.recipient,
          subject: job.subject,
          template_key: job.template_key,
          workflow_stage: "new_registration",
          status: "sent",
          provider_message_id: providerResponse?.id || null,
          sent_at: new Date().toISOString(),
        });
      } catch (emailError: any) {
        await supabaseAdmin.from("tmos_message_logs").insert({
          event_registration_id: registration.id,
          event_id: eventId,
          channel: "email",
          recipient: job.recipient,
          subject: job.subject,
          template_key: job.template_key,
          workflow_stage: "new_registration",
          status: "failed",
          error_message: emailError?.message || "Email send failed",
        });
        throw emailError;
      }
    }));

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
