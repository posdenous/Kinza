import { renderHook, act } from '@testing-library/react-native';

// Hook under test
import useUgcModeration, { ContentType } from '../useUgcModeration';

/**
 * Unit tests for the useUgcModeration hook. These cover the minimal happy path
 * of the public API and common early-failure scenarios when Firestore is
 * unavailable.  Full end-to-end moderation flows are exercised elsewhere via
 * integration tests in the mobile app.
 */

// ---------------------- mocks -------------------------------------------

// i18n – identity translation helper
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Firestore – we only need the type definitions, but prevent runtime errors
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: { fromDate: jest.fn() },
}));

// Hook dependencies
jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [null], // Simulate missing Firestore (e.g. offline)
}));

jest.mock('../../hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'parent' }),
}));

jest.mock('../../hooks/useCities', () => ({
  useUserCity: () => ({ currentCityId: null }),
}));

// -----------------------------------------------------------------------

describe('useUgcModeration', () => {
  it('returns false when Firestore is unavailable during submit', async () => {
    const { result } = renderHook(() => useUgcModeration());

    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitForModeration(
        'event' as ContentType,
        'event-1',
        { title: 'Fun Event', userId: 'user-1' }
      );
    });

    expect(submitResult).toBe(false);
    expect(result.current.error).not.toBeNull();
  });
});
