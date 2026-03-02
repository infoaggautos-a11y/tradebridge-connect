import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { MembershipTier } from '@/data/mockData';

export type UserRole = 'member' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  membershipTier: MembershipTier;
  matchViewsUsed: number;
  registeredEvents: string[];
  subscribed: boolean;
  subscriptionEnd?: string;
  productId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ADMIN_EMAILS = ['admin@dil.com', 'admin@diltradebridge.com'];

function mapSupabaseUser(supaUser: SupabaseUser, profile?: any, subData?: any): User {
  const email = supaUser.email || '';
  const role: UserRole = ADMIN_EMAILS.includes(email) ? 'admin' : 'member';
  const tier = (profile?.membership_tier || 'free') as MembershipTier;

  return {
    id: supaUser.id,
    name: profile?.name || supaUser.user_metadata?.name || email.split('@')[0],
    email,
    role,
    membershipTier: tier,
    matchViewsUsed: 0,
    registeredEvents: [],
    subscribed: subData?.subscribed || false,
    subscriptionEnd: subData?.subscription_end,
    productId: subData?.product_id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async (session: Session | null) => {
    if (!session) return null;
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) {
        console.error('Subscription check error:', error);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
  };

  const loadUser = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const [profile, subData] = await Promise.all([
      fetchProfile(session.user.id),
      checkSubscription(session),
    ]);
    setUser(mapSupabaseUser(session.user, profile, subData));
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-refresh subscription every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const subData = await checkSubscription(session);
        if (subData) {
          setUser(prev => prev ? { ...prev, subscribed: subData.subscribed, subscriptionEnd: subData.subscription_end, productId: subData.product_id, membershipTier: subData.subscribed ? (prev.membershipTier === 'free' ? 'starter' : prev.membershipTier) : 'free' } : null);
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const refreshSubscription = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const [profile, subData] = await Promise.all([
        fetchProfile(session.user.id),
        checkSubscription(session),
      ]);
      setUser(mapSupabaseUser(session.user, profile, subData));
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      loading,
      refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
