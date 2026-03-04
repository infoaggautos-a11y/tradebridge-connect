import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kaelxkayllqlkzsgauyz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { userId, businessId, currency = 'USD', type = 'main' } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .single();

    if (existingWallet) {
      return new Response(JSON.stringify({
        success: true,
        wallet: existingWallet,
        message: 'Wallet already exists',
      }), { status: 200 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    const { data: wallet, error } = await supabase.from('wallets').insert({
      user_id: userId,
      business_id: businessId || null,
      type,
      currency,
      balance: 0,
      pending_balance: 0,
      available_balance: 0,
      frozen_balance: 0,
      status: 'active',
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      wallet,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Create wallet error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
