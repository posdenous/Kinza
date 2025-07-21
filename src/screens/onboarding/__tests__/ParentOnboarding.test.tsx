import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ParentOnboarding } from '../ParentOnboarding';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

jest.mock('../../../services/authService', () => ({
  getCurrentUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  updateOnboardingStep: jest.fn(),
}));

jest.mock('../../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [mockFirestore]
}));

const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
};

const mockOnComplete = jest.fn();

describe('ParentOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Language Selection Step', () => {
    it('should render language selection as first step', () => {
      const { getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      expect(getByText('onboarding.pickLanguage')).toBeTruthy();
    });

    it('should advance to next step when language is selected', async () => {
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      // Select English language
      const englishButton = getByTestId('language-en');
      fireEvent.press(englishButton);
      
      await waitFor(() => {
        expect(getByText('onboarding.privacyConsent')).toBeTruthy();
      });
    });
  });

  describe('Privacy Consent Step', () => {
    it('should show GDPR-compliant privacy consent', async () => {
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      // Navigate to privacy step
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByText('privacy.parentalConsent')).toBeTruthy();
        expect(getByText('privacy.basicProfile')).toBeTruthy();
        expect(getByText('privacy.personalizedRecommendations')).toBeTruthy();
        expect(getByText('privacy.locationServices')).toBeTruthy();
        expect(getByText('privacy.usageAnalytics')).toBeTruthy();
      });
    });

    it('should require parental consent to proceed', async () => {
      const { getByTestId, getByText, queryByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      // Navigate to privacy step
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        const nextButton = getByTestId('next-button');
        fireEvent.press(nextButton);
        
        // Should show error without parental consent
        expect(queryByText('errors.permission.consentRequired')).toBeTruthy();
      });
    });

    it('should advance when required consents are given', async () => {
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      // Navigate to privacy step
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(async () => {
        // Give required consents
        fireEvent.press(getByTestId('consent-basic-profile'));
        fireEvent.press(getByTestId('parental-consent'));
        
        // Should advance to child profile step
        fireEvent.press(getByTestId('next-button'));
        
        await waitFor(() => {
          expect(getByText('onboarding.childProfile')).toBeTruthy();
        });
      });
    });
  });

  describe('Child Profile Setup Step', () => {
    it('should validate child profile information', async () => {
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      // Navigate to child profile step
      await navigateToChildProfileStep();
      
      // Try to proceed without required info
      fireEvent.press(getByTestId('next-button'));
      
      expect(getByText('errors.form.required')).toBeTruthy();
    });

    it('should validate age range for child', async () => {
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToChildProfileStep();
      
      // Enter invalid age
      fireEvent.changeText(getByTestId('child-name-input'), 'Test Child');
      fireEvent.changeText(getByTestId('child-age-input'), '25');
      
      fireEvent.press(getByTestId('next-button'));
      
      expect(getByText('errors.form.invalid')).toBeTruthy();
    });

    it('should accept valid child profile and advance', async () => {
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToChildProfileStep();
      
      // Enter valid child info
      fireEvent.changeText(getByTestId('child-name-input'), 'Test Child');
      fireEvent.changeText(getByTestId('child-age-input'), '8');
      
      fireEvent.press(getByTestId('next-button'));
      
      await waitFor(() => {
        expect(getByText('onboarding.interests')).toBeTruthy();
      });
    });
  });

  describe('Interest Selection Step', () => {
    it('should allow multiple interest selection', async () => {
      const { getByTestId } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToInterestsStep();
      
      // Select multiple interests
      fireEvent.press(getByTestId('interest-sports'));
      fireEvent.press(getByTestId('interest-arts'));
      fireEvent.press(getByTestId('interest-science'));
      
      // Should allow proceeding with selected interests
      fireEvent.press(getByTestId('next-button'));
      
      await waitFor(() => {
        expect(getByTestId('auth-step')).toBeTruthy();
      });
    });

    it('should allow proceeding without interests selected', async () => {
      const { getByTestId } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToInterestsStep();
      
      // Skip interests
      fireEvent.press(getByTestId('skip-button'));
      
      await waitFor(() => {
        expect(getByTestId('auth-step')).toBeTruthy();
      });
    });
  });

  describe('Authentication Step', () => {
    it('should offer login and registration options', async () => {
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToAuthStep();
      
      expect(getByText('auth.login')).toBeTruthy();
      expect(getByText('auth.register')).toBeTruthy();
      expect(getByText('auth.continueAsGuest')).toBeTruthy();
    });

    it('should complete onboarding on successful login', async () => {
      const authService = require('../../../services/authService');
      authService.login.mockResolvedValue({ uid: 'test-user' });
      authService.getCurrentUser.mockReturnValue({ uid: 'test-user' });
      
      const { getByTestId } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToAuthStep();
      
      // Fill login form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      
      // Submit login
      fireEvent.press(getByTestId('login-button'));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should handle login errors gracefully', async () => {
      const authService = require('../../../services/authService');
      authService.login.mockRejectedValue(new Error('Invalid credentials'));
      
      const { getByTestId, getByText } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToAuthStep();
      
      // Fill login form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      
      // Submit login
      fireEvent.press(getByTestId('login-button'));
      
      await waitFor(() => {
        expect(getByText('auth.invalidCredentials')).toBeTruthy();
      });
    });
  });

  describe('Data Persistence', () => {
    it('should persist onboarding data throughout flow', async () => {
      const { getByTestId } = render(
        <ParentOnboarding onComplete={mockOnComplete} />
      );
      
      // Complete full flow
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(async () => {
        // Privacy consents
        fireEvent.press(getByTestId('consent-basic-profile'));
        fireEvent.press(getByTestId('parental-consent'));
        fireEvent.press(getByTestId('next-button'));
        
        await waitFor(async () => {
          // Child profile
          fireEvent.changeText(getByTestId('child-name-input'), 'Test Child');
          fireEvent.changeText(getByTestId('child-age-input'), '8');
          fireEvent.press(getByTestId('next-button'));
          
          await waitFor(async () => {
            // Interests
            fireEvent.press(getByTestId('interest-sports'));
            fireEvent.press(getByTestId('next-button'));
            
            // Should have all data available for final step
            await waitFor(() => {
              expect(getByTestId('auth-step')).toBeTruthy();
            });
          });
        });
      });
    });
  });

  // Helper functions
  const navigateToChildProfileStep = async () => {
    const { getByTestId } = render(
      <ParentOnboarding onComplete={mockOnComplete} />
    );
    
    fireEvent.press(getByTestId('language-en'));
    
    await waitFor(async () => {
      fireEvent.press(getByTestId('consent-basic-profile'));
      fireEvent.press(getByTestId('parental-consent'));
      fireEvent.press(getByTestId('next-button'));
    });
  };

  const navigateToInterestsStep = async () => {
    await navigateToChildProfileStep();
    
    await waitFor(async () => {
      fireEvent.changeText(getByTestId('child-name-input'), 'Test Child');
      fireEvent.changeText(getByTestId('child-age-input'), '8');
      fireEvent.press(getByTestId('next-button'));
    });
  };

  const navigateToAuthStep = async () => {
    await navigateToInterestsStep();
    
    await waitFor(() => {
      fireEvent.press(getByTestId('next-button'));
    });
  };
});
