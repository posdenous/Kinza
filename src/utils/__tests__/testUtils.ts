/**
 * Test utilities for consistent mocking and test setup
 */

import { Event } from '../../types/events';

/**
 * Creates a mock event object for testing
 */
export const createMockEvent = (overrides: Partial<Event> = {}): Event => {
  return {
    id: 'event123',
    title: 'Test Event',
    description: 'This is a test event',
    startTime: new Date('2025-07-20T10:00:00'),
    endTime: new Date('2025-07-20T12:00:00'),
    location: {
      name: 'Test Venue',
      address: '123 Test St',
      coordinates: { latitude: 52.52, longitude: 13.405 }
    },
    categories: ['music'],
    ageRange: { min: 0, max: 12 },
    cityId: 'berlin',
    createdBy: 'user123',
    createdAt: new Date('2025-07-01'),
    images: ['https://example.com/image.jpg'],
    translations: {
      en: { title: 'Test Event', description: 'This is a test event' },
      de: { title: 'Test Veranstaltung', description: 'Dies ist eine Testveranstaltung' },
      it: { title: 'Evento di prova', description: 'Questo è un evento di prova' }
    },
    ...overrides
  };
};

/**
 * Common mock setup for i18n/translation
 */
export const setupTranslationMock = () => {
  jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en' }
    }),
  }));
};

/**
 * Common mock setup for Expo icons
 */
export const setupIconsMock = () => {
  jest.mock('@expo/vector-icons', () => ({
    Ionicons: (props: any) => null,
  }));
};

/**
 * Mock setup for Firebase Auth
 */
export const setupFirebaseAuthMock = (userRole = 'user', isAuthenticated = true) => {
  const mockUser = isAuthenticated ? {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User'
  } : null;

  jest.mock('firebase/auth', () => ({
    getAuth: () => ({
      currentUser: mockUser
    }),
  }));

  // Also mock the useUserRole hook if it's being used
  jest.mock('../../hooks/useUserRole', () => ({
    useUserRole: () => ({
      role: userRole,
      isLoading: false,
      error: null
    }),
  }));
};

/**
 * Mock setup for Firestore
 */
export const setupFirestoreMock = () => {
  jest.mock('../../hooks/useFirestoreInstance', () => ({
    useFirestoreInstance: () => [{}], // Return a mock firestore instance
  }));

  // Mock common Firestore functions
  jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    serverTimestamp: jest.fn(() => new Date()),
    Timestamp: {
      fromDate: jest.fn(date => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
      now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 }))
    }
  }));
};

/**
 * Setup snapshot testing with proper serialization of dates
 */
export const setupSnapshotSerialization = () => {
  // Add a serializer for Date objects in snapshots
  expect.addSnapshotSerializer({
    test: (val) => val instanceof Date,
    print: (val) => `Date(${JSON.stringify(val.toISOString())})`,
  });
};

/**
 * Create a mock for the useCities hook
 */
export const setupCitiesMock = (currentCityId = 'berlin') => {
  jest.mock('../../hooks/useCities', () => ({
    useUserCity: () => ({
      currentCity: { 
        id: currentCityId, 
        name: 'Berlin', 
        country: 'DE', 
        isActive: true 
      },
      cities: [
        { id: 'berlin', name: 'Berlin', country: 'DE', isActive: true },
        { id: 'munich', name: 'Munich', country: 'DE', isActive: false },
      ],
      loading: false,
      error: null,
      currentCityId
    }),
  }));
};
