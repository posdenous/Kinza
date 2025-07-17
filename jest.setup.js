import '@testing-library/jest-native/extend-expect';

// Simple i18n mock so t('key') returns the key
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// Mock Firebase Firestore to avoid deep module resolution errors
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
}));
