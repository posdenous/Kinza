import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatCardWithSkeleton from '../StatCardWithSkeleton';

interface DashboardStats {
  pendingEvents: number;
  pendingComments: number;
  activeEvents: number;
  reportedContent: number;
}

interface AdminStatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
  isRetrying: boolean;
  t: (key: string) => string;
}

/**
 * Admin dashboard statistics cards component
 * Displays key metrics in a clean card layout
 */
const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats,
  loading,
  isRetrying,
  t
}) => {
  return (
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
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default AdminStatsCards;
