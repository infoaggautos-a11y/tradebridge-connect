import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kaelxkayllqlkzsgauyz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PAYOUT_FEES = {
  NGN: { flat: 10, percentage: 0.01 },
  USD: { flat: 1, percentage: 0.005 },
  EUR: { flat: 1, percentage: 0.005 },
  GBP: { flat: 1, percentage: 0.005 },
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { userId, walletId, amount, currency = 'USD', bankAccountId, bankCode, bankName, accountName } = body;

    if (!userId || !walletId || !amount || !bankAccountId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), { status: 400 });
    }

    if (wallet.available_balance < amount * 100) {
      return new Response(JSON.stringify({ error: 'Insufficient funds' }), { status: 400 });
    }

    const feeConfig = PAYOUT_FEES[currency] || PAYOUT_FEES.USD;
    const fees = Math.max(feeConfig.flat * 100, Math.round(amount * 100 * feeConfig.percentage));
    const netAmount = Math.round(amount * 100) - fees;

    const reference = `Payout-${Date.now().toString(36).toUpperCase()}`;

    const { data: payout, error: payoutError } = await supabase.from('payouts').insert({
      user_id: userId,
      wallet_id: walletId,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: 'pending',
      reference,
      provider: 'stripe',
      failure_reason: null,
    }).select().single();

    if (payoutError) throw payoutError;

    await supabase.from('wallets').update({
      balance: wallet.balance - Math.round(amount * 100),
      pending_balance: wallet.pending_balance + Math.round(amount * 100),
    }).eq('id', walletId);

    await supabase.from('wallet_transactions').insert({
      wallet_id: walletId,
      type: 'withdrawal',
      amount: -Math.round(amount * 100),
      balance_after: wallet.balance - Math.round(amount * 100),
      reference,
      description: `Withdrawal to ${bankName} (${bankAccountId})`,
      status: 'pending',
    });

    setTimeout(async () => {
      try {
        const randomSuccess = Math.random() > 0.1;
        
        if (randomSuccess) {
          await supabase.from('payouts').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            provider_ref: `txn_${Date.now()}`,
          }).eq('id', payout.id);

          await supabase.from('wallets').update({
            pending_balance: wallet.pending_balance - Math.round(amount * 100),
          }).eq('id', walletId);

          await supabase.from('wallet_transactions').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          }).eq('reference', reference);
        } else {
          await supabase.from('payouts').update({
            status: 'failed',
            failure_reason: 'Payout rejected by provider',
          }).eq('id', payout.id);

          await supabase.from('wallets').update({
            balance: wallet.balance,
            pending_balance: wallet.pending_balance - Math.round(amount * 100),
          }).eq('id', walletId);
        }
      } catch (e) {
        console.error('Async payout processing error:', e);
      }
    }, 5000);

    return new Response(JSON.stringify({
      success: true,
      payout: {
        ...payout,
        fees: fees / 100,
        netAmount: netAmount / 100,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Payout error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
