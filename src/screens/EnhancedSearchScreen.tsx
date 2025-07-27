import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useEnhancedSearch, SearchFilters } from '../hooks/useEnhancedSearch';
import { ScrapedEvent } from '../services/eventScrapingService';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';

interface Props {
  cityId: string;
  onEventSelect?: (event: any) => void;
}

export const EnhancedSearchScreen: React.FC<Props> = ({ cityId, onEventSelect }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    searchResult,
    searchEvents,
    saveScrapedEvent,
    getSearchSuggestions,
    quickKidsSearch,
    searchFreeEvents,
    clearSearch,
    isLoading,
    error
  } = useEnhancedSearch(cityId);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    kidsOnlyMode: true,
    maxAge: 12
  });

  // Get search suggestions when query changes
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length > 1) {
        const newSuggestions = await getSearchSuggestions(searchQuery);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, getSearchSuggestions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert(t('search.error'), t('search.enterQuery'));
      return;
    }

    await searchEvents({
      ...filters,
      query: searchQuery.trim()
    });
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    searchEvents({
      ...filters,
      query: suggestion
    });
  };

  const handleSaveScrapedEvent = async (event: ScrapedEvent) => {
    if (!user) {
      Alert.alert(t('auth.required'), t('auth.loginToSave'));
      return;
    }

    try {
      await saveScrapedEvent(event);
      Alert.alert(t('search.success'), t('search.eventSaved'));
    } catch (error) {
      Alert.alert(t('search.error'), t('search.saveFailed'));
    }
  };

  const renderScrapedEventCard = (event: ScrapedEvent) => (
    <View key={`${event.title}-${event.startDate}`} style={styles.eventCard}>
      <View style={styles.scrapedBadge}>
        <Text style={styles.scrapedBadgeText}>🔍 {t('search.scraped')}</Text>
      </View>
      
      <Text style={styles.eventTitle}>{event.title}</Text>
      
      <View style={styles.eventMeta}>
        <Text style={styles.eventMetaText}>
          📍 {event.venue} {event.address && `- ${event.address}`}
        </Text>
        <Text style={styles.eventMetaText}>
          📅 {event.startDate.toLocaleDateString()} {event.startTime && `at ${event.startTime}`}
        </Text>
        <Text style={styles.eventMetaText}>
          👶 Ages {event.minAge}-{event.maxAge}
        </Text>
        <Text style={styles.eventMetaText}>
          💰 {event.isFree ? t('common.free') : `€${event.price?.toFixed(2)}`}
        </Text>
      </View>

      <Text style={styles.eventDescription} numberOfLines={3}>
        {event.description}
      </Text>

      <View style={styles.eventTags}>
        {event.categories.map(category => {
          const categoryStyle = styles[`tag${category}` as keyof typeof styles] as any;
          return (
            <View key={category} style={[styles.tag, categoryStyle]}>
              <Text style={styles.tagText}>{t(`categories.${category}`)}</Text>
            </View>
          );
        })}
        {event.kidFriendly && (
          <View style={[styles.tag, styles.tagKidFriendly]}>
            <Text style={styles.tagText}>👶 {t('search.kidFriendly')}</Text>
          </View>
        )}
      </View>

      <View style={styles.eventActions}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => handleSaveScrapedEvent(event)}
          disabled={!user}
        >
          <Text style={styles.saveButtonText}>
            {user ? t('search.saveEvent') : t('auth.loginRequired')}
          </Text>
        </TouchableOpacity>
        
        {onEventSelect && (
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onEventSelect(event)}
          >
            <Text style={styles.viewButtonText}>{t('search.viewDetails')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterControls = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{t('search.filters')}</Text>
      
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>{t('search.includeScrapedEvents')}</Text>
        <Switch
          value={filters.includeScrapedEvents}
          onValueChange={(value) => setFilters(prev => ({ ...prev, includeScrapedEvents: value }))}
          trackColor={{ false: '#767577', true: theme.colors.primary }}
        />
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>{t('search.kidsOnlyMode')}</Text>
        <Switch
          value={filters.kidsOnlyMode}
          onValueChange={(value) => setFilters(prev => ({ ...prev, kidsOnlyMode: value }))}
          trackColor={{ false: '#767577', true: theme.colors.primary }}
        />
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>{t('search.maxAge')}</Text>
        <TextInput
          style={styles.ageInput}
          value={filters.maxAge?.toString() || ''}
          onChangeText={(text) => setFilters(prev => ({ ...prev, maxAge: parseInt(text) || undefined }))}
          keyboardType="numeric"
          placeholder="12"
        />
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickButton} onPress={quickKidsSearch}>
        <Text style={styles.quickButtonText}>👶 {t('search.kidEvents')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickButton} onPress={searchFreeEvents}>
        <Text style={styles.quickButtonText}>🆓 {t('search.freeEvents')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickButton} onPress={clearSearch}>
        <Text style={styles.quickButtonText}>🗑️ {t('search.clear')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchStats = () => {
    if (!searchResult.scrapingResult) return null;

    const { totalFound, kidFriendlyCount, excludedCount } = searchResult.scrapingResult;
    
    return (
      <View style={styles.statsPanel}>
        <Text style={styles.statsTitle}>{t('search.scrapingResults')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalFound}</Text>
            <Text style={styles.statLabel}>{t('search.totalFound')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{kidFriendlyCount}</Text>
            <Text style={styles.statLabel}>{t('search.kidFriendly')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{excludedCount}</Text>
            <Text style={styles.statLabel}>{t('search.excluded')}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('search.enhancedSearch')}</Text>
        <Text style={styles.subtitle}>{t('search.findKidFriendlyEvents')}</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('search.placeholder')}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map(suggestion => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Search Statistics */}
      {renderSearchStats()}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsSection}>
        {searchResult.totalCount > 0 && (
          <Text style={styles.resultsTitle}>
            {t('search.foundEvents', { count: searchResult.totalCount })}
          </Text>
        )}

        {/* Scraped Events */}
        {searchResult.scrapedEvents.length > 0 && (
          <View style={styles.scrapedSection}>
            <Text style={styles.sectionTitle}>
              🔍 {t('search.scrapedEvents')} ({searchResult.scrapedEvents.length})
            </Text>
            {searchResult.scrapedEvents.map(renderScrapedEventCard)}
          </View>
        )}

        {/* Local Events */}
        {searchResult.localEvents.length > 0 && (
          <View style={styles.localSection}>
            <Text style={styles.sectionTitle}>
              📍 {t('search.localEvents')} ({searchResult.localEvents.length})
            </Text>
            {/* Render local events here - similar to scraped events */}
          </View>
        )}

        {/* No Results */}
        {searchResult.totalCount === 0 && !isLoading && searchQuery && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>{t('search.noResults')}</Text>
            <Text style={styles.noResultsSubtext}>{t('search.tryDifferentQuery')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  searchSection: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginLeft: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  filterSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
  },
  ageInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 60,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsPanel: {
    backgroundColor: theme.colors.primary,
    margin: 20,
    padding: 15,
    borderRadius: 12,
  },
  statsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  resultsSection: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  scrapedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scrapedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingRight: 80,
  },
  eventMeta: {
    marginBottom: 10,
  },
  eventMetaText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tagoutdoor: { backgroundColor: '#e8f5e8' },
  tageducational: { backgroundColor: '#f3e5f5' },
  tagarts: { backgroundColor: '#fce4ec' },
  tagKidFriendly: { backgroundColor: '#e8f5e8' },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  noResults: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  scrapedSection: {
    marginBottom: 20,
  },
  localSection: {
    marginBottom: 20,
  },
});
