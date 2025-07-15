import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from 'react-firebase-hooks/firestore';
import { getAuth } from 'firebase/auth';
import { useUserRole } from '../hooks/useUserRole';
import { useUserCity } from '../hooks/useCities';

interface ReportFormData {
  type: 'event' | 'comment' | 'profile' | 'other';
  reason: string;
  details: string;
  contentId?: string;
  contentTitle?: string;
}

const initialReportFormData: ReportFormData = {
  type: 'other',
  reason: '',
  details: '',
};

const TrustScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [firestore] = useFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const { userRole } = useUserRole();
  const { currentCityId } = useUserCity();

  const [activeTab, setActiveTab] = useState<'guidelines' | 'report'>('guidelines');
  const [reportFormData, setReportFormData] = useState<ReportFormData>(initialReportFormData);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showReportTypeModal, setShowReportTypeModal] = useState<boolean>(false);

  const handleReportTypeSelect = (type: ReportFormData['type']) => {
    setReportFormData(prev => ({ ...prev, type }));
    setShowReportTypeModal(false);
  };

  const handleSubmitReport = async () => {
    if (!firestore) {
      Alert.alert(
        t('trust.errorTitle'),
        t('trust.firestoreError'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    // Validate form
    if (!reportFormData.reason.trim()) {
      Alert.alert(
        t('trust.validationError'),
        t('trust.reasonRequired'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!reportFormData.details.trim() || reportFormData.details.length < 10) {
      Alert.alert(
        t('trust.validationError'),
        t('trust.detailsRequired'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setSubmitting(true);

    try {
      const reportsRef = collection(firestore, 'reports');
      
      await addDoc(reportsRef, {
        ...reportFormData,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        cityId: currentCityId, // City scoping rule
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      // Reset form and show success modal
      setReportFormData(initialReportFormData);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error submitting report:', err);
      Alert.alert(
        t('trust.errorTitle'),
        t('trust.submitError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderGuidelinesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('trust.communityGuidelines')}</Text>
        <Text style={styles.paragraph}>{t('trust.communityIntro')}</Text>
        
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guidelineIcon} />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>{t('trust.guideline1Title')}</Text>
            <Text style={styles.guidelineText}>{t('trust.guideline1Text')}</Text>
          </View>
        </View>
        
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guidelineIcon} />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>{t('trust.guideline2Title')}</Text>
            <Text style={styles.guidelineText}>{t('trust.guideline2Text')}</Text>
          </View>
        </View>
        
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guidelineIcon} />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>{t('trust.guideline3Title')}</Text>
            <Text style={styles.guidelineText}>{t('trust.guideline3Text')}</Text>
          </View>
        </View>
        
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guidelineIcon} />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>{t('trust.guideline4Title')}</Text>
            <Text style={styles.guidelineText}>{t('trust.guideline4Text')}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('trust.contentModeration')}</Text>
        <Text style={styles.paragraph}>{t('trust.moderationIntro')}</Text>
        
        <View style={styles.moderationItem}>
          <Text style={styles.moderationTitle}>{t('trust.moderation1Title')}</Text>
          <Text style={styles.moderationText}>{t('trust.moderation1Text')}</Text>
        </View>
        
        <View style={styles.moderationItem}>
          <Text style={styles.moderationTitle}>{t('trust.moderation2Title')}</Text>
          <Text style={styles.moderationText}>{t('trust.moderation2Text')}</Text>
        </View>
        
        <View style={styles.moderationItem}>
          <Text style={styles.moderationTitle}>{t('trust.moderation3Title')}</Text>
          <Text style={styles.moderationText}>{t('trust.moderation3Text')}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('trust.reportingContent')}</Text>
        <Text style={styles.paragraph}>{t('trust.reportingIntro')}</Text>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => setActiveTab('report')}
        >
          <Ionicons name="flag" size={20} color="#FFFFFF" />
          <Text style={styles.reportButtonText}>{t('trust.reportContent')}</Text>
        </TouchableOpacity>
      </View>
      
      {userRole === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('trust.adminTools')}</Text>
          <Text style={styles.paragraph}>{t('trust.adminIntro')}</Text>
          
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.adminButtonText}>{t('trust.goToAdminDashboard')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderReportTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('trust.reportContentTitle')}</Text>
        <Text style={styles.paragraph}>{t('trust.reportContentDesc')}</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('trust.reportType')}</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowReportTypeModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {reportFormData.type ? t(`trust.reportTypes.${reportFormData.type}`) : t('trust.selectType')}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('trust.reportReason')}</Text>
          <TextInput
            style={styles.textInput}
            value={reportFormData.reason}
            onChangeText={(text) => setReportFormData(prev => ({ ...prev, reason: text }))}
            placeholder={t('trust.reasonPlaceholder')}
            placeholderTextColor="#999999"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('trust.reportDetails')}</Text>
          <TextInput
            style={styles.textAreaInput}
            value={reportFormData.details}
            onChangeText={(text) => setReportFormData(prev => ({ ...prev, details: text }))}
            placeholder={t('trust.detailsPlaceholder')}
            placeholderTextColor="#999999"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {reportFormData.details.length} / 500
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submittingButton]}
          onPress={handleSubmitReport}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>{t('trust.submitReport')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('trust.title')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'guidelines' && styles.activeTab]}
          onPress={() => setActiveTab('guidelines')}
        >
          <Text style={[styles.tabText, activeTab === 'guidelines' && styles.activeTabText]}>
            {t('trust.guidelines')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'report' && styles.activeTab]}
          onPress={() => setActiveTab('report')}
        >
          <Text style={[styles.tabText, activeTab === 'report' && styles.activeTabText]}>
            {t('trust.report')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'guidelines' ? renderGuidelinesTab() : renderReportTab()}
      
      {/* Report Type Modal */}
      <Modal
        visible={showReportTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('trust.selectReportType')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReportTypeModal(false)}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleReportTypeSelect('event')}
              >
                <Ionicons name="calendar" size={24} color="#2196F3" style={styles.modalOptionIcon} />
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionTitle}>{t('trust.reportTypes.event')}</Text>
                  <Text style={styles.modalOptionDescription}>{t('trust.reportTypeDesc.event')}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleReportTypeSelect('comment')}
              >
                <Ionicons name="chatbubble" size={24} color="#9C27B0" style={styles.modalOptionIcon} />
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionTitle}>{t('trust.reportTypes.comment')}</Text>
                  <Text style={styles.modalOptionDescription}>{t('trust.reportTypeDesc.comment')}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleReportTypeSelect('profile')}
              >
                <Ionicons name="person" size={24} color="#FF5722" style={styles.modalOptionIcon} />
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionTitle}>{t('trust.reportTypes.profile')}</Text>
                  <Text style={styles.modalOptionDescription}>{t('trust.reportTypeDesc.profile')}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleReportTypeSelect('other')}
              >
                <Ionicons name="alert-circle" size={24} color="#FFC107" style={styles.modalOptionIcon} />
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionTitle}>{t('trust.reportTypes.other')}</Text>
                  <Text style={styles.modalOptionDescription}>{t('trust.reportTypeDesc.other')}</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.successModalTitle}>{t('trust.reportSubmitted')}</Text>
            <Text style={styles.successModalText}>{t('trust.reportThankYou')}</Text>
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>{t('common.ok')}</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  guidelineIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  moderationItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  moderationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  moderationText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
  },
  textAreaInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  submittingButton: {
    backgroundColor: '#90CAF9',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
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
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionIcon: {
    marginRight: 16,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  modalOptionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  successModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  successModalText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  successModalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  successModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TrustScreen;
