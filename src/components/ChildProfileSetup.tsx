import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ChildProfileSetupProps {
  onSave: (childData: {
    name: string;
    age: number;
    consentGiven: boolean;
  }) => void;
}

/**
 * Component for setting up a child profile during onboarding
 */
const ChildProfileSetup: React.FC<ChildProfileSetupProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    // Validate age
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 18) {
      setError(t('errors.form.invalid'));
      return;
    }

    // Validate consent
    if (!consentGiven) {
      setError(t('errors.permission.consentRequired'));
      return;
    }

    // Save child profile
    onSave({
      name: name.trim(),
      age: ageNum,
      consentGiven
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('onboarding.childName')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={t('onboarding.childName')}
      />

      <Text style={styles.label}>{t('onboarding.childAge')}</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={(text) => {
          setAge(text);
          setError('');
        }}
        placeholder="3"
        keyboardType="number-pad"
        maxLength={2}
      />

      <View style={styles.consentContainer}>
        <Switch
          value={consentGiven}
          onValueChange={(value) => {
            setConsentGiven(value);
            if (value) setError('');
          }}
        />
        <Text style={styles.consentText}>{t('onboarding.consent')}</Text>
      </View>

      <Text style={styles.consentInfo}>{t('onboarding.consentInfo')}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.saveButton, (!age || !consentGiven) && styles.disabledButton]}
        onPress={handleSave}
        disabled={!age || !consentGiven}
      >
        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
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
    marginBottom: 16,
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  consentInfo: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});

export default ChildProfileSetup;
