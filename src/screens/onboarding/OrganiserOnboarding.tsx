import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebaseConfig';
import OnboardingStep from '../../components/OnboardingStep';
import LanguageSelector from '../../components/LanguageSelector';
import { UserRole } from '../../auth/roles';
import authService from '../../auth/authService';

interface OrganiserOnboardingProps {
  onComplete: () => void;
}

/**
 * Organiser onboarding flow screen
 */
const OrganiserOnboarding: React.FC<OrganiserOnboardingProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    language: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    orgName: '',
    website: '',
  });
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

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
  };

  // Handle registration form submission
  const handleRegister = async () => {
    // Validate form
    if (!userData.email || !userData.password || !userData.displayName) {
      setError(t('errors.form.required'));
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      setError(t('errors.auth.passwordMismatch'));
      return;
    }

    try {
      // Register user
      await authService.register({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        role: UserRole.ORGANISER,
        language: userData.language,
      });
      
      // Move to next step
      setStep(2);
      setError('');
      
      // Update onboarding step
      const user = authService.getCurrentUser();
      if (user) {
        await updateOnboardingStep(user.uid, 'email_verification');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(t('errors.auth.emailInUse'));
    }
  };

  // Simulate email verification
  const handleVerifyEmail = () => {
    // In a real app, we would check if the email is verified
    setIsVerified(true);
    setStep(3);
    
    const user = authService.getCurrentUser();
    if (user) {
      updateOnboardingStep(user.uid, 'profile_setup');
    }
  };

  // Handle profile setup
  const handleProfileSetup = async () => {
    if (!userData.orgName) {
      setError(t('errors.form.required'));
      return;
    }

    try {
      const user = authService.getCurrentUser();
      if (user) {
        // Update user profile
        await updateDoc(doc(firestore, 'users', user.uid), {
          orgName: userData.orgName,
          website: userData.website,
          onboardingStep: 'submit_first_event',
          updatedAt: new Date(),
        });
        
        setStep(4);
        setError('');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
    }
  };

  // Handle first event submission
  const handleFirstEventSubmit = () => {
    // In a real app, we would navigate to the event submission form
    setStep(5);
    
    const user = authService.getCurrentUser();
    if (user) {
      updateOnboardingStep(user.uid, 'access_dashboard');
    }
    
    // Complete onboarding
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
            title={t('onboarding.organiserPath')}
            onNext={() => {}}
            onBack={() => setStep(0)}
            progress={step / totalSteps}
          >
            <ScrollView style={styles.formContainer}>
              <Text style={styles.formLabel}>{t('auth.displayName')}</Text>
              <TextInput
                style={styles.input}
                value={userData.displayName}
                onChangeText={(text) => setUserData({ ...userData, displayName: text })}
                placeholder={t('auth.displayName')}
              />
              
              <Text style={styles.formLabel}>{t('auth.email')}</Text>
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text })}
                placeholder={t('auth.email')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Text style={styles.formLabel}>{t('auth.password')}</Text>
              <TextInput
                style={styles.input}
                value={userData.password}
                onChangeText={(text) => setUserData({ ...userData, password: text })}
                placeholder={t('auth.password')}
                secureTextEntry
              />
              
              <Text style={styles.formLabel}>{t('auth.confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                value={userData.confirmPassword}
                onChangeText={(text) => setUserData({ ...userData, confirmPassword: text })}
                placeholder={t('auth.confirmPassword')}
                secureTextEntry
              />
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
                <Text style={styles.submitButtonText}>{t('auth.register')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </OnboardingStep>
        );
      case 2:
        return (
          <OnboardingStep
            title={t('onboarding.emailVerification')}
            onNext={handleVerifyEmail}
            onBack={() => setStep(1)}
            nextLabel={t('common.continue')}
            progress={step / totalSteps}
          >
            <View style={styles.centerContent}>
              <Text style={styles.infoText}>
                {t('onboarding.verificationSent')}
              </Text>
              <Text style={styles.subInfoText}>
                {t('auth.verifyEmailInfo')}
              </Text>
              
              {/* In a real app, this would check actual email verification status */}
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
                <Text style={styles.verifyButtonText}>
                  {t('auth.iVerifiedMyEmail')}
                </Text>
              </TouchableOpacity>
            </View>
          </OnboardingStep>
        );
      case 3:
        return (
          <OnboardingStep
            title={t('onboarding.profileSetup')}
            onNext={() => {}}
            onBack={() => setStep(2)}
            progress={step / totalSteps}
          >
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>{t('onboarding.orgName')}</Text>
              <TextInput
                style={styles.input}
                value={userData.orgName}
                onChangeText={(text) => setUserData({ ...userData, orgName: text })}
                placeholder={t('onboarding.orgName')}
              />
              
              <Text style={styles.formLabel}>{t('onboarding.website')}</Text>
              <TextInput
                style={styles.input}
                value={userData.website}
                onChangeText={(text) => setUserData({ ...userData, website: text })}
                placeholder="https://example.com"
                keyboardType="url"
                autoCapitalize="none"
              />
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <TouchableOpacity style={styles.submitButton} onPress={handleProfileSetup}>
                <Text style={styles.submitButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </OnboardingStep>
        );
      case 4:
        return (
          <OnboardingStep
            title={t('onboarding.submitFirstEvent')}
            onNext={handleFirstEventSubmit}
            onBack={() => setStep(3)}
            nextLabel={t('events.create')}
            progress={step / totalSteps}
          >
            <View style={styles.centerContent}>
              <Text style={styles.infoText}>
                {t('organiser.createFirstEventInfo')}
              </Text>
              
              <TouchableOpacity style={styles.submitButton} onPress={handleFirstEventSubmit}>
                <Text style={styles.submitButtonText}>{t('events.create')}</Text>
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
  formContainer: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  subInfoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrganiserOnboarding;
