import { useState, useEffect } from 'react';
import { auth, firestore } from '../../firebase/firebaseConfig';
import { UserRole } from '../auth/roles';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface UserRoleState {
  role: UserRole;
  isLoading: boolean;
  error: string | null;
  cityId: string | null;
  onboardingStep: string | null;
}

/**
 * Hook to get and manage the current user's role
 * @returns The current user's role information, loading state, and error if any
 */
export const useUserRole = (): UserRoleState => {
  const [state, setState] = useState<UserRoleState>({
    role: UserRole.GUEST, // Default role is guest
    isLoading: true,
    error: null,
    cityId: null,
    onboardingStep: null
  });

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        // User is not authenticated, set role to guest
        setState({
          role: UserRole.GUEST,
          isLoading: false,
          error: null,
          cityId: null,
          onboardingStep: null
        });
        return;
      }

      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setState({
            role: userData.role || UserRole.PARENT, // Default to parent if role is not specified
            isLoading: false,
            error: null,
            cityId: userData.cityId || 'berlin', // Default to Berlin if cityId is not specified
            onboardingStep: userData.onboardingStep || null
          });
        } else {
          // User document doesn't exist, set default role
          setState({
            role: UserRole.PARENT,
            isLoading: false,
            error: null,
            cityId: 'berlin', // Default to Berlin
            onboardingStep: 'pick_language' // First onboarding step
          });
        }
      } catch (error) {
        setState({
          role: UserRole.GUEST,
          isLoading: false,
          error: `Error fetching user role: ${error instanceof Error ? error.message : String(error)}`,
          cityId: null,
          onboardingStep: null
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return state;
};

export default useUserRole;
