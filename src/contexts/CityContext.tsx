/**
 * City Context
 * 
 * Provides city-related state and functions to components throughout the app
 * Enforces city scoping rule by ensuring all data is scoped to the current city
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { useFirestoreInstance } from '../hooks/useFirestoreInstance';
import { useAuth } from '../hooks/useAuth';

export interface City {
  id: string;
  name: string;
  country: string;
  isActive: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  languageCode: string;
}

interface CityContextType {
  cities: City[];
  currentCity: City | null;
  currentCityId: string | null;
  setCurrentCityId: (cityId: string) => void;
  isLoading: boolean;
  error: Error | null;
  refreshCities: () => Promise<void>;
}

// Create the context with a default value
const CityContext = createContext<CityContextType>({
  cities: [],
  currentCity: null,
  currentCityId: null,
  setCurrentCityId: () => {},
  isLoading: false,
  error: null,
  refreshCities: async () => {},
});

interface CityProviderProps {
  children: ReactNode;
  defaultCityId?: string;
}

/**
 * City Provider Component
 * Manages city state and provides it to the app
 */
export const CityProvider: React.FC<CityProviderProps> = ({ 
  children,
  defaultCityId = 'berlin' // Default to Berlin if not specified
}) => {
  const { t } = useTranslation();
  const [firestore] = useFirestoreInstance();
  const { user } = useAuth();
  
  const [cities, setCities] = useState<City[]>([]);
  const [currentCityId, setCurrentCityId] = useState<string | null>(defaultCityId);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all available cities
  const fetchCities = async (): Promise<void> => {
    if (!firestore) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const citiesRef = collection(firestore, 'cities');
      const q = query(citiesRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);
      
      const citiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as City));
      
      setCities(citiesData);
      
      // If we don't have a current city yet, set it to the default
      if (!currentCityId && citiesData.length > 0) {
        const defaultCity = citiesData.find(city => city.id === defaultCityId) || citiesData[0];
        setCurrentCityId(defaultCity.id);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's preferred city from profile if available
  const fetchUserCity = async (): Promise<void> => {
    if (!firestore || !user) return;
    
    try {
      const userProfileRef = doc(firestore, 'profiles', user.uid);
      const profileSnap = await getDoc(userProfileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        if (profileData.preferredCityId) {
          setCurrentCityId(profileData.preferredCityId);
        }
      }
    } catch (err) {
      console.error('Error fetching user city preference:', err);
    }
  };

  // Refresh cities data
  const refreshCities = async (): Promise<void> => {
    await fetchCities();
  };

  // Initial fetch of cities
  useEffect(() => {
    fetchCities();
  }, [firestore]);

  // Fetch user's preferred city when user changes
  useEffect(() => {
    if (user) {
      fetchUserCity();
    }
  }, [user, firestore]);

  // Update current city when currentCityId or cities change
  useEffect(() => {
    if (currentCityId && cities.length > 0) {
      const city = cities.find(city => city.id === currentCityId);
      setCurrentCity(city || null);
    } else {
      setCurrentCity(null);
    }
  }, [currentCityId, cities]);

  // Context value
  const value: CityContextType = {
    cities,
    currentCity,
    currentCityId,
    setCurrentCityId,
    isLoading,
    error,
    refreshCities,
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};

/**
 * Custom hook to use the city context
 */
export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  
  return context;
};

export default CityContext;
