import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebaseConfig';
import OnboardingStep from '../../components/OnboardingStep';
import LanguageSelector from '../../components/LanguageSelector';
import { UserRole } from '../../auth/roles';
import authService from '../../auth/authService';

interface AdminOnboardingProps {
  onComplete: () => void;
}

/**
 * Admin onboarding flow screen
 */
const AdminOnboarding: React.FC<AdminOnboardingProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('');
  const [policiesAccepted, setPoliciesAccepted] = useState(false);

  // Total number of steps in the onboarding flow
  const totalSteps = 2;

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
  const handleLanguageSelected = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setStep(1);
    
    const user = authService.getCurrentUser();
    if (user) {
      updateOnboardingStep(user.uid, 'admin_confirm');
    }
  };

  // Handle policy confirmation
  const handlePolicyConfirmation = async () => {
    setPoliciesAccepted(true);
    
    try {
      const user = authService.getCurrentUser();
      if (user) {
        // Update user profile
        await updateDoc(doc(firestore, 'users', user.uid), {
          role: UserRole.ADMIN,
          language,
          policiesAccepted: true,
          onboardingStep: 'completed',
          updatedAt: new Date(),
        });
      }
      
      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Policy confirmation error:', error);
    }
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
            title={t('onboarding.adminConfirm')}
            onNext={handlePolicyConfirmation}
            onBack={() => setStep(0)}
            nextLabel={t('common.confirm')}
            progress={step / totalSteps}
            isLastStep={true}
          >
            <ScrollView style={styles.policyContainer}>
              <Text style={styles.policyTitle}>{t('admin.moderationPolicy')}</Text>
              
              <Text style={styles.policySection}>{t('admin.contentGuidelines')}</Text>
              <Text style={styles.policyText}>
                • {t('admin.policyNoHarmful')}
              </Text>
              <Text style={styles.policyText}>
                • {t('admin.policyNoSpam')}
              </Text>
              <Text style={styles.policyText}>
                • {t('admin.policyNoOffensive')}
              </Text>
              <Text style={styles.policyText}>
                • {t('admin.policyNoMisleading')}
              </Text>
              
              <Text style={styles.policySection}>{t('admin.moderationProcess')}</Text>
              <Text style={styles.policyText}>
                • {t('admin.policyReviewPrompt')}
              </Text>
              <Text style={styles.policyText}>
                • {t('admin.policyProvideReason')}
              </Text>
              <Text style={styles.policyText}>
                • {t('admin.policyConsistency')}
              </Text>
              
              <Text style={styles.policySection}>{t('admin.dataPrivacy')}</Text>
              <Text style={styles.policyText}>
                • {t('admin.policyDataProtection')}
              </Text>
              <Text style={styles.policyText}>
                • {t('admin.policyChildProtection')}
              </Text>
              
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handlePolicyConfirmation}
              >
                <Text style={styles.acceptButtonText}>{t('common.acceptAndContinue')}</Text>
              </TouchableOpacity>
            </ScrollView>
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
  policyContainer: {
    padding: 16,
  },
  policyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  policySection: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminOnboarding;
