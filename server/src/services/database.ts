import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// Helper functions for payment operations
export async function findOrCreateUser(email: string, name?: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: name || email.split('@')[0] }
    });
  }
  
  return user;
}

export async function updateUserTier(userId: string, tier: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { membershipTier: tier }
  });
}

export async function createOrUpdateSubscription(data: {
  userId: string;
  planId: string;
  planName: string;
  stripeSubscriptionId?: string;
  paystackSubCode?: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}) {
  const existing = await prisma.subscription.findFirst({
    where: { 
      userId: data.userId,
      planId: data.planId,
      status: { in: ['active', 'trialing', 'past_due'] }
    }
  });

  if (existing) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        stripeSubscriptionId: data.stripeSubscriptionId,
      }
    });
  }

  return prisma.subscription.create({
    data: {
      userId: data.userId,
      planId: data.planId,
      planName: data.planName,
      stripeSubscriptionId: data.stripeSubscriptionId,
      paystackSubCode: data.paystackSubCode,
      status: data.status,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
    }
  });
}

export async function createPayment(data: {
  userId: string;
  amount: number;
  currency: string;
  type: string;
  provider: string;
  reference: string;
  status: string;
  stripePaymentId?: string;
  paystackRef?: string;
  metadata?: any;
}) {
  return prisma.payment.create({
    data: {
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      type: data.type,
      provider: data.provider,
      reference: data.reference,
      status: data.status,
      stripePaymentId: data.stripePaymentId,
      paystackRef: data.paystackRef,
      metadata: data.metadata,
    }
  });
}

export async function updatePaymentStatus(reference: string, status: string) {
  return prisma.payment.updateMany({
    where: { reference },
    data: { status }
  });
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  return prisma.subscription.findFirst({
    where: { stripeSubscriptionId }
  });
}

export async function getSubscriptionByUserId(userId: string) {
  return prisma.subscription.findFirst({
    where: { 
      userId,
      status: { in: ['active', 'trialing', 'past_due'] }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: 'Starter', tier: 'starter' },
  growth: { name: 'Growth', tier: 'growth' },
  enterprise: { name: 'Enterprise', tier: 'enterprise' },
};
