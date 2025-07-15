import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import useOrganiserEvents from '../hooks/useOrganiserEvents';
import { useUserRole } from '../hooks/useUserRole';
import EventCard from '../components/EventCard';
import { Event } from '../types/events';

type RootStackParamList = {
  OrganiserDashboard: undefined;
  SubmitEvent: undefined;
  EventDetail: { eventId: string };
  Login: undefined;
};

type OrganiserDashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OrganiserDashboard'
>;

/**
 * Dashboard screen for event organisers
 * Enforces role_access rule: only organiser users can access this screen
 */
const OrganiserDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<OrganiserDashboardNavigationProp>();
  const { events, loading, error, refresh, stats } = useOrganiserEvents();
  const { role, userCityId } = useUserRole();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Check if user has organiser permissions
  const isOrganiser = role === 'organiser';

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

  // Handle create new event
  const handleCreateEvent = () => {
    navigation.navigate('SubmitEvent');
  };

  // Filter events based on active tab
  const filteredEvents = events.filter((event) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return event.status === 'pending';
    if (activeTab === 'approved') return event.status === 'approved';
    if (activeTab === 'rejected') return event.status === 'rejected';
    return true;
  });

  // Render not authorized state
  if (!isOrganiser) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.titleText}>{t('errors.notAuthorized')}</Text>
        <Text style={styles.subtitleText}>{t('errors.organiserOnly')}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('organiser.dashboard')}</Text>
        <Text style={styles.cityBadge}>{userCityId}</Text>
      </View>
      
      {/* Stats Section */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={[styles.statsCard, styles.totalEventsCard]}>
                  <Ionicons name="calendar" size={24} color="#FFFFFF" />
                  <Text style={styles.statsNumber}>{stats.total}</Text>
                  <Text style={styles.statsLabel}>{t('organiser.totalEvents')}</Text>
                </View>
                
                <View style={[styles.statsCard, styles.pendingEventsCard]}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                  <Text style={styles.statsNumber}>{stats.pending}</Text>
                  <Text style={styles.statsLabel}>{t('organiser.pendingEvents')}</Text>
                </View>
              </View>
              
              <View style={styles.statsRow}>
                <View style={[styles.statsCard, styles.viewsCard]}>
                  <Ionicons name="eye" size={24} color="#FFFFFF" />
                  <Text style={styles.statsNumber}>{stats.views}</Text>
                  <Text style={styles.statsLabel}>{t('organiser.totalViews')}</Text>
                </View>
                
                <View style={[styles.statsCard, styles.savesCard]}>
                  <Ionicons name="bookmark" size={24} color="#FFFFFF" />
                  <Text style={styles.statsNumber}>{stats.saves}</Text>
                  <Text style={styles.statsLabel}>{t('organiser.totalSaves')}</Text>
                </View>
              </View>
            </View>
            
            {/* Create Event Button */}
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={handleCreateEvent}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.createEventButtonText}>{t('organiser.createEvent')}</Text>
            </TouchableOpacity>
            
            {/* Events Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'all' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('all')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'all' && styles.activeTabText,
                  ]}
                >
                  {t('organiser.allEvents')} ({stats.total})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'pending' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('pending')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'pending' && styles.activeTabText,
                  ]}
                >
                  {t('organiser.pending')} ({stats.pending})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'approved' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('approved')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'approved' && styles.activeTabText,
                  ]}
                >
                  {t('organiser.approved')} ({stats.approved})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'rejected' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('rejected')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'rejected' && styles.activeTabText,
                  ]}
                >
                  {t('organiser.rejected')} ({stats.rejected})
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Events List */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                  <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>
                  {activeTab === 'all'
                    ? t('organiser.noEvents')
                    : activeTab === 'pending'
                    ? t('organiser.noPendingEvents')
                    : activeTab === 'approved'
                    ? t('organiser.noApprovedEvents')
                    : t('organiser.noRejectedEvents')}
                </Text>
                {activeTab === 'all' && (
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateEvent}
                  >
                    <Text style={styles.createButtonText}>{t('organiser.createFirst')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.eventsContainer}>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'all'
                    ? t('organiser.yourEvents')
                    : activeTab === 'pending'
                    ? t('organiser.pendingEvents')
                    : activeTab === 'approved'
                    ? t('organiser.approvedEvents')
                    : t('organiser.rejectedEvents')}
                </Text>
                
                {filteredEvents.map((event) => (
                  <View key={event.id} style={styles.eventItemContainer}>
                    <View style={styles.eventStatusBadge}>
                      <View
                        style={[
                          styles.statusIndicator,
                          { backgroundColor: event.statusColor },
                        ]}
                      />
                      <Text style={styles.statusText}>{event.statusLabel}</Text>
                    </View>
                    
                    <EventCard
                      event={event}
                      onPress={handleEventPress}
                    />
                    
                    <View style={styles.eventStats}>
                      <View style={styles.eventStat}>
                        <Ionicons name="eye" size={16} color="#666666" />
                        <Text style={styles.eventStatText}>{event.views || 0}</Text>
                      </View>
                      
                      <View style={styles.eventStat}>
                        <Ionicons name="bookmark" size={16} color="#666666" />
                        <Text style={styles.eventStatText}>{event.saves || 0}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  cityBadge: {
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
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
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalEventsCard: {
    backgroundColor: '#2196F3',
  },
  pendingEventsCard: {
    backgroundColor: '#FF9800',
  },
  viewsCard: {
    backgroundColor: '#9C27B0',
  },
  savesCard: {
    backgroundColor: '#4CAF50',
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  createEventButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventItemContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  eventStatusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  eventStatText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
});

export default OrganiserDashboardScreen;
