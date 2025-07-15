import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { Event } from '../types/events';

interface MapEventMarkerProps {
  event: Event;
  onPress: (event: Event) => void;
}

/**
 * Custom marker component for events on the map
 */
const MapEventMarker: React.FC<MapEventMarkerProps> = ({ event, onPress }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  // Get translated title if available
  const eventTitle = event.translations?.[currentLanguage]?.title || event.title;
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(currentLanguage, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Get category color based on first category
  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      music: '#FF5722',
      sports: '#4CAF50',
      art: '#9C27B0',
      education: '#2196F3',
      outdoor: '#8BC34A',
      food: '#FF9800',
      default: '#607D8B',
    };
    
    return categoryColors[category] || categoryColors.default;
  };

  const primaryCategory = event.categories[0] || 'default';
  const markerColor = getCategoryColor(primaryCategory);

  return (
    <Marker
      coordinate={{
        latitude: event.location.coordinates.latitude,
        longitude: event.location.coordinates.longitude,
      }}
      tracksViewChanges={false}
    >
      <View style={[styles.markerContainer, { backgroundColor: markerColor }]}>
        <Text style={styles.markerText}>{event.minAge}-{event.maxAge}</Text>
      </View>
      
      <Callout tooltip onPress={() => onPress(event)}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle} numberOfLines={1}>
            {eventTitle}
          </Text>
          
          <Text style={styles.calloutDate}>
            {formatDate(event.startDate)}
          </Text>
          
          <Text style={styles.calloutLocation} numberOfLines={1}>
            {event.location.name}
          </Text>
          
          <View style={styles.calloutCategories}>
            {event.categories.slice(0, 2).map((category, index) => (
              <View 
                key={index} 
                style={[
                  styles.categoryTag, 
                  { backgroundColor: getCategoryColor(category) }
                ]}
              >
                <Text style={styles.categoryText}>
                  {t(`categories.${category}`)}
                </Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>{t('common.viewDetails')}</Text>
          </TouchableOpacity>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDate: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  calloutLocation: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  calloutCategories: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MapEventMarker;
