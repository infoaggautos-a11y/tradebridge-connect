import { formatCurrency } from '@/types/payment';
import { Subscription } from '@/types/subscription';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationType = 
  | 'payment_received'
  | 'payment_failed'
  | 'subscription_created'
  | 'subscription_renewed'
  | 'subscription_expiring'
  | 'subscription_canceled'
  | 'escrow_funded'
  | 'escrow_released'
  | 'escrow_disputed'
  | 'payout_initiated'
  | 'payout_completed'
  | 'payout_failed'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'kyc_expiring'
  | 'deal_created'
  | 'deal_completed'
  | 'document_uploaded'
  | 'message_received'
  | 'event_reminder'
  | 'ticket_purchased';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  metadata?: Record<string, any>;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  notifyOnPayment: boolean;
  notifyOnSubscription: boolean;
  notifyOnDeal: boolean;
  notifyOnEscrow: boolean;
  notifyOnKyc: boolean;
  marketingEmails: boolean;
}

export interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    userId: 'user_001',
    type: 'escrow_funded',
    title: 'Escrow Funded',
    message: 'Your escrow deposit of $15,000 has been received and secured.',
    channel: 'email',
    status: 'delivered',
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'notif_002',
    userId: 'user_001',
    type: 'subscription_renewed',
    title: 'Subscription Renewed',
    message: 'Your Growth plan subscription has been renewed successfully.',
    channel: 'email',
    status: 'delivered',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

const EMAIL_TEMPLATES: Record<NotificationType, EmailTemplate> = {
  payment_received: {
    id: 'tpl_payment_received',
    name: 'Payment Received',
    subject: 'Payment Received - {{amount}}',
    body: `
      <h1>Payment Received</h1>
      <p>Hello {{userName}},</p>
      <p>We have received your payment of <strong>{{amount}}</strong>.</p>
      <p>Reference: {{reference}}</p>
      <p>Thank you for using DIL Trade Bridge!</p>
    `,
    variables: ['userName', 'amount', 'reference'],
  },
  payment_failed: {
    id: 'tpl_payment_failed',
    name: 'Payment Failed',
    subject: 'Payment Failed - Action Required',
    body: `
      <h1>Payment Failed</h1>
      <p>Hello {{userName}},</p>
      <p>Your payment of <strong>{{amount}}</strong> has failed.</p>
      <p>Reason: {{reason}}</p>
      <p>Please update your payment method to continue using our services.</p>
      <p><a href="{{updatePaymentUrl}}">Update Payment Method</a></p>
    `,
    variables: ['userName', 'amount', 'reason', 'updatePaymentUrl'],
  },
  subscription_created: {
    id: 'tpl_subscription_created',
    name: 'Subscription Created',
    subject: 'Welcome to {{planName}}!',
    body: `
      <h1>Welcome to {{planName}}!</h1>
      <p>Hello {{userName}},</p>
      <p>Your subscription to the <strong>{{planName}}</strong> plan has been activated.</p>
      <p>Amount: {{amount}}/{{billingInterval}}</p>
      <p>Next billing date: {{nextBillingDate}}</p>
    `,
    variables: ['userName', 'planName', 'amount', 'billingInterval', 'nextBillingDate'],
  },
  subscription_renewed: {
    id: 'tpl_subscription_renewed',
    name: 'Subscription Renewed',
    subject: 'Subscription Renewed - {{planName}}',
    body: `
      <h1>Subscription Renewed</h1>
      <p>Hello {{userName}},</p>
      <p>Your <strong>{{planName}}</strong> subscription has been automatically renewed.</p>
      <p>Amount charged: {{amount}}</p>
      <p>Next renewal: {{nextRenewalDate}}</p>
    `,
    variables: ['userName', 'planName', 'amount', 'nextRenewalDate'],
  },
  subscription_expiring: {
    id: 'tpl_subscription_expiring',
    name: 'Subscription Expiring',
    subject: 'Subscription Expiring Soon',
    body: `
      <h1>Subscription Expiring</h1>
      <p>Hello {{userName}},</p>
      <p>Your <strong>{{planName}}</strong> subscription will expire on <strong>{{expiryDate}}</strong>.</p>
      <p>To avoid service interruption, please ensure your payment method is up to date.</p>
    `,
    variables: ['userName', 'planName', 'expiryDate'],
  },
  subscription_canceled: {
    id: 'tpl_subscription_canceled',
    name: 'Subscription Canceled',
    subject: 'Subscription Canceled',
    body: `
      <h1>Subscription Canceled</h1>
      <p>Hello {{userName}},</p>
      <p>Your subscription has been canceled as requested.</p>
      <p>Your access will continue until <strong>{{accessEndDate}}</strong>.</p>
      <p>We hope to see you again soon!</p>
    `,
    variables: ['userName', 'accessEndDate'],
  },
  escrow_funded: {
    id: 'tpl_escrow_funded',
    name: 'Escrow Funded',
    subject: 'Escrow Funds Secured - {{amount}}',
    body: `
      <h1>Escrow Funds Secured</h1>
      <p>Hello {{userName}},</p>
      <p>Funds of <strong>{{amount}}</strong> have been deposited into escrow for deal <strong>{{dealName}}</strong>.</p>
      <p>Reference: {{escrowReference}}</p>
      <p>The seller has been notified and will proceed with fulfilling the deal.</p>
    `,
    variables: ['userName', 'amount', 'dealName', 'escrowReference'],
  },
  escrow_released: {
    id: 'tpl_escrow_released',
    name: 'Escrow Released',
    subject: 'Funds Released - {{amount}}',
    body: `
      <h1>Funds Released</h1>
      <p>Hello {{userName}},</p>
      <p>Funds of <strong>{{amount}}</strong> have been released from escrow for deal <strong>{{dealName}}</strong>.</p>
      <p>Commission deducted: {{commission}}</p>
      <p>Net amount received: {{netAmount}}</p>
    `,
    variables: ['userName', 'amount', 'dealName', 'commission', 'netAmount'],
  },
  escrow_disputed: {
    id: 'tpl_escrow_disputed',
    name: 'Escrow Disputed',
    subject: 'Deal Dispute Opened - {{dealName}}',
    body: `
      <h1>Deal Dispute Opened</h1>
      <p>Hello {{userName}},</p>
      <p>A dispute has been opened for deal <strong>{{dealName}}</strong>.</p>
      <p>Reason: {{reason}}</p>
      <p>Our team will review the case and contact you within 48 hours.</p>
    `,
    variables: ['userName', 'dealName', 'reason'],
  },
  payout_initiated: {
    id: 'tpl_payout_initiated',
    name: 'Payout Initiated',
    subject: 'Payout Initiated - {{amount}}',
    body: `
      <h1>Payout Initiated</h1>
      <p>Hello {{userName}},</p>
      <p>A payout of <strong>{{amount}}</strong> has been initiated to your bank account.</p>
      <p>Reference: {{payoutReference}}</p>
      <p>Expected arrival: {{arrivalDate}}</p>
    `,
    variables: ['userName', 'amount', 'payoutReference', 'arrivalDate'],
  },
  payout_completed: {
    id: 'tpl_payout_completed',
    name: 'Payout Completed',
    subject: 'Payout Completed - {{amount}}',
    body: `
      <h1>Payout Completed</h1>
      <p>Hello {{userName}},</p>
      <p>Your payout of <strong>{{amount}}</strong> has been completed successfully.</p>
      <p>Reference: {{payoutReference}}</p>
    `,
    variables: ['userName', 'amount', 'payoutReference'],
  },
  payout_failed: {
    id: 'tpl_payout_failed',
    name: 'Payout Failed',
    subject: 'Payout Failed - Action Required',
    body: `
      <h1>Payout Failed</h1>
      <p>Hello {{userName}},</p>
      <p>Your payout of <strong>{{amount}}</strong> has failed.</p>
      <p>Reason: {{reason}}</p>
      <p>Please update your bank account details to resolve this issue.</p>
      <p><a href="{{updateBankUrl}}">Update Bank Account</a></p>
    `,
    variables: ['userName', 'amount', 'reason', 'updateBankUrl'],
  },
  kyc_approved: {
    id: 'tpl_kyc_approved',
    name: 'KYC Approved',
    subject: 'Verification Approved',
    body: `
      <h1>Verification Approved</h1>
      <p>Hello {{userName}},</p>
      <p>Congratulations! Your identity verification has been approved.</p>
      <p>You now have full access to all platform features including escrow and payouts.</p>
    `,
    variables: ['userName'],
  },
  kyc_rejected: {
    id: 'tpl_kyc_rejected',
    name: 'KYC Rejected',
    subject: 'Verification Not Approved',
    body: `
      <h1>Verification Not Approved</h1>
      <p>Hello {{userName}},</p>
      <p>Unfortunately, your identity verification could not be approved.</p>
      <p>Reason: {{reason}}</p>
      <p>Please resubmit your documents with the correct information.</p>
    `,
    variables: ['userName', 'reason'],
  },
  kyc_expiring: {
    id: 'tpl_kyc_expiring',
    name: 'KYC Expiring',
    subject: 'Verification Expiring Soon',
    body: `
      <h1>Verification Expiring</h1>
      <p>Hello {{userName}},</p>
      <p>Your identity verification will expire on <strong>{{expiryDate}}</strong>.</p>
      <p>Please renew your verification to continue using escrow and payout features.</p>
    `,
    variables: ['userName', 'expiryDate'],
  },
  deal_created: {
    id: 'tpl_deal_created',
    name: 'Deal Created',
    subject: 'New Deal Created - {{dealName}}',
    body: `
      <h1>New Deal Created</h1>
      <p>Hello {{userName}},</p>
      <p>A new deal <strong>{{dealName}}</strong> has been created.</p>
      <p>Value: {{dealAmount}}</p>
      <p>Counterparty: {{counterpartyName}}</p>
    `,
    variables: ['userName', 'dealName', 'dealAmount', 'counterpartyName'],
  },
  deal_completed: {
    id: 'tpl_deal_completed',
    name: 'Deal Completed',
    subject: 'Deal Completed - {{dealName}}',
    body: `
      <h1>Deal Completed</h1>
      <p>Hello {{userName}},</p>
      <p>Congratulations! The deal <strong>{{dealName}}</strong> has been completed successfully.</p>
      <p>Thank you for using DIL Trade Bridge!</p>
    `,
    variables: ['userName', 'dealName'],
  },
  document_uploaded: {
    id: 'tpl_document_uploaded',
    name: 'Document Uploaded',
    subject: 'Document Uploaded - {{documentName}}',
    body: `
      <h1>Document Uploaded</h1>
      <p>Hello {{userName}},</p>
      <p>A new document <strong>{{documentName}}</strong> has been uploaded for deal <strong>{{dealName}}</strong>.</p>
    `,
    variables: ['userName', 'documentName', 'dealName'],
  },
  message_received: {
    id: 'tpl_message_received',
    name: 'Message Received',
    subject: 'New Message from {{senderName}}',
    body: `
      <h1>New Message</h1>
      <p>Hello {{userName}},</p>
      <p>You have a new message from <strong>{{senderName}}</strong>.</p>
      <p>{{messagePreview}}</p>
      <p><a href="{{messageUrl}}">View Message</a></p>
    `,
    variables: ['userName', 'senderName', 'messagePreview', 'messageUrl'],
  },
  event_reminder: {
    id: 'tpl_event_reminder',
    name: 'Event Reminder',
    subject: 'Reminder: {{eventName}}',
    body: `
      <h1>Event Reminder</h1>
      <p>Hello {{userName}},</p>
      <p>This is a reminder that <strong>{{eventName}}</strong> starts on <strong>{{eventDate}}</strong>.</p>
      <p><a href="{{eventUrl}}">View Event Details</a></p>
    `,
    variables: ['userName', 'eventName', 'eventDate', 'eventUrl'],
  },
  ticket_purchased: {
    id: 'tpl_ticket_purchased',
    name: 'Ticket Purchased',
    subject: 'Ticket Confirmed - {{eventName}}',
    body: `
      <h1>Ticket Confirmed</h1>
      <p>Hello {{userName}},</p>
      <p>Your ticket for <strong>{{eventName}}</strong> has been confirmed!</p>
      <p>Ticket Type: {{ticketType}}</p>
      <p>Ticket Reference: {{ticketReference}}</p>
      <p><a href="{{ticketUrl}}">Download Ticket</a></p>
    `,
    variables: ['userName', 'eventName', 'ticketType', 'ticketReference', 'ticketUrl'],
  },
};

class NotificationService {
  private emailProvider: 'sendgrid' | 'ses' | 'postmark' | null = null;
  private smsProvider: 'twilio' | 'nexmo' | null = null;
  private pushProvider: 'firebase' | null = null;

  initialize(config: {
    email?: 'sendgrid' | 'ses' | 'postmark';
    sms?: 'twilio' | 'nexmo';
    push?: 'firebase';
  }): void {
    if (config.email) this.emailProvider = config.email;
    if (config.sms) this.smsProvider = config.sms;
    if (config.push) this.pushProvider = config.push;
  }

  async sendNotification(params: SendNotificationParams): Promise<Notification> {
    const { userId, type, title, message, channel = 'email', metadata } = params;

    const notification: Notification = {
      id: generateId(),
      userId,
      type,
      title,
      message,
      channel,
      status: 'pending',
      metadata,
      createdAt: new Date().toISOString(),
    };

    let success = false;

    switch (channel) {
      case 'email':
        success = await this.sendEmail(userId, title, message, type, metadata);
        break;
      case 'sms':
        success = await this.sendSms(userId, message);
        break;
      case 'push':
        success = await this.sendPush(userId, title, message, metadata);
        break;
      case 'in_app':
        success = true;
        mockNotifications.push(notification);
        break;
    }

    notification.status = success ? 'sent' : 'failed';
    return notification;
  }

  private async sendEmail(
    userId: string,
    subject: string,
    body: string,
    type: NotificationType,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const template = EMAIL_TEMPLATES[type];
    
    if (!this.emailProvider) {
      console.log('Email simulation:', { userId, subject, template });
      return true;
    }

    try {
      const response = await fetch('/api/notifications/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          templateId: template?.id,
          subject,
          body,
          variables: metadata,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  private async sendSms(userId: string, message: string): Promise<boolean> {
    if (!this.smsProvider) {
      console.log('SMS simulation:', { userId, message });
      return true;
    }

    try {
      const response = await fetch('/api/notifications/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message }),
      });

      return response.ok;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  private async sendPush(
    userId: string,
    title: string,
    body: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    if (!this.pushProvider) {
      console.log('Push simulation:', { userId, title, body });
      return true;
    }

    try {
      const response = await fetch('/api/notifications/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, body, data: metadata }),
      });

      return response.ok;
    } catch (error) {
      console.error('Push send error:', error);
      return false;
    }
  }

  async sendPaymentReceivedNotification(userId: string, amount: number, currency: string, reference: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'payment_received',
      title: 'Payment Received',
      message: `Your payment of ${formatCurrency(amount, currency)} has been received. Reference: ${reference}`,
      metadata: { amount, currency, reference },
    });
  }

  async sendPaymentFailedNotification(userId: string, subscription?: Subscription): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your payment has failed. Please update your payment method to continue using our services.',
      metadata: { subscription },
    });
  }

  async sendSubscriptionCreatedNotification(userId: string, planName: string, amount: number): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'subscription_created',
      title: 'Subscription Activated',
      message: `Your ${planName} subscription (${formatCurrency(amount, 'USD')}/month) has been activated.`,
      metadata: { planName, amount },
    });
  }

  async sendSubscriptionRenewedNotification(userId: string, planName: string, amount: number, nextRenewalDate: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'subscription_renewed',
      title: 'Subscription Renewed',
      message: `Your ${planName} subscription has been renewed. Next renewal: ${nextRenewalDate}`,
      metadata: { planName, amount, nextRenewalDate },
    });
  }

  async sendSubscriptionExpiringNotification(userId: string, planName: string, expiryDate: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'subscription_expiring',
      title: 'Subscription Expiring',
      message: `Your ${planName} subscription will expire on ${expiryDate}.`,
      metadata: { planName, expiryDate },
    });
  }

  async sendEscrowFundedNotification(userId: string, amount: number, currency: string, dealName: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'escrow_funded',
      title: 'Escrow Funded',
      message: `Funds of ${formatCurrency(amount, currency)} have been secured in escrow for deal "${dealName}".`,
      metadata: { amount, currency, dealName },
    });
  }

  async sendEscrowReleasedNotification(userId: string, amount: number, currency: string, commission: number, dealName: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'escrow_released',
      title: 'Funds Released',
      message: `Funds of ${formatCurrency(amount - commission, currency)} have been released for deal "${dealName}". Commission: ${formatCurrency(commission, currency)}`,
      metadata: { amount, currency, commission, netAmount: amount - commission, dealName },
    });
  }

  async sendPayoutInitiatedNotification(userId: string, amount: number, currency: string, reference: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'payout_initiated',
      title: 'Payout Initiated',
      message: `A payout of ${formatCurrency(amount, currency)} has been initiated. Reference: ${reference}`,
      metadata: { amount, currency, reference },
    });
  }

  async sendPayoutCompletedNotification(userId: string, amount: number, currency: string, reference: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'payout_completed',
      title: 'Payout Completed',
      message: `Your payout of ${formatCurrency(amount, currency)} has been completed. Reference: ${reference}`,
      metadata: { amount, currency, reference },
    });
  }

  async sendKycApprovedNotification(userId: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'kyc_approved',
      title: 'Verification Approved',
      message: 'Congratulations! Your identity verification has been approved.',
    });
  }

  async sendKycRejectedNotification(userId: string, reason: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'kyc_rejected',
      title: 'Verification Not Approved',
      message: `Your verification was not approved. Reason: ${reason}`,
      metadata: { reason },
    });
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return mockNotifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.readAt = new Date().toISOString();
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    for (const notification of mockNotifications) {
      if (notification.userId === userId && !notification.readAt) {
        notification.readAt = new Date().toISOString();
      }
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return mockNotifications.filter(n => n.userId === userId && !n.readAt).length;
  }

  getTemplate(type: NotificationType): EmailTemplate | undefined {
    return EMAIL_TEMPLATES[type];
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return {
      userId,
      email: true,
      sms: false,
      push: true,
      inApp: true,
      notifyOnPayment: true,
      notifyOnSubscription: true,
      notifyOnDeal: true,
      notifyOnEscrow: true,
      notifyOnKyc: true,
      marketingEmails: false,
    };
  }

  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId);
    return { ...current, ...preferences };
  }
}

export const notificationService = new NotificationService();
