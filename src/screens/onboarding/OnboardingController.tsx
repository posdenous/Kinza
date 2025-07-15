import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../auth/roles';
import useUserRole from '../../hooks/useUserRole';
import ParentOnboarding from './ParentOnboarding';
import OrganiserOnboarding from './OrganiserOnboarding';
import AdminOnboarding from './AdminOnboarding';
import GuestOnboarding from './GuestOnboarding';

interface OnboardingControllerProps {
  initialRole?: UserRole;
  onComplete: () => void;
}

/**
 * Controller component that determines which onboarding flow to show
 * based on the user's role or the provided initialRole
 */
const OnboardingController: React.FC<OnboardingControllerProps> = ({
  initialRole,
  onComplete,
}) => {
  const { t } = useTranslation();
  const { userRole, loading, error } = useUserRole();
  const [role, setRole] = useState<UserRole | null>(initialRole || null);

  // Set role from user role hook if not provided initially
  useEffect(() => {
    if (!initialRole && userRole) {
      setRole(userRole);
    }
  }, [initialRole, userRole]);

  // Show loading indicator while determining role
  if (loading || (!role && !initialRole)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Render appropriate onboarding flow based on role
  const renderOnboardingFlow = () => {
    switch (role) {
      case UserRole.PARENT:
        return <ParentOnboarding onComplete={onComplete} />;
      case UserRole.ORGANISER:
        return <OrganiserOnboarding onComplete={onComplete} />;
      case UserRole.ADMIN:
        return <AdminOnboarding onComplete={onComplete} />;
      case UserRole.GUEST:
      default:
        // Default to guest onboarding if no role is specified or role is guest
        return <GuestOnboarding onComplete={onComplete} />;
    }
  };

  return <View style={styles.container}>{renderOnboardingFlow()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingController;
