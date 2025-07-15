import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface OnboardingStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isLastStep?: boolean;
  progress: number; // 0 to 1
}

/**
 * Reusable component for onboarding steps
 */
const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel,
  backLabel,
  isLastStep = false,
  progress
}) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>{backLabel || t('common.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, isLastStep ? styles.doneButton : {}]}
          onPress={onNext}
        >
          <Text style={styles.nextButtonText}>
            {nextLabel || (isLastStep ? t('common.done') : t('common.next'))}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4CAF50',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  doneButton: {
    backgroundColor: '#2196F3',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingStep;
