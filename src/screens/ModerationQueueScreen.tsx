import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import useModeration, { ModerationItem as ModerationItemType } from '../hooks/useModeration';
import ModerationItem from '../components/ModerationItem';
import { useUserRole } from '../hooks/useUserRole';
import EventCard from '../components/EventCard';

type RootStackParamList = {
  ModerationQueue: undefined;
  EventDetail: { eventId: string };
  AdminDashboard: undefined;
};

type ModerationQueueNavigationProp = StackNavigationProp<RootStackParamList, 'ModerationQueue'>;

/**
 * Screen for displaying and managing content moderation queue
 * Enforces UGC moderation rule: all user-generated content must pass moderation before display
 */
const ModerationQueueScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ModerationQueueNavigationProp>();
  const { pendingItems, loading, error, approveItem, rejectItem, refresh } = useModeration();
  const { role, userCityId } = useUserRole();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModerationItemType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  // Check if user has admin permissions
  const isAdmin = role === 'admin';

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  // Handle view item
  const handleViewItem = (item: ModerationItemType) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Handle approve item
  const handleApproveItem = async (item: ModerationItemType) => {
    setProcessingItem(item.id);
    
    const success = await approveItem(item);
    
    if (success) {
      Alert.alert(
        t('moderation.success'),
        t('moderation.itemApproved')
      );
    } else {
      Alert.alert(
        t('errors.title'),
        t('errors.approveItem')
      );
    }
    
    setProcessingItem(null);
    setModalVisible(false);
  };

  // Handle reject item
  const handleRejectItem = async (item: ModerationItemType) => {
    Alert.alert(
      t('moderation.confirmReject'),
      t('moderation.rejectWarning'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('moderation.reject'),
          style: 'destructive',
          onPress: async () => {
            setProcessingItem(item.id);
            
            const success = await rejectItem(item);
            
            if (success) {
              Alert.alert(
                t('moderation.success'),
                t('moderation.itemRejected')
              );
            } else {
              Alert.alert(
                t('errors.title'),
                t('errors.rejectItem')
              );
            }
            
            setProcessingItem(null);
            setModalVisible(false);
          },
        },
      ]
    );
  };

  // Navigate to event detail
  const handleNavigateToEvent = (eventId: string) => {
    setModalVisible(false);
    navigation.navigate('EventDetail', { eventId });
  };

  // Render not authorized state
  if (!isAdmin) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.titleText}>{t('errors.notAuthorized')}</Text>
        <Text style={styles.subtitleText}>{t('errors.adminOnly')}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render empty state
  if (pendingItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('moderation.queue')}</Text>
          <Text style={styles.cityBadge}>{userCityId}</Text>
        </View>
        
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text style={styles.titleText}>{t('moderation.allClear')}</Text>
          <Text style={styles.subtitleText}>{t('moderation.noItemsToModerate')}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
            <Text style={styles.refreshButtonText}>{t('common.refresh')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('moderation.queue')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{pendingItems.length}</Text>
          </View>
          <Text style={styles.cityBadge}>{userCityId}</Text>
        </View>
      </View>
      
      <FlatList
        data={pendingItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ModerationItem
            item={item}
            onApprove={handleApproveItem}
            onReject={handleRejectItem}
            onView={handleViewItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      
      {/* Item Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem?.type === 'event'
                  ? t('moderation.eventDetails')
                  : selectedItem?.type === 'comment'
                  ? t('moderation.commentDetails')
                  : t('moderation.itemDetails')}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedItem?.type === 'event' && (
                <>
                  <EventCard
                    event={selectedItem.content}
                    onPress={() => handleNavigateToEvent(selectedItem.id)}
                  />
                  <Text style={styles.detailLabel}>{t('events.description')}</Text>
                  <Text style={styles.detailText}>{selectedItem.content.description}</Text>
                  
                  <Text style={styles.detailLabel}>{t('events.organiser')}</Text>
                  <Text style={styles.detailText}>{selectedItem.content.organiser?.name}</Text>
                </>
              )}
              
              {selectedItem?.type === 'comment' && (
                <>
                  <Text style={styles.detailLabel}>{t('comments.eventTitle')}</Text>
                  <Text style={styles.detailText}>{selectedItem.content.eventTitle}</Text>
                  
                  <Text style={styles.detailLabel}>{t('comments.author')}</Text>
                  <Text style={styles.detailText}>{selectedItem.content.userName}</Text>
                  
                  <Text style={styles.detailLabel}>{t('comments.comment')}</Text>
                  <Text style={styles.detailText}>{selectedItem.content.text}</Text>
                </>
              )}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.rejectButtonLarge}
                onPress={() => selectedItem && handleRejectItem(selectedItem)}
                disabled={!!processingItem}
              >
                {processingItem === selectedItem?.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{t('moderation.reject')}</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.approveButtonLarge}
                onPress={() => selectedItem && handleApproveItem(selectedItem)}
                disabled={!!processingItem}
              >
                {processingItem === selectedItem?.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{t('moderation.approve')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cityBadge: {
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#607D8B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    maxHeight: '70%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
  },
  approveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  rejectButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ModerationQueueScreen;
