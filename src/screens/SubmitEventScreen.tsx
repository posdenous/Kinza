import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import EventFormFields from '../components/EventFormFields';
import useEventValidation from '../hooks/useEventValidation';
import authService from '../auth/authService';
import { Event } from '../types/events';
import { useApiWithRetry } from '../hooks/common/useApiWithRetry';

type RootStackParamList = {
  SubmitEvent: undefined;
  Login: undefined;
  EventDetail: { eventId: string };
};

type SubmitEventNavigationProp = StackNavigationProp<RootStackParamList, 'SubmitEvent'>;

/**
 * Screen for submitting new events
 * Enforces event validation rules: title, age range, venue, and start time required
 */
const SubmitEventScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SubmitEventNavigationProp>();
  const { validateEvent, isEventValid } = useEventValidation();
  
  const [eventData, setEventData] = useState<Partial<Event>>({
    title: '',
    description: '',
    location: {
      name: '',
      address: '',
      coordinates: undefined,
    },
    startDate: new Date(),
    categories: [],
    minAge: undefined,
    maxAge: undefined,
    isFree: true,
    images: [],
    organiser: {
      id: '',
      name: '',
    },
    cityId: 'berlin', // Default city
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [validationTriggered, setValidationTriggered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // API with retry for event submission
  const { execute: executeSubmission, isRetrying } = useApiWithRetry(
    async () => {
      const eventRef = await addDoc(collection(firestore, 'events'), {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending', // Events require moderation before being displayed
        approved: false,
        views: 0,
        saves: 0,
      });
      return eventRef;
    }
  );
  
  // Check if user is authenticated
  const user = authService.getCurrentUser();
  const isAuthenticated = !!user;
  
  // Set organiser info when user is authenticated
  useEffect(() => {
    if (user) {
      setEventData((prev) => ({
        ...prev,
        organiser: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
        },
      }));
    }
  }, [user]);
  
  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for the field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Validate on change if validation has been triggered before
    if (validationTriggered) {
      const validationErrors = validateEvent({
        ...eventData,
        [field]: value,
      });
      setErrors(validationErrors);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const validationErrors = validateEvent(eventData);
    setErrors(validationErrors);
    setValidationTriggered(true);
    
    if (Object.keys(validationErrors).length > 0) {
      // Scroll to first error (would be implemented in a real app)
      return;
    }
    
    if (!isAuthenticated) {
      Alert.alert(
        t('auth.loginRequired'),
        t('auth.loginToSubmitEvent'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('auth.login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Submit event with retry logic
      await executeSubmission();
      
      setIsSubmitting(false);
      
      // Show success message
      Alert.alert(
        t('events.success'),
        t('events.eventSubmitted'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      // Reset form
      setEventData({
        title: '',
        description: '',
        location: {
          name: '',
          address: '',
          coordinates: undefined,
        },
        startDate: new Date(),
        categories: [],
        minAge: undefined,
        maxAge: undefined,
        isFree: true,
        images: [],
        organiser: {
          id: user?.uid || '',
          name: user?.displayName || '',
        },
        cityId: 'berlin',
      });
      setValidationTriggered(false);
      
    } catch (error) {
      console.error('Error submitting event:', error);
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : t('errors.submitEvent');
      setSubmitError(errorMessage);
      Alert.alert(
        t('errors.title'), 
        errorMessage
      );
    }
  };
  
  // Render not authenticated state
  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="calendar" size={64} color="#CCCCCC" />
        <Text style={styles.titleText}>{t('auth.loginRequired')}</Text>
        <Text style={styles.subtitleText}>{t('auth.loginToSubmitEvent')}</Text>
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
        <Text style={styles.headerTitle}>{t('events.submitEvent')}</Text>
      </View>
      
      <ScrollView style={styles.formContainer}>
        <EventFormFields
          eventData={eventData}
          onChange={handleChange}
          errors={errors}
        />
        
        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                {isRetrying ? t('common.retrying') : t('common.submitting')}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>{t('events.submit')}</Text>
          )}
        </TouchableOpacity>
        
        {/* General Error */}
        {errors.general && (
          <Text style={styles.generalError}>{errors.general}</Text>
        )}
        
        {/* Moderation Notice */}
        <View style={styles.moderationNotice}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.moderationText}>
            {t('events.moderationExplanation')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  formContainer: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  generalError: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  moderationNotice: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  moderationText: {
    flex: 1,
    marginLeft: 8,
    color: '#0D47A1',
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
});

export default SubmitEventScreen;
