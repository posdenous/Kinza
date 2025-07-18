/**
 * Authentication Context
 * 
 * Provides authentication state and functions to components throughout the app
 * Enforces role-based access control and authentication requirements
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useFirestoreInstance } from '../hooks/useFirestoreInstance';
import { useCity } from './CityContext';

export type UserRole = 'guest' | 'parent' | 'organiser' | 'admin';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: UserRole;
  cityId: string;
  createdAt: any; // Firestore timestamp
  lastLoginAt: any; // Firestore timestamp
  isActive: boolean;
  consentGiven: boolean;
  childProfiles?: any[]; // Array of child profile references
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: UserRole;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserConsent: (consentGiven: boolean) => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userRole: 'guest',
  isLoading: true,
  error: null,
  signIn: async () => { throw new Error('Not implemented'); },
  signUp: async () => { throw new Error('Not implemented'); },
  signOut: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); },
  updateUserProfile: async () => { throw new Error('Not implemented'); },
  updateUserPassword: async () => { throw new Error('Not implemented'); },
  updateUserConsent: async () => { throw new Error('Not implemented'); },
  hasPermission: () => false,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides it to the app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const auth = useFirebaseAuth();
  const [firestore] = useFirestoreInstance();
  const { currentCityId } = useCity();
  
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Role hierarchy for permission checks
  const roleHierarchy: Record<UserRole, number> = {
    'guest': 0,
    'parent': 1,
    'organiser': 2,
    'admin': 3
  };

  /**
   * Check if the current user has the required role or higher
   */
  const hasPermission = (requiredRole: UserRole): boolean => {
    const currentRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return currentRoleLevel >= requiredRoleLevel;
  };

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = async (uid: string): Promise<void> => {
    if (!firestore) return;
    
    try {
      const profileRef = doc(firestore, 'profiles', uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as UserProfile;
        setUserProfile(profileData);
        setUserRole(profileData.role);
      } else {
        // Profile doesn't exist yet, create a default one
        setUserRole('guest');
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  /**
   * Update the last login timestamp
   */
  const updateLastLogin = async (uid: string): Promise<void> => {
    if (!firestore) return;
    
    try {
      const profileRef = doc(firestore, 'profiles', uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        await updateDoc(profileRef, {
          lastLoginAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error updating last login:', err);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<User> => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      await updateLastLogin(result.user.uid);
      
      return result.user;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
    if (!auth || !firestore || !currentCityId) {
      throw new Error('Firebase services not initialized or city not selected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the user account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(result.user, { displayName });
      
      // Create a user profile in Firestore
      const profileRef = doc(firestore, 'profiles', result.user.uid);
      await setDoc(profileRef, {
        uid: result.user.uid,
        displayName,
        email,
        photoURL: null,
        role: 'parent', // Default role for new users
        cityId: currentCityId, // City scoping rule
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isActive: true,
        consentGiven: false, // Consent required rule
      });
      
      return result.user;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      setUserRole('guest');
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!firestore || !user) {
      throw new Error('Firebase Firestore not initialized or user not logged in');
    }
    
    try {
      const profileRef = doc(firestore, 'profiles', user.uid);
      await updateDoc(profileRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...data,
        });
      }
      
      // Update display name in Firebase Auth if provided
      if (data.displayName && user.displayName !== data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }
      
      // Update photo URL in Firebase Auth if provided
      if (data.photoURL && user.photoURL !== data.photoURL) {
        await updateProfile(user, { photoURL: data.photoURL });
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  /**
   * Update user password
   */
  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!auth || !user || !user.email) {
      throw new Error('Firebase Auth not initialized or user not logged in');
    }
    
    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update the password
      await updateProfile(user, { password: newPassword });
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  /**
   * Update user consent
   */
  const updateUserConsent = async (consentGiven: boolean): Promise<void> => {
    if (!firestore || !user) {
      throw new Error('Firebase Firestore not initialized or user not logged in');
    }
    
    try {
      const profileRef = doc(firestore, 'profiles', user.uid);
      await updateDoc(profileRef, {
        consentGiven,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          consentGiven,
        });
      }
    } catch (err) {
      console.error('Error updating user consent:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setIsLoading(true);
      
      if (authUser) {
        setUser(authUser);
        await fetchUserProfile(authUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
        setUserRole('guest');
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth, firestore]);

  // Context value
  const value: AuthContextType = {
    user,
    userProfile,
    userRole,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    updateUserConsent,
    hasPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
