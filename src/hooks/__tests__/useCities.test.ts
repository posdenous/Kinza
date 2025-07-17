import { renderHook } from '@testing-library/react-native';
import { useCities } from '../useCities';

// Mock Firebase and related hooks so the hook can run in isolation
jest.mock('../useFirestoreInstance', () => ({
  useFirestoreInstance: () => [null], // no Firestore available
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
}));

describe('useCities', () => {
  it('returns default state when firestore is unavailable', () => {
    const { result } = renderHook(() => useCities());
    expect(result.current.cities).toEqual([]);
    // Loading should still be true on first render
    expect(result.current.loading).toBe(true);
  });
});
