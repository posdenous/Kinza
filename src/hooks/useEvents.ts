import { useState, useEffect } from 'react';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  cityId: string;
  organizerId: string;
  ageRange?: {
    min: number;
    max: number;
  };
  category?: string;
  isApproved?: boolean;
}

export interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: (cityId?: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const useEvents = (cityId?: string): EventsState => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockEvents: Event[] = [
    {
      id: 'event-1',
      title: 'Berlin Zoo Family Day',
      description: 'A fun day at the zoo for families',
      startTime: new Date('2024-01-15T10:00:00'),
      endTime: new Date('2024-01-15T16:00:00'),
      location: 'Berlin Zoo',
      cityId: 'berlin',
      organizerId: 'org-1',
      ageRange: { min: 0, max: 12 },
      category: 'outdoor',
      isApproved: true
    },
    {
      id: 'event-2',
      title: 'Children\'s Art Workshop',
      description: 'Creative art activities for kids',
      startTime: new Date('2024-01-16T14:00:00'),
      endTime: new Date('2024-01-16T17:00:00'),
      location: 'Community Center',
      cityId: 'berlin',
      organizerId: 'org-2',
      ageRange: { min: 5, max: 10 },
      category: 'creative',
      isApproved: true
    }
  ];

  const fetchEvents = async (filterCityId?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter by city if provided
      const filteredEvents = filterCityId 
        ? mockEvents.filter(event => event.cityId === filterCityId)
        : mockEvents;
      
      setEvents(filteredEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    await fetchEvents(cityId);
  };

  useEffect(() => {
    fetchEvents(cityId);
  }, [cityId]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    refreshEvents
  };
};
