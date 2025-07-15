import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, startAt, endAt, Firestore } from 'firebase/firestore';
import { useFirestore } from 'react-firebase-hooks/firestore';
import { getAuth } from 'firebase/auth';
import { useUserRole } from './useUserRole';

export type SearchResultType = 'event' | 'venue' | 'profile';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  date?: Date;
  address?: string;
  distance?: number; // in km
  ageRange?: string;
  rating?: number;
}

interface SearchOptions {
  query: string;
  types?: SearchResultType[];
  categories?: string[];
  ageRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  distance?: number; // in km
  limit?: number;
  cityId: string;
}

export const useSearch = (options: SearchOptions) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [firestore] = useFirestore();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchResults = async () => {
      if (!options.query || options.query.length < 2 || !firestore || roleLoading) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults: SearchResult[] = [];
        const { query: searchQuery, types, categories, ageRange, dateRange, limit: resultLimit = 20, cityId } = options;

        // Normalize the search query for better matching
        const normalizedQuery = searchQuery.toLowerCase().trim();
        const queryStart = normalizedQuery;
        const queryEnd = normalizedQuery + '\uf8ff'; // Unicode character for end of string search

        // Search events
        if (!types || types.includes('event')) {
          const eventsRef = collection(firestore, 'events');
          let eventsQuery = query(
            eventsRef,
            where('cityId', '==', cityId), // City scoping rule
            where('status', '==', 'approved'), // Only show approved events
            where('searchableTitle', '>=', queryStart),
            where('searchableTitle', '<=', queryEnd),
            orderBy('searchableTitle'),
            limit(resultLimit)
          );

          // Apply category filter if provided
          if (categories && categories.length > 0) {
            eventsQuery = query(eventsQuery, where('category', 'in', categories));
          }

          // Apply age range filter if provided
          if (ageRange) {
            eventsQuery = query(
              eventsQuery,
              where('minAge', '<=', ageRange.max),
              where('maxAge', '>=', ageRange.min)
            );
          }

          // Apply date range filter if provided
          if (dateRange) {
            eventsQuery = query(
              eventsQuery,
              where('startDate', '>=', dateRange.start),
              where('startDate', '<=', dateRange.end)
            );
          }

          const eventSnapshot = await getDocs(eventsQuery);
          
          eventSnapshot.forEach((doc) => {
            const eventData = doc.data();
            searchResults.push({
              id: doc.id,
              type: 'event',
              title: eventData.title,
              description: eventData.description,
              imageUrl: eventData.imageUrl,
              category: eventData.category,
              date: eventData.startDate?.toDate(),
              address: eventData.venue?.address,
              ageRange: `${eventData.minAge}-${eventData.maxAge}`,
              rating: eventData.rating
            });
          });
        }

        // Search venues
        if (!types || types.includes('venue')) {
          const venuesRef = collection(firestore, 'venues');
          let venuesQuery = query(
            venuesRef,
            where('cityId', '==', cityId), // City scoping rule
            where('searchableName', '>=', queryStart),
            where('searchableName', '<=', queryEnd),
            orderBy('searchableName'),
            limit(resultLimit)
          );

          // Apply category filter if provided
          if (categories && categories.length > 0) {
            venuesQuery = query(venuesQuery, where('category', 'in', categories));
          }

          const venueSnapshot = await getDocs(venuesQuery);
          
          venueSnapshot.forEach((doc) => {
            const venueData = doc.data();
            searchResults.push({
              id: doc.id,
              type: 'venue',
              title: venueData.name,
              description: venueData.description,
              imageUrl: venueData.imageUrl,
              category: venueData.category,
              address: venueData.address,
              distance: venueData.distance,
              rating: venueData.rating
            });
          });
        }

        // Search profiles (only for admin users)
        if ((userRole === 'admin') && (!types || types.includes('profile'))) {
          const profilesRef = collection(firestore, 'users');
          let profilesQuery = query(
            profilesRef,
            where('cityId', '==', cityId), // City scoping rule
            where('searchableName', '>=', queryStart),
            where('searchableName', '<=', queryEnd),
            orderBy('searchableName'),
            limit(resultLimit)
          );

          const profileSnapshot = await getDocs(profilesQuery);
          
          profileSnapshot.forEach((doc) => {
            const profileData = doc.data();
            searchResults.push({
              id: doc.id,
              type: 'profile',
              title: profileData.displayName,
              description: profileData.bio,
              imageUrl: profileData.photoURL,
              category: profileData.role
            });
          });
        }

        // Sort results by relevance (exact matches first, then partial matches)
        searchResults.sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          
          if (aTitle === normalizedQuery && bTitle !== normalizedQuery) return -1;
          if (bTitle === normalizedQuery && aTitle !== normalizedQuery) return 1;
          
          if (aTitle.startsWith(normalizedQuery) && !bTitle.startsWith(normalizedQuery)) return -1;
          if (bTitle.startsWith(normalizedQuery) && !aTitle.startsWith(normalizedQuery)) return 1;
          
          return aTitle.localeCompare(bTitle);
        });

        setResults(searchResults);
      } catch (err) {
        console.error('Error searching:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred during search'));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [options, firestore, userRole, roleLoading]);

  return { results, loading, error };
};
