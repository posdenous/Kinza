import { useState, useEffect } from 'react';
import { UserRole } from '../auth/roles';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  cityId?: string;
}

export interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    // In a real app, this would check Firebase auth state
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock sign in logic
      const mockUser: User = {
        id: 'mock-user-id',
        email,
        displayName: 'Mock User',
        cityId: 'berlin'
      };
      setUser(mockUser);
      setUserRole(UserRole.PARENT);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      // Mock sign up logic
      const mockUser: User = {
        id: 'mock-new-user-id',
        email,
        displayName: userData.displayName || 'New User',
        cityId: userData.cityId || 'berlin'
      };
      setUser(mockUser);
      setUserRole(userData.role || UserRole.PARENT);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    userRole,
    loading,
    signIn,
    signOut,
    signUp
  };
};
