import { logger } from './logger.js';

const subscriptions: Map<string, any> = new Map();

export function addSubscription(subscription: any): void {
  subscriptions.set(subscription.id, subscription);
}

export async function processScheduledRenewals(): Promise<void> {
  try {
    const now = new Date();
    
    for (const [id, subscription] of subscriptions) {
      if (subscription.status !== 'active') continue;
      
      const periodEnd = new Date(subscription.currentPeriodEnd);
      if (periodEnd <= now) {
        logger.info('Processing renewal for subscription', { id });
        await processSubscriptionRenewal(id);
      }
    }
  } catch (error: any) {
    logger.error('Error processing scheduled renewals:', error);
  }
}

async function processSubscriptionRenewal(subscriptionId: string): Promise<void> {
  const subscription = subscriptions.get(subscriptionId);
  if (!subscription) return;

  try {
    logger.info('Renewing subscription', { subscriptionId });
    
    subscription.currentPeriodStart = subscription.currentPeriodEnd;
    const nextPeriod = new Date();
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
    subscription.currentPeriodEnd = nextPeriod.toISOString();
    subscription.updatedAt = new Date().toISOString();

    subscriptions.set(subscriptionId, subscription);
    
    logger.info('Subscription renewed successfully', { subscriptionId });
  } catch (error: any) {
    logger.error('Subscription renewal failed', { subscriptionId, error: error.message });
    
    subscription.status = 'past_due';
    subscription.updatedAt = new Date().toISOString();
    subscriptions.set(subscriptionId, subscription);
  }
}

export async function getSubscription(subscriptionId: string): Promise<any | null> {
  return subscriptions.get(subscriptionId) || null;
}

export async function updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
  const subscription = subscriptions.get(subscriptionId);
  if (subscription) {
    subscription.status = status;
    subscription.updatedAt = new Date().toISOString();
    subscriptions.set(subscriptionId, subscription);
  }
}
