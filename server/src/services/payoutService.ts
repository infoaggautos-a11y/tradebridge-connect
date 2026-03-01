import { logger } from './logger.js';

const pendingPayouts: Map<string, any> = new Map();

export async function processPendingPayouts(): Promise<void> {
  try {
    for (const [id, payout] of pendingPayouts) {
      if (payout.status !== 'pending') continue;
      
      logger.info('Processing pending payout', { id });
      
      payout.status = 'processing';
      
      await processPayout(id);
    }
  } catch (error: any) {
    logger.error('Error processing pending payouts:', error);
  }
}

async function processPayout(payoutId: string): Promise<void> {
  const payout = pendingPayouts.get(payoutId);
  if (!payout) return;

  try {
    const success = Math.random() > 0.1;
    
    if (success) {
      payout.status = 'completed';
      payout.completedAt = new Date().toISOString();
      payout.providerReference = `prov_${Date.now()}`;
      
      logger.info('Payout completed', { payoutId });
    } else {
      payout.status = 'failed';
      payout.failureReason = 'Provider processing failed';
      
      logger.error('Payout failed', { payoutId });
    }

    pendingPayouts.set(payoutId, payout);
  } catch (error: any) {
    logger.error('Payout processing error', { payoutId, error: error.message });
    payout.status = 'failed';
    payout.failureReason = error.message;
    pendingPayouts.set(payoutId, payout);
  }
}

export function addPendingPayout(payout: any): void {
  pendingPayouts.set(payout.id, payout);
}

export function getPayout(payoutId: string): any | null {
  return pendingPayouts.get(payoutId) || null;
}
