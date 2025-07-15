import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebaseConfig';
import { UserRole } from './roles';

/**
 * Interface for user registration data
 */
interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
  cityId?: string;
  language?: string;
}

/**
 * Interface for user login data
 */
interface LoginData {
  email: string;
  password: string;
}

/**
 * Service for handling authentication operations
 */
export const authService = {
  /**
   * Register a new user
   * @param data User registration data
   * @returns The created user
   */
  async register(data: RegisterData): Promise<User> {
    const { email, password, displayName, role = UserRole.PARENT, cityId = 'berlin', language = 'en' } = data;
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      email,
      displayName,
      role,
      cityId,
      language,
      onboardingStep: 'pick_language',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      consentGiven: false,
      savedEvents: []
    });
    
    return user;
  },
  
  /**
   * Log in an existing user
   * @param data User login data
   * @returns The logged in user
   */
  async login(data: LoginData): Promise<User> {
    const { email, password } = data;
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login timestamp
    await updateDoc(doc(firestore, 'users', user.uid), {
      lastLoginAt: serverTimestamp()
    });
    
    return user;
  },
  
  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },
  
  /**
   * Send password reset email
   * @param email User's email address
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },
  
  /**
   * Update user profile
   * @param user Current user
   * @param data Data to update
   */
  async updateUserProfile(user: User, data: Partial<RegisterData>): Promise<void> {
    if (data.displayName) {
      await updateProfile(user, { displayName: data.displayName });
    }
    
    const updateData: Record<string, any> = {};
    if (data.language) updateData.language = data.language;
    if (data.cityId) updateData.cityId = data.cityId;
    
    if (Object.keys(updateData).length > 0) {
      await updateDoc(doc(firestore, 'users', user.uid), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    }
  },
  
  /**
   * Update user onboarding step
   * @param userId User ID
   * @param step Onboarding step
   */
  async updateOnboardingStep(userId: string, step: string): Promise<void> {
    await updateDoc(doc(firestore, 'users', userId), {
      onboardingStep: step,
      updatedAt: serverTimestamp()
    });
  },
  
  /**
   * Set user consent for child profiles
   * @param userId User ID
   * @param consent Consent value
   */
  async setUserConsent(userId: string, consent: boolean): Promise<void> {
    await updateDoc(doc(firestore, 'users', userId), {
      consentGiven: consent,
      updatedAt: serverTimestamp()
    });
  },
  
  /**
   * Get the current authenticated user
   * @returns The current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
};

export default authService;
