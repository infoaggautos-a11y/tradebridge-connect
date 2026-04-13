import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wihcbiminnorjuhffedb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { userId, templateId, subject, body: emailBody, variables } = body;

    if (!userId || !subject) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    const recipientEmail = profile?.email || body.email;
    const recipientName = profile?.full_name || 'User';

    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    let emailSent = false;
    let errorMessage = '';

    if (sendGridApiKey) {
      const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: recipientEmail, name: recipientName }],
            dynamic_template_data: { subject, ...variables },
          }],
          from: { email: process.env.EMAIL_FROM || 'noreply@diltradebridge.com', name: 'DIL Trade Bridge' },
          template_id: templateId,
        }),
      });
      emailSent = sgResponse.status >= 200 && sgResponse.status < 300;
    } else if (resendApiKey) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@diltradebridge.com',
          to: recipientEmail,
          subject,
          html: emailBody || `<p>${JSON.stringify(variables || {})}</p>`,
        }),
      });
      emailSent = resendResponse.ok;
    } else {
      console.log('Email service not configured. Logging email instead:', {
        to: recipientEmail,
        subject,
        variables,
      });
      emailSent = true;
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'email',
        title: subject,
        message: emailBody || JSON.stringify(variables),
        status: emailSent ? 'sent' : 'failed',
      });

    return new Response(JSON.stringify({ 
      success: emailSent,
      message: emailSent ? 'Email sent successfully' : 'Failed to send email',
    }), {
      status: emailSent ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
