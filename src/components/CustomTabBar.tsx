import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import theme from '../styles/theme';

/**
 * Custom tab bar component with active state styling (bold + underline)
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // Determine icon based on route name
        const getIconName = () => {
          switch (route.name) {
            case 'Home':
              return 'home';
            case 'Search':
              return 'search';
            case 'Profile':
              return 'person';
            default:
              return 'apps';
          }
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={`${label} tab`}
            testID={`${label}-tab`}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Ionicons
              name={`${getIconName()}${isFocused ? '' : '-outline'}`}
              size={24}
              color={isFocused ? theme.colors.primary : theme.colors.text.light}
            />
            <Text
              style={[
                styles.tabText,
                isFocused && styles.tabTextActive,
                { fontFamily: isFocused ? 'Poppins-Bold' : 'Nunito-Regular' }
              ]}
            >
              {label.toString()}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.ui.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.border,
    height: 60,
    ...theme.shadows.sm,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44, // Accessibility: minimum touch target size
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.text.light,
    marginTop: 2,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});

export default CustomTabBar;
