import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Event } from '../types/events';
import theme from '../styles/theme';
import useFocusState from '../hooks/useFocusState';
import { withStyleFallback, withColorFallback, withFontFallback } from '../utils/styleUtils';

interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
  onSaveToggle?: (event: Event) => void;
  isSaved?: boolean;
  compact?: boolean;
  fallbackImage?: string;
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
  fallbackImage = 'https://via.placeholder.com/400x300?text=No+Image',
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { focusHandlers, focusStyles } = useFocusState();
  
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
      style={withStyleFallback([styles.container, compact && styles.compactContainer, focusStyles], { backgroundColor: '#FFFFFF', borderRadius: 8 })}
      onPress={() => onPress(event)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${event.title} event details`}
      {...focusHandlers}
    >
      {/* Event Image */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        {event.images && event.images.length > 0 ? (
          <>
            {imageLoading && (
              <View style={[styles.placeholderImage, styles.loadingContainer]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            )}
            <Image
              source={{ uri: event.images[0] }}
              style={[styles.eventImage, imageError && styles.hiddenImage]}
              resizeMode="cover"
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              accessible={true}
              accessibilityLabel={t('events.eventImage', { title: event.title })}
              testID="event-image"
            />
            {imageError && (
              <View style={[styles.placeholderImage, styles.errorContainer]}>
                <Ionicons 
                  name="alert-circle-outline" 
                  size={compact ? 24 : 32} 
                  color="#FF5722" 
                  aria-label={t('events.imageError')} 
                />
                <Text style={styles.errorText}>{t('events.imageLoadError')}</Text>
                {fallbackImage && (
                  <Image 
                    source={{ uri: fallbackImage }}
                    style={styles.fallbackImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons 
              name="image-outline" 
              size={compact ? 24 : 32} 
              color="#CCCCCC" 
              aria-label={t('events.noImage')} 
            />
            <Text style={styles.noImageText}>{t('events.noImage')}</Text>
          </View>
        )}
        
        {/* Age Range Badge */}
        <View style={styles.ageBadge}>
          <Text style={styles.ageBadgeText}>{event.minAge}-{event.maxAge}</Text>
        </View>
        
        {/* Save Button */}
        {onSaveToggle && (
          <TouchableOpacity 
            style={[styles.saveButton, focusStyles]} 
            onPress={() => onSaveToggle(event)}
            accessibilityLabel={isSaved ? t('events.unsaveEvent') : t('events.saveEvent')}
            accessibilityRole="button"
            accessible={true}
            {...focusHandlers}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color="#FFFFFF"
              aria-label={isSaved ? t('events.unsaveEvent') : t('events.saveEvent')}
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
    backgroundColor: theme.colors.ui.card,
    borderRadius: theme.borders.radius.xl, // 16px corner radius per requirements
    overflow: 'hidden',
    marginBottom: theme.spacing[4],
    ...theme.shadows.md, // Add soft shadow per requirements
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    zIndex: 2,
  },
  hiddenImage: {
    opacity: 0.3,
  },
  fallbackImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.5,
    zIndex: -1,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#FF5722',
    marginTop: theme.spacing[1],
    textAlign: 'center',
    paddingHorizontal: theme.spacing[2],
  },
  noImageText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#CCCCCC',
    marginTop: theme.spacing[1],
    textAlign: 'center',
  },
  ageBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    left: theme.spacing[2],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borders.radius.md,
    paddingVertical: theme.spacing.px,
    paddingHorizontal: theme.spacing[2],
  },
  ageBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.heading,
  },
  saveButton: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borders.radius.full,
    width: theme.layout.touchableMinHeight, // 44px minimum for accessibility
    height: theme.layout.touchableMinHeight, // 44px minimum for accessibility
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: theme.layout.touchableMinHeight, // Ensure minimum touch target size
  },
  detailsContainer: {
    padding: theme.spacing[3],
  },
  compactDetailsContainer: {
    flex: 1,
    padding: theme.spacing[2],
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    marginLeft: theme.spacing[1],
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body, // Nunito for body text
    color: theme.colors.text.light,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.heading, // Poppins bold for headings
    marginBottom: theme.spacing[2],
  },
  compactEventTitle: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[1],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: theme.spacing[1],
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body, // Nunito for body text
    color: theme.colors.text.light,
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    borderRadius: theme.borders.radius.md,
    paddingVertical: theme.spacing.px,
    paddingHorizontal: theme.spacing[2],
    marginRight: theme.spacing[1],
  },
  categoryText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.heading,
  },
  moreCategories: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    marginLeft: theme.spacing[1],
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body, // Nunito for body text
    fontWeight: 'bold',
    color: theme.colors.text.light,
  },
  compactText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body,
  },
});

export default EventCard;
