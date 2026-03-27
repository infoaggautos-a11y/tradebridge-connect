export const companyConfig = {
  name: 'Interconsult DI Okorokwo Nkiruka',
  businessType: 'Sole Proprietor',
  registrationNumber: '',
  address: 'Nigeria',
  email: 'info@floodgateautomation.com',
  
  adminEmails: [
    'floodgatesautomation@gmail.com',
    'admin@diltradebridge.com',
    'info@floodgateautomation.com',
  ],
  
  bank: {
    name: 'Revolut Bank UAB',
    iban: 'LT39 3250 0376 9399 5279',
    swift: 'REVOLT21',
    correspondentSwift: 'CHASDEFX',
    address: 'Konstitucijos ave. 21B, 08130, Vilnius, Lithuania',
    accountType: 'Sole Proprietor',
  },

  platform: {
    name: 'DIL Trade Bridge',
    url: 'https://diltradebridge.com',
    supportEmail: 'support@diltradebridge.com',
  },

  stripe: {
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
  },

  paystack: {
    secretKey: '',
    publicKey: '',
    webhookSecret: '',
  },

  commission: {
    standard: 0.025,
    premium: 0.02,
    enterprise: 0.015,
  },

  escrow: {
    releaseDays: 1,
    disputeDays: 7,
  },
};

export const getCompanyBankDetails = () => ({
  bankName: companyConfig.bank.name,
  iban: companyConfig.bank.iban,
  swift: companyConfig.bank.swift,
  correspondentSwift: companyConfig.bank.correspondentSwift,
  accountName: companyConfig.name,
  accountType: companyConfig.bank.accountType,
  reference: `DIL-${Date.now().toString(36).toUpperCase()}`,
});
