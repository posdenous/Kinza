import { useState, useEffect, useCallback } from 'react';
import { Event } from '../types/Event';
import { eventScrapingService, ScrapedEvent, ScrapingOptions, ScrapingResult } from '../services/eventScrapingService';
import { useAuth } from './useAuth';

export interface SearchFilters {
  query?: string;
  categories?: string[];
  minAge?: number;
  maxAge?: number;
  isFree?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  kidsOnlyMode?: boolean;
}

export interface SearchResult {
  localEvents: Event[];
  scrapedEvents: ScrapedEvent[];
  totalCount: number;
  scrapingResult?: ScrapingResult;
  isLoading: boolean;
  error: string | null;
}

export const useEnhancedSearch = (cityId: string) => {
  const { user } = useAuth();
  const [searchResult, setSearchResult] = useState<SearchResult>({
    localEvents: [],
    scrapedEvents: [],
    totalCount: 0,
    isLoading: false,
    error: null
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  /**
   * Search both local events and scraped events
   */
  const searchEvents = useCallback(async (filters: SearchFilters) => {
    setSearchResult(prev => ({ ...prev, isLoading: true, error: null }));
    setIsSearching(true);
    setSearchError(null);

    try {
      // Search local events (existing Firestore events)
      const localEventsPromise = searchLocalEvents(filters);
      
      // Always search scraped events for comprehensive results
      const scrapedEventsPromise = searchScrapedEvents(filters);

      const [localEvents, scrapingResult] = await Promise.all([
        localEventsPromise,
        scrapedEventsPromise
      ]);

      const scrapedEvents = scrapingResult?.events || [];
      
      setSearchResult({
        localEvents,
        scrapedEvents,
        totalCount: localEvents.length + scrapedEvents.length,
        scrapingResult: scrapingResult || undefined,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Enhanced search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setSearchError(errorMessage);
      setSearchResult(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    } finally {
      setIsSearching(false);
    }
  }, [cityId]);

  /**
   * Search local Firestore events
   */
  const searchLocalEvents = async (filters: SearchFilters): Promise<Event[]> => {
    // In production, this would query your Firestore events collection
    // For demo purposes, return empty array since we're focusing on scraping
    return [];
  };

  /**
   * Search scraped events using the scraping service
   */
  const searchScrapedEvents = async (filters: SearchFilters): Promise<ScrapingResult | null> => {
    const scrapingOptions: ScrapingOptions = {
      maxAge: filters.maxAge,
      minAge: filters.minAge,
      categories: filters.categories,
      kidsOnly: filters.kidsOnlyMode,
      maxResults: 20,
      dateRange: filters.dateRange
    };

    return await eventScrapingService.searchEvents(filters.query || '', scrapingOptions);
  };

  /**
   * Convert scraped events to Kinza format and save them
   */
  const saveScrapedEvent = useCallback(async (scrapedEvent: ScrapedEvent): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to save events');
    }

    try {
      const kinzaEvents = eventScrapingService.convertToKinzaEvents([scrapedEvent], cityId);
      const eventToSave = kinzaEvents[0];

      // In production, save to Firestore with proper validation
      console.log('Saving scraped event:', eventToSave);
      
      // Add to local events list for immediate UI update
      setSearchResult(prev => ({
        ...prev,
        localEvents: [...prev.localEvents, eventToSave as Event],
        scrapedEvents: prev.scrapedEvents.filter(e => e.title !== scrapedEvent.title)
      }));

    } catch (error) {
      console.error('Failed to save scraped event:', error);
      throw error;
    }
  }, [user, cityId]);

  /**
   * Get smart search suggestions based on user preferences
   */
  const getSearchSuggestions = useCallback(async (query: string): Promise<string[]> => {
    // In production, this could analyze user's past searches and preferences
    const commonSuggestions = [
      'kinderworkshop',
      'familientag',
      'zoo',
      'museum',
      'spielplatz',
      'basteln',
      'sport für kinder',
      'musik für familien'
    ];

    if (!query.trim()) {
      return commonSuggestions.slice(0, 5);
    }

    return commonSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  /**
   * Quick search for kid-friendly events
   */
  const quickKidsSearch = useCallback(async () => {
    await searchEvents({
      query: '',
      kidsOnlyMode: true,
      maxAge: 12,
      categories: ['educational', 'arts', 'outdoor']
    });
  }, [searchEvents]);

  /**
   * Search for free family events
   */
  const searchFreeEvents = useCallback(async () => {
    await searchEvents({
      query: '',
      isFree: true,
      kidsOnlyMode: true,
      maxAge: 16
    });
  }, [searchEvents]);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setSearchResult({
      localEvents: [],
      scrapedEvents: [],
      totalCount: 0,
      isLoading: false,
      error: null
    });
  }, []);

  return {
    searchResult,
    searchEvents,
    saveScrapedEvent,
    getSearchSuggestions,
    quickKidsSearch,
    searchFreeEvents,
    clearSearch,
    isLoading: isSearching || searchResult.isLoading,
    error: searchError || searchResult.error
  };
};
