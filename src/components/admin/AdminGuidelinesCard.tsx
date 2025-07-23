import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminGuidelinesCardProps {
  t: (key: string) => string;
}

/**
 * Admin guidelines card component
 * Displays moderation guidelines and best practices
 */
const AdminGuidelinesCard: React.FC<AdminGuidelinesCardProps> = ({ t }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{t('admin.guidelines')}</Text>
      <View style={styles.guidelineCard}>
        <Text style={styles.guidelineTitle}>{t('admin.moderationGuidelines')}</Text>
        <Text style={styles.guidelineText}>{t('admin.moderationGuidelinesDesc')}</Text>
        
        <View style={styles.guidelineRule}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.guidelineRuleText}>{t('admin.guideline1')}</Text>
        </View>
        
        <View style={styles.guidelineRule}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.guidelineRuleText}>{t('admin.guideline2')}</Text>
        </View>
        
        <View style={styles.guidelineRule}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.guidelineRuleText}>{t('admin.guideline3')}</Text>
        </View>
        
        <View style={styles.guidelineRule}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.guidelineRuleText}>{t('admin.guideline4')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  guidelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 16,
  },
  guidelineRule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guidelineRuleText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
});

export default AdminGuidelinesCard;
