import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ModerationItem as ModerationItemType } from '../hooks/useModeration';

interface ModerationItemProps {
  item: ModerationItemType;
  onApprove: (item: ModerationItemType) => void;
  onReject: (item: ModerationItemType) => void;
  onView: (item: ModerationItemType) => void;
}

/**
 * Component for displaying a single moderation item
 */
const ModerationItem: React.FC<ModerationItemProps> = ({
  item,
  onApprove,
  onReject,
  onView,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(currentLanguage, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get item title based on type
  const getItemTitle = () => {
    if (item.type === 'event') {
      const eventTitle = item.content.translations?.[currentLanguage]?.title || item.content.title;
      return eventTitle;
    } else if (item.type === 'comment') {
      return t('moderation.commentOn', { eventTitle: item.content.eventTitle || 'Event' });
    } else if (item.type === 'profile') {
      return item.content.displayName || t('moderation.userProfile');
    }
    return t('moderation.unknownItem');
  };

  // Get item preview content
  const getItemPreview = () => {
    if (item.type === 'event') {
      const eventDesc = item.content.translations?.[currentLanguage]?.description || item.content.description;
      return eventDesc?.substring(0, 100) + '...';
    } else if (item.type === 'comment') {
      return item.content.text?.substring(0, 100) + '...';
    } else if (item.type === 'profile') {
      return item.content.bio?.substring(0, 100) + '...';
    }
    return '';
  };

  // Get icon for item type
  const getItemIcon = () => {
    switch (item.type) {
      case 'event':
        return 'calendar';
      case 'comment':
        return 'chatbubble';
      case 'profile':
        return 'person';
      default:
        return 'document';
    }
  };

  return (
    <View style={styles.container}>
      {/* Item Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Ionicons name={getItemIcon()} size={16} color="#FFFFFF" />
          <Text style={styles.typeText}>
            {t(`moderation.types.${item.type}`)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>

      {/* Item Content */}
      <View style={styles.contentContainer}>
        {/* Item Image (if available) */}
        {item.type === 'event' && item.content.images && item.content.images.length > 0 && (
          <Image
            source={{ uri: item.content.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Item Title */}
        <Text style={styles.title}>{getItemTitle()}</Text>

        {/* Item Preview */}
        <Text style={styles.preview} numberOfLines={3}>
          {getItemPreview()}
        </Text>

        {/* Item Metadata */}
        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Ionicons name="person" size={14} color="#666666" />
            <Text style={styles.metadataText}>
              {item.content.organiser?.name || item.content.userName || t('common.anonymous')}
            </Text>
          </View>

          <View style={styles.metadataItem}>
            <Ionicons name="location" size={14} color="#666666" />
            <Text style={styles.metadataText}>{item.cityId}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onView(item)}
        >
          <Ionicons name="eye" size={16} color="#2196F3" />
          <Text style={styles.viewButtonText}>{t('moderation.view')}</Text>
        </TouchableOpacity>

        <View style={styles.approveRejectContainer}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => onReject(item)}
          >
            <Ionicons name="close-circle" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>{t('moderation.reject')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => onApprove(item)}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>{t('moderation.approve')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#607D8B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
  },
  contentContainer: {
    padding: 12,
  },
  image: {
    height: 120,
    borderRadius: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  viewButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  approveRejectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ModerationItem;
