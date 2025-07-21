import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OrganiserOnboarding } from '../OrganiserOnboarding';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

jest.mock('../../../services/authService', () => ({
  getCurrentUser: jest.fn(),
  register: jest.fn(),
  updateOnboardingStep: jest.fn(),
}));

const mockOnComplete = jest.fn();

describe('OrganiserOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Language Selection', () => {
    it('should start with language selection', () => {
      const { getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      expect(getByText('onboarding.pickLanguage')).toBeTruthy();
    });
  });

  describe('Registration Step', () => {
    it('should collect organiser registration details', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      // Navigate to registration
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByText('auth.email')).toBeTruthy();
        expect(getByText('auth.password')).toBeTruthy();
        expect(getByText('auth.confirmPassword')).toBeTruthy();
        expect(getByText('organiser.displayName')).toBeTruthy();
      });
    });

    it('should validate password confirmation', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        fireEvent.changeText(getByTestId('email-input'), 'organiser@example.com');
        fireEvent.changeText(getByTestId('password-input'), 'password123');
        fireEvent.changeText(getByTestId('confirm-password-input'), 'different');
        fireEvent.changeText(getByTestId('display-name-input'), 'Test Organiser');
        
        fireEvent.press(getByTestId('next-button'));
        
        expect(getByText('auth.passwordMismatch')).toBeTruthy();
      });
    });

    it('should validate email format', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
        fireEvent.press(getByTestId('next-button'));
        
        expect(getByText('auth.invalidEmail')).toBeTruthy();
      });
    });
  });

  describe('Email Verification Step', () => {
    it('should show email verification requirement', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToVerificationStep();
      
      expect(getByText('auth.verifyEmail')).toBeTruthy();
      expect(getByText('auth.checkInbox')).toBeTruthy();
    });

    it('should allow resending verification email', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToVerificationStep();
      
      fireEvent.press(getByTestId('resend-verification'));
      
      await waitFor(() => {
        expect(getByText('auth.verificationSent')).toBeTruthy();
      });
    });
  });

  describe('Organization Profile Step', () => {
    it('should collect organization details', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToProfileStep();
      
      expect(getByText('organiser.orgName')).toBeTruthy();
      expect(getByText('organiser.website')).toBeTruthy();
      expect(getByText('organiser.description')).toBeTruthy();
    });

    it('should validate required organization fields', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToProfileStep();
      
      fireEvent.press(getByTestId('next-button'));
      
      expect(getByText('errors.form.required')).toBeTruthy();
    });

    it('should validate website URL format', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToProfileStep();
      
      fireEvent.changeText(getByTestId('org-name-input'), 'Test Organization');
      fireEvent.changeText(getByTestId('website-input'), 'invalid-url');
      
      fireEvent.press(getByTestId('next-button'));
      
      expect(getByText('errors.form.invalidUrl')).toBeTruthy();
    });
  });

  describe('First Event Creation', () => {
    it('should guide through first event creation', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToEventCreationStep();
      
      expect(getByText('onboarding.submitFirstEvent')).toBeTruthy();
      expect(getByText('events.title')).toBeTruthy();
      expect(getByText('events.description')).toBeTruthy();
      expect(getByText('events.venue')).toBeTruthy();
      expect(getByText('events.startTime')).toBeTruthy();
      expect(getByText('events.ageRange')).toBeTruthy();
    });

    it('should enforce event validation rules', async () => {
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToEventCreationStep();
      
      // Try to submit without required fields
      fireEvent.press(getByTestId('create-event-button'));
      
      expect(getByText('events.titleRequired')).toBeTruthy();
      expect(getByText('events.venueRequired')).toBeTruthy();
      expect(getByText('events.timeRequired')).toBeTruthy();
      expect(getByText('events.ageRangeRequired')).toBeTruthy();
    });

    it('should complete onboarding after successful event creation', async () => {
      const authService = require('../../../services/authService');
      authService.getCurrentUser.mockReturnValue({ uid: 'test-organiser' });
      
      const { getByTestId } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToEventCreationStep();
      
      // Fill event details
      fireEvent.changeText(getByTestId('event-title-input'), 'Test Event');
      fireEvent.changeText(getByTestId('event-description-input'), 'A great event for kids');
      fireEvent.changeText(getByTestId('event-venue-input'), 'Test Venue');
      fireEvent.changeText(getByTestId('min-age-input'), '5');
      fireEvent.changeText(getByTestId('max-age-input'), '12');
      
      // Set date and time (mock date picker)
      fireEvent.press(getByTestId('date-picker'));
      fireEvent.press(getByTestId('time-picker'));
      
      fireEvent.press(getByTestId('create-event-button'));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Role Assignment', () => {
    it('should assign organiser role on completion', async () => {
      const authService = require('../../../services/authService');
      const mockUser = { uid: 'test-organiser' };
      authService.getCurrentUser.mockReturnValue(mockUser);
      
      const { getByTestId } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      await completeFullOnboarding();
      
      // Verify role assignment
      expect(authService.updateOnboardingStep).toHaveBeenCalledWith(
        mockUser.uid,
        expect.objectContaining({
          role: 'organiser',
          onboardingStep: 'completed'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle registration errors', async () => {
      const authService = require('../../../services/authService');
      authService.register.mockRejectedValue(new Error('Email already exists'));
      
      const { getByTestId, getByText } = render(
        <OrganiserOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        fireEvent.changeText(getByTestId('email-input'), 'existing@example.com');
        fireEvent.changeText(getByTestId('password-input'), 'password123');
        fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
        fireEvent.changeText(getByTestId('display-name-input'), 'Test Organiser');
        
        fireEvent.press(getByTestId('next-button'));
      });
      
      await waitFor(() => {
        expect(getByText('auth.emailExists')).toBeTruthy();
      });
    });
  });

  // Helper functions
  const navigateToVerificationStep = async () => {
    const { getByTestId } = render(
      <OrganiserOnboarding onComplete={mockOnComplete} />
    );
    
    fireEvent.press(getByTestId('language-en'));
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('email-input'), 'organiser@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.changeText(getByTestId('display-name-input'), 'Test Organiser');
      fireEvent.press(getByTestId('next-button'));
    });
  };

  const navigateToProfileStep = async () => {
    await navigateToVerificationStep();
    
    await waitFor(() => {
      fireEvent.press(getByTestId('verification-confirmed'));
    });
  };

  const navigateToEventCreationStep = async () => {
    await navigateToProfileStep();
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('org-name-input'), 'Test Organization');
      fireEvent.changeText(getByTestId('website-input'), 'https://test.com');
      fireEvent.press(getByTestId('next-button'));
    });
  };

  const completeFullOnboarding = async () => {
    await navigateToEventCreationStep();
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('event-title-input'), 'Test Event');
      fireEvent.changeText(getByTestId('event-description-input'), 'A great event');
      fireEvent.changeText(getByTestId('event-venue-input'), 'Test Venue');
      fireEvent.changeText(getByTestId('min-age-input'), '5');
      fireEvent.changeText(getByTestId('max-age-input'), '12');
      fireEvent.press(getByTestId('create-event-button'));
    });
  };
});
