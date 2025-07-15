import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Event } from '../types/events';

interface UseMapEventsOptions {
  cityId: string;
  filters?: {
    ageRange?: [number, number];
    categories?: string[];
    date?: Date;
    free?: boolean;
  };
  radius?: number; // in kilometers
  center?: {
    latitude: number;
    longitude: number;
  };
  limit?: number;
}

/**
 * Custom hook to fetch events for the map view with filtering options
 */
export const useMapEvents = ({
  cityId,
  filters,
  radius = 10,
  center,
  limit: eventLimit = 50,
}: UseMapEventsOptions) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        // Start with base query for the city
        let eventsQuery = query(
          collection(firestore, 'events'),
          where('cityId', '==', cityId),
          where('isApproved', '==', true),
          where('startDate', '>=', new Date()),
          orderBy('startDate', 'asc'),
          limit(eventLimit)
        );

        // Apply filters if provided
        if (filters) {
          // Age range filter
          if (filters.ageRange) {
            const [minAge, maxAge] = filters.ageRange;
            eventsQuery = query(
              eventsQuery,
              where('minAge', '<=', maxAge),
              where('maxAge', '>=', minAge)
            );
          }

          // Categories filter
          if (filters.categories && filters.categories.length > 0) {
            eventsQuery = query(
              eventsQuery,
              where('categories', 'array-contains-any', filters.categories)
            );
          }

          // Date filter
          if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            
            eventsQuery = query(
              eventsQuery,
              where('startDate', '>=', startOfDay),
              where('startDate', '<=', endOfDay)
            );
          }

          // Free events filter
          if (filters.free) {
            eventsQuery = query(eventsQuery, where('isFree', '==', true));
          }
        }

        const querySnapshot = await getDocs(eventsQuery);
        const eventsData: Event[] = [];

        querySnapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() } as Event);
        });

        // If center coordinates are provided, filter events by distance
        if (center) {
          const filteredEvents = eventsData.filter((event) => {
            if (!event.location?.coordinates) return false;
            
            // Calculate distance using Haversine formula
            const distance = calculateDistance(
              center.latitude,
              center.longitude,
              event.location.coordinates.latitude,
              event.location.coordinates.longitude
            );
            
            return distance <= radius;
          });
          
          setEvents(filteredEvents);
        } else {
          setEvents(eventsData);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [cityId, filters, radius, center, eventLimit]);

  return { events, loading, error };
};

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export default useMapEvents;
