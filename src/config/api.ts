// API Configuration
// Update this to your production server URL when deploying
const isProd = import.meta.env.PROD;
const isDev = import.meta.env.DEV;

export const API_URL = isProd 
  ? '' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const getApiUrl = (path: string) => {
  if (API_URL) {
    return `${API_URL}${path}`;
  }
  return path;
};

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51T5TpVEPAQKb2xdh9mGnFrkFGBjOEx35NuiHGmtxdWorfG78VQnuI42TpWlVd0Han0WghsDNvbee8si2ytjA3HE700BOjt48PT';

export const getAccessHeaders = (params?: { userId?: string; membershipTier?: string }) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params?.userId) headers['X-User-Id'] = params.userId;
  if (params?.membershipTier) headers['X-Membership-Tier'] = params.membershipTier;
  return headers;
};

export default {
  API_URL,
  getApiUrl,
  STRIPE_PUBLISHABLE_KEY,
  getAccessHeaders,
};
