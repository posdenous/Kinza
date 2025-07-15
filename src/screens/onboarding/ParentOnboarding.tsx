import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebaseConfig';
import OnboardingStep from '../../components/OnboardingStep';
import LanguageSelector from '../../components/LanguageSelector';
import LocationPermission from '../../components/LocationPermission';
import ChildProfileSetup from '../../components/ChildProfileSetup';
import InterestSelection from '../../components/InterestSelection';
import AuthOptions from '../../components/AuthOptions';
import { UserRole } from '../../auth/roles';
import authService from '../../auth/authService';

interface ParentOnboardingProps {
  onComplete: () => void;
}

/**
 * Parent onboarding flow screen
 */
const ParentOnboarding: React.FC<ParentOnboardingProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    language: '',
    cityId: 'berlin',
    childProfile: {
      name: '',
      age: 0,
    },
    interests: [] as string[],
    consentGiven: false,
  });

  // Total number of steps in the onboarding flow
  const totalSteps = 5;

  // Update onboarding step in Firestore
  const updateOnboardingStep = async (userId: string, stepName: string) => {
    try {
      if (userId) {
        await authService.updateOnboardingStep(userId, stepName);
      }
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  // Handle language selection
  const handleLanguageSelected = (language: string) => {
    setUserData({ ...userData, language });
    setStep(1);

    const user = authService.getCurrentUser();
    if (user) {
      updateOnboardingStep(user.uid, 'request_location_or_zip');
    }
  };

  // Handle location permission
  const handleLocationGranted = () => {
    setStep(2);

    const user = authService.getCurrentUser();
    if (user) {
      updateOnboardingStep(user.uid, 'child_profile_setup');
    }
  };

  // Handle ZIP code entry
  const handleZipEntered = (zip: string) => {
    // In a real app, we would convert ZIP to cityId or coordinates
    setStep(2);

    const user = authService.getCurrentUser();
    if (user) {
      updateOnboardingStep(user.uid, 'child_profile_setup');
    }
  };

  // Handle child profile setup
  const handleChildProfileSaved = async (childData: {
    name: string;
    age: number;
    consentGiven: boolean;
  }) => {
    setUserData({
      ...userData,
      childProfile: {
        name: childData.name,
        age: childData.age,
      },
      consentGiven: childData.consentGiven,
    });
    
    setStep(3);

    const user = authService.getCurrentUser();
    if (user) {
      // Save child profile to Firestore
      try {
        await setDoc(doc(firestore, 'childProfiles', `${user.uid}_${Date.now()}`), {
          parentId: user.uid,
          name: childData.name,
          age: childData.age,
          createdAt: new Date(),
        });

        // Update user consent
        await authService.setUserConsent(user.uid, childData.consentGiven);
        
        // Update onboarding step
        await updateOnboardingStep(user.uid, 'interest_selection');
      } catch (error) {
        console.error('Error saving child profile:', error);
      }
    }
  };

  // Handle interest selection
  const handleInterestsSaved = (interests: string[]) => {
    setUserData({ ...userData, interests });
    setStep(4);

    const user = authService.getCurrentUser();
    if (user) {
      updateOnboardingStep(user.uid, 'optional_authentication');
    }
  };

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      await authService.login({ email, password });
      
      const user = authService.getCurrentUser();
      if (user) {
        // Update user data with onboarding info
        await updateDoc(doc(firestore, 'users', user.uid), {
          role: UserRole.PARENT,
          language: userData.language,
          cityId: userData.cityId,
          interests: userData.interests,
          onboardingStep: 'welcome_tour',
          updatedAt: new Date(),
        });
      }
      
      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle register
  const handleRegister = async (email: string, password: string, displayName: string) => {
    try {
      await authService.register({
        email,
        password,
        displayName,
        role: UserRole.PARENT,
        cityId: userData.cityId,
        language: userData.language,
      });
      
      const user = authService.getCurrentUser();
      if (user) {
        // Update user data with onboarding info
        await updateDoc(doc(firestore, 'users', user.uid), {
          interests: userData.interests,
          onboardingStep: 'welcome_tour',
          updatedAt: new Date(),
        });
      }
      
      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // Handle skip authentication
  const handleSkipAuth = () => {
    // Continue as guest
    setStep(5);
    onComplete();
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <OnboardingStep
            title={t('onboarding.pickLanguage')}
            onNext={() => {}}
            progress={step / totalSteps}
          >
            <LanguageSelector onLanguageSelected={handleLanguageSelected} />
          </OnboardingStep>
        );
      case 1:
        return (
          <OnboardingStep
            title={t('onboarding.locationPermission')}
            onNext={() => handleLocationGranted()}
            onBack={() => setStep(0)}
            progress={step / totalSteps}
          >
            <LocationPermission
              onLocationGranted={handleLocationGranted}
              onZipEntered={handleZipEntered}
            />
          </OnboardingStep>
        );
      case 2:
        return (
          <OnboardingStep
            title={t('onboarding.childProfile')}
            onNext={() => {}}
            onBack={() => setStep(1)}
            progress={step / totalSteps}
          >
            <ChildProfileSetup onSave={handleChildProfileSaved} />
          </OnboardingStep>
        );
      case 3:
        return (
          <OnboardingStep
            title={t('onboarding.interests')}
            onNext={() => {}}
            onBack={() => setStep(2)}
            progress={step / totalSteps}
          >
            <InterestSelection onSave={handleInterestsSaved} />
          </OnboardingStep>
        );
      case 4:
        return (
          <OnboardingStep
            title={t('onboarding.signIn')}
            onNext={handleSkipAuth}
            onBack={() => setStep(3)}
            nextLabel={t('onboarding.skip')}
            progress={step / totalSteps}
          >
            <AuthOptions
              onLogin={handleLogin}
              onRegister={handleRegister}
              onSkip={handleSkipAuth}
            />
          </OnboardingStep>
        );
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderStep()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default ParentOnboarding;
