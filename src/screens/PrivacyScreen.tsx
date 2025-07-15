import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'react-firebase-hooks/firestore';
import { getAuth } from 'firebase/auth';

interface PrivacySettings {
  shareLocation: boolean;
  shareProfile: boolean;
  allowComments: boolean;
  allowEventNotifications: boolean;
  allowMessageNotifications: boolean;
  dataCollection: boolean;
  childProfilesVisible: boolean;
}

const defaultPrivacySettings: PrivacySettings = {
  shareLocation: true,
  shareProfile: true,
  allowComments: true,
  allowEventNotifications: true,
  allowMessageNotifications: true,
  dataCollection: true,
  childProfilesVisible: false,
};

const PrivacyScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [firestore] = useFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!firestore || !user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if user has given consent for child profiles
          setHasConsent(userData.childProfileConsent === true);
          
          // Get privacy settings or use defaults
          if (userData.privacySettings) {
            setPrivacySettings({
              ...defaultPrivacySettings,
              ...userData.privacySettings
            });
          }
        }
      } catch (err) {
        console.error('Error fetching privacy settings:', err);
        Alert.alert(
          t('privacy.errorTitle'),
          t('privacy.errorFetching'),
          [{ text: t('common.ok') }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacySettings();
  }, [firestore, user, t]);

  const handleToggleSetting = (setting: keyof PrivacySettings) => {
    // Special case for child profiles visibility - requires consent
    if (setting === 'childProfilesVisible' && !hasConsent && !privacySettings[setting]) {
      Alert.alert(
        t('privacy.consentRequired'),
        t('privacy.consentMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('privacy.giveConsent'), 
            onPress: () => {
              navigation.navigate('ChildProfileConsent');
            }
          }
        ]
      );
      return;
    }

    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const savePrivacySettings = async () => {
    if (!firestore || !user) {
      Alert.alert(
        t('privacy.errorTitle'),
        t('privacy.notLoggedIn'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        privacySettings,
        updatedAt: new Date()
      });
      
      Alert.alert(
        t('privacy.successTitle'),
        t('privacy.settingsSaved'),
        [{ text: t('common.ok') }]
      );
    } catch (err) {
      console.error('Error saving privacy settings:', err);
      Alert.alert(
        t('privacy.errorTitle'),
        t('privacy.errorSaving'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>{t('privacy.loading')}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#CCCCCC" />
          <Text style={styles.notLoggedInTitle}>{t('privacy.loginRequired')}</Text>
          <Text style={styles.notLoggedInText}>{t('privacy.loginMessage')}</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>{t('privacy.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.locationSharing')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('privacy.shareLocation')}</Text>
              <Text style={styles.settingDescription}>{t('privacy.shareLocationDesc')}</Text>
            </View>
            <Switch
              value={privacySettings.shareLocation}
              onValueChange={() => handleToggleSetting('shareLocation')}
              trackColor={{ false: '#D1D1D1', true: '#2196F3' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.profileVisibility')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('privacy.shareProfile')}</Text>
              <Text style={styles.settingDescription}>{t('privacy.shareProfileDesc')}</Text>
            </View>
            <Switch
              value={privacySettings.shareProfile}
              onValueChange={() => handleToggleSetting('shareProfile')}
              trackColor={{ false: '#D1D1D1', true: '#2196F3' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('privacy.childProfilesVisible')}</Text>
              <Text style={styles.settingDescription}>{t('privacy.childProfilesVisibleDesc')}</Text>
            </View>
            <Switch
              value={privacySettings.childProfilesVisible}
              onValueChange={() => handleToggleSetting('childProfilesVisible')}
              trackColor={{ false: '#D1D1D1', true: '#2196F3' }}
              thumbColor="#FFFFFF"
              disabled={!hasConsent}
            />
          </View>
          
          {!hasConsent && (
            <TouchableOpacity 
              style={styles.consentButton}
              onPress={() => navigation.navigate('ChildProfileConsent')}
            >
              <Text style={styles.consentButtonText}>{t('privacy.giveConsent')}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.interactions')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('privacy.allowComments')}</Text>
              <Text style={styles.settingDescription}>{t('privacy.allowCommentsDesc')}</Text>
            </View>
            <Switch
              value={privacySettings.allowComments}
              onValueChange={() => handleToggleSetting('allowComments')}
              trackColor={{ false: '#D1D1D1', true: '#2196F3' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.notifications')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('privacy.eventNotifications')}</Text>
              <Text style={styles.settingDescription}>{t('privacy.eventNotificationsDesc')}</Text>
            </View>
            <Switch
              value={privacySettings.allowEventNotifications}
              onValueChange={() => handleToggleSetting('allowEventNotifications')}
              trackColor={{ false: '#D1D1D1', true: '#2196F3' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('privacy.messageNotifications')}</Text>
              <Text style={styles.settingDescription}>{t('privacy.messageNotificationsDesc')}</Text>
            </View>
            <Switch
              value={privacySettings.allowMessageNotifications}
              onValueChange={() => handleToggleSetting('allowMessageNotifications')}
              trackColor={{ false: '#D1D1D1', true: '#2196F3' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.dataUsage')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('privacy.dataCollection')}</Text>
              <Text style={styles.settingDescription}>{t('privacy.dataCollectionDesc')}</Text>
            </View>
            <Switch
              value={privacySettings.dataCollection}
              onValueChange={() => handleToggleSetting('dataCollection')}
              trackColor={{ false: '#D1D1D1', true: '#2196F3' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.linkButtonText}>{t('privacy.viewPrivacyPolicy')}</Text>
            <Ionicons name="chevron-forward" size={16} color="#2196F3" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('DataDeletion')}
          >
            <Text style={styles.linkButtonText}>{t('privacy.requestDataDeletion')}</Text>
            <Ionicons name="chevron-forward" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.savingButton]}
          onPress={savePrivacySettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('privacy.saveSettings')}</Text>
          )}
        </TouchableOpacity>
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
  content: {
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  consentButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  consentButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  linkButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  savingButton: {
    backgroundColor: '#90CAF9',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default PrivacyScreen;
