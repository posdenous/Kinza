import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface ChildDataConsent {
  basicProfile: boolean;        // Name and age only - REQUIRED
  eventRecommendations: boolean; // Algorithm-based suggestions - OPTIONAL
  locationServices: boolean;    // Geographic event filtering - OPTIONAL
  usageAnalytics: boolean;     // Anonymized usage statistics - OPTIONAL
}

interface ChildProfileSetupProps {
  onSave: (childData: {
    name: string;
    age: number;
    consent: ChildDataConsent;
    parentalConsent: boolean;
  }) => void;
}

/**
 * GDPR-Compliant Child Profile Setup Component
 * Implements granular consent with clear data boundaries and enhanced privacy protection
 */
const ChildProfileSetup: React.FC<ChildProfileSetupProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [consent, setConsent] = useState<ChildDataConsent>({
    basicProfile: false,
    eventRecommendations: false,
    locationServices: false,
    usageAnalytics: false,
  });
  const [error, setError] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleConsentChange = (key: keyof ChildDataConsent, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const openPrivacyPolicy = () => {
    Alert.alert(
      t('privacy.privacyPolicy'),
      t('privacy.privacyPolicyDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.viewOnline'), onPress: () => Linking.openURL('https://kinza.berlin/privacy') }
      ]
    );
  };

  const handleSave = () => {
    // Validate name
    if (!name.trim()) {
      setError(t('errors.form.nameRequired'));
      return;
    }

    // Validate age
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 18) {
      setError(t('errors.form.ageInvalid'));
      return;
    }

    // Validate parental consent
    if (!parentalConsent) {
      setError(t('errors.permission.parentalConsentRequired'));
      return;
    }

    // Validate basic profile consent (required)
    if (!consent.basicProfile) {
      setError(t('errors.permission.basicProfileRequired'));
      return;
    }

    // Save child profile with granular consent
    onSave({
      name: name.trim(),
      age: ageNum,
      consent,
      parentalConsent
    });
  };

  const isFormValid = name.trim() && age && parentalConsent && consent.basicProfile;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Child Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('onboarding.childInformation')}</Text>
        
        <Text style={styles.label}>{t('onboarding.childName')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (error) setError('');
          }}
          placeholder={t('onboarding.childNamePlaceholder')}
          maxLength={50}
        />

        <Text style={styles.label}>{t('onboarding.childAge')}</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={(text) => {
            setAge(text);
            if (error) setError('');
          }}
          placeholder="5"
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      {/* Data Processing Consent Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('privacy.dataProcessingConsent')}</Text>
        <Text style={styles.sectionDescription}>{t('privacy.granularConsentDesc')}</Text>

        {/* Basic Profile - Required */}
        <View style={styles.consentItem}>
          <View style={styles.consentHeader}>
            <Switch
              value={consent.basicProfile}
              onValueChange={(value) => handleConsentChange('basicProfile', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={consent.basicProfile ? '#FFFFFF' : '#FFFFFF'}
            />
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentTitle}>
                {t('privacy.basicProfile')} 
                <Text style={styles.requiredLabel}>({t('common.required')})</Text>
              </Text>
              <Text style={styles.consentDescription}>{t('privacy.basicProfileDesc')}</Text>
            </View>
          </View>
          <View style={styles.dataDetails}>
            <Text style={styles.dataLabel}>{t('privacy.dataCollected')}:</Text>
            <Text style={styles.dataText}>• {t('privacy.firstName')}</Text>
            <Text style={styles.dataText}>• {t('privacy.ageRange')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.purpose')}: {t('privacy.ageAppropriateEvents')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.retention')}: {t('privacy.untilDeleted')}</Text>
          </View>
        </View>

        {/* Event Recommendations - Optional */}
        <View style={styles.consentItem}>
          <View style={styles.consentHeader}>
            <Switch
              value={consent.eventRecommendations}
              onValueChange={(value) => handleConsentChange('eventRecommendations', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={consent.eventRecommendations ? '#FFFFFF' : '#FFFFFF'}
            />
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentTitle}>
                {t('privacy.personalizedRecommendations')} 
                <Text style={styles.optionalLabel}>({t('common.optional')})</Text>
              </Text>
              <Text style={styles.consentDescription}>{t('privacy.recommendationsDesc')}</Text>
            </View>
          </View>
          <View style={styles.dataDetails}>
            <Text style={styles.dataLabel}>{t('privacy.dataCollected')}:</Text>
            <Text style={styles.dataText}>• {t('privacy.eventInteractions')}</Text>
            <Text style={styles.dataText}>• {t('privacy.savedEvents')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.purpose')}: {t('privacy.personalizedSuggestions')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.retention')}: {t('privacy.sixMonths')}</Text>
          </View>
        </View>

        {/* Location Services - Optional */}
        <View style={styles.consentItem}>
          <View style={styles.consentHeader}>
            <Switch
              value={consent.locationServices}
              onValueChange={(value) => handleConsentChange('locationServices', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={consent.locationServices ? '#FFFFFF' : '#FFFFFF'}
            />
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentTitle}>
                {t('privacy.locationBasedEvents')} 
                <Text style={styles.optionalLabel}>({t('common.optional')})</Text>
              </Text>
              <Text style={styles.consentDescription}>{t('privacy.locationDesc')}</Text>
            </View>
          </View>
          <View style={styles.dataDetails}>
            <Text style={styles.dataLabel}>{t('privacy.dataCollected')}:</Text>
            <Text style={styles.dataText}>• {t('privacy.approximateLocation')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.purpose')}: {t('privacy.nearbyEvents')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.retention')}: {t('privacy.notStored')}</Text>
          </View>
        </View>

        {/* Usage Analytics - Optional */}
        <View style={styles.consentItem}>
          <View style={styles.consentHeader}>
            <Switch
              value={consent.usageAnalytics}
              onValueChange={(value) => handleConsentChange('usageAnalytics', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={consent.usageAnalytics ? '#FFFFFF' : '#FFFFFF'}
            />
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentTitle}>
                {t('privacy.usageAnalytics')} 
                <Text style={styles.optionalLabel}>({t('common.optional')})</Text>
              </Text>
              <Text style={styles.consentDescription}>{t('privacy.analyticsDesc')}</Text>
            </View>
          </View>
          <View style={styles.dataDetails}>
            <Text style={styles.dataLabel}>{t('privacy.dataCollected')}:</Text>
            <Text style={styles.dataText}>• {t('privacy.anonymizedUsage')}</Text>
            <Text style={styles.dataText}>• {t('privacy.appPerformance')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.purpose')}: {t('privacy.improveApp')}</Text>
            <Text style={styles.dataLabel}>{t('privacy.retention')}: {t('privacy.threeMonths')}</Text>
          </View>
        </View>
      </View>

      {/* Parental Consent Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('privacy.parentalConsent')}</Text>
        
        <View style={styles.parentalConsentContainer}>
          <Switch
            value={parentalConsent}
            onValueChange={(value) => {
              setParentalConsent(value);
              if (error) setError('');
            }}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={parentalConsent ? '#FFFFFF' : '#FFFFFF'}
          />
          <View style={styles.parentalConsentText}>
            <Text style={styles.parentalConsentTitle}>{t('privacy.parentalConsentTitle')}</Text>
            <Text style={styles.parentalConsentDescription}>{t('privacy.parentalConsentDesc')}</Text>
          </View>
        </View>
      </View>

      {/* Privacy Information */}
      <View style={styles.privacyInfo}>
        <View style={styles.privacyRow}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.privacyText}>{t('privacy.dataSecure')}</Text>
        </View>
        <View style={styles.privacyRow}>
          <Ionicons name="time" size={20} color="#2196F3" />
          <Text style={styles.privacyText}>{t('privacy.changeAnytime')}</Text>
        </View>
        <View style={styles.privacyRow}>
          <Ionicons name="trash" size={20} color="#FF5722" />
          <Text style={styles.privacyText}>{t('privacy.deleteAnytime')}</Text>
        </View>
        
        <TouchableOpacity style={styles.privacyPolicyButton} onPress={openPrivacyPolicy}>
          <Ionicons name="document-text" size={16} color="#2196F3" />
          <Text style={styles.privacyPolicyText}>{t('privacy.viewFullPolicy')}</Text>
        </TouchableOpacity>
        
        {/* Additional Privacy Information */}
        <View style={styles.additionalPrivacyInfo}>
          <Text style={styles.privacyInfoTitle}>{t('privacy.importantInfo')}</Text>
          
          <View style={styles.privacyInfoItem}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.privacyInfoText}>{t('privacy.noThirdPartySharing')}</Text>
          </View>
          
          <View style={styles.privacyInfoItem}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.privacyInfoText}>{t('privacy.dataStoredEU')}</Text>
          </View>
          
          <View style={styles.privacyInfoItem}>
            <Ionicons name="eye" size={16} color="#666" />
            <Text style={styles.privacyInfoText}>{t('privacy.accessRights')}</Text>
          </View>
          
          <View style={styles.privacyInfoItem}>
            <Ionicons name="mail" size={16} color="#666" />
            <Text style={styles.privacyInfoText}>{t('privacy.contactDPO')}</Text>
          </View>
        </View>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, !isFormValid && styles.disabledButton]}
        onPress={handleSave}
        disabled={!isFormValid}
      >
        <Text style={styles.saveButtonText}>{t('common.saveAndContinue')}</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  consentItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  consentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  requiredLabel: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 12,
  },
  optionalLabel: {
    color: '#2196F3',
    fontWeight: 'normal',
    fontSize: 12,
  },
  dataDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginTop: 4,
  },
  dataText: {
    fontSize: 12,
    color: '#777777',
    marginLeft: 8,
    marginTop: 2,
  },
  parentalConsentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  parentalConsentText: {
    flex: 1,
    marginLeft: 12,
  },
  parentalConsentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  parentalConsentDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  privacyInfo: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  privacyPolicyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  privacyPolicyText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 5,
  },
  additionalPrivacyInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  privacyInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  privacyInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    margin: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  bottomSpacing: {
    height: 40,
  },
  // Legacy styles for compatibility
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default ChildProfileSetup;
