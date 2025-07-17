import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Component under test
import TrustScreen from '../TrustScreen';

/**
 * High-level behavioural tests for the TrustScreen. Similar to the PrivacyScreen
 * tests, we stub all heavy external dependencies so the component can render in
 * isolation without Firebase or navigation containers.
 */

// -------------------------- mocks ---------------------------------------

// i18n – identity function for t()
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Navigation helpers
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Firebase Auth – no logged-in user required for guidelines view
jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
}));

// Firestore hook
jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [null],
}));

// User role / city hooks
jest.mock('../../hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'parent' }),
}));

jest.mock('../../hooks/useCities', () => ({
  useUserCity: () => ({ currentCityId: 'berlin' }),
}));

// Silence NativeAnimated warning
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

// -----------------------------------------------------------------------

describe('TrustScreen', () => {
  it('renders Community Guidelines tab by default', async () => {
    const { getByText } = render(<TrustScreen />);

    await waitFor(() => {
      expect(getByText('trust.communityGuidelines')).toBeTruthy();
    });
  });

  it('navigates to Report tab when the report button is pressed', async () => {
    const { getByText } = render(<TrustScreen />);

    // The report button is inside guidelines tab
    const reportBtn = await waitFor(() => getByText('trust.reportContent'));
    fireEvent.press(reportBtn);

    await waitFor(() => {
      expect(getByText('trust.reportContentTitle')).toBeTruthy();
    });
  });
});
