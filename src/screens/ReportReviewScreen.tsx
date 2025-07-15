import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import useReports, { Report } from '../hooks/useReports';
import { useUserRole } from '../hooks/useUserRole';

type RootStackParamList = {
  ReportReview: undefined;
  EventDetail: { eventId: string };
  Login: undefined;
};

type ReportReviewNavigationProp = StackNavigationProp<RootStackParamList, 'ReportReview'>;

/**
 * Screen for admins to review reported content
 * Enforces role_access rule: only admin users can access this screen
 */
const ReportReviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ReportReviewNavigationProp>();
  const { reports, loading, error, resolveReport, dismissReport, refresh } = useReports();
  const { role, userCityId } = useUserRole();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Check if user has admin permissions
  const isAdmin = role === 'admin';

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  // Open report details modal
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  // Close report details modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  // Handle resolve report
  const handleResolveReport = async (report: Report) => {
    Alert.alert(
      t('admin.confirmResolve'),
      t('admin.confirmResolveDescription'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.resolve'),
          style: 'destructive',
          onPress: async () => {
            setProcessingAction(true);
            const success = await resolveReport(report);
            setProcessingAction(false);
            
            if (success) {
              Alert.alert(
                t('admin.reportResolved'),
                t('admin.reportResolvedDescription'),
                [{ text: t('common.ok') }]
              );
              setModalVisible(false);
            } else {
              Alert.alert(
                t('errors.error'),
                t('errors.failedToResolveReport'),
                [{ text: t('common.ok') }]
              );
            }
          },
        },
      ]
    );
  };

  // Handle dismiss report
  const handleDismissReport = async (report: Report) => {
    Alert.alert(
      t('admin.confirmDismiss'),
      t('admin.confirmDismissDescription'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.dismiss'),
          onPress: async () => {
            setProcessingAction(true);
            const success = await dismissReport(report);
            setProcessingAction(false);
            
            if (success) {
              Alert.alert(
                t('admin.reportDismissed'),
                t('admin.reportDismissedDescription'),
                [{ text: t('common.ok') }]
              );
              setModalVisible(false);
            } else {
              Alert.alert(
                t('errors.error'),
                t('errors.failedToDismissReport'),
                [{ text: t('common.ok') }]
              );
            }
          },
        },
      ]
    );
  };

  // Navigate to content detail
  const handleViewContent = (report: Report) => {
    if (report.type === 'event') {
      navigation.navigate('EventDetail', { eventId: report.targetId });
    }
    // Add navigation for other content types as needed
  };

  // Get report type label
  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'event':
        return t('admin.event');
      case 'comment':
        return t('admin.comment');
      case 'profile':
        return t('admin.profile');
      default:
        return t('admin.content');
    }
  };

  // Get report reason label
  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'inappropriate':
        return t('admin.inappropriate');
      case 'spam':
        return t('admin.spam');
      case 'offensive':
        return t('admin.offensive');
      case 'misleading':
        return t('admin.misleading');
      case 'other':
        return t('admin.other');
      default:
        return reason;
    }
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
        <Text style={styles.headerTitle}>{t('admin.reportReview')}</Text>
        <Text style={styles.cityBadge}>{userCityId}</Text>
      </View>
      
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
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyTitle}>{t('admin.allClear')}</Text>
            <Text style={styles.emptyText}>{t('admin.noReportedContent')}</Text>
          </View>
        ) : (
          <View style={styles.reportsContainer}>
            <Text style={styles.sectionTitle}>
              {t('admin.pendingReports')} ({reports.length})
            </Text>
            
            {reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => handleViewReport(report)}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportTypeBadge}>
                    <Ionicons
                      name={
                        report.type === 'event'
                          ? 'calendar'
                          : report.type === 'comment'
                          ? 'chatbubble'
                          : 'person'
                      }
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.reportTypeBadgeText}>
                      {getReportTypeLabel(report.type)}
                    </Text>
                  </View>
                  
                  <Text style={styles.reportDate}>
                    {format(report.reportedAt, 'MMM d, yyyy')}
                  </Text>
                </View>
                
                <View style={styles.reportContent}>
                  <Text style={styles.reportReason}>
                    {getReasonLabel(report.reason)}
                  </Text>
                  
                  <Text style={styles.reportDetails} numberOfLines={2}>
                    {report.details || t('admin.noDetails')}
                  </Text>
                </View>
                
                <View style={styles.reportFooter}>
                  <TouchableOpacity
                    style={[styles.reportButton, styles.viewButton]}
                    onPress={() => handleViewReport(report)}
                  >
                    <Ionicons name="eye" size={16} color="#2196F3" />
                    <Text style={[styles.reportButtonText, styles.viewButtonText]}>
                      {t('common.view')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.reportButton, styles.dismissButton]}
                    onPress={() => handleDismissReport(report)}
                  >
                    <Ionicons name="close" size={16} color="#FF9800" />
                    <Text style={[styles.reportButtonText, styles.dismissButtonText]}>
                      {t('common.dismiss')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.reportButton, styles.resolveButton]}
                    onPress={() => handleResolveReport(report)}
                  >
                    <Ionicons name="checkmark" size={16} color="#4CAF50" />
                    <Text style={[styles.reportButtonText, styles.resolveButtonText]}>
                      {t('common.resolve')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Report Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedReport && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {t('admin.reportDetails')}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleCloseModal}
                  >
                    <Ionicons name="close" size={24} color="#000000" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('admin.reportType')}</Text>
                    <View style={styles.reportTypeBadge}>
                      <Ionicons
                        name={
                          selectedReport.type === 'event'
                            ? 'calendar'
                            : selectedReport.type === 'comment'
                            ? 'chatbubble'
                            : 'person'
                        }
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.reportTypeBadgeText}>
                        {getReportTypeLabel(selectedReport.type)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('admin.reportReason')}</Text>
                    <Text style={styles.detailValue}>
                      {getReasonLabel(selectedReport.reason)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('admin.reportDate')}</Text>
                    <Text style={styles.detailValue}>
                      {format(selectedReport.reportedAt, 'MMM d, yyyy HH:mm')}
                    </Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>{t('admin.reportDetails')}</Text>
                    <Text style={styles.detailText}>
                      {selectedReport.details || t('admin.noDetails')}
                    </Text>
                  </View>
                  
                  {selectedReport.contentSnapshot && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>{t('admin.contentPreview')}</Text>
                      
                      {selectedReport.type === 'event' && (
                        <>
                          <Text style={styles.contentTitle}>
                            {selectedReport.contentSnapshot.title?.en || t('admin.untitled')}
                          </Text>
                          <Text style={styles.contentDescription}>
                            {selectedReport.contentSnapshot.description?.en || t('admin.noDescription')}
                          </Text>
                        </>
                      )}
                      
                      {selectedReport.type === 'comment' && (
                        <Text style={styles.contentDescription}>
                          {selectedReport.contentSnapshot.text || t('admin.noContent')}
                        </Text>
                      )}
                      
                      {selectedReport.type === 'profile' && (
                        <Text style={styles.contentDescription}>
                          {selectedReport.contentSnapshot.displayName || t('admin.noName')}
                        </Text>
                      )}
                    </View>
                  )}
                </ScrollView>
                
                <View style={styles.modalActions}>
                  {selectedReport.type === 'event' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.viewContentButton]}
                      onPress={() => {
                        handleCloseModal();
                        handleViewContent(selectedReport);
                      }}
                    >
                      <Text style={styles.viewContentButtonText}>
                        {t('admin.viewContent')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.dismissReportButton]}
                    onPress={() => handleDismissReport(selectedReport)}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.dismissReportButtonText}>
                        {t('admin.dismissReport')}
                      </Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.resolveReportButton]}
                    onPress={() => handleResolveReport(selectedReport)}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.resolveReportButtonText}>
                        {t('admin.resolveReport')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  reportsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  reportTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reportTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reportDate: {
    fontSize: 12,
    color: '#666666',
  },
  reportContent: {
    padding: 12,
  },
  reportReason: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reportDetails: {
    fontSize: 14,
    color: '#333333',
  },
  reportFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  reportButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  viewButton: {
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  viewButtonText: {
    color: '#2196F3',
  },
  dismissButton: {
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  dismissButtonText: {
    color: '#FF9800',
  },
  resolveButton: {},
  resolveButtonText: {
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewContentButton: {
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  viewContentButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  dismissReportButton: {
    backgroundColor: '#FF9800',
  },
  dismissReportButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resolveReportButton: {
    backgroundColor: '#4CAF50',
  },
  resolveReportButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ReportReviewScreen;
