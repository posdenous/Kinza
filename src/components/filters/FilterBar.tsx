import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../../styles/theme';

export interface FilterOption {
  id: string;
  name: string;
  icon?: string; // Icon name from Ionicons
}

interface FilterBarProps {
  title?: string;
  options: FilterOption[];
  selectedOptions: string[];
  onToggleOption: (optionId: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  showResetButton?: boolean;
  testID?: string;
}

/**
 * Reusable filter bar component for horizontal scrolling filters
 */
const FilterBar: React.FC<FilterBarProps> = ({
  title,
  options,
  selectedOptions,
  onToggleOption,
  onResetFilters,
  hasActiveFilters,
  showResetButton = true,
  testID = 'filter-bar',
}) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.filtersContainer} testID={testID}>
      {title && (
        <View style={styles.filterHeaderRow}>
          <Text style={styles.filterTitle}>{title}</Text>
          {showResetButton && hasActiveFilters && (
            <TouchableOpacity 
              style={styles.resetFiltersButton} 
              onPress={onResetFilters}
              accessibilityLabel={t('search.resetFilters')}
              testID={`${testID}-reset-button`}
            >
              <Ionicons name="refresh-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.resetFiltersText}>{t('search.resetFilters')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScrollView}
        testID={`${testID}-scroll-view`}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterOption,
              selectedOptions.includes(option.id) && styles.selectedFilterOption
            ]}
            onPress={() => onToggleOption(option.id)}
            accessibilityLabel={option.name}
            accessibilityState={{ selected: selectedOptions.includes(option.id) }}
            testID={`${testID}-option-${option.id}`}
          >
            {option.icon && (
              <Ionicons 
                name={selectedOptions.includes(option.id) ? option.icon as any : `${option.icon}-outline` as any} 
                size={16} 
                color={selectedOptions.includes(option.id) ? theme.colors.text.inverse : theme.colors.text.dark} 
                style={styles.filterOptionIcon}
              />
            )}
            <Text 
              style={[
                styles.filterOptionText,
                selectedOptions.includes(option.id) && styles.selectedFilterOptionText
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: theme.colors.ui.background,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  filterTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.heading,
    fontWeight: 'bold',
    color: theme.colors.text.dark,
  },
  resetFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[1],
  },
  resetFiltersText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    marginLeft: theme.spacing[1],
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.ui.card,
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borders.radius.full,
    marginRight: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    minHeight: theme.layout.touchableMinHeight,
  },
  selectedFilterOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionIcon: {
    marginRight: theme.spacing[1],
  },
  filterOptionText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.dark,
  },
  selectedFilterOptionText: {
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
});

export default FilterBar;
