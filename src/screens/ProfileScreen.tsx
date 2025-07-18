import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import theme from '../styles/theme';
import { getGradientBackgroundStyle } from '../utils/gradientUtils';
import UserAvatar from '../components/UserAvatar';

/**
 * Profile screen component with access to various user settings and tools
 */
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Menu items for the profile screen
  const menuItems = [
    {
      id: 'privacy',
      title: 'Privacy Settings',
      icon: 'shield-outline',
      screen: 'Privacy',
    },
    {
      id: 'trust',
      title: 'Trust & Safety',
      icon: 'checkmark-circle-outline',
      screen: 'Trust',
    },
    {
      id: 'screenshots',
      title: 'Save Screenshots',
      icon: 'camera-outline',
      screen: 'Screenshots',
    },
    // Add more menu items as needed
  ];

  const handleMenuPress = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <UserAvatar userId="user123" size={100} />
        </View>
        <Text style={styles.profileName}>User Name</Text>
        <Text style={styles.profileEmail}>user@example.com</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.screen)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} aria-label={item.title} />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" aria-label={`Navigate to ${item.title}`} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Kinza v0.1.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gradients.profile[0], // Use the first color from the profile gradient
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
    backgroundColor: theme.colors.ui.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
    ...theme.shadows.sm,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.dark,
    marginBottom: theme.spacing[1],
  },
  profileEmail: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
  },
  menuContainer: {
    backgroundColor: theme.colors.ui.background,
    marginTop: theme.spacing[4],
    borderRadius: theme.borders.radius.xl,
    overflow: 'hidden',
    marginHorizontal: theme.spacing[4],
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
    minHeight: theme.layout.touchableMinHeight,
  },
  menuIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.dark,
  },
  footer: {
    padding: theme.spacing[4],
    alignItems: 'center',
  },
  versionText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
  },
});

export default ProfileScreen;
