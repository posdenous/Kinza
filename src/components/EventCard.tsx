import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types/events';

interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
  onSaveToggle?: (event: Event) => void;
  isSaved?: boolean;
  compact?: boolean;
}

/**
 * Reusable event card component for displaying event information
 */
const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onSaveToggle,
  isSaved = false,
  compact = false,
}) => {
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

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(currentLanguage, {
      hour: '2-digit',
      minute: '2-digit',
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

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer]}
      onPress={() => onPress(event)}
    >
      {/* Event Image */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        {event.images && event.images.length > 0 ? (
          <Image
            source={{ uri: event.images[0] }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image" size={compact ? 24 : 32} color="#CCCCCC" />
          </View>
        )}
        
        {/* Age Range Badge */}
        <View style={styles.ageBadge}>
          <Text style={styles.ageBadgeText}>{event.minAge}-{event.maxAge}</Text>
        </View>
        
        {/* Save Button */}
        {onSaveToggle && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onSaveToggle(event)}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Event Details */}
      <View style={[styles.detailsContainer, compact && styles.compactDetailsContainer]}>
        {/* Date and Time */}
        <View style={styles.dateTimeRow}>
          <Ionicons name="calendar" size={compact ? 14 : 16} color="#666666" />
          <Text style={[styles.dateTimeText, compact && styles.compactText]}>
            {formatDate(event.startDate)} • {formatTime(event.startDate)}
          </Text>
        </View>
        
        {/* Event Title */}
        <Text
          style={[styles.eventTitle, compact && styles.compactEventTitle]}
          numberOfLines={compact ? 1 : 2}
        >
          {eventTitle}
        </Text>
        
        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={compact ? 14 : 16} color="#666666" />
          <Text
            style={[styles.locationText, compact && styles.compactText]}
            numberOfLines={1}
          >
            {event.location.name}
          </Text>
        </View>
        
        {/* Categories */}
        {!compact && (
          <View style={styles.categoriesRow}>
            {event.categories.slice(0, 2).map((category, index) => (
              <View
                key={index}
                style={[
                  styles.categoryTag,
                  { backgroundColor: getCategoryColor(category) },
                ]}
              >
                <Text style={styles.categoryText}>
                  {t(`categories.${category}`)}
                </Text>
              </View>
            ))}
            
            {event.categories.length > 2 && (
              <Text style={styles.moreCategories}>
                +{event.categories.length - 2}
              </Text>
            )}
          </View>
        )}
        
        {/* Price */}
        <View style={styles.priceRow}>
          <Ionicons
            name={event.isFree ? "pricetag" : "card"}
            size={compact ? 14 : 16}
            color="#666666"
          />
          <Text style={[styles.priceText, compact && styles.compactText]}>
            {event.isFree
              ? t('events.free')
              : event.price
              ? `${event.price.amount} ${event.price.currency}`
              : t('events.priceNotSpecified')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    height: 100,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  compactImageContainer: {
    height: 100,
    width: 100,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  ageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 12,
  },
  compactDetailsContainer: {
    flex: 1,
    padding: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666666',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  compactEventTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666666',
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moreCategories: {
    fontSize: 10,
    color: '#666666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  compactText: {
    fontSize: 10,
  },
});

export default EventCard;
