import { useAuth, User, AuthState } from '../useAuth';
import { UserRole } from '../../auth/roles';

// Mock React hooks for testing
const mockSetState = jest.fn();
const mockUseState = jest.fn();
const mockUseEffect = jest.fn();

jest.mock('react', () => ({
  useState: (initial: any) => [initial, mockSetState],
  useEffect: (fn: Function, deps?: any[]) => mockUseEffect(fn, deps),
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null user and loading false', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBeNull();
      expect(result.current.userRole).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
    });

    it('should have correct AuthState interface structure', () => {
      const { result } = renderHook(() => useAuth());
      const authState: AuthState = result.current;
      
      expect(authState).toHaveProperty('user');
      expect(authState).toHaveProperty('userRole');
      expect(authState).toHaveProperty('loading');
      expect(authState).toHaveProperty('signIn');
      expect(authState).toHaveProperty('signOut');
      expect(authState).toHaveProperty('signUp');
    });
  });

  describe('Sign In Functionality', () => {
    it('should handle successful sign in', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(result.current.user).toEqual({
        id: 'mock-user-id',
        email: 'test@example.com',
        displayName: 'Mock User',
        cityId: 'berlin'
      });
      expect(result.current.userRole).toBe(UserRole.PARENT);
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during sign in', async () => {
      const { result } = renderHook(() => useAuth());
      
      let loadingDuringSignIn = false;
      
      await act(async () => {
        const signInPromise = result.current.signIn('test@example.com', 'password123');
        loadingDuringSignIn = result.current.loading;
        await signInPromise;
      });
      
      expect(loadingDuringSignIn).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it('should handle sign in with different email formats', async () => {
      const { result } = renderHook(() => useAuth());
      
      const testEmails = [
        'user@domain.com',
        'test.email+tag@example.org',
        'user123@test-domain.co.uk'
      ];
      
      for (const email of testEmails) {
        await act(async () => {
          await result.current.signIn(email, 'password123');
        });
        
        expect(result.current.user?.email).toBe(email);
      }
    });

    it('should maintain consistent user data structure', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      const user: User = result.current.user!;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('displayName');
      expect(user).toHaveProperty('cityId');
      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
    });
  });

  describe('Sign Out Functionality', () => {
    it('should handle successful sign out', async () => {
      const { result } = renderHook(() => useAuth());
      
      // First sign in
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(result.current.user).not.toBeNull();
      
      // Then sign out
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.userRole).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during sign out', async () => {
      const { result } = renderHook(() => useAuth());
      
      // First sign in
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      let loadingDuringSignOut = false;
      
      await act(async () => {
        const signOutPromise = result.current.signOut();
        loadingDuringSignOut = result.current.loading;
        await signOutPromise;
      });
      
      expect(loadingDuringSignOut).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it('should handle sign out when already signed out', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Ensure we start signed out
      expect(result.current.user).toBeNull();
      
      // Attempt sign out
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.userRole).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Sign Up Functionality', () => {
    it('should handle successful sign up with minimal data', async () => {
      const { result } = renderHook(() => useAuth());
      
      const userData = {
        displayName: 'New User',
        cityId: 'berlin'
      };
      
      await act(async () => {
        await result.current.signUp('newuser@example.com', 'password123', userData);
      });
      
      expect(result.current.user).toEqual({
        id: 'mock-new-user-id',
        email: 'newuser@example.com',
        displayName: 'New User',
        cityId: 'berlin'
      });
      expect(result.current.userRole).toBe(UserRole.PARENT);
      expect(result.current.loading).toBe(false);
    });

    it('should handle sign up with custom role', async () => {
      const { result } = renderHook(() => useAuth());
      
      const userData = {
        displayName: 'Organiser User',
        cityId: 'berlin',
        role: UserRole.ORGANISER
      };
      
      await act(async () => {
        await result.current.signUp('organiser@example.com', 'password123', userData);
      });
      
      expect(result.current.userRole).toBe(UserRole.ORGANISER);
    });

    it('should use default values for missing userData', async () => {
      const { result } = renderHook(() => useAuth());
      
      const userData = {}; // Empty user data
      
      await act(async () => {
        await result.current.signUp('minimal@example.com', 'password123', userData);
      });
      
      expect(result.current.user?.displayName).toBe('New User');
      expect(result.current.user?.cityId).toBe('berlin');
      expect(result.current.userRole).toBe(UserRole.PARENT);
    });

    it('should set loading state during sign up', async () => {
      const { result } = renderHook(() => useAuth());
      
      let loadingDuringSignUp = false;
      
      await act(async () => {
        const signUpPromise = result.current.signUp('test@example.com', 'password123', {});
        loadingDuringSignUp = result.current.loading;
        await signUpPromise;
      });
      
      expect(loadingDuringSignUp).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should maintain state consistency across operations', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Initial state
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
      
      // Sign up
      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', { role: UserRole.ADMIN });
      });
      
      expect(result.current.user).not.toBeNull();
      expect(result.current.userRole).toBe(UserRole.ADMIN);
      
      // Sign out
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.userRole).toBeNull();
      
      // Sign in
      await act(async () => {
        await result.current.signIn('different@example.com', 'password123');
      });
      
      expect(result.current.user?.email).toBe('different@example.com');
      expect(result.current.userRole).toBe(UserRole.PARENT);
    });

    it('should handle rapid state changes', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Perform multiple operations quickly
      await act(async () => {
        await result.current.signIn('user1@example.com', 'password123');
      });
      
      await act(async () => {
        await result.current.signOut();
      });
      
      await act(async () => {
        await result.current.signUp('user2@example.com', 'password123', { role: UserRole.ORGANISER });
      });
      
      // Final state should be consistent
      expect(result.current.user?.email).toBe('user2@example.com');
      expect(result.current.userRole).toBe(UserRole.ORGANISER);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty email and password', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn('', '');
      });
      
      // Should still create a mock user (since this is a mock implementation)
      expect(result.current.user?.email).toBe('');
      expect(result.current.loading).toBe(false);
    });

    it('should handle null/undefined userData in signUp', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', null as any);
      });
      
      // Should use default values
      expect(result.current.user?.displayName).toBe('New User');
      expect(result.current.user?.cityId).toBe('berlin');
    });

    it('should maintain loading state consistency on errors', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Even if operations complete successfully, loading should be false
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(result.current.loading).toBe(false);
      
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Business Rules Compliance', () => {
    it('should assign berlin as default cityId', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(result.current.user?.cityId).toBe('berlin');
    });

    it('should assign PARENT as default role', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(result.current.userRole).toBe(UserRole.PARENT);
    });

    it('should respect custom cityId in userData', async () => {
      const { result } = renderHook(() => useAuth());
      
      const userData = {
        displayName: 'Test User',
        cityId: 'munich'
      };
      
      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', userData);
      });
      
      expect(result.current.user?.cityId).toBe('munich');
    });

    it('should support all valid user roles', async () => {
      const { result } = renderHook(() => useAuth());
      
      const roles = [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.GUEST, UserRole.PARTNER];
      
      for (const role of roles) {
        await act(async () => {
          await result.current.signUp(`${role}@example.com`, 'password123', { role });
        });
        
        expect(result.current.userRole).toBe(role);
        
        await act(async () => {
          await result.current.signOut();
        });
      }
    });
  });
});
