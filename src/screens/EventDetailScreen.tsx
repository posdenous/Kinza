import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import useEventDetail from '../hooks/useEventDetail';
import authService from '../auth/authService';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';

type RootStackParamList = {
  EventDetail: { eventId: string };
  Map: undefined;
};

type EventDetailRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;
type EventDetailNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetail'>;

/**
 * Event detail screen showing comprehensive information about an event
 */
const EventDetailScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const route = useRoute<EventDetailRouteProp>();
  const navigation = useNavigation<EventDetailNavigationProp>();
  const { eventId } = route.params;
  const { event, comments, loading, error } = useEventDetail(eventId);
  
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [savingInProgress, setSavingInProgress] = useState<boolean>(false);
  
  // Get current language for translations
  const currentLanguage = i18n.language;

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString(currentLanguage, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    
    return new Date(date).toLocaleTimeString(currentLanguage, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle save/unsave event
  const handleSaveEvent = async () => {
    const user = authService.getCurrentUser();
    
    if (!user) {
      Alert.alert(
        t('auth.loginRequired'),
        t('auth.loginToSaveEvents'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('auth.login'), onPress: () => navigation.navigate('Map') },
        ]
      );
      return;
    }
    
    if (!event) return;
    
    setSavingInProgress(true);
    
    try {
      const savedEventId = `${user.uid}_${event.id}`;
      
      if (isSaved) {
        // Unsave event
        await deleteDoc(doc(firestore, 'savedEvents', savedEventId));
        setIsSaved(false);
      } else {
        // Save event
        await setDoc(doc(firestore, 'savedEvents', savedEventId), {
          userId: user.uid,
          eventId: event.id,
          savedAt: new Date(),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving/unsaving event:', error);
      Alert.alert(t('errors.title'), t('errors.saveEvent'));
    } finally {
      setSavingInProgress(false);
    }
  };

  // Handle share event
  const handleShareEvent = async () => {
    if (!event) return;
    
    try {
      const eventTitle = event.translations?.[currentLanguage]?.title || event.title;
      const shareMessage = `${eventTitle} - ${formatDate(event.startDate)} ${formatTime(event.startDate)}`;
      
      await Share.share({
        message: shareMessage,
        // In a real app, we would include a deep link to the event
        // url: `https://kinza.app/events/${event.id}`,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  // Handle open website
  const handleOpenWebsite = () => {
    if (event?.website) {
      Linking.openURL(event.website).catch((err) => {
        console.error('Error opening website:', err);
        Alert.alert(t('errors.title'), t('errors.openWebsite'));
      });
    }
  };

  // Handle open maps for directions
  const handleOpenMaps = () => {
    if (event?.location?.coordinates) {
      const { latitude, longitude } = event.location.coordinates;
      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      
      Linking.openURL(url).catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert(t('errors.title'), t('errors.openMaps'));
      });
    }
  };

  // Handle register for event
  const handleRegister = () => {
    if (event?.registrationUrl) {
      Linking.openURL(event.registrationUrl).catch((err) => {
        console.error('Error opening registration URL:', err);
        Alert.alert(t('errors.title'), t('errors.openRegistration'));
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error || t('errors.eventNotFound')}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get translated content
  const eventTitle = event.translations?.[currentLanguage]?.title || event.title;
  const eventDescription = event.translations?.[currentLanguage]?.description || event.description;

  return (
    <ScrollView style={styles.container}>
      {/* Event Image */}
      <View style={styles.imageContainer}>
        {event.images && event.images.length > 0 ? (
          <Image
            source={{ uri: event.images[0] }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image" size={64} color="#CCCCCC" />
          </View>
        )}
        
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareEvent}
          >
            <Ionicons name="share-social" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveEvent}
            disabled={savingInProgress}
          >
            {savingInProgress ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Event Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.eventTitle}>{eventTitle}</Text>
        
        <View style={styles.organiserRow}>
          <Text style={styles.organiserLabel}>{t('events.organiser')}:</Text>
          <Text style={styles.organiserName}>{event.organiser.name}</Text>
        </View>
        
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <Ionicons name="calendar" size={20} color="#666666" />
            <Text style={styles.dateTimeText}>{formatDate(event.startDate)}</Text>
          </View>
          
          <View style={styles.dateTimeItem}>
            <Ionicons name="time" size={20} color="#666666" />
            <Text style={styles.dateTimeText}>{formatTime(event.startDate)}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#666666" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationName}>{event.location.name}</Text>
            <Text style={styles.locationAddress}>{event.location.address}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleOpenMaps}
          >
            <Ionicons name="navigate" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.ageRow}>
          <Ionicons name="people" size={20} color="#666666" />
          <Text style={styles.ageText}>
            {t('events.ageRange', { min: event.minAge, max: event.maxAge })}
          </Text>
        </View>
        
        <View style={styles.categoriesRow}>
          {event.categories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{t(`categories.${category}`)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.priceRow}>
          <Ionicons
            name={event.isFree ? "pricetag" : "card"}
            size={20}
            color="#666666"
          />
          <Text style={styles.priceText}>
            {event.isFree
              ? t('events.free')
              : event.price
              ? `${event.price.amount} ${event.price.currency}`
              : t('events.priceNotSpecified')}
          </Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>{t('events.description')}</Text>
          <Text
            style={[
              styles.descriptionText,
              !isExpanded && { maxHeight: 100 },
            ]}
            numberOfLines={isExpanded ? undefined : 4}
          >
            {eventDescription}
          </Text>
          
          {eventDescription.length > 150 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? t('common.readLess') : t('common.readMore')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {event.website && (
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={handleOpenWebsite}
            >
              <Ionicons name="globe" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>{t('events.visitWebsite')}</Text>
            </TouchableOpacity>
          )}
          
          {event.registrationRequired && event.registrationUrl && (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Ionicons name="log-in" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>{t('events.register')}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Comments Section */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>
            {t('comments.title')} ({comments.length})
          </Text>
          
          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>{t('comments.noComments')}</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.userName}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          )}
          
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={() => {
              // In a real app, we would navigate to a comment form or show a modal
              Alert.alert(t('comments.addComment'), t('comments.commentFeature'));
            }}
          >
            <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>{t('comments.addComment')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  imageContainer: {
    height: 250,
    position: 'relative',
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
  backIconButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  detailsContainer: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  organiserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  organiserLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  organiserName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  locationName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666666',
  },
  directionsButton: {
    padding: 4,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ageText: {
    marginLeft: 8,
    fontSize: 14,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    overflow: 'hidden',
  },
  expandButton: {
    marginTop: 8,
  },
  expandButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  websiteButton: {
    backgroundColor: '#607D8B',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  commentsContainer: {
    marginBottom: 24,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#666666',
  },
  commentText: {
    fontSize: 14,
  },
  addCommentButton: {
    backgroundColor: '#FF9800',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EventDetailScreen;
