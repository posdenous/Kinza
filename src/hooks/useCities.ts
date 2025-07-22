import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFirestoreInstance } from './useFirestoreInstance';
import { getAuth } from 'firebase/auth';
import { useApiWithRetry } from './common/useApiWithRetry';

export interface City {
  id: string;
  name: string;
  country: string;
  isActive: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  locales: string[]; // Supported languages for this city
}

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [firestore] = useFirestoreInstance();
  const auth = getAuth();

  // Create API call function for retry logic
  const fetchCitiesApiCall = useCallback(async () => {
    if (!firestore) throw new Error('Firestore not initialized');

    const citiesRef = collection(firestore, 'cities');
    const citiesQuery = query(citiesRef);
    const citiesSnapshot = await getDocs(citiesQuery);
    
    const citiesData: City[] = [];
    
    citiesSnapshot.forEach((doc) => {
      const cityData = doc.data() as Omit<City, 'id'>;
      citiesData.push({
        id: doc.id,
        ...cityData
      });
    });
    
    // Sort cities by name
    citiesData.sort((a, b) => a.name.localeCompare(b.name));
    
    return citiesData;
  }, [firestore]);

  // Use retry-enabled API call for fetching cities
  const { execute: fetchCitiesWithRetry, isRetrying } = useApiWithRetry(
    fetchCitiesApiCall,
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  );

  useEffect(() => {
    const fetchCities = async () => {
      if (!firestore) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchCitiesWithRetry();
        setCities(result);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [firestore, fetchCitiesWithRetry]);

  return { cities, loading: loading || isRetrying, error };
};

export const useUserCity = () => {
  const [currentCityId, setCurrentCityId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [firestore] = useFirestoreInstance();
  const auth = getAuth();
  const user = auth.currentUser;
  const { cities, loading: citiesLoading } = useCities();

  // Create API call function for retry logic
  const fetchUserCityApiCall = useCallback(async () => {
    if (!firestore) throw new Error('Firestore not initialized');
    if (citiesLoading) throw new Error('Cities still loading');

    // If user is logged in, get their city preference from their profile
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.cityId) {
          // Verify that the city exists and is active
          const cityExists = cities.some(city => city.id === userData.cityId && city.isActive);
          
          if (cityExists) {
            return userData.cityId;
          }
        }
      }
    }
    
    // If no user city preference or it's invalid, use the first active city
    const defaultCity = cities.find(city => city.isActive);
    if (defaultCity) {
      return defaultCity.id;
    } else {
      // If no active cities, use the first city
      if (cities.length > 0) {
        return cities[0].id;
      }
    }
    
    return null;
  }, [firestore, user, cities, citiesLoading]);

  // Use retry-enabled API call for fetching user city
  const { execute: fetchUserCityWithRetry, isRetrying } = useApiWithRetry(
    fetchUserCityApiCall,
    {
      maxRetries: 2,
      baseDelay: 500,
    }
  );

  useEffect(() => {
    const fetchUserCity = async () => {
      if (!firestore || citiesLoading) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchUserCityWithRetry();
        setCurrentCityId(result);
      } catch (err) {
        console.error('Error fetching user city:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserCity();
  }, [firestore, fetchUserCityWithRetry, citiesLoading]);

  // Get the current city object
  const currentCity = cities.find(city => city.id === currentCityId) || null;

  return { 
    currentCityId, 
    currentCity,
    loading: loading || citiesLoading || isRetrying, 
    error,
    cities
  };
};
