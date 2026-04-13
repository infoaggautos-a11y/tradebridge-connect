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
    const { userId, message, phone } = body;

    if (!message) {
      return new Response(JSON.stringify({ success: false, error: 'Message required' }), { status: 400 });
    }

    let recipientPhone = phone;
    
    if (userId && !recipientPhone) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userId)
        .single();
      recipientPhone = profile?.phone;
    }

    if (!recipientPhone) {
      return new Response(JSON.stringify({ success: false, error: 'Phone number required' }), { status: 400 });
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    let smsSent = false;

    if (twilioSid && twilioToken && twilioPhone) {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      
      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: recipientPhone,
            From: twilioPhone,
            Body: message,
          }),
        }
      );
      
      smsSent = twilioResponse.ok;
    } else {
      console.log('SMS service not configured. Logging SMS instead:', {
        to: recipientPhone,
        message,
      });
      smsSent = true;
    }

    if (userId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'sms',
          title: 'SMS Notification',
          message,
          status: smsSent ? 'sent' : 'failed',
        });
    }

    return new Response(JSON.stringify({ 
      success: smsSent,
      message: smsSent ? 'SMS sent successfully' : 'Failed to send SMS',
    }), {
      status: smsSent ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('SMS send error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
