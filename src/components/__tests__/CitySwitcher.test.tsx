import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CitySwitcher from '../CitySwitcher';

// Mock icons to avoid native dependency warnings
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => null,
}));

// Mock translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock hooks used inside CitySwitcher
jest.mock('../../hooks/useCities', () => ({
  useUserCity: () => ({
    currentCity: { id: 'berlin', name: 'Berlin', country: 'DE', isActive: true },
    cities: [
      { id: 'berlin', name: 'Berlin', country: 'DE', isActive: true },
      { id: 'munich', name: 'Munich', country: 'DE', isActive: false },
    ],
    loading: false,
    error: null,
  }),
}));

jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [null], // no firestore for unit test
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
}));

describe('CitySwitcher', () => {
  it('renders current city name', () => {
    const { getByText } = render(<CitySwitcher compact />);
    expect(getByText('Berlin')).toBeTruthy();
  });

  it('opens modal on press', () => {
    const { getByText, queryByText } = render(<CitySwitcher compact />);
    const button = getByText('Berlin');
    fireEvent.press(button);
    expect(queryByText('citySwitcher.selectCity')).toBeTruthy();
  });
});
