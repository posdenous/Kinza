import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSearch, SearchResult, SearchResultType } from '../hooks/useSearch';
import EventCard from '../components/EventCard';
import { useUserRole } from '../hooks/useUserRole';
import { format } from 'date-fns';

interface CategoryFilter {
  id: string;
  name: string;
}

interface SearchResultsScreenProps {
  route: {
    params: {
      initialQuery?: string;
      cityId: string;
    };
  };
}

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>(); // Type as any to fix navigation typing issues
  const { role } = useUserRole();
  const { initialQuery = '', cityId } = route.params;

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>(['event', 'venue']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [hasActiveFilters, setHasActiveFilters] = useState<boolean>(false);

  // Define category filters
  const categoryFilters: CategoryFilter[] = [
    { id: 'workshop', name: t('categories.workshop') },
    { id: 'outdoor', name: t('categories.outdoor') },
    { id: 'music', name: t('categories.music') },
    { id: 'art', name: t('categories.art') },
    { id: 'sports', name: t('categories.sports') },
    { id: 'education', name: t('categories.education') },
    { id: 'food', name: t('categories.food') },
  ];

  // Search results hook
  const { results, loading, error } = useSearch({
    query: searchQuery,
    types: selectedTypes,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    cityId,
  });

  // Reset search when city changes
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery, cityId]);
  
  // Check if there are active filters
  useEffect(() => {
    // Consider filters active if categories are selected or if types differ from default
    const defaultTypes = ['event', 'venue'];
    const typesChanged = selectedTypes.length !== defaultTypes.length || 
      !selectedTypes.every(type => defaultTypes.includes(type));
      
    setHasActiveFilters(selectedCategories.length > 0 || typesChanged);
  }, [selectedTypes, selectedCategories]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const toggleType = (type: SearchResultType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  // Reset all filters to default values
  const resetAllFilters = () => {
    setSelectedTypes(['event', 'venue']);
    setSelectedCategories([]);
  };

  const navigateToDetail = (item: SearchResult) => {
    switch (item.type) {
      case 'event':
        navigation.navigate('EventDetail', { eventId: item.id });
        break;
      case 'venue':
        navigation.navigate('VenueDetail', { venueId: item.id });
        break;
      case 'profile':
        navigation.navigate('ProfileDetail', { userId: item.id });
        break;
    }
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => {
    if (item.type === 'event') {
      return (
        <EventCard 
          event={{
            id: item.id,
            title: item.title,
            description: item.description || '',
            images: item.imageUrl ? [item.imageUrl] : [],
            categories: item.category ? [item.category] : [],
            startDate: item.date || new Date(), // Provide default date to fix type error
            location: { 
              name: '',
              address: item.address || '',
              coordinates: { latitude: 0, longitude: 0 } 
            },
            organiser: { id: '', name: '' },
            minAge: item.ageRange ? parseInt(item.ageRange.split('-')[0] || '0') : 0,
            maxAge: item.ageRange ? parseInt(item.ageRange.split('-')[1] || '18') : 18,
            isFree: true,
            isApproved: true,
            moderationStatus: 'approved',
            cityId: cityId,
            createdAt: new Date(),
            updatedAt: new Date(),
            registrationRequired: false,
            isRecurring: false
          }}
          onPress={() => navigateToDetail(item)}
        />
      );
    }

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => navigateToDetail(item)}
      >
        <View style={styles.resultContent}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
          ) : (
            <View style={[styles.resultImage, styles.placeholderImage]}>
              <Ionicons 
                name={item.type === 'venue' ? 'location' : 'person'} 
                size={24} 
                color="#CCCCCC" 
              />
            </View>
          )}
          
          <View style={styles.resultInfo}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {t(`search.types.${item.type}`)}
                </Text>
              </View>
            </View>
            
            {item.category && (
              <Text style={styles.resultCategory}>
                {t(`categories.${item.category.toLowerCase()}`)}
              </Text>
            )}
            
            {item.description && (
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            {item.address && (
              <View style={styles.resultDetail}>
                <Ionicons name="location-outline" size={14} color="#666666" />
                <Text style={styles.resultDetailText} numberOfLines={1}>{item.address}</Text>
              </View>
            )}
            
            {item.date && (
              <View style={styles.resultDetail}>
                <Ionicons name="calendar-outline" size={14} color="#666666" />
                <Text style={styles.resultDetailText}>
                  {format(item.date, 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={t('search.placeholder')}
            placeholderTextColor="#999999"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={16} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name={showFilters ? "options" : "options-outline"} 
            size={24} 
            color={showFilters ? "#2196F3" : "#333333"} 
          />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterHeaderRow}>
            <Text style={styles.filterTitle}>{t('search.filterByType')}</Text>
            {hasActiveFilters && (
              <TouchableOpacity 
                style={styles.resetFiltersButton} 
                onPress={resetAllFilters}
                accessibilityLabel={t('search.resetFilters')}
              >
                <Ionicons name="refresh-outline" size={14} color="#2196F3" />
                <Text style={styles.resetFiltersText}>{t('search.resetFilters')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            <TouchableOpacity
              style={[
                styles.typeFilter,
                selectedTypes.includes('event') && styles.selectedTypeFilter
              ]}
              onPress={() => toggleType('event')}
            >
              <Ionicons 
                name={selectedTypes.includes('event') ? "calendar" : "calendar-outline"} 
                size={16} 
                color={selectedTypes.includes('event') ? "#FFFFFF" : "#333333"} 
              />
              <Text 
                style={[
                  styles.typeFilterText,
                  selectedTypes.includes('event') && styles.selectedTypeFilterText
                ]}
              >
                {t('search.types.event')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeFilter,
                selectedTypes.includes('venue') && styles.selectedTypeFilter
              ]}
              onPress={() => toggleType('venue')}
            >
              <Ionicons 
                name={selectedTypes.includes('venue') ? "location" : "location-outline"} 
                size={16} 
                color={selectedTypes.includes('venue') ? "#FFFFFF" : "#333333"} 
              />
              <Text 
                style={[
                  styles.typeFilterText,
                  selectedTypes.includes('venue') && styles.selectedTypeFilterText
                ]}
              >
                {t('search.types.venue')}
              </Text>
            </TouchableOpacity>
            
            {role === 'admin' && (
              <TouchableOpacity
                style={[
                  styles.typeFilter,
                  selectedTypes.includes('profile') && styles.selectedTypeFilter
                ]}
                onPress={() => toggleType('profile')}
              >
                <Ionicons 
                  name={selectedTypes.includes('profile') ? "person" : "person-outline"} 
                  size={16} 
                  color={selectedTypes.includes('profile') ? "#FFFFFF" : "#333333"} 
                />
                <Text 
                  style={[
                    styles.typeFilterText,
                    selectedTypes.includes('profile') && styles.selectedTypeFilterText
                  ]}
                >
                  {t('search.types.profile')}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          
          <View style={styles.filterHeaderRow}>
            <Text style={styles.filterTitle}>{t('search.filterByCategory')}</Text>
            {selectedCategories.length > 0 && (
              <TouchableOpacity 
                style={styles.clearCategoriesButton} 
                onPress={() => setSelectedCategories([])}
                accessibilityLabel={t('search.clearCategories')}
              >
                <Text style={styles.clearCategoriesText}>{t('search.clearCategories')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {categoryFilters.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryFilter,
                  selectedCategories.includes(category.id) && styles.selectedCategoryFilter
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text 
                  style={[
                    styles.categoryFilterText,
                    selectedCategories.includes(category.id) && styles.selectedCategoryFilterText
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>{t('search.searching')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF5722" />
          <Text style={styles.errorText}>{t('search.error')}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setSearchQuery(searchQuery)}
          >
            <Text style={styles.retryButtonText}>{t('search.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          {searchQuery.length > 0 ? (
            <>
              <Ionicons name="search-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>{t('search.noResults')}</Text>
              <Text style={styles.emptySubtext}>{t('search.tryDifferent')}</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>{t('search.startSearching')}</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {t('search.resultsCount', { count: results.length })}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resetFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  resetFiltersText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  clearCategoriesButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  clearCategoriesText: {
    color: '#757575',
    fontSize: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterScrollView: {
    marginBottom: 16,
  },
  typeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedTypeFilter: {
    backgroundColor: '#2196F3',
  },
  typeFilterText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 4,
  },
  selectedTypeFilterText: {
    color: '#FFFFFF',
  },
  categoryFilter: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedCategoryFilter: {
    backgroundColor: '#2196F3',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedCategoryFilterText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultContent: {
    flexDirection: 'row',
  },
  resultImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#F5F5F5',
  },
  resultInfo: {
    flex: 1,
    padding: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#666666',
  },
  resultCategory: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  resultDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  resultDetailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
});

export default SearchResultsScreen;
