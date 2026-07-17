import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedDocumentCodes = new Set([
  "passport",
  "company_profile",
  "product_catalogue",
  "certifications",
]);

const decodeBase64 = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 120);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const {
      registrationId,
      eventId,
      email,
      documentCode,
      label,
      fileName,
      contentType,
      base64Data,
    } = await req.json();

    if (!registrationId || !eventId || !email || !documentCode || !fileName || !contentType || !base64Data) {
      return new Response(
        JSON.stringify({ error: "Missing required document upload fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!allowedDocumentCodes.has(documentCode)) {
      return new Response(
        JSON.stringify({ error: "Unsupported document type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("event_registrations")
      .select("id,event_id,email")
      .eq("id", registrationId)
      .eq("event_id", eventId)
      .single();

    if (registrationError || !registration) {
      return new Response(
        JSON.stringify({ error: "Registration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (String(registration.email).toLowerCase() !== String(email).toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Registration email does not match" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabaseAdmin.storage.createBucket("tmos-documents", {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    }).catch(() => null);

    const safeName = sanitizeFileName(fileName);
    const objectPath = `${eventId}/${registrationId}/${documentCode}/${Date.now()}-${safeName}`;
    const fileBytes = decodeBase64(base64Data);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("tmos-documents")
      .upload(objectPath, fileBytes, {
        contentType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: updatedDocument, error: documentError } = await supabaseAdmin
      .from("tmos_delegate_documents")
      .upsert({
        event_registration_id: registrationId,
        event_id: eventId,
        document_code: documentCode,
        label: label || documentCode,
        file_url: objectPath,
        file_name: fileName,
        status: "submitted",
        uploaded_at: new Date().toISOString(),
      }, { onConflict: "event_registration_id,document_code" })
      .select()
      .single();

    if (documentError) throw documentError;

    return new Response(
      JSON.stringify({ success: true, document: updatedDocument }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Delegate document upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
