import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardStats {
  pendingEvents: number;
  pendingComments: number;
  activeEvents: number;
  reportedContent: number;
}

interface AdminToolsSectionProps {
  stats: DashboardStats;
  onNavigateToModerationQueue: () => void;
  onNavigateToReportReview: () => void;
  t: (key: string) => string;
}

/**
 * Admin tools section component
 * Provides navigation to admin-specific tools and features
 */
const AdminToolsSection: React.FC<AdminToolsSectionProps> = ({
  stats,
  onNavigateToModerationQueue,
  onNavigateToReportReview,
  t
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{t('admin.tools')}</Text>
      
      {/* Moderation Queue Tool */}
      <TouchableOpacity
        style={styles.toolButton}
        onPress={onNavigateToModerationQueue}
        testID="moderation-queue-button"
      >
        <View style={styles.toolIconContainer}>
          <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>{t('admin.moderationQueue')}</Text>
          <Text style={styles.toolDescription}>{t('admin.moderationQueueDesc')}</Text>
        </View>
        <View style={styles.toolBadgeContainer}>
          {(stats.pendingEvents + stats.pendingComments) > 0 && (
            <Text style={styles.toolBadgeText}>
              {stats.pendingEvents + stats.pendingComments}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </View>
      </TouchableOpacity>

      {/* Report Review Tool */}
      <TouchableOpacity
        style={styles.toolButton}
        onPress={onNavigateToReportReview}
        testID="report-review-button"
      >
        <View style={styles.toolIconContainer}>
          <Ionicons name="flag" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>{t('admin.reportReview')}</Text>
          <Text style={styles.toolDescription}>{t('admin.reportReviewDesc')}</Text>
        </View>
        <View style={styles.toolBadgeContainer}>
          {stats.reportedContent > 0 && (
            <Text style={styles.toolBadgeText}>
              {stats.reportedContent}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AdminToolsSection;
