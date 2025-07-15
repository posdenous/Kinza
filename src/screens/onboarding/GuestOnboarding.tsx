import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import OnboardingStep from '../../components/OnboardingStep';
import LanguageSelector from '../../components/LanguageSelector';
import LocationPermission from '../../components/LocationPermission';
import { UserRole } from '../../auth/roles';
import authService from '../../auth/authService';

interface GuestOnboardingProps {
  onComplete: () => void;
}

/**
 * Guest onboarding flow screen - simplified version with limited features
 */
const GuestOnboarding: React.FC<GuestOnboardingProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    language: '',
    cityId: 'berlin',
  });

  // Total number of steps in the onboarding flow
  const totalSteps = 3;

  // Handle language selection
  const handleLanguageSelected = (language: string) => {
    setUserData({ ...userData, language });
    setStep(1);
  };

  // Handle location permission
  const handleLocationGranted = () => {
    setStep(2);
  };

  // Handle ZIP code entry
  const handleZipEntered = (zip: string) => {
    // In a real app, we would convert ZIP to cityId or coordinates
    setStep(2);
  };

  // Handle guest continuation
  const handleContinueAsGuest = () => {
    // Complete onboarding
    onComplete();
  };

  // Handle sign in option
  const handleSignInOption = () => {
    // In a real app, we would navigate to the sign in screen
    // For now, we'll just complete the onboarding
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
            title={t('onboarding.welcome')}
            onNext={handleContinueAsGuest}
            onBack={() => setStep(1)}
            nextLabel={t('auth.continueAsGuest')}
            progress={step / totalSteps}
            isLastStep={true}
          >
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                {t('onboarding.guestWelcomeMessage')}
              </Text>
              
              <Text style={styles.limitationsText}>
                {t('onboarding.guestLimitations')}
              </Text>
              
              <View style={styles.limitationsList}>
                <Text style={styles.limitationItem}>• {t('onboarding.limitSaveEvents')}</Text>
                <Text style={styles.limitationItem}>• {t('onboarding.limitComments')}</Text>
                <Text style={styles.limitationItem}>• {t('onboarding.limitPersonalization')}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignInOption}
              >
                <Text style={styles.signInButtonText}>{t('auth.signInForMore')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleContinueAsGuest}
              >
                <Text style={styles.guestButtonText}>{t('auth.continueAsGuest')}</Text>
              </TouchableOpacity>
            </View>
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
  welcomeContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  limitationsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  limitationsList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  limitationItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  signInButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButton: {
    backgroundColor: '#9E9E9E',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GuestOnboarding;
