import { renderHook, act } from '@testing-library/react-native';
import { useCities, useUserCity } from '../useCities';
import { City } from '../useCities';

// Mock data
const mockCities: City[] = [
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'DE',
    isActive: true,
    coordinates: { latitude: 52.52, longitude: 13.405 },
    timezone: 'Europe/Berlin',
    locales: ['en', 'de']
  },
  {
    id: 'munich',
    name: 'Munich',
    country: 'DE',
    isActive: true,
    coordinates: { latitude: 48.137, longitude: 11.576 },
    timezone: 'Europe/Berlin',
    locales: ['en', 'de']
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'IT',
    isActive: false, // Inactive city
    coordinates: { latitude: 41.902, longitude: 12.496 },
    timezone: 'Europe/Rome',
    locales: ['en', 'it']
  }
];

// Mock Firebase Firestore
const mockGetDocs = jest.fn();
const mockGetDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (firestore: any, path: string) => {
    mockCollection(path);
    return { path };
  },
  query: (collectionRef: any) => {
    mockQuery(collectionRef);
    return collectionRef;
  },
  getDocs: async (query: any) => {
    mockGetDocs(query);
    return {
      forEach: (callback: (doc: any) => void) => {
        mockCities.forEach((city, index) => {
          callback({
            id: city.id,
            data: () => ({ ...city, id: undefined }),
          });
        });
      }
    };
  },
  doc: (firestore: any, collection: string, id: string) => {
    mockDoc(collection, id);
    return { collection, id };
  },
  getDoc: async (docRef: any) => {
    mockGetDoc(docRef);
    // Simulate user document with cityId
    if (docRef.collection === 'users' && docRef.id === 'test-user-id') {
      return {
        exists: () => true,
        data: () => ({ cityId: 'berlin' })
      };
    }
    // Simulate non-existent document
    return {
      exists: () => false,
      data: () => null
    };
  }
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null // Default to no user
  }))
}));

// Mock useFirestoreInstance
jest.mock('../useFirestoreInstance', () => ({
  useFirestoreInstance: jest.fn(() => [{}]) // Mock Firestore instance
}));

// Mock localStorage for browser environments
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('useCities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('returns default state when firestore is unavailable', () => {
    // Override the mock to return null
    require('../useFirestoreInstance').useFirestoreInstance.mockReturnValueOnce([null]);
    
    const { result } = renderHook(() => useCities());
    expect(result.current.cities).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('fetches cities from firestore', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCities());
    
    // Initial state
    expect(result.current.loading).toBe(true);
    
    // Wait for the async effect to complete
    await waitForNextUpdate();
    
    // Verify the correct data is returned
    expect(result.current.cities).toHaveLength(mockCities.length);
    expect(result.current.cities[0].id).toBe('berlin');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Verify Firestore was called correctly
    expect(mockCollection).toHaveBeenCalledWith('cities');
    expect(mockGetDocs).toHaveBeenCalled();
  });

  it('handles errors when fetching cities', async () => {
    // Mock getDocs to throw an error
    require('firebase/firestore').getDocs.mockImplementationOnce(() => {
      throw new Error('Failed to fetch cities');
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useCities());
    
    // Wait for the async effect to complete
    await waitForNextUpdate();
    
    // Verify error handling
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch cities');
    expect(result.current.cities).toEqual([]);
  });
});

describe('useUserCity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('returns null city when not logged in and no localStorage', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserCity());
    
    // Wait for the async effect to complete
    await waitForNextUpdate();
    
    // Should default to null when no user and no localStorage
    expect(result.current.currentCityId).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('gets city from user profile when logged in', async () => {
    // Mock logged in user
    require('firebase/auth').getAuth.mockReturnValueOnce({
      currentUser: { uid: 'test-user-id' }
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useUserCity());
    
    // Wait for the async effect to complete
    await waitForNextUpdate();
    
    // Should get city from user profile
    expect(result.current.currentCityId).toBe('berlin');
    expect(mockDoc).toHaveBeenCalledWith('users', 'test-user-id');
    expect(mockGetDoc).toHaveBeenCalled();
  });

  it('falls back to localStorage when user has no city preference', async () => {
    // Mock logged in user with no city preference
    require('firebase/auth').getAuth.mockReturnValueOnce({
      currentUser: { uid: 'user-without-city' }
    });
    
    // Set localStorage city
    localStorageMock.setItem('kinza_city_id', 'munich');
    
    const { result, waitForNextUpdate } = renderHook(() => useUserCity());
    
    // Wait for the async effect to complete
    await waitForNextUpdate();
    
    // Should fall back to localStorage
    expect(result.current.currentCityId).toBe('munich');
  });

  it('falls back to first active city when no preference exists', async () => {
    // Mock no user and empty localStorage
    require('firebase/auth').getAuth.mockReturnValueOnce({
      currentUser: null
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useUserCity());
    
    // Wait for the async effect to complete
    await waitForNextUpdate();
    
    // Should default to first active city (Berlin)
    expect(result.current.currentCityId).toBe('berlin');
  });

  it('provides the current city object', async () => {
    // Set localStorage city
    localStorageMock.setItem('kinza_city_id', 'berlin');
    
    const { result, waitForNextUpdate } = renderHook(() => useUserCity());
    
    // Wait for the async effect to complete
    await waitForNextUpdate();
    
    // Should provide the full city object
    expect(result.current.currentCity).toBeDefined();
    expect(result.current.currentCity?.id).toBe('berlin');
    expect(result.current.currentCity?.name).toBe('Berlin');
  });

  it('allows changing the current city', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserCity());
    
    // Wait for initial load
    await waitForNextUpdate();
    
    // Change city
    act(() => {
      result.current.changeCity('munich');
    });
    
    // Should update currentCityId
    expect(result.current.currentCityId).toBe('munich');
    
    // Should save to localStorage
    expect(localStorageMock.getItem('kinza_city_id')).toBe('munich');
  });

  it('prevents changing to inactive cities', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserCity());
    
    // Wait for initial load
    await waitForNextUpdate();
    
    // Try to change to inactive city
    act(() => {
      result.current.changeCity('rome');
    });
    
    // Should not update to inactive city
    expect(result.current.currentCityId).not.toBe('rome');
  });
});
