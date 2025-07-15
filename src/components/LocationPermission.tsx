import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

interface LocationPermissionProps {
  onLocationGranted: () => void;
  onZipEntered: (zip: string) => void;
}

/**
 * Component for requesting location permission or entering ZIP code
 */
const LocationPermission: React.FC<LocationPermissionProps> = ({ 
  onLocationGranted, 
  onZipEntered 
}) => {
  const { t } = useTranslation();
  const [zipCode, setZipCode] = useState('');
  const [useZip, setUseZip] = useState(false);

  const handleLocationPermission = () => {
    // In a real app, we would request location permission here
    // For now, we'll just simulate it being granted
    onLocationGranted();
  };

  const handleZipSubmit = () => {
    if (zipCode.trim().length > 0) {
      onZipEntered(zipCode);
    }
  };

  return (
    <View style={styles.container}>
      {!useZip ? (
        <View style={styles.locationContainer}>
          <Text style={styles.infoText}>
            {t('onboarding.locationPermission')}
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleLocationPermission}
          >
            <Text style={styles.permissionButtonText}>
              {t('common.allow')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.switchOption}
            onPress={() => setUseZip(true)}
          >
            <Text style={styles.switchOptionText}>
              {t('onboarding.enterZip')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.zipContainer}>
          <Text style={styles.infoText}>
            {t('onboarding.enterZip')}
          </Text>
          <TextInput
            style={styles.zipInput}
            value={zipCode}
            onChangeText={setZipCode}
            placeholder="10115"
            keyboardType="number-pad"
            maxLength={5}
          />
          <TouchableOpacity
            style={[
              styles.zipSubmitButton,
              zipCode.trim().length === 0 && styles.disabledButton
            ]}
            onPress={handleZipSubmit}
            disabled={zipCode.trim().length === 0}
          >
            <Text style={styles.zipSubmitText}>
              {t('common.submit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.switchOption}
            onPress={() => setUseZip(false)}
          >
            <Text style={styles.switchOptionText}>
              {t('common.useLocation')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    width: '100%',
    alignItems: 'center',
  },
  zipContainer: {
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchOption: {
    padding: 16,
  },
  switchOptionText: {
    color: '#2196F3',
    fontSize: 14,
  },
  zipInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  zipSubmitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    alignItems: 'center',
    marginBottom: 16,
  },
  zipSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});

export default LocationPermission;
