import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CommentList from '../components/CommentList';
import CommentInput from '../components/CommentInput';
import theme from '../styles/theme';

interface EventDetailScreenProps {
  route: {
    params: {
      eventId: string;
      event?: {
        id: string;
        title: string;
        description: string;
        date: string;
        ageRange: string;
        venue: string;
        imageUrl?: string;
        price?: string;
        organizer: string;
      };
    };
  };
}

/**
 * Event detail screen with integrated comment pagination
 * Demonstrates the new comment system with load more functionality
 */
const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { eventId, event } = route.params;
  
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  const handleCommentAdded = () => {
    // Refresh comment list when new comment is added
    setCommentCount(prev => prev + 1);
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('events.notFound')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="event-detail-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('events.eventDetails')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        )}

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.light} />
              <Text style={styles.metaText}>{event.date}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={theme.colors.text.light} />
              <Text style={styles.metaText}>{event.ageRange}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={theme.colors.text.light} />
              <Text style={styles.metaText}>{event.venue}</Text>
            </View>
            
            {event.price && (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={16} color={theme.colors.text.light} />
                <Text style={styles.metaText}>{event.price}</Text>
              </View>
            )}
          </View>

          <Text style={styles.eventDescription}>{event.description}</Text>
          
          <Text style={styles.organizerText}>
            {t('events.organizedBy')} {event.organizer}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} testID="save-event-button">
            <Ionicons name="heart-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.saveButtonText}>{t('events.save')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.commentButton} 
            onPress={() => setShowComments(!showComments)}
            testID="toggle-comments-button"
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.commentButtonText}>
              {t('events.comments')} ({commentCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.locationButton} testID="location-button">
            <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.locationButtonText}>{t('events.location')}</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Input */}
        <View style={styles.commentInputSection}>
          <CommentInput 
            eventId={eventId}
            onCommentAdded={handleCommentAdded}
          />
        </View>

        {/* Comments Section with Pagination */}
        {showComments && (
          <View style={styles.commentsSection} testID="comments-section">
            <CommentList
              eventId={eventId}
              initialLimit={10}
              loadMoreLimit={5}
              showHeader={true}
              onCommentCountChange={handleCommentCountChange}
              testID="event-comments"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing[2],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: theme.spacing[4],
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  eventMeta: {
    marginBottom: theme.spacing[4],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  metaText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    marginLeft: theme.spacing[2],
  },
  eventDescription: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.primary,
    lineHeight: 22,
    marginBottom: theme.spacing[4],
  },
  organizerText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  saveButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing[1],
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  commentButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing[1],
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  locationButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing[1],
  },
  commentInputSection: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commentsSection: {
    minHeight: 400,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing[6],
  },
});

export default EventDetailScreen;
