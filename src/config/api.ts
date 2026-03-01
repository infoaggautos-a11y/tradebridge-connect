// API Configuration
// Update this to your production server URL when deploying
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51T5TpVEPAQKb2xdh9mGnFrkFGBjOEx35NuiHGmtxdWorfG78VQnuI42TpWlVd0Han0WghsDNvbee8si2ytjA3HE700BOjt48PT';

export const getAccessHeaders = (params?: { userId?: string; membershipTier?: string }) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params?.userId) headers['X-User-Id'] = params.userId;
  if (params?.membershipTier) headers['X-Membership-Tier'] = params.membershipTier;
  return headers;
};

export default {
  API_URL,
  STRIPE_PUBLISHABLE_KEY,
  getAccessHeaders,
};
