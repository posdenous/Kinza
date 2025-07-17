import { renderHook, act } from '@testing-library/react-native';

import useUgcModeration, { ContentType } from '../useUgcModeration';

/**
 * Happy-path test that exercises the main `submitForModeration` flow of the
 * `useUgcModeration` hook. We provide fully-stubbed Firestore helpers so the
 * hook behaves as if it were online and authorised.
 */

// ---------------------------- mocks ------------------------------------

// Translation helper
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Firestore SDK – only the bits the hook touches
const mockAddDoc = jest.fn().mockImplementation(() => Promise.resolve({ id: 'mid-1' }));
const mockUpdateDoc = jest.fn().mockImplementation(() => Promise.resolve());
const mockCollection = jest.fn().mockImplementation(() => 'collection-ref');
const mockDoc = jest.fn().mockImplementation(() => 'doc-ref');
const mockQuery = jest.fn().mockImplementation(() => 'query-ref');
const mockWhere = jest.fn().mockImplementation(() => 'where-ref');
const mockGetDocs = jest.fn().mockImplementation(() => Promise.resolve({ size: 0, empty: true, docs: [] }));
const mockServerTimestamp = jest.fn().mockImplementation(() => ({ seconds: 1625097600, nanoseconds: 0 }));

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  serverTimestamp: (...args: any[]) => mockServerTimestamp(...args),
  Timestamp: { 
    fromDate: jest.fn(),
    now: jest.fn().mockReturnValue({ toMillis: () => Date.now() })
  },
}));

// useFirestoreInstance – provide a non-null stub so the hook proceeds
jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [{ firestore: {} }],
}));

// Role and city helpers
jest.mock('../../hooks/useUserRole', () => ({
  useUserRole: () => ({ role: 'parent' }),
}));

jest.mock('../../hooks/useCities', () => ({
  useUserCity: () => ({ currentCityId: 'berlin' }),
}));

// -----------------------------------------------------------------------

describe('useUgcModeration – happy path', () => {
  // Set a reasonable timeout for each test
  jest.setTimeout(5000);
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations with synchronous versions
    mockAddDoc.mockImplementation(() => Promise.resolve({ id: 'mid-1' }));
    mockUpdateDoc.mockImplementation(() => Promise.resolve());
    mockGetDocs.mockImplementation(() => Promise.resolve({ size: 0, empty: true, docs: [] }));
  });

  it('submits content for moderation and updates Firestore', async () => {
    // Create a mock AI screening function that resolves immediately
    const mockAiScreen = jest.fn().mockImplementation(() => Promise.resolve(['contains_inappropriate']));
    
    // Render the hook with the mock AI screening function
    const { result } = renderHook(() => useUgcModeration({ aiScreen: mockAiScreen }));

    // Test data that will trigger the AI flag
    const contentData = {
      title: 'Event with questionable text',
      description: 'This contains inappropriate content', // triggers AI flag
      userId: 'user-1',
      minAge: 3,
      maxAge: 8,
      location: 'Park',
      startDate: '2025-01-01',
    };

    // Call the hook function and wait for it to complete
    let submitResult: boolean | undefined;
    
    await act(async () => {
      submitResult = await result.current.submitForModeration(
        'event' as ContentType,
        'event-1',
        contentData
      );
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
    expect(moderationPayload.contentId).toBe('event-1');
    expect(moderationPayload.contentType).toBe('event');
    expect(moderationPayload.status).toBe('pending');
    
    // Verify the content was updated with moderation status
    const contentUpdateRef = mockDoc.mock.calls[0];
    const contentUpdateData = mockUpdateDoc.mock.calls[0][1];
    expect(contentUpdateRef[1]).toBe('events');
    expect(contentUpdateRef[2]).toBe('event-1');
    expect(contentUpdateData.moderationStatus).toBe('pending');
  });
  
  // Add a simplified test that focuses on the core functionality
  it('handles moderation submission with minimal data', async () => {
    // Create a simplified mock that returns immediately
    const mockSimpleAiScreen = jest.fn().mockImplementation(() => Promise.resolve(['test_flag']));
    
    const { result } = renderHook(() => useUgcModeration({ aiScreen: mockSimpleAiScreen }));
    
    // Minimal test data
    const simpleData = {
      title: 'Simple test',
      userId: 'user-simple',
    };
    
    let success: boolean | undefined;
    
    await act(async () => {
      success = await result.current.submitForModeration(
        'comment' as ContentType,
        'comment-1',
        simpleData
      );
    });
    
    expect(success).toBe(true);
    expect(mockAddDoc).toHaveBeenCalled();
    expect(mockUpdateDoc).toHaveBeenCalled();
  });
});
