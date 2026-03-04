import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kaelxkayllqlkzsgauyz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: Request) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    let userId: string | undefined;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      userId = url.searchParams.get('userId') || undefined;
    } else {
      const body = await req.json();
      userId = body.userId;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('type');

    if (error) throw error;

    const { data: transactions, error: txnError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .in('wallet_id', wallets?.map(w => w.id) || [])
      .order('created_at', { ascending: false })
      .limit(50);

    if (txnError) throw txnError;

    const walletsWithTransactions = wallets?.map(wallet => ({
      ...wallet,
      transactions: transactions?.filter(t => t.wallet_id === wallet.id) || [],
    })) || [];

    const mainWallet = walletsWithTransactions.find(w => w.type === 'main');
    const escrowWallet = walletsWithTransactions.find(w => w.type === 'escrow');

    return new Response(JSON.stringify({
      success: true,
      wallets: walletsWithTransactions,
      mainWallet,
      escrowWallet,
      totalBalance: (mainWallet?.balance || 0) + (escrowWallet?.balance || 0),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Get wallet error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
