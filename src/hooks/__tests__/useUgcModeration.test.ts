import { renderHook, act } from '@testing-library/react-native';

// Hook under test
import useUgcModeration, { ContentType } from '../useUgcModeration';

/**
 * Unit tests for the useUgcModeration hook. These cover the happy path
 * of the public API, common failure scenarios, and verify that the hook
 * correctly enforces the app's moderation rules.
 */

// ---------------------- mocks -------------------------------------------

// Mock data
const mockModerationItems = [
  {
    id: 'mod-1',
    contentId: 'comment-1',
    contentType: 'comment',
    contentData: { text: 'Great event!', userId: 'user-1' },
    status: 'pending',
    submittedBy: 'user-1',
    submittedAt: { toDate: () => new Date('2025-07-01') },
    cityId: 'berlin',
  },
  {
    id: 'mod-2',
    contentId: 'comment-2',
    contentType: 'comment',
    contentData: { text: 'Looking forward to this!', userId: 'user-2' },
    status: 'approved',
    submittedBy: 'user-2',
    submittedAt: { toDate: () => new Date('2025-07-02') },
    cityId: 'berlin',
    moderatedBy: 'admin-1',
    moderatedAt: { toDate: () => new Date('2025-07-03') },
  },
  {
    id: 'mod-3',
    contentId: 'comment-3',
    contentType: 'comment',
    contentData: { text: 'Inappropriate content', userId: 'user-3' },
    status: 'rejected',
    submittedBy: 'user-3',
    submittedAt: { toDate: () => new Date('2025-07-04') },
    cityId: 'berlin',
    moderatedBy: 'admin-1',
    moderatedAt: { toDate: () => new Date('2025-07-05') },
    reason: 'Violates community guidelines',
  },
  {
    id: 'mod-4',
    contentId: 'event-1',
    contentType: 'event',
    contentData: { title: 'Fun Event', userId: 'user-4' },
    status: 'pending',
    submittedBy: 'user-4',
    submittedAt: { toDate: () => new Date('2025-07-06') },
    cityId: 'munich', // Different city
  },
];

// i18n – identity translation helper
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Firestore functions
const mockCollection = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockGetDocs = jest.fn();
const mockServerTimestamp = jest.fn();

// Firestore mock implementation
jest.mock('firebase/firestore', () => ({
  collection: (firestore: any, path: string) => {
    mockCollection(path);
    return { path };
  },
  addDoc: async (collectionRef: any, data: any) => {
    mockAddDoc(collectionRef, data);
    return { id: 'new-mod-id' };
  },
  updateDoc: async (docRef: any, data: any) => {
    mockUpdateDoc(docRef, data);
    return true;
  },
  doc: (firestore: any, collection: string, id: string) => {
    mockDoc(collection, id);
    return { collection, id };
  },
  query: (collectionRef: any, ...constraints: any[]) => {
    mockQuery(collectionRef, constraints);
    return { collectionRef, constraints };
  },
  where: (field: string, operator: string, value: any) => {
    mockWhere(field, operator, value);
    return { field, operator, value };
  },
  getDocs: async (query: any) => {
    mockGetDocs(query);
    
    // Filter the mock data based on query constraints
    let filteredItems = [...mockModerationItems];
    
    if (query.constraints) {
      query.constraints.forEach((constraint: any) => {
        if (constraint.field && constraint.operator && constraint.value !== undefined) {
          filteredItems = filteredItems.filter(item => {
            if (constraint.operator === '==') {
              return item[constraint.field] === constraint.value;
            }
            return true;
          });
        }
      });
    }
    
    return {
      empty: filteredItems.length === 0,
      size: filteredItems.length,
      forEach: (callback: (doc: any) => void) => {
        filteredItems.forEach((item, index) => {
          callback({
            id: item.id,
            data: () => ({ ...item }),
          });
        });
      },
      docs: filteredItems.map(item => ({
        id: item.id,
        data: () => ({ ...item }),
      })),
    };
  },
  serverTimestamp: () => {
    mockServerTimestamp();
    return new Date();
  },
  Timestamp: { 
    fromDate: (date: Date) => ({ 
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0
    }) 
  },
}));

// Default mock implementations for hook dependencies
const defaultMocks = {
  // Mock Firestore instance
  useFirestoreInstance: jest.fn(() => [{}]),
  
  // Mock user role
  useUserRole: jest.fn(() => ({ role: 'user' })),
  
  // Mock city
  useUserCity: jest.fn(() => ({ currentCityId: 'berlin' })),
};

// Setup default mocks
jest.mock('../useFirestoreInstance', () => ({
  useFirestoreInstance: () => defaultMocks.useFirestoreInstance(),
}));

jest.mock('../useUserRole', () => ({
  useUserRole: () => defaultMocks.useUserRole(),
}));

jest.mock('../useCities', () => ({
  useUserCity: () => defaultMocks.useUserCity(),
}));

// -----------------------------------------------------------------------

describe('useUgcModeration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset default mock implementations
    defaultMocks.useFirestoreInstance.mockImplementation(() => [{}]);
    defaultMocks.useUserRole.mockImplementation(() => ({ role: 'user' }));
    defaultMocks.useUserCity.mockImplementation(() => ({ currentCityId: 'berlin' }));
  });
  
  it('returns false when Firestore is unavailable during submit', async () => {
    // Override the mock to return null (no Firestore)
    defaultMocks.useFirestoreInstance.mockImplementation(() => [null]);
    
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
  
  it('successfully submits content for moderation', async () => {
    const { result } = renderHook(() => useUgcModeration());

    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitForModeration(
        'comment',
        'new-comment-id',
        { text: 'Great event!', userId: 'user-1' }
      );
    });

    expect(submitResult).toBe(true);
    expect(mockCollection).toHaveBeenCalledWith('moderation');
    expect(mockAddDoc).toHaveBeenCalled();
    
    // Verify the submitted data includes required fields
    const addDocArgs = mockAddDoc.mock.calls[0][1];
    expect(addDocArgs.contentId).toBe('new-comment-id');
    expect(addDocArgs.contentType).toBe('comment');
    expect(addDocArgs.status).toBe('pending');
    expect(addDocArgs.cityId).toBe('berlin'); // City scoping enforced
  });
  
  it('returns correct moderation status for content', async () => {
    const { result } = renderHook(() => useUgcModeration());

    // Check status of approved content
    let status: string | null = null;
    await act(async () => {
      status = await result.current.checkModerationStatus('comment', 'comment-2');
    });
    expect(status).toBe('approved');

    // Check status of pending content
    await act(async () => {
      status = await result.current.checkModerationStatus('comment', 'comment-1');
    });
    expect(status).toBe('pending');

    // Check status of rejected content
    await act(async () => {
      status = await result.current.checkModerationStatus('comment', 'comment-3');
    });
    expect(status).toBe('rejected');

    // Check status of non-existent content
    await act(async () => {
      status = await result.current.checkModerationStatus('comment', 'non-existent');
    });
    expect(status).toBeNull();
  });
  
  it('enforces city scoping for moderation', async () => {
    const { result } = renderHook(() => useUgcModeration());

    // Try to check status of content from another city
    let status: string | null = null;
    await act(async () => {
      status = await result.current.checkModerationStatus('event', 'event-1');
    });
    
    // Should not find content from another city
    expect(status).toBeNull();
    
    // Verify city filter was applied in the query
    expect(mockWhere).toHaveBeenCalledWith('cityId', '==', 'berlin');
  });
  
  it('allows admin to approve content', async () => {
    // Set user role to admin
    defaultMocks.useUserRole.mockImplementation(() => ({ role: 'admin' }));
    
    const { result } = renderHook(() => useUgcModeration());

    let approveResult: boolean = false;
    await act(async () => {
      approveResult = await result.current.approveContent('mod-1');
    });

    expect(approveResult).toBe(true);
    expect(mockDoc).toHaveBeenCalledWith('moderation', 'mod-1');
    expect(mockUpdateDoc).toHaveBeenCalled();
    
    // Verify the update data
    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(updateData.status).toBe('approved');
    expect(updateData.moderatedBy).toBeDefined();
    expect(updateData.moderatedAt).toBeDefined();
  });
  
  it('prevents non-admin users from approving content', async () => {
    // Set user role to regular user
    defaultMocks.useUserRole.mockImplementation(() => ({ role: 'user' }));
    
    const { result } = renderHook(() => useUgcModeration());

    let approveResult: boolean = false;
    await act(async () => {
      approveResult = await result.current.approveContent('mod-1');
    });

    expect(approveResult).toBe(false);
    expect(mockUpdateDoc).not.toHaveBeenCalled();
    expect(result.current.error).not.toBeNull();
  });
  
  it('allows admin to reject content with reason', async () => {
    // Set user role to admin
    defaultMocks.useUserRole.mockImplementation(() => ({ role: 'admin' }));
    
    const { result } = renderHook(() => useUgcModeration());

    let rejectResult: boolean = false;
    await act(async () => {
      rejectResult = await result.current.rejectContent('mod-1', 'Violates guidelines');
    });

    expect(rejectResult).toBe(true);
    expect(mockDoc).toHaveBeenCalledWith('moderation', 'mod-1');
    expect(mockUpdateDoc).toHaveBeenCalled();
    
    // Verify the update data
    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(updateData.status).toBe('rejected');
    expect(updateData.reason).toBe('Violates guidelines');
    expect(updateData.moderatedBy).toBeDefined();
    expect(updateData.moderatedAt).toBeDefined();
  });
  
  it('handles AI screening during submission if provided', async () => {
    // Mock AI screening function
    const mockAiScreen = jest.fn().mockResolvedValue(['potentially_offensive']);
    
    const { result } = renderHook(() => useUgcModeration({ aiScreen: mockAiScreen }));

    await act(async () => {
      await result.current.submitForModeration(
        'comment',
        'new-comment-id',
        { text: 'Questionable content', userId: 'user-1' }
      );
    });

    // Verify AI screening was called
    expect(mockAiScreen).toHaveBeenCalledWith(
      'comment', 
      { text: 'Questionable content', userId: 'user-1' }
    );
    
    // Verify AI flags were included in submission
    const addDocArgs = mockAddDoc.mock.calls[0][1];
    expect(addDocArgs.aiFlags).toEqual(['potentially_offensive']);
  });
});
