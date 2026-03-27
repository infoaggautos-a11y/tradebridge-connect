export type EmailCategory = 'onboarding' | 'deal' | 'subscription' | 'admin' | 'invoice';

export type EmailTemplateType =
  // Invoice
  | 'invoice_sent'
  | 'invoice_paid'
  | 'invoice_overdue'
  | 'invoice_reminder'
  // Onboarding
  | 'welcome_email'
  | 'tier2_approved'
  | 'tier2_rejected'
  | 'tier3_approved'
  | 'abandoned_24h'
  | 'abandoned_72h'
  | 'abandoned_7d'
  // Deal & Payment
  | 'match_introduction'
  | 'match_accepted'
  | 'escrow_funded'
  | 'milestone_complete'
  | 'release_pending'
  | 'escrow_released'
  | 'payout_initiated'
  | 'payout_completed'
  | 'dispute_raised'
  | 'dispute_resolved'
  // Subscription
  | 'subscription_activated'
  | 'payment_receipt'
  | 'renewal_reminder'
  | 'payment_failed'
  | 'subscription_cancelled'
  // Admin
  | 'kyc_submitted'
  | 'kyc_sla_warning'
  | 'dispute_sla_warning'
  | 'large_escrow_alert';

export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  category: EmailCategory;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface EmailQueueItem {
  id: string;
  to: string;
  templateType: EmailTemplateType;
  variables: Record<string, string>;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  sentAt?: string;
  createdAt: string;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  pending: number;
  byCategory: Record<EmailCategory, number>;
}

export const emailTemplates: EmailTemplate[] = [
  // Invoice
  {
    id: 'et_inv_001',
    type: 'invoice_sent',
    category: 'invoice',
    subject: 'Invoice {{invoiceNumber}} from {{sellerName}}',
    body: `Dear {{buyerName}},

You have received a new invoice from {{sellerName}}.

Invoice Number: {{invoiceNumber}}
Amount Due: {{amount}} {{currency}}
Due Date: {{dueDate}}

{{#if dealTitle}}
Deal: {{dealTitle}}
{{/if}}

{{#if notes}}
Notes: {{notes}}
{{/if}}

View and pay your invoice: {{invoiceLink}}

Best regards,
{{sellerName}}`,
    variables: ['buyerName', 'sellerName', 'invoiceNumber', 'amount', 'currency', 'dueDate', 'dealTitle', 'notes', 'invoiceLink'],
    isActive: true,
  },
  {
    id: 'et_inv_002',
    type: 'invoice_paid',
    category: 'invoice',
    subject: 'Payment Received - Invoice {{invoiceNumber}}',
    body: `Dear {{sellerName}},

Great news! Payment has been received for invoice {{invoiceNumber}}.

Amount Paid: {{amount}} {{currency}}
Paid By: {{buyerName}}
Paid On: {{paidDate}}

{{#if dealTitle}}
Deal: {{dealTitle}}
{{/if}}

Transaction History: {{walletLink}}

Best regards,
DIL Trade Bridge`,
    variables: ['sellerName', 'buyerName', 'invoiceNumber', 'amount', 'currency', 'paidDate', 'dealTitle', 'walletLink'],
    isActive: true,
  },
  {
    id: 'et_inv_003',
    type: 'invoice_overdue',
    category: 'invoice',
    subject: 'Payment Overdue - Invoice {{invoiceNumber}}',
    body: `Dear {{buyerName}},

This is a friendly reminder that invoice {{invoiceNumber}} is now overdue.

Invoice Number: {{invoiceNumber}}
Original Due Date: {{dueDate}}
Amount Due: {{amount}} {{currency}}
Days Overdue: {{daysOverdue}}

Please arrange payment at your earliest convenience to avoid any additional fees.

View Invoice: {{invoiceLink}}

Best regards,
{{sellerName}}`,
    variables: ['buyerName', 'sellerName', 'invoiceNumber', 'amount', 'currency', 'dueDate', 'daysOverdue', 'invoiceLink'],
    isActive: true,
  },
  {
    id: 'et_inv_004',
    type: 'invoice_reminder',
    category: 'invoice',
    subject: 'Reminder: Invoice {{invoiceNumber}} Payment Due',
    body: `Dear {{buyerName}},

We wanted to follow up regarding invoice {{invoiceNumber}}.

Amount Due: {{amount}} {{currency}}
Due Date: {{dueDate}}

This is your {{reminderCount}} reminder. Please arrange payment to avoid any service interruptions.

View and Pay: {{invoiceLink}}

Best regards,
{{sellerName}}`,
    variables: ['buyerName', 'sellerName', 'invoiceNumber', 'amount', 'currency', 'dueDate', 'reminderCount', 'invoiceLink'],
    isActive: true,
  },
  // Onboarding
  {
    id: 'et_001',
    type: 'welcome_email',
    category: 'onboarding',
    subject: 'Welcome to DIL Trade Platform',
    body: `Dear {{name}},

Welcome to DIL (Direct International Trade) Platform!

Your business profile has been created successfully. Start exploring trade opportunities today.

Next steps:
1. Complete your business profile
2. Browse potential trade partners
3. Upgrade to Verified status for full access

Best regards,
DIL Team`,
    variables: ['name', 'businessName'],
    isActive: true,
  },
  {
    id: 'et_002',
    type: 'tier2_approved',
    category: 'onboarding',
    subject: 'Congratulations! Your Business Verification Approved',
    body: `Dear {{name}},

Great news! Your business verification has been approved.

You now have:
✓ Full matchmaking access
✓ Messaging with businesses
✓ Event registration
✓ Ability to purchase subscriptions

Complete Tier 3 (Trade Ready) to unlock escrow features.

Best regards,
DIL Team`,
    variables: ['name', 'businessName'],
    isActive: true,
  },
  {
    id: 'et_003',
    type: 'tier2_rejected',
    category: 'onboarding',
    subject: 'Action Required: Verification Documents',
    body: `Dear {{name}},

Unfortunately, your business verification could not be approved at this time.

Reason: {{rejectionReason}}

Please resubmit your documents with the correct information.

If you have questions, contact our support team.

Best regards,
DIL Team`,
    variables: ['name', 'businessName', 'rejectionReason'],
    isActive: true,
  },
  {
    id: 'et_004',
    type: 'abandoned_24h',
    category: 'onboarding',
    subject: "Don't miss out on trade opportunities",
    body: `Hi {{name}},

You started your verification but haven't completed it.

Complete your verification to:
- Get matched with verified trade partners
- Access the Deal Room
- Join our trade events

Continue where you left off: {{verificationLink}}

Best regards,
DIL Team`,
    variables: ['name', 'verificationLink'],
    isActive: true,
  },
  // Deal & Payment
  {
    id: 'et_005',
    type: 'match_introduction',
    category: 'deal',
    subject: 'New Trade Partner Introduction',
    body: `Dear {{name}},

You have a new match!

{{partnerName}} from {{partnerCountry}} has been matched with your business based on your trade preferences.

Match Score: {{matchScore}}%
Sector Alignment: {{sectorMatch}}%

View their profile and start a conversation: {{matchLink}}

Best regards,
DIL Team`,
    variables: ['name', 'partnerName', 'partnerCountry', 'matchScore', 'sectorMatch', 'matchLink'],
    isActive: true,
  },
  {
    id: 'et_006',
    type: 'escrow_funded',
    category: 'deal',
    subject: 'Escrow Funded - Deal {{dealNumber}}',
    body: `Dear {{name}},

Funds have been received in escrow for deal {{dealNumber}}.

Amount: {{amount}} {{currency}}
Buyer: {{buyerName}}

The seller has been notified to proceed with delivery.

Track this deal: {{dealLink}}

Best regards,
DIL Team`,
    variables: ['name', 'dealNumber', 'amount', 'currency', 'buyerName', 'dealLink'],
    isActive: true,
  },
  {
    id: 'et_007',
    type: 'escrow_released',
    category: 'deal',
    subject: 'Payment Released - Deal {{dealNumber}}',
    body: `Dear {{name}},

Great news! Payment has been released for deal {{dealNumber}}.

Amount Released: {{amount}} {{currency}}
Commission Deducted: {{commission}} {{currency}}

Your payout has been initiated and will arrive in 1-2 business days.

Transaction History: {{walletLink}}

Best regards,
DIL Team`,
    variables: ['name', 'dealNumber', 'amount', 'currency', 'commission', 'walletLink'],
    isActive: true,
  },
  {
    id: 'et_008',
    type: 'dispute_raised',
    category: 'deal',
    subject: 'Dispute Filed - Deal {{dealNumber}}',
    body: `Dear {{name}},

A dispute has been raised on deal {{dealNumber}}.

Category: {{category}}
Amount in Dispute: {{amount}} {{currency}}

Our dispute resolution team will contact both parties within 24 hours.

View Dispute Details: {{disputeLink}}

Best regards,
DIL Team`,
    variables: ['name', 'dealNumber', 'category', 'amount', 'currency', 'disputeLink'],
    isActive: true,
  },
  {
    id: 'et_009',
    type: 'payout_completed',
    category: 'deal',
    subject: 'Payout Completed - {{amount}}',
    body: `Dear {{name}},

Your withdrawal has been completed successfully.

Amount: {{amount}} {{currency}}
Bank: {{bankName}}
Account: {{accountNumber}}

The funds should arrive in your account within 1 business day.

Transaction History: {{walletLink}}

Best regards,
DIL Team`,
    variables: ['name', 'amount', 'currency', 'bankName', 'accountNumber', 'walletLink'],
    isActive: true,
  },
  // Subscription
  {
    id: 'et_010',
    type: 'subscription_activated',
    category: 'subscription',
    subject: 'Subscription Activated - {{plan}} Plan',
    body: `Dear {{name}},

Your {{plan}} subscription is now active!

You now have access to:
{{features}}

Manage your subscription: {{subscriptionLink}}

Best regards,
DIL Team`,
    variables: ['name', 'plan', 'features', 'subscriptionLink'],
    isActive: true,
  },
  {
    id: 'et_011',
    type: 'renewal_reminder',
    category: 'subscription',
    subject: 'Your Subscription Renews in {{days}} Days',
    body: `Dear {{name}},

Your {{plan}} subscription will automatically renew in {{days}} days.

Current Plan: {{plan}}
Renewal Amount: {{amount}}
Next Billing Date: {{renewalDate}}

To make changes: {{subscriptionLink}}

Best regards,
DIL Team`,
    variables: ['name', 'plan', 'days', 'amount', 'renewalDate', 'subscriptionLink'],
    isActive: true,
  },
  // Admin
  {
    id: 'et_012',
    type: 'kyc_submitted',
    category: 'admin',
    subject: '[ADMIN] New KYC Submission - {{businessName}}',
    body: `Admin Alert,

A new KYC application has been submitted.

Business: {{businessName}}
Country: {{country}}
Tier: {{targetTier}}

Review: {{adminLink}}

DIL Admin`,
    variables: ['businessName', 'country', 'targetTier', 'adminLink'],
    isActive: true,
  },
  {
    id: 'et_013',
    type: 'large_escrow_alert',
    category: 'admin',
    subject: '[ADMIN] Large Escrow Deposit - {{amount}}',
    body: `Admin Alert,

A large escrow deposit has been received.

Deal: {{dealNumber}}
Amount: {{amount}} {{currency}}
Buyer: {{buyerName}}

Monitor: {{adminLink}}

DIL Admin`,
    variables: ['dealNumber', 'amount', 'currency', 'buyerName', 'adminLink'],
    isActive: true,
  },
];

export const emailService = {
  getTemplates(): EmailTemplate[] {
    return emailTemplates;
  },

  getTemplateByType(type: EmailTemplateType): EmailTemplate | undefined {
    return emailTemplates.find(t => t.type === type);
  },

  getActiveTemplates(): EmailTemplate[] {
    return emailTemplates.filter(t => t.isActive);
  },

  getTemplatesByCategory(category: EmailCategory): EmailTemplate[] {
    return emailTemplates.filter(t => t.category === category);
  },

  renderTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string; body: string } {
    let subject = template.subject;
    let body = template.body;
    
    Object.entries(variables).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return { subject, body };
  },

  getStats(): EmailStats {
    return {
      totalSent: 12450,
      totalFailed: 45,
      pending: 12,
      byCategory: {
        onboarding: 3200,
        deal: 6800,
        subscription: 2100,
        admin: 350,
      },
    };
  },
};
