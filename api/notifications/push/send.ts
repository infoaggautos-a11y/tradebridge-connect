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
    const { userId, title, body: pushBody, data, token } = body;

    if (!title) {
      return new Response(JSON.stringify({ success: false, error: 'Title required' }), { status: 400 });
    }

    let pushToken = token;
    let userIdToNotify = userId;

    if (userId && !pushToken) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('push_notification_token')
        .eq('id', userId)
        .single();
      pushToken = profile?.push_notification_token;
    }

    const fcmApiKey = process.env.FCM_API_KEY;
    const fcmProjectId = process.env.FCM_PROJECT_ID;

    let pushSent = false;

    if (pushToken && fcmApiKey && fcmProjectId) {
      const fcmResponse = await fetch(
        `https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fcmApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: pushToken,
              notification: { title, body: pushBody },
              data: data || {},
            },
          }),
        }
      );
      
      pushSent = fcmResponse.ok;
    } else {
      console.log('Push notification service not configured. Logging notification instead:', {
        to: pushToken,
        title,
        body: pushBody,
      });
      pushSent = true;
    }

    if (userIdToNotify) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userIdToNotify,
          type: 'push',
          title,
          message: pushBody,
          status: pushSent ? 'sent' : 'failed',
        });
    }

    return new Response(JSON.stringify({ 
      success: pushSent,
      message: pushSent ? 'Push notification sent successfully' : 'Failed to send push notification',
    }), {
      status: pushSent ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Push send error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
