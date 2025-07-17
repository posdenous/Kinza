import { renderHook, act } from '@testing-library/react-native';

import useUgcModeration, { ContentType } from '../useUgcModeration';

/**
 * Happy-path test that exercises the main `submitForModeration` flow of the
 * `useUgcModeration` hook. We provide fully-stubbed Firestore helpers so the
 * hook behaves as if it were online and authorised.
 */

// ---------------------------- mocks ------------------------------------

// Increase default test timeout for async operations
jest.setTimeout(10000);

// Translation helper
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Firestore SDK – only the bits the hook touches
const mockAddDoc = jest.fn().mockResolvedValue({ id: 'mid-1' });
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockGetDocs = jest.fn().mockResolvedValue({ size: 0, empty: true, docs: [] });
const mockServerTimestamp = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  serverTimestamp: (...args: any[]) => mockServerTimestamp(...args),
  Timestamp: { fromDate: jest.fn() },
}));

// useFirestoreInstance – provide a non-null stub so the hook proceeds
jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [{ firestore: true }],
}));

// Role and city helpers
jest.mock('../../hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'parent' }),
}));

jest.mock('../../hooks/useCities', () => ({
  useUserCity: () => ({ currentCityId: 'berlin' }),
}));

// -----------------------------------------------------------------------

describe('useUgcModeration – happy path', () => {
  

  

  

  beforeEach(() => {
    jest.clearAllMocks();
  });

  

  it('submits content for moderation and updates Firestore', async () => {
    const mockAiScreen = jest.fn().mockResolvedValue(['contains_inappropriate']);
    const { result } = renderHook(() => useUgcModeration({ aiScreen: mockAiScreen }));

    const contentData = {
      title: 'Event with questionable text',
      description: 'This contains inappropriate content', // triggers AI flag
      userId: 'user-1',
      minAge: 3,
      maxAge: 8,
      location: 'Park',
      startDate: '2025-01-01',
    };

    let submitResult: boolean | undefined;
    await act(async () => {
      const promise = result.current.submitForModeration(
        'event' as ContentType,
        'event-1',
        contentData,
      );
      
      
      submitResult = await promise;
    });

    // Hook should indicate success
    expect(submitResult).toBe(true);

    // Firestore helpers should have been invoked
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);

    // The moderation document should include AI flags
    const moderationPayload = mockAddDoc.mock.calls[0][1];
    expect(moderationPayload.aiFlags).toContain('contains_inappropriate');
    expect(moderationPayload.cityId).toBe('berlin');
  });
});
