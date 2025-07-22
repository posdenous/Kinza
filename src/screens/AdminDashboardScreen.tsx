import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useUserRole } from '../hooks/useUserRole';
import { useApiWithRetry } from '../hooks/common/useApiWithRetry';
import StatCardWithSkeleton from '../components/StatCardWithSkeleton';

type RootStackParamList = {
  AdminDashboard: undefined;
  ModerationQueue: undefined;
  ReportReview: undefined;
  EventDetail: { eventId: string };
  Login: undefined;
};

type AdminDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

interface DashboardStats {
  pendingEvents: number;
  pendingComments: number;
  activeEvents: number;
  reportedContent: number;
}

/**
 * Admin dashboard screen showing overview and access to admin tools
 * Enforces role_access rule: only admin users can access this screen
 */
const AdminDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { role, userCityId } = useUserRole();
  
  const [stats, setStats] = useState<DashboardStats>({
    pendingEvents: 0,
    pendingComments: 0,
    activeEvents: 0,
    reportedContent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin permissions
  const isAdmin = role === 'admin';

  // Create API call function for retry logic
  const fetchStatsApiCall = useCallback(async () => {
    if (!isAdmin) {
      throw new Error('User not authorized to view admin stats');
    }

    // Fetch pending events count
    const pendingEventsQuery = query(
      collection(firestore, 'events'),
      where('status', '==', 'pending'),
      where('cityId', '==', userCityId)
    );
    const pendingEventsSnapshot = await getDocs(pendingEventsQuery);
    
    // Fetch pending comments count
    const pendingCommentsQuery = query(
      collection(firestore, 'comments'),
      where('status', '==', 'pending'),
      where('cityId', '==', userCityId)
    );
    const pendingCommentsSnapshot = await getDocs(pendingCommentsQuery);
    
    // Fetch active events count
    const activeEventsQuery = query(
      collection(firestore, 'events'),
      where('status', '==', 'approved'),
      where('cityId', '==', userCityId)
    );
    const activeEventsSnapshot = await getDocs(activeEventsQuery);
    
    // Fetch reported content count
    const reportedContentQuery = query(
      collection(firestore, 'reports'),
      where('status', '==', 'pending'),
      where('cityId', '==', userCityId)
    );
    const reportedContentSnapshot = await getDocs(reportedContentQuery);
    
    return {
      pendingEvents: pendingEventsSnapshot.size,
      pendingComments: pendingCommentsSnapshot.size,
      activeEvents: activeEventsSnapshot.size,
      reportedContent: reportedContentSnapshot.size,
    };
  }, [isAdmin, userCityId]);

  // Use retry-enabled API call for fetching stats
  const { execute: fetchStatsWithRetry, isRetrying } = useApiWithRetry(
    fetchStatsApiCall,
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  );

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchStatsWithRetry();
        setStats(result);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        if (err instanceof Error && err.message === 'User not authorized to view admin stats') {
          setError('User not authorized to view admin stats');
        } else {
          setError(t('errors.fetchStats'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [fetchStatsWithRetry, isAdmin, t]);

  // Navigate to moderation queue
  const handleNavigateToModerationQueue = () => {
    navigation.navigate('ModerationQueue');
  };

  // Navigate to report review
  const handleNavigateToReportReview = () => {
    navigation.navigate('ReportReview');
  };

  // Render not authorized state
  if (!isAdmin) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.titleText}>{t('errors.notAuthorized')}</Text>
        <Text style={styles.subtitleText}>{t('errors.adminOnly')}</Text>
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
        <Text style={styles.headerTitle}>{t('admin.dashboard')}</Text>
        <Text style={styles.cityBadge}>{userCityId}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>
              {isRetrying ? t('common.retrying') : t('common.loading')}
            </Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatCardWithSkeleton
                loading={loading || isRetrying}
                title={t('admin.pendingEvents')}
                value={stats.pendingEvents}
                backgroundColor="#FF9800"
                textColor="#FFFFFF"
                testID="pending-events-card"
              />
              <StatCardWithSkeleton
                loading={loading || isRetrying}
                title={t('admin.pendingComments')}
                value={stats.pendingComments}
                backgroundColor="#9C27B0"
                textColor="#FFFFFF"
                testID="pending-comments-card"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCardWithSkeleton
                loading={loading || isRetrying}
                title={t('admin.activeEvents')}
                value={stats.activeEvents}
                backgroundColor="#4CAF50"
                textColor="#FFFFFF"
                testID="active-events-card"
              />
              <StatCardWithSkeleton
                loading={loading || isRetrying}
                title={t('admin.reportedContent')}
                value={stats.reportedContent}
                backgroundColor="#F44336"
                textColor="#FFFFFF"
                testID="reported-content-card"
              />
            </View>
          </View>
        )}
        
        {/* Admin Tools */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('admin.tools')}</Text>
          
          <TouchableOpacity
            style={styles.toolButton}
            onPress={handleNavigateToModerationQueue}
          >
            <View style={styles.toolIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.toolTextContainer}>
              <Text style={styles.toolTitle}>{t('admin.moderationQueue')}</Text>
              <Text style={styles.toolDescription}>{t('admin.moderationQueueDescription')}</Text>
            </View>
            <View style={styles.toolBadgeContainer}>
              <Text style={styles.toolBadgeText}>
                {stats.pendingEvents + stats.pendingComments}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolButton}
            onPress={handleNavigateToReportReview}
          >
            <View style={[styles.toolIconContainer, { backgroundColor: '#F44336' }]}>
              <Ionicons name="flag" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.toolTextContainer}>
              <Text style={styles.toolTitle}>{t('admin.reportReview')}</Text>
              <Text style={styles.toolDescription}>{t('admin.reportReviewDescription')}</Text>
            </View>
            <View style={styles.toolBadgeContainer}>
              <Text style={styles.toolBadgeText}>{stats.reportedContent}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Admin Guidelines */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('admin.guidelines')}</Text>
          
          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>{t('admin.moderationPolicy')}</Text>
            <Text style={styles.guidelineText}>{t('admin.moderationPolicyDescription')}</Text>
            
            <View style={styles.guidelineRule}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.guidelineRuleText}>{t('admin.approveRule1')}</Text>
            </View>
            
            <View style={styles.guidelineRule}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.guidelineRuleText}>{t('admin.approveRule2')}</Text>
            </View>
            
            <View style={styles.guidelineRule}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={styles.guidelineRuleText}>{t('admin.rejectRule1')}</Text>
            </View>
            
            <View style={styles.guidelineRule}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={styles.guidelineRuleText}>{t('admin.rejectRule2')}</Text>
            </View>
          </View>
        </View>
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
  pendingEventsCard: {
    backgroundColor: '#FF9800',
  },
  pendingCommentsCard: {
    backgroundColor: '#9C27B0',
  },
  activeEventsCard: {
    backgroundColor: '#4CAF50',
  },
  reportedContentCard: {
    backgroundColor: '#F44336',
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  toolButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolTextContainer: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#666666',
  },
  toolBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBadgeText: {
    backgroundColor: '#F44336',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  guidelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 16,
  },
  guidelineRule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guidelineRuleText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
});

export default AdminDashboardScreen;
