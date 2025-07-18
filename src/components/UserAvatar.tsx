import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';

interface UserAvatarProps {
  userId?: string;
  size?: number;
  style?: any;
}

/**
 * UserAvatar component that displays cartoon animal avatars
 * Uses koala, fox, and bunny icons based on user ID
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  userId = 'default',
  size = 80,
  style,
}) => {
  const { t } = useTranslation();
  
  // Determine which animal avatar to show based on userId
  const getAnimalAvatar = (id: string): {
    name: any; // Using any to avoid TypeScript issues with Ionicons names
    color: string;
    label: string;
  } => {
    // Use the last character of the userId to determine the avatar
    const lastChar = id.charAt(id.length - 1).toLowerCase();
    
    // Map of animal avatars - using valid Ionicons names
    const animalAvatars = {
      koala: {
        name: 'paw-outline' as const,
        color: theme.colors.primary,
        label: t('avatar.koala'),
      },
      fox: {
        name: 'logo-firefox' as const,
        color: theme.colors.secondary,
        label: t('avatar.fox'),
      },
      bunny: {
        name: 'heart-outline' as const,
        color: theme.colors.accent,
        label: t('avatar.bunny'),
      },
    };
    
    // Assign avatar based on userId's last character
    if (['a', 'b', 'c', 'd'].includes(lastChar)) {
      return animalAvatars.koala;
    } else if (['e', 'f', 'g', 'h', 'i'].includes(lastChar)) {
      return animalAvatars.fox;
    } else {
      return animalAvatars.bunny;
    }
  };
  
  const avatar = getAnimalAvatar(userId);
  
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatar.color,
        },
        style,
      ]}
      accessibilityLabel={avatar.label}
    >
      <Ionicons name={avatar.name} size={size * 0.6} color={theme.colors.text.inverse} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
});

export default UserAvatar;
