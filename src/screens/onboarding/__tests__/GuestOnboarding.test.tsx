import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GuestOnboarding } from '../GuestOnboarding';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

const mockOnComplete = jest.fn();

describe('GuestOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Language Selection', () => {
    it('should start with language selection', () => {
      const { getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      expect(getByText('onboarding.pickLanguage')).toBeTruthy();
    });

    it('should advance to location permission after language selection', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByText('onboarding.locationPermission')).toBeTruthy();
      });
    });
  });

  describe('Location Permission Step', () => {
    it('should explain location benefits for guests', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        expect(getByText('guest.locationBenefits')).toBeTruthy();
        expect(getByText('guest.nearbyEvents')).toBeTruthy();
        expect(getByText('guest.noPersonalData')).toBeTruthy();
      });
    });

    it('should allow proceeding with location permission', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        fireEvent.press(getByTestId('allow-location'));
      });
      
      await waitFor(() => {
        expect(getByText('guest.welcomeMessage')).toBeTruthy();
      });
    });

    it('should allow proceeding without location permission', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      fireEvent.press(getByTestId('language-en'));
      
      await waitFor(() => {
        fireEvent.press(getByTestId('skip-location'));
      });
      
      await waitFor(() => {
        expect(getByText('guest.welcomeMessage')).toBeTruthy();
      });
    });
  });

  describe('Welcome and Feature Overview', () => {
    it('should show guest-specific features', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToWelcomeStep();
      
      expect(getByText('guest.canViewEvents')).toBeTruthy();
      expect(getByText('guest.canSearchEvents')).toBeTruthy();
      expect(getByText('guest.limitedMapAccess')).toBeTruthy();
      expect(getByText('guest.noSaveOrComment')).toBeTruthy();
    });

    it('should offer registration upgrade', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToWelcomeStep();
      
      expect(getByText('auth.signInForMore')).toBeTruthy();
      expect(getByText('guest.upgradeFeatures')).toBeTruthy();
    });

    it('should complete guest onboarding', async () => {
      const { getByTestId } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToWelcomeStep();
      
      fireEvent.press(getByTestId('continue-as-guest'));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Registration Conversion', () => {
    it('should redirect to registration when user chooses to sign up', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToWelcomeStep();
      
      fireEvent.press(getByTestId('sign-up-button'));
      
      await waitFor(() => {
        expect(getByText('auth.createAccount')).toBeTruthy();
      });
    });
  });

  describe('Limited Access Enforcement', () => {
    it('should set guest role with limited permissions', async () => {
      const { getByTestId } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToWelcomeStep();
      
      fireEvent.press(getByTestId('continue-as-guest'));
      
      await waitFor(() => {
        // Verify guest role is set (would be tested in integration)
        expect(mockOnComplete).toHaveBeenCalledWith({
          role: 'guest',
          hasLimitedAccess: true
        });
      });
    });
  });

  describe('Privacy for Guests', () => {
    it('should emphasize no data collection for guests', async () => {
      const { getByTestId, getByText } = render(
        <GuestOnboarding onComplete={mockOnComplete} />
      );
      
      await navigateToWelcomeStep();
      
      expect(getByText('guest.noDataCollection')).toBeTruthy();
      expect(getByText('guest.anonymousBrowsing')).toBeTruthy();
    });
  });

  // Helper function
  const navigateToWelcomeStep = async () => {
    const { getByTestId } = render(
      <GuestOnboarding onComplete={mockOnComplete} />
    );
    
    fireEvent.press(getByTestId('language-en'));
    
    await waitFor(() => {
      fireEvent.press(getByTestId('skip-location'));
    });
  };
});
