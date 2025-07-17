import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Component under test
import PrivacyScreen from '../PrivacyScreen';

/**
 * NOTE:
 * These tests focus on verifying high-level behaviour of the PrivacyScreen. We stub
 * all heavy external dependencies (Firebase, navigation, translations) so the
 * component can render in isolation.
 */

// --- mocks --------------------------------------------------------------

// i18n – use key as translation so we can assert easily
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Navigation helpers used inside the screen
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Firebase Auth – return no logged-in user for this test scenario
jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
}));

// Firestore hook – not needed for this simple render test
jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [null],
}));

// Prevent React Native warning about missing native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

// -----------------------------------------------------------------------

describe('PrivacyScreen', () => {
  it('shows login prompt when user is not authenticated', async () => {
    const { getByText } = render(<PrivacyScreen />);

    await waitFor(() => {
      // We expect the translated login-required headline to be present
      expect(getByText('privacy.loginRequired')).toBeTruthy();
    });
  });
});
