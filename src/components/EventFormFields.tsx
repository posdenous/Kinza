import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types/events';

interface EventFormFieldsProps {
  eventData: Partial<Event>;
  onChange: (field: string, value: any) => void;
  errors: { [key: string]: string };
}

/**
 * Reusable component for event form fields
 */
const EventFormFields: React.FC<EventFormFieldsProps> = ({
  eventData,
  onChange,
  errors,
}) => {
  const { t } = useTranslation();
  
  // State for date/time pickers
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  
  // Available categories
  const categories = [
    'music',
    'sports',
    'art',
    'education',
    'outdoor',
    'food',
    'theater',
    'museum',
    'playground',
  ];
  
  // Available age ranges
  const ageRanges = [
    { label: '0-2', minAge: 0, maxAge: 2 },
    { label: '3-5', minAge: 3, maxAge: 5 },
    { label: '6-9', minAge: 6, maxAge: 9 },
    { label: '10-12', minAge: 10, maxAge: 12 },
    { label: '13-18', minAge: 13, maxAge: 18 },
    { label: 'All ages', minAge: 0, maxAge: 18 },
  ];

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    const currentCategories = eventData.categories || [];
    
    if (currentCategories.includes(category)) {
      onChange(
        'categories',
        currentCategories.filter((c) => c !== category)
      );
    } else {
      onChange('categories', [...currentCategories, category]);
    }
  };

  // Set age range
  const setAgeRange = (minAge: number, maxAge: number) => {
    onChange('minAge', minAge);
    onChange('maxAge', maxAge);
  };

  // Handle date/time changes
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDate(false);
      setShowStartTime(false);
      setShowEndDate(false);
      setShowEndTime(false);
    }
    
    if (selectedDate) {
      if (showStartDate) {
        const currentDate = eventData.startDate ? new Date(eventData.startDate) : new Date();
        currentDate.setFullYear(selectedDate.getFullYear());
        currentDate.setMonth(selectedDate.getMonth());
        currentDate.setDate(selectedDate.getDate());
        onChange('startDate', currentDate);
      } else if (showStartTime) {
        const currentDate = eventData.startDate ? new Date(eventData.startDate) : new Date();
        currentDate.setHours(selectedDate.getHours());
        currentDate.setMinutes(selectedDate.getMinutes());
        onChange('startDate', currentDate);
      } else if (showEndDate) {
        const currentDate = eventData.endDate ? new Date(eventData.endDate) : new Date();
        currentDate.setFullYear(selectedDate.getFullYear());
        currentDate.setMonth(selectedDate.getMonth());
        currentDate.setDate(selectedDate.getDate());
        onChange('endDate', currentDate);
      } else if (showEndTime) {
        const currentDate = eventData.endDate ? new Date(eventData.endDate) : new Date();
        currentDate.setHours(selectedDate.getHours());
        currentDate.setMinutes(selectedDate.getMinutes());
        onChange('endDate', currentDate);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.title')} *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={eventData.title}
          onChangeText={(text) => onChange('title', text)}
          placeholder={t('events.titlePlaceholder')}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>
      
      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.description')} *</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          value={eventData.description}
          onChangeText={(text) => onChange('description', text)}
          placeholder={t('events.descriptionPlaceholder')}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>
      
      {/* Location */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.location')} *</Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          value={eventData.location?.name}
          onChangeText={(text) =>
            onChange('location', { ...eventData.location, name: text })
          }
          placeholder={t('events.locationNamePlaceholder')}
        />
        <TextInput
          style={[
            styles.input,
            styles.marginTop8,
            errors.location && styles.inputError,
          ]}
          value={eventData.location?.address}
          onChangeText={(text) =>
            onChange('location', { ...eventData.location, address: text })
          }
          placeholder={t('events.locationAddressPlaceholder')}
        />
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            // In a real app, we would open a map to select location
            // For now, we'll just set dummy coordinates
            onChange('location', {
              ...eventData.location,
              coordinates: { latitude: 52.52, longitude: 13.405 },
            });
          }}
        >
          <Ionicons name="location" size={20} color="#FFFFFF" />
          <Text style={styles.mapButtonText}>{t('events.pickOnMap')}</Text>
        </TouchableOpacity>
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}
      </View>
      
      {/* Date and Time */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.dateAndTime')} *</Text>
        
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              errors.startDate && styles.inputError,
            ]}
            onPress={() => setShowStartDate(true)}
          >
            <Ionicons name="calendar" size={20} color="#666666" />
            <Text style={styles.dateTimeButtonText}>
              {eventData.startDate
                ? formatDate(eventData.startDate)
                : t('events.startDate')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              errors.startDate && styles.inputError,
            ]}
            onPress={() => setShowStartTime(true)}
          >
            <Ionicons name="time" size={20} color="#666666" />
            <Text style={styles.dateTimeButtonText}>
              {eventData.startDate
                ? formatTime(eventData.startDate)
                : t('events.startTime')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {errors.startDate && (
          <Text style={styles.errorText}>{errors.startDate}</Text>
        )}
        
        <View style={styles.switchRow}>
          <Switch
            value={!!eventData.endDate}
            onValueChange={(value) => {
              if (value) {
                // Set end date to start date + 1 hour by default
                const endDate = eventData.startDate
                  ? new Date(eventData.startDate.getTime() + 60 * 60 * 1000)
                  : new Date(Date.now() + 60 * 60 * 1000);
                onChange('endDate', endDate);
              } else {
                onChange('endDate', undefined);
              }
            }}
          />
          <Text style={styles.switchLabel}>{t('events.hasEndTime')}</Text>
        </View>
        
        {eventData.endDate && (
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                errors.endDate && styles.inputError,
              ]}
              onPress={() => setShowEndDate(true)}
            >
              <Ionicons name="calendar" size={20} color="#666666" />
              <Text style={styles.dateTimeButtonText}>
                {formatDate(eventData.endDate)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                errors.endDate && styles.inputError,
              ]}
              onPress={() => setShowEndTime(true)}
            >
              <Ionicons name="time" size={20} color="#666666" />
              <Text style={styles.dateTimeButtonText}>
                {formatTime(eventData.endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {errors.endDate && (
          <Text style={styles.errorText}>{errors.endDate}</Text>
        )}
        
        {/* Date/Time Pickers */}
        {(showStartDate || showStartTime || showEndDate || showEndTime) && (
          <DateTimePicker
            value={
              showStartDate || showStartTime
                ? eventData.startDate || new Date()
                : eventData.endDate || new Date()
            }
            mode={showStartDate || showEndDate ? 'date' : 'time'}
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      
      {/* Age Range */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.ageRange')} *</Text>
        <View style={styles.ageRangeContainer}>
          {ageRanges.map((range, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.ageRangeButton,
                eventData.minAge === range.minAge &&
                  eventData.maxAge === range.maxAge &&
                  styles.selectedAgeRange,
                errors.ageRange && styles.inputError,
              ]}
              onPress={() => setAgeRange(range.minAge, range.maxAge)}
            >
              <Text
                style={[
                  styles.ageRangeText,
                  eventData.minAge === range.minAge &&
                    eventData.maxAge === range.maxAge &&
                    styles.selectedText,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.ageRange && (
          <Text style={styles.errorText}>{errors.ageRange}</Text>
        )}
      </View>
      
      {/* Categories */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.categories')} *</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                eventData.categories?.includes(category) && styles.selectedCategory,
                errors.categories && styles.inputError,
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  eventData.categories?.includes(category) && styles.selectedText,
                ]}
              >
                {t(`categories.${category}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.categories && (
          <Text style={styles.errorText}>{errors.categories}</Text>
        )}
      </View>
      
      {/* Price */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.price')}</Text>
        <View style={styles.switchRow}>
          <Switch
            value={!!eventData.isFree}
            onValueChange={(value) => {
              onChange('isFree', value);
              if (value) {
                onChange('price', undefined);
              }
            }}
          />
          <Text style={styles.switchLabel}>{t('events.isFree')}</Text>
        </View>
        
        {!eventData.isFree && (
          <View style={styles.priceContainer}>
            <TextInput
              style={[
                styles.priceInput,
                errors.price && styles.inputError,
              ]}
              value={eventData.price?.amount?.toString() || ''}
              onChangeText={(text) =>
                onChange('price', {
                  ...eventData.price,
                  amount: parseFloat(text) || 0,
                })
              }
              keyboardType="numeric"
              placeholder="0.00"
            />
            
            <TextInput
              style={[
                styles.currencyInput,
                errors.price && styles.inputError,
              ]}
              value={eventData.price?.currency || ''}
              onChangeText={(text) =>
                onChange('price', {
                  ...eventData.price,
                  currency: text,
                })
              }
              placeholder="EUR"
            />
          </View>
        )}
        
        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
      </View>
      
      {/* Registration */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.registration')}</Text>
        <View style={styles.switchRow}>
          <Switch
            value={!!eventData.registrationRequired}
            onValueChange={(value) => {
              onChange('registrationRequired', value);
              if (!value) {
                onChange('registrationUrl', undefined);
              }
            }}
          />
          <Text style={styles.switchLabel}>{t('events.registrationRequired')}</Text>
        </View>
        
        {eventData.registrationRequired && (
          <TextInput
            style={styles.input}
            value={eventData.registrationUrl}
            onChangeText={(text) => onChange('registrationUrl', text)}
            placeholder={t('events.registrationUrlPlaceholder')}
            keyboardType="url"
          />
        )}
      </View>
      
      {/* Website */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.website')}</Text>
        <TextInput
          style={styles.input}
          value={eventData.website}
          onChangeText={(text) => onChange('website', text)}
          placeholder={t('events.websitePlaceholder')}
          keyboardType="url"
        />
      </View>
      
      {/* Contact Info */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('events.contactInfo')}</Text>
        <TextInput
          style={styles.input}
          value={eventData.contactEmail}
          onChangeText={(text) => onChange('contactEmail', text)}
          placeholder={t('events.emailPlaceholder')}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, styles.marginTop8]}
          value={eventData.contactPhone}
          onChangeText={(text) => onChange('contactPhone', text)}
          placeholder={t('events.phonePlaceholder')}
          keyboardType="phone-pad"
        />
      </View>
      
      {/* Required Fields Note */}
      <Text style={styles.requiredNote}>* {t('common.requiredFields')}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  marginTop8: {
    marginTop: 8,
  },
  mapButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  dateTimeButtonText: {
    marginLeft: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    marginLeft: 8,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ageRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAgeRange: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  ageRangeText: {
    color: '#333333',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryText: {
    color: '#333333',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 0.7,
  },
  currencyInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 0.25,
  },
  requiredNote: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 20,
  },
});

export default EventFormFields;
