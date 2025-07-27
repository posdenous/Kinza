import { Event } from '../types/Event';

export interface ScrapedEvent {
  title: string;
  description: string;
  venue?: string;
  address?: string;
  startDate: Date;
  startTime?: string;
  endDate?: Date;
  endTime?: string;
  minAge?: number;
  maxAge?: number;
  isFree: boolean;
  price?: number;
  categories: string[];
  source: 'berlin.de' | 'google-maps';
  sourceUrl?: string;
  kidFriendly: boolean;
  excludeReason?: string;
}

export interface ScrapingOptions {
  maxAge?: number;
  minAge?: number;
  categories?: string[];
  kidsOnly?: boolean;
  maxResults?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ScrapingResult {
  events: ScrapedEvent[];
  totalFound: number;
  kidFriendlyCount: number;
  excludedCount: number;
  source: string;
  scrapedAt: Date;
}

class EventScrapingService {
  private readonly API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Kid-friendly filtering keywords
  private readonly EXCLUDE_KEYWORDS = [
    'alkohol', 'bier', 'wein', 'cocktail', 'bar', 'club', 'party', '18+', '21+',
    'casino', 'glücksspiel', 'poker', 'gambling', 'horror', 'gewalt', 'violence',
    'erotik', 'adult', 'erwachsene', 'nachtleben', 'nightlife'
  ];

  private readonly INCLUDE_KEYWORDS = [
    'kinder', 'familie', 'family', 'jugend', 'baby', 'spielen', 'lernen',
    'workshop', 'basteln', 'kreativ', 'entdecken', 'museum', 'zoo', 'park',
    'spielplatz', 'bibliothek', 'kindermuseum', 'familientag'
  ];

  private readonly CATEGORY_KEYWORDS = {
    outdoor: ['park', 'zoo', 'garten', 'spielplatz', 'outdoor', 'natur', 'spaziergang', 'wandern'],
    indoor: ['museum', 'bibliothek', 'theater', 'kino', 'indoor', 'werkstatt', 'atelier'],
    educational: ['museum', 'lernen', 'workshop', 'bildung', 'wissenschaft', 'experiment', 'entdecken'],
    sports: ['sport', 'schwimmen', 'klettern', 'fußball', 'basketball', 'bewegung', 'fitness'],
    arts: ['kunst', 'malen', 'basteln', 'kreativ', 'musik', 'theater', 'tanz', 'zeichnen'],
    music: ['musik', 'konzert', 'singen', 'instrument', 'chor', 'band', 'klavier']
  };

  /**
   * Search for kid-friendly events using scraping
   */
  async searchEvents(query: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    try {
      // For production, this would call your backend scraping API
      // For demo purposes, we'll simulate the scraping process
      const scrapedEvents = await this.simulateEventScraping(query, options);
      
      // Apply kid-friendly filtering
      const filteredEvents = this.applyKidFriendlyFilter(scrapedEvents, options);
      
      return {
        events: filteredEvents,
        totalFound: scrapedEvents.length,
        kidFriendlyCount: filteredEvents.length,
        excludedCount: scrapedEvents.length - filteredEvents.length,
        source: 'berlin.de',
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error('Event scraping failed:', error);
      throw new Error('Failed to scrape events');
    }
  }

  /**
   * Convert scraped events to Kinza Event format
   */
  convertToKinzaEvents(scrapedEvents: ScrapedEvent[], cityId: string = 'berlin'): Partial<Event>[] {
    return scrapedEvents.map(event => ({
      title: event.title,
      description: event.description,
      location: {
        name: event.venue || '',
        address: event.address || '',
        coordinates: undefined // Would be geocoded in production
      },
      startDate: event.startDate,
      endDate: event.endDate,
      categories: event.categories,
      minAge: event.minAge,
      maxAge: event.maxAge,
      isFree: event.isFree,
      price: event.price,
      images: [], // Would extract images in production
      organiser: {
        id: 'scraped',
        name: event.source === 'berlin.de' ? 'Berlin.de' : 'Google Maps'
      },
      cityId,
      source: 'scraped',
      sourceUrl: event.sourceUrl,
      status: 'pending', // Requires moderation
      kidFriendly: event.kidFriendly
    }));
  }

  /**
   * Apply kid-friendly content filtering
   */
  private applyKidFriendlyFilter(events: ScrapedEvent[], options: ScrapingOptions): ScrapedEvent[] {
    return events.filter(event => {
      // Age filtering
      if (options.maxAge && event.minAge && event.minAge > options.maxAge) {
        event.excludeReason = `min age ${event.minAge} > ${options.maxAge}`;
        return false;
      }

      if (options.minAge && event.maxAge && event.maxAge < options.minAge) {
        event.excludeReason = `max age ${event.maxAge} < ${options.minAge}`;
        return false;
      }

      // Kids-only mode filtering
      if (options.kidsOnly) {
        const content = `${event.title} ${event.description}`.toLowerCase();
        
        // Check for exclusion keywords
        const hasExcludeKeywords = this.EXCLUDE_KEYWORDS.some(keyword => 
          content.includes(keyword.toLowerCase())
        );
        
        if (hasExcludeKeywords) {
          const foundKeywords = this.EXCLUDE_KEYWORDS.filter(keyword => 
            content.includes(keyword.toLowerCase())
          );
          event.excludeReason = `contains: ${foundKeywords.join(', ')}`;
          return false;
        }
      }

      // Category filtering
      if (options.categories && options.categories.length > 0) {
        const hasAllowedCategory = event.categories.some(category => 
          options.categories!.includes(category)
        );
        
        if (!hasAllowedCategory) {
          event.excludeReason = `categories ${event.categories.join(', ')} not in allowed list`;
          return false;
        }
      }

      // Mark as kid-friendly if it passes all filters
      event.kidFriendly = true;
      return true;
    });
  }

  /**
   * Smart categorization based on content analysis
   */
  private categorizeEvent(event: ScrapedEvent): string[] {
    const content = `${event.title} ${event.description} ${event.venue}`.toLowerCase();
    const categories: string[] = [];
    const categoryScores: { [key: string]: number } = {};

    // Score each category based on keyword matches
    Object.entries(this.CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (content.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (score > 0) {
        categoryScores[category] = score;
      }
    });

    // Get top 3 categories by score
    const sortedCategories = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return sortedCategories.length > 0 ? sortedCategories : ['indoor']; // Default fallback
  }

  /**
   * Simulate event scraping (replace with actual scraping in production)
   */
  private async simulateEventScraping(query: string, options: ScrapingOptions): Promise<ScrapedEvent[]> {
    // In production, this would make actual HTTP requests to berlin.de and Google Maps
    // For demo purposes, return sample data that matches the query
    
    const sampleEvents: ScrapedEvent[] = [
      {
        title: "Kinderworkshop: Drucktechniken",
        description: "Familien und Kinder ab 6 Jahren können verschiedene Drucktechniken ausprobieren und kreative Kunstwerke erstellen.",
        venue: "Ephraim-Palais",
        address: "Poststraße 16, 10178 Berlin",
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: "10:00",
        minAge: 6,
        maxAge: 14,
        isFree: true,
        price: 0,
        categories: [],
        source: 'berlin.de',
        sourceUrl: 'https://www.berlin.de/...',
        kidFriendly: false // Will be determined by filtering
      },
      {
        title: "Zoo Berlin Familientag",
        description: "Entdecken Sie mit der ganzen Familie die Tierwelt. Spezielle Führungen für Kinder und Fütterungszeiten.",
        venue: "Zoo Berlin",
        address: "Hardenbergplatz 8, 10787 Berlin",
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        startTime: "09:00",
        minAge: 0,
        maxAge: 99,
        isFree: false,
        price: 8.50,
        categories: [],
        source: 'berlin.de',
        sourceUrl: 'https://www.berlin.de/...',
        kidFriendly: false
      },
      {
        title: "Spielplatz-Olympiade",
        description: "Sport und Spaß für Kinder aller Altersgruppen. Verschiedene Stationen mit Spielen und Aktivitäten.",
        venue: "Volkspark Friedrichshain",
        address: "Am Friedrichshain, 10249 Berlin",
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startTime: "11:00",
        minAge: 3,
        maxAge: 16,
        isFree: true,
        price: 0,
        categories: [],
        source: 'berlin.de',
        sourceUrl: 'https://www.berlin.de/...',
        kidFriendly: false
      }
    ];

    // Apply smart categorization
    sampleEvents.forEach(event => {
      event.categories = this.categorizeEvent(event);
    });

    // Filter by query if provided
    if (query && query.trim()) {
      const queryLower = query.toLowerCase();
      return sampleEvents.filter(event => 
        event.title.toLowerCase().includes(queryLower) ||
        event.description.toLowerCase().includes(queryLower) ||
        event.venue?.toLowerCase().includes(queryLower) ||
        event.categories.some(cat => cat.toLowerCase().includes(queryLower))
      );
    }

    return sampleEvents;
  }

  /**
   * Get cached scraped events (for performance)
   */
  async getCachedEvents(cityId: string, maxAge: number = 3600000): Promise<ScrapedEvent[]> {
    // In production, implement caching logic
    // For now, return empty array to force fresh scraping
    return [];
  }

  /**
   * Clear cached scraped events
   */
  async clearCache(cityId: string): Promise<void> {
    // In production, implement cache clearing
    console.log(`Cleared scraped events cache for ${cityId}`);
  }
}

export const eventScrapingService = new EventScrapingService();
