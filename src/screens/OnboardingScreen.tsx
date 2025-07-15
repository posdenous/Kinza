import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import OnboardingController from './onboarding/OnboardingController';
import { UserRole } from '../auth/roles';
import authService from '../auth/authService';

type RootStackParamList = {
  Home: undefined;
  Onboarding: { role?: UserRole };
};

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingScreenProps {
  route?: {
    params?: {
      role?: UserRole;
    };
  };
}

/**
 * Main onboarding screen that serves as the entry point for all onboarding flows
 */
const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const initialRole = route?.params?.role;
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Check if onboarding is already complete
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const user = authService.getCurrentUser();
      if (user) {
        const userData = await authService.getUserData(user.uid);
        if (userData?.onboardingStep === 'completed') {
          setIsOnboardingComplete(true);
          navigation.replace('Home');
        }
      }
    };

    checkOnboardingStatus();
  }, [navigation]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    // Navigate to the main app
    navigation.replace('Home');
  };

  // If onboarding is already complete, don't render anything
  if (isOnboardingComplete) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <OnboardingController
        initialRole={initialRole}
        onComplete={handleOnboardingComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default OnboardingScreen;
