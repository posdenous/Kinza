# 🔍 Enhanced Search - Kid-Friendly Event Scraping

## Overview

The Enhanced Search feature integrates kid-friendly event scraping into the Kinza Berlin app's search flow, providing families with access to curated events from both local databases and external sources.

## Data Sources

### Primary Source: Berlin.de Weekend Tips
- **URL**: `https://www.berlin.de/wochenend-tipps/?wt_mc=wochenendtipp.250717`
- **Content**: Family-friendly weekend activities and events in Berlin
- **Update Frequency**: Weekly (typically updated on Fridays)
- **Scraping Method**: HTML parsing of event listings
- **Location**: `src/services/eventScrapingService.ts`

### Secondary Sources (Future Implementation)
- **Google Maps Events**: Local business events and activities
- **Berlin.de Main Events**: `https://www.berlin.de/events/`
- **Family-focused websites**: Potential integration with specialized family event platforms

## Architecture

### Core Components

#### 1. Event Scraping Service (`src/services/eventScrapingService.ts`)
```typescript
class EventScrapingService {
  // Main search method - always includes scraped events
  async searchEvents(query: string, options: ScrapingOptions): Promise<ScrapingResult>
  
  // Kid-friendly filtering with exclusion keywords
  applyKidFriendlyFilter(events: ScrapedEvent[], options: FilterOptions): ScrapedEvent[]
  
  // Smart categorization into Kinza categories
  private categorizeEvent(event: ScrapedEvent): string[]
  
  // Convert scraped events to Kinza format
  convertToKinzaEvents(scrapedEvents: ScrapedEvent[], cityId: string): Partial<Event>[]
}
```

#### 2. Enhanced Search Hook (`src/hooks/useEnhancedSearch.ts`)
```typescript
interface SearchFilters {
  query: string;
  categories?: string[];
  minAge?: number;
  maxAge?: number;
  isFree?: boolean;
  kidsOnlyMode?: boolean; // Always enabled for family safety
}

// Always searches both local and scraped events
const searchEvents = async (filters: SearchFilters) => {
  const localEventsPromise = searchLocalEvents(filters);
  const scrapedEventsPromise = searchScrapedEvents(filters); // Always included
  // ...
}
```

#### 3. Enhanced Search Screen (`src/screens/EnhancedSearchScreen.tsx`)
- Mobile-optimized search interface
- Smart filters for age, categories, free events
- Mixed results display (local + scraped events)
- Save functionality for authenticated users

## Kid-Friendly Filtering

### Exclusion Keywords
Events are filtered out if they contain these keywords:
```typescript
const EXCLUDE_KEYWORDS = [
  'alcohol', 'beer', 'wine', 'cocktail', 'bar', 'pub',
  'gambling', 'casino', 'poker', 'betting',
  'adult', 'mature', '18+', 'nightclub', 'strip',
  'violent', 'horror', 'scary', 'frightening'
];
```

### Age-Based Filtering
- **Default Max Age**: 12 years (configurable)
- **Family Mode**: Events suitable for mixed age groups
- **Validation**: Events must specify appropriate age ranges

### Content Categorization
Automatic categorization into Kinza categories:
- **Outdoor**: Parks, sports, nature activities
- **Indoor**: Museums, workshops, indoor play
- **Educational**: Learning experiences, science, history
- **Sports**: Physical activities, games, fitness
- **Arts**: Creative workshops, exhibitions, crafts
- **Music**: Concerts, music lessons, performances

## Technical Implementation

### Scraping Logic (Currently Simulated)
```typescript
// For demo purposes - production requires backend implementation
private async simulateEventScraping(query: string, options: ScrapingOptions): Promise<ScrapedEvent[]> {
  // Returns sample kid-friendly events from Berlin
  // Production: Replace with actual web scraping using Puppeteer/Playwright
}
```

### Production Scraping Requirements
1. **Backend API**: Scraping should be server-side to avoid CORS issues
2. **Rate Limiting**: Respect berlin.de's robots.txt and rate limits
3. **Caching**: Cache scraped results for 1-6 hours to reduce load
4. **Error Handling**: Graceful fallback to local events if scraping fails
5. **Legal Compliance**: Ensure scraping complies with terms of service

### Data Flow
```
User Search Query
    ↓
Enhanced Search Hook
    ↓
Parallel Execution:
├── Local Firestore Query (city-scoped)
└── Event Scraping Service
    ├── Fetch from berlin.de
    ├── Apply kid-friendly filters
    ├── Categorize events
    └── Convert to Kinza format
    ↓
Combined Results Display
    ├── Local events (green badge)
    └── Scraped events (red badge)
```

## Configuration

### Environment Variables
```bash
# Backend API URL for production scraping
EXPO_PUBLIC_API_URL=https://api.kinza.berlin

# Scraping configuration
SCRAPING_ENABLED=true
SCRAPING_CACHE_TTL=3600  # 1 hour
SCRAPING_RATE_LIMIT=10   # requests per minute
```

### Feature Flags
```typescript
// In production, these can be controlled via feature flags
const SCRAPING_CONFIG = {
  enabled: true,
  sources: ['berlin.de'],
  kidFriendlyMode: true,
  maxAge: 12,
  cacheEnabled: true
};
```

## User Experience

### Search Behavior
- **Always Comprehensive**: Scraped events are always included (no user toggle)
- **Source Transparency**: Clear badges indicate local vs scraped events
- **Kid-Safe Default**: All results are pre-filtered for family appropriateness
- **Save Functionality**: Users can save interesting scraped events to their collection

### Performance
- **Parallel Loading**: Local and scraped results load simultaneously
- **Progressive Enhancement**: Local results appear first, scraped results append
- **Loading States**: Professional skeleton screens during search
- **Error Handling**: Graceful fallback if scraping fails

## Monitoring & Analytics

### Key Metrics to Track
- Scraping success rate and response times
- User engagement with scraped vs local events
- Most popular scraped event categories
- Save rate for scraped events
- Search query patterns

### Error Monitoring
- Scraping failures and timeouts
- Kid-friendly filter effectiveness
- Categorization accuracy
- User-reported inappropriate content

## Maintenance

### Regular Tasks
1. **Weekly**: Review new events from berlin.de for quality
2. **Monthly**: Update exclusion keywords based on user feedback
3. **Quarterly**: Evaluate new data sources for integration
4. **As Needed**: Adjust categorization logic based on accuracy metrics

### Code Locations for Future Updates
- **Add new exclusion keywords**: `src/services/eventScrapingService.ts` → `EXCLUDE_KEYWORDS`
- **Modify categorization**: `src/services/eventScrapingService.ts` → `categorizeEvent()`
- **Add new data sources**: `src/services/eventScrapingService.ts` → `simulateEventScraping()`
- **Update age limits**: `src/hooks/useEnhancedSearch.ts` → default `maxAge` values
- **Modify UI filters**: `src/screens/EnhancedSearchScreen.tsx` → filter controls

## Legal & Compliance

### Data Sources Compliance
- **Berlin.de**: Public information, respect robots.txt and rate limits
- **Attribution**: Consider adding "Powered by Berlin.de" attribution
- **Terms of Service**: Regular review of source website terms

### Privacy Considerations
- **No Personal Data**: Only scrape public event information
- **City Scoping**: All scraped events are scoped to Berlin (user's city)
- **User Consent**: Scraped events are clearly labeled as external sources

## Future Enhancements

### Planned Features
1. **Real-time Scraping**: Replace simulation with actual web scraping
2. **Multiple Cities**: Extend beyond Berlin to Hamburg, Munich, etc.
3. **User Preferences**: Allow users to customize age ranges and categories
4. **Event Recommendations**: ML-based suggestions based on saved events
5. **Social Features**: User ratings and reviews for scraped events

### Technical Improvements
1. **Caching Layer**: Redis cache for scraped results
2. **Background Jobs**: Scheduled scraping to pre-populate results
3. **Quality Scoring**: Rank events by relevance and quality
4. **A/B Testing**: Test different filtering and categorization approaches

---

**Last Updated**: January 2024  
**Maintainer**: Kinza Development Team  
**Contact**: For questions about the enhanced search feature, see the main project README.
