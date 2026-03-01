import Stripe from 'stripe';
import { logger } from './logger.js';

const getStripeKey = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return key;
};

const stripe = new Stripe(getStripeKey(), {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, any>;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      payment_method_types: ['card'],
      metadata: {
        reference: params.reference,
        ...params.metadata,
      },
      description: `DIL Trade Bridge Payment - ${params.reference}`,
    });

    logger.info('Payment intent created', { id: paymentIntent.id, amount: params.amount });
    return paymentIntent;
  } catch (error: any) {
    logger.error('Create payment intent error:', error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
}

export async function verifyPayment(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    logger.info('Payment confirmed', { id: paymentIntent.id, status: paymentIntent.status });
    return paymentIntent;
  } catch (error: any) {
    logger.error('Verify payment error:', error);
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<Stripe.Refund> {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = amount;
    }

    if (reason) {
      refundParams.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    const refund = await stripe.refunds.create(refundParams);
    logger.info('Refund created', { id: refund.id, paymentIntentId });
    return refund;
  } catch (error: any) {
    logger.error('Create refund error:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
}

export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error: any) {
    logger.error('Retrieve payment intent error:', error);
    throw new Error(`Failed to retrieve payment: ${error.message}`);
  }
}

export async function createCustomer(email: string, name: string, metadata?: Record<string, any>): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    logger.info('Customer created', { id: customer.id, email });
    return customer;
  } catch (error: any) {
    logger.error('Create customer error:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, any>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    logger.info('Subscription created', { id: subscription.id, customerId });
    return subscription;
  } catch (error: any) {
    logger.error('Create subscription error:', error);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
}

export async function cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    logger.info('Subscription cancelled', { id: subscriptionId, immediately });
    return subscription;
  } catch (error: any) {
    logger.error('Cancel subscription error:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
}

export async function updateSubscription(
  subscriptionId: string,
  params: { priceId?: string; cancelAtPeriodEnd?: boolean }
): Promise<Stripe.Subscription> {
  try {
    const updateParams: Stripe.SubscriptionUpdateParams = {};
    
    if (params.priceId) {
      updateParams.items = [{
        id: 'item_mock',
        price: params.priceId,
      }];
    }

    if (params.cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = params.cancelAtPeriodEnd;
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, updateParams);
    logger.info('Subscription updated', { id: subscriptionId });
    return subscription;
  } catch (error: any) {
    logger.error('Update subscription error:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    logger.warn('Stripe webhook secret not configured - skipping signature verification');
    // In development, allow webhooks without verification
    if (process.env.NODE_ENV === 'development') {
      return JSON.parse(payload.toString()) as Stripe.Event;
    }
    throw new Error('Stripe webhook secret not configured');
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}

export function verifyPaystackWebhookSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    logger.warn('Paystack webhook secret not configured');
    return true; // Allow in development
  }
  
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha512', webhookSecret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
