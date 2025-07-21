import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AdminOnboarding } from '../AdminOnboarding';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

jest.mock('../../../services/authService', () => ({
  getCurrentUser: jest.fn(),
  updateOnboardingStep: jest.fn(),
}));

const mockOnComplete = jest.fn();

describe('AdminOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Language Selection', () => {
    it('should start with language selection', () => {
      const { getByText } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      expect(getByText('onboarding.pickLanguage')).toBeTruthy();
    });

    it('should advance to policy acceptance after language selection', async () => {
      const { getByTestId, getByText } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByText('admin.policiesAndGuidelines')).toBeTruthy();
      });
    });
  });

  describe('Policy Acceptance Step', () => {
    it('should display admin-specific policies', async () => {
      const { getByTestId, getByText } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByText('admin.policyModeration')).toBeTruthy();
        expect(getByText('admin.policyPrivacy')).toBeTruthy();
        expect(getByText('admin.policyChildProtection')).toBeTruthy();
        expect(getByText('admin.policyDataHandling')).toBeTruthy();
      });
    });

    it('should require policy acceptance to complete onboarding', async () => {
      const { getByTestId, getByText } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        // Try to proceed without accepting policies
        fireEvent.press(getByTestId('accept-button'));
        
        expect(getByText('admin.mustAcceptPolicies')).toBeTruthy();
      });
    });

    it('should complete onboarding when policies are accepted', async () => {
      const authService = require('../../../services/authService');
      authService.getCurrentUser.mockReturnValue({ uid: 'test-admin' });
      
      const { getByTestId } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        // Accept all policies
        fireEvent.press(getByTestId('policy-moderation'));
        fireEvent.press(getByTestId('policy-privacy'));
        fireEvent.press(getByTestId('policy-child-protection'));
        fireEvent.press(getByTestId('policy-data-handling'));
        
        fireEvent.press(getByTestId('accept-button'));
      });
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Role Assignment', () => {
    it('should assign admin role and permissions', async () => {
      const authService = require('../../../services/authService');
      const mockUser = { uid: 'test-admin' };
      authService.getCurrentUser.mockReturnValue(mockUser);
      
      const { getByTestId } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      // Complete onboarding
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        fireEvent.press(getByTestId('policy-moderation'));
        fireEvent.press(getByTestId('policy-privacy'));
        fireEvent.press(getByTestId('policy-child-protection'));
        fireEvent.press(getByTestId('policy-data-handling'));
        fireEvent.press(getByTestId('accept-button'));
      });
      
      await waitFor(() => {
        expect(authService.updateOnboardingStep).toHaveBeenCalledWith(
          mockUser.uid,
          expect.objectContaining({
            role: 'admin',
            policiesAccepted: true,
            onboardingStep: 'completed'
          })
        );
      });
    });
  });

  describe('Admin Responsibilities', () => {
    it('should display admin responsibilities and tools overview', async () => {
      const { getByTestId, getByText } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByText('admin.responsibilityModeration')).toBeTruthy();
        expect(getByText('admin.responsibilityUserManagement')).toBeTruthy();
        expect(getByText('admin.responsibilityContentReview')).toBeTruthy();
        expect(getByText('admin.responsibilityPrivacyCompliance')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle onboarding update errors', async () => {
      const authService = require('../../../services/authService');
      authService.getCurrentUser.mockReturnValue({ uid: 'test-admin' });
      authService.updateOnboardingStep.mockRejectedValue(new Error('Update failed'));
      
      const { getByTestId, getByText } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        fireEvent.press(getByTestId('policy-moderation'));
        fireEvent.press(getByTestId('policy-privacy'));
        fireEvent.press(getByTestId('policy-child-protection'));
        fireEvent.press(getByTestId('policy-data-handling'));
        fireEvent.press(getByTestId('accept-button'));
      });
      
      await waitFor(() => {
        expect(getByText('errors.onboardingFailed')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for admin tools', async () => {
      const { getByTestId } = render(
        <AdminOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByTestId('policy-moderation')).toHaveProp('accessibilityLabel', 'admin.policyModeration');
        expect(getByTestId('policy-privacy')).toHaveProp('accessibilityLabel', 'admin.policyPrivacy');
      });
    });
  });
});
