import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, MembershipTier } from '@/data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  membershipTier: MembershipTier;
  matchViewsUsed: number;
  registeredEvents: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const mockUsers: Record<string, User> = {
  'member@dil.com': {
    id: 'u1', name: 'Chidi Okonkwo', email: 'member@dil.com', role: 'member',
    businessId: 'b1', membershipTier: 'growth', matchViewsUsed: 1, registeredEvents: ['e1'],
  },
  'admin@dil.com': {
    id: 'u2', name: 'Sarah Admin', email: 'admin@dil.com', role: 'admin',
    membershipTier: 'enterprise', matchViewsUsed: 0, registeredEvents: [],
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: UserRole): boolean => {
    const mockUser = mockUsers[email];
    if (mockUser) {
      setUser(mockUser);
      return true;
    }
    // Allow any email with role selection for demo
    setUser({
      id: 'u-demo', name: email.split('@')[0], email, role,
      membershipTier: 'free', matchViewsUsed: 0, registeredEvents: [],
    });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
