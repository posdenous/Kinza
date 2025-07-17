import { renderHook, act } from '@testing-library/react-native';
import useUgcModeration, { ContentType } from '../useUgcModeration';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Create simple mock implementations
const mockAddDoc = jest.fn().mockImplementation(() => Promise.resolve({ id: 'test-id' }));
const mockUpdateDoc = jest.fn().mockImplementation(() => Promise.resolve());
const mockCollection = jest.fn().mockReturnValue('collection-ref');
const mockDoc = jest.fn().mockReturnValue('doc-ref');

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  query: jest.fn().mockReturnValue('query-ref'),
  where: jest.fn().mockReturnValue('where-ref'),
  getDocs: jest.fn().mockResolvedValue({ size: 0, empty: true, docs: [] }),
  serverTimestamp: jest.fn().mockReturnValue({ _seconds: 1625097600, _nanoseconds: 0 }),
  Timestamp: {
    fromDate: jest.fn(),
    now: jest.fn().mockReturnValue({ toMillis: () => Date.now() })
  },
}));

// Mock hooks
jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [{}],
}));

jest.mock('../../hooks/useUserRole', () => ({
  useUserRole: () => ({ role: 'parent' }),
}));

jest.mock('../../hooks/useCities', () => ({
  useUserCity: () => ({ currentCityId: 'berlin' }),
}));

describe('useUgcModeration - simple test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully submits content for moderation', async () => {
    // Create a simple mock AI screening function
    const mockAiScreen = jest.fn().mockImplementation(() => Promise.resolve(['test_flag']));
    
    // Render the hook
    const { result } = renderHook(() => useUgcModeration({ aiScreen: mockAiScreen }));

    // Simple content data
    const contentData = {
      title: 'Test Content',
      userId: 'user-123'
    };

    // Call the hook function
    let success = false;
    await act(async () => {
      success = await result.current.submitForModeration(
        'comment' as ContentType,
        'comment-123',
        contentData
      );
    });

    // Verify results
    expect(success).toBe(true);
    expect(mockAiScreen).toHaveBeenCalledWith('comment', contentData);
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    
    // Check moderation document
    const moderationPayload = mockAddDoc.mock.calls[0][1];
    expect(moderationPayload.contentId).toBe('comment-123');
    expect(moderationPayload.contentType).toBe('comment');
    expect(moderationPayload.status).toBe('pending');
    expect(moderationPayload.cityId).toBe('berlin');
    expect(moderationPayload.aiFlags).toEqual(['test_flag']);
  });
});
