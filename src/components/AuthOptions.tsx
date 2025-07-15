import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AuthOptionsProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, displayName: string) => void;
  onSkip: () => void;
}

/**
 * Component for authentication options during onboarding
 */
const AuthOptions: React.FC<AuthOptionsProps> = ({ onLogin, onRegister, onSkip }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'options' | 'login' | 'register'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError(t('errors.form.required'));
      return;
    }
    onLogin(email, password);
  };

  const handleRegister = () => {
    if (!email || !password || !displayName) {
      setError(t('errors.form.required'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errors.auth.passwordMismatch'));
      return;
    }
    onRegister(email, password, displayName);
  };

  const renderOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={styles.title}>{t('onboarding.signIn')}</Text>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          setMode('login');
          setError('');
        }}
      >
        <Text style={styles.optionButtonText}>{t('auth.login')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          setMode('register');
          setError('');
        }}
      >
        <Text style={styles.optionButtonText}>{t('auth.register')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipButtonText}>{t('onboarding.skip')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLogin = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>{t('auth.login')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.email')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.password')}
        secureTextEntry
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
        <Text style={styles.submitButtonText}>{t('auth.login')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setMode('options');
          setError('');
        }}
      >
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegister = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>{t('auth.register')}</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={t('auth.displayName')}
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.email')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.password')}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={t('auth.confirmPassword')}
        secureTextEntry
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
        <Text style={styles.submitButtonText}>{t('auth.register')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setMode('options');
          setError('');
        }}
      >
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </TouchableOpacity>
    </View>
  );

  switch (mode) {
    case 'login':
      return renderLogin();
    case 'register':
      return renderRegister();
    default:
      return renderOptions();
  }
};

const styles = StyleSheet.create({
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  formContainer: {
    width: '100%',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 14,
  },
});

export default AuthOptions;
