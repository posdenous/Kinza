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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import useSavedEvents from '../hooks/useSavedEvents';
import EventCardWithSkeleton from '../components/EventCardWithSkeleton';
import { Event } from '../types/events';
import authService from '../auth/authService';
import { doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';

type RootStackParamList = {
  SavedEvents: undefined;
  EventDetail: { eventId: string };
  Login: undefined;
};

type SavedEventsNavigationProp = StackNavigationProp<RootStackParamList, 'SavedEvents'>;

/**
 * Screen for displaying and managing user's saved events
 */
const SavedEventsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SavedEventsNavigationProp>();
  const { savedEvents, loading, error, refresh } = useSavedEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [removingEventId, setRemovingEventId] = useState<string | null>(null);

  // Check if user is authenticated
  const user = authService.getCurrentUser();
  const isAuthenticated = !!user;

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  // Handle event press
  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  // Handle remove saved event
  const handleRemoveSavedEvent = async (event: Event) => {
    if (!user) return;
    
    try {
      setRemovingEventId(event.id);
      
      const savedEventId = `${user.uid}_${event.id}`;
      await deleteDoc(doc(firestore, 'savedEvents', savedEventId));
      
      // Refresh the list
      refresh();
    } catch (error) {
      console.error('Error removing saved event:', error);
      Alert.alert(t('errors.title'), t('errors.removeSavedEvent'));
    } finally {
      setRemovingEventId(null);
    }
  };

  // Navigate to login screen
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Render not authenticated state
  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bookmark" size={64} color="#CCCCCC" />
        <Text style={styles.titleText}>{t('savedEvents.loginRequired')}</Text>
        <Text style={styles.subtitleText}>{t('savedEvents.loginToSeeEvents')}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render loading state with skeletons
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('savedEvents.title')}</Text>
        </View>
        
        <View style={styles.listContent}>
          {/* Show 3 skeleton cards while loading */}
          <EventCardWithSkeleton loading={true} onPress={() => {}} />
          <EventCardWithSkeleton loading={true} onPress={() => {}} />
          <EventCardWithSkeleton loading={true} onPress={() => {}} />
        </View>
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
  if (savedEvents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('savedEvents.title')}</Text>
        </View>
        
        <View style={styles.centerContainer}>
          <Ionicons name="bookmark" size={64} color="#CCCCCC" />
          <Text style={styles.titleText}>{t('savedEvents.noEvents')}</Text>
          <Text style={styles.subtitleText}>{t('savedEvents.saveEventsTip')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('savedEvents.title')}</Text>
      </View>
      
      <FlatList
        data={savedEvents}
        keyExtractor={(item) => item.eventId}
        renderItem={({ item }) => {
          // Skip events with no details (might have been deleted)
          if (!item.eventDetails) return null;
          
          return (
            <EventCardWithSkeleton
              event={item.eventDetails}
              loading={removingEventId === item.eventId}
              onPress={handleEventPress}
              onSaveToggle={handleRemoveSavedEvent}
              isSaved={true}
              testID={`saved-event-${item.eventId}`}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
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
  },
  headerTitle: {
    fontSize: 20,
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
  loginButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  loginButtonText: {
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
});

export default SavedEventsScreen;
