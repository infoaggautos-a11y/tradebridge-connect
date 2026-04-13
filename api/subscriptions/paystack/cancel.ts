export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { subscriptionCode, immediately = false, userId } = body;

    if (!subscriptionCode) {
      return new Response(JSON.stringify({ success: false, error: 'Subscription code required' }), { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecret) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Paystack not configured. Please add PAYSTACK_SECRET_KEY to environment variables.' 
      }), { status: 503 });
    }

    let endpoint, method;
    
    if (immediately) {
      endpoint = 'https://api.paystack.co/subscription/disable';
      method = 'POST';
    } else {
      endpoint = 'https://api.paystack.co/subscription/disable';
      method = 'POST';
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: subscriptionCode,
        cancel_at_cycle_end: !immediately,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Paystack API error');
    }

    return new Response(JSON.stringify({
      success: true,
      data: data.data,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Cancel Paystack subscription error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
