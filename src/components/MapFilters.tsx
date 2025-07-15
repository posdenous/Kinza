import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EventFilter } from '../types/events';
import { Ionicons } from '@expo/vector-icons';

interface MapFiltersProps {
  onApplyFilters: (filters: EventFilter) => void;
  initialFilters?: EventFilter;
}

/**
 * Component for filtering events on the map
 */
const MapFilters: React.FC<MapFiltersProps> = ({
  onApplyFilters,
  initialFilters = {},
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<EventFilter>(initialFilters);
  
  // Available categories
  const categories = [
    'music',
    'sports',
    'art',
    'education',
    'outdoor',
    'food',
    'theater',
    'museum',
    'playground',
  ];
  
  // Available age ranges
  const ageRanges = [
    { label: '0-2', value: [0, 2] as [number, number] },
    { label: '3-5', value: [3, 5] as [number, number] },
    { label: '6-9', value: [6, 9] as [number, number] },
    { label: '10-12', value: [10, 12] as [number, number] },
    { label: '13+', value: [13, 18] as [number, number] },
  ];

  // Toggle category selection
  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    
    if (currentCategories.includes(category)) {
      setFilters({
        ...filters,
        categories: currentCategories.filter(c => c !== category),
      });
    } else {
      setFilters({
        ...filters,
        categories: [...currentCategories, category],
      });
    }
  };

  // Set age range
  const setAgeRange = (range: [number, number]) => {
    setFilters({
      ...filters,
      ageRange: range,
    });
  };

  // Toggle free events filter
  const toggleFreeEvents = () => {
    setFilters({
      ...filters,
      free: !filters.free,
    });
  };

  // Apply filters
  const applyFilters = () => {
    onApplyFilters(filters);
    setIsExpanded(false);
  };

  // Reset filters
  const resetFilters = () => {
    const emptyFilters: EventFilter = {};
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (filters.ageRange) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.date) count++;
    if (filters.free) count++;
    return count;
  };

  const activeFilterCount = countActiveFilters();

  return (
    <View style={styles.container}>
      {!isExpanded ? (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsExpanded(true)}
        >
          <Ionicons name="filter" size={20} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>
            {t('map.filters')}
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.expandedContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>{t('map.filterEvents')}</Text>
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filtersScrollView}>
            {/* Age Range Section */}
            <Text style={styles.sectionTitle}>{t('filters.ageRange')}</Text>
            <View style={styles.ageRangeContainer}>
              {ageRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.ageRangeButton,
                    filters.ageRange &&
                      filters.ageRange[0] === range.value[0] &&
                      filters.ageRange[1] === range.value[1] &&
                      styles.selectedAgeRange,
                  ]}
                  onPress={() => setAgeRange(range.value)}
                >
                  <Text
                    style={[
                      styles.ageRangeText,
                      filters.ageRange &&
                        filters.ageRange[0] === range.value[0] &&
                        filters.ageRange[1] === range.value[1] &&
                        styles.selectedText,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Categories Section */}
            <Text style={styles.sectionTitle}>{t('filters.categories')}</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    filters.categories?.includes(category) && styles.selectedCategory,
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      filters.categories?.includes(category) && styles.selectedText,
                    ]}
                  >
                    {t(`categories.${category}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Free Events Toggle */}
            <TouchableOpacity
              style={styles.freeEventsToggle}
              onPress={toggleFreeEvents}
            >
              <View
                style={[
                  styles.toggleBox,
                  filters.free && styles.toggleBoxActive,
                ]}
              >
                {filters.free && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.toggleText}>{t('filters.freeEventsOnly')}</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>{t('common.reset')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>{t('common.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filtersScrollView: {
    padding: 16,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  ageRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAgeRange: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  ageRangeText: {
    color: '#333333',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryText: {
    color: '#333333',
  },
  freeEventsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBoxActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  toggleText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    color: '#666666',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default MapFilters;
