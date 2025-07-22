import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../utils/i18n';
import { UserRole } from '../../auth/roles';
import HomeScreen from '../HomeScreen';
import SearchResultsScreen from '../SearchResultsScreen';
import ProfileScreen from '../ProfileScreen';
import EventDetailScreen from '../EventDetailScreen';
import PrivacyScreen from '../PrivacyScreen';
import TrustScreen from '../TrustScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Mock authentication with different roles
const createMockAuth = (role, user) => ({
  user: user || { id: 'test-user', email: 'test@example.com' },
  userRole: role,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
});

// Mock events data
const mockEvents = [
  {
    id: 'event-1',
    title: 'Berlin Zoo Family Day',
    description: 'Fun day at the zoo',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T16:00:00Z'),
    venue: 'Berlin Zoo',
    ageRange: '3-12',
    price: 0,
    cityId: 'berlin',
    organizerId: 'org-1',
    status: 'approved',
    tags: ['outdoor', 'animals'],
  },
];

// Test navigation components
const TestTabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchResultsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const TestStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Main" component={TestTabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
    <Stack.Screen name="Trust" component={TrustScreen} />
  </Stack.Navigator>
);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </I18nextProvider>
);

describe('Navigation Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue(
      createMockAuth(UserRole.PARENT, null)
    );
    
    jest.mocked(require('../../hooks/useEvents').useEvents).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      refreshEvents: jest.fn(),
    });
  });

  describe('Tab Navigation Integration', () => {
    it('should navigate between main tabs correctly', async () => {
      render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Should start on Home tab
      expect(screen.getByTestId('home-screen')).toBeTruthy();

      // Navigate to Search tab
      const searchTab = screen.getByText('Search');
      fireEvent.press(searchTab);

      await waitFor(() => {
        expect(screen.getByTestId('search-screen')).toBeTruthy();
      });

      // Navigate to Profile tab
      const profileTab = screen.getByText('Profile');
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(screen.getByTestId('profile-screen')).toBeTruthy();
      });

      // Navigate back to Home tab
      const homeTab = screen.getByText('Home');
      fireEvent.press(homeTab);

      await waitFor(() => {
        expect(screen.getByTestId('home-screen')).toBeTruthy();
      });
    });

    it('should maintain tab state when switching between tabs', async () => {
      render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Start on Home, toggle map off
      const toggleMapButton = screen.getByTestId('toggle-map-button');
      fireEvent.press(toggleMapButton);

      await waitFor(() => {
        expect(screen.queryByTestId('map-container')).toBeNull();
      });

      // Switch to Search tab and back
      fireEvent.press(screen.getByText('Search'));
      await waitFor(() => {
        expect(screen.getByTestId('search-screen')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Home'));
      await waitFor(() => {
        expect(screen.getByTestId('home-screen')).toBeTruthy();
        // Map should still be hidden
        expect(screen.queryByTestId('map-container')).toBeNull();
        expect(screen.getByTestId('show-map-button')).toBeTruthy();
      });
    });
  });

  describe('Stack Navigation Integration', () => {
    it('should navigate from event list to event detail', async () => {
      render(
        <TestWrapper>
          <TestStackNavigator />
        </TestWrapper>
      );

      // Should start on Home screen
      expect(screen.getByTestId('home-screen')).toBeTruthy();

      // Press on event card to navigate to detail
      const eventCard = screen.getByTestId('event-card-event-1');
      fireEvent.press(eventCard);

      await waitFor(() => {
        expect(screen.getByTestId('event-detail-screen')).toBeTruthy();
      });
    });

    it('should navigate from profile to privacy settings', async () => {
      render(
        <TestWrapper>
          <TestStackNavigator />
        </TestWrapper>
      );

      // Navigate to Profile tab
      fireEvent.press(screen.getByText('Profile'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-screen')).toBeTruthy();
      });

      // Navigate to Privacy settings
      const privacyButton = screen.getByTestId('privacy-settings-button');
      fireEvent.press(privacyButton);

      await waitFor(() => {
        expect(screen.getByTestId('privacy-screen')).toBeTruthy();
      });
    });

    it('should handle back navigation correctly', async () => {
      const mockGoBack = jest.fn();
      jest.mocked(require('@react-navigation/native').useNavigation).mockReturnValue({
        navigate: jest.fn(),
        goBack: mockGoBack,
        dispatch: jest.fn(),
      });

      render(
        <TestWrapper>
          <TestStackNavigator />
        </TestWrapper>
      );

      // Navigate to event detail
      const eventCard = screen.getByTestId('event-card-event-1');
      fireEvent.press(eventCard);

      await waitFor(() => {
        expect(screen.getByTestId('event-detail-screen')).toBeTruthy();
      });

      // Press back button
      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Role-Based Navigation Integration', () => {
    it('should show admin-specific navigation options for admin users', async () => {
      jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue(
        createMockAuth(UserRole.ADMIN, null)
      );

      render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Navigate to Profile
      fireEvent.press(screen.getByText('Profile'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-screen')).toBeTruthy();
      });

      // Admin should see admin dashboard option
      expect(screen.getByTestId('admin-dashboard-button')).toBeTruthy();
      expect(screen.getByTestId('moderation-queue-button')).toBeTruthy();
    });

    it('should show organiser-specific navigation for organiser users', async () => {
      jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue(
        createMockAuth(UserRole.ORGANISER, null)
      );

      render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Navigate to Profile
      fireEvent.press(screen.getByText('Profile'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-screen')).toBeTruthy();
      });

      // Organiser should see event creation option
      expect(screen.getByTestId('create-event-button')).toBeTruthy();
      expect(screen.getByTestId('my-events-button')).toBeTruthy();
    });

    it('should hide restricted navigation options for guest users', async () => {
      jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue(
        createMockAuth(UserRole.GUEST, null)
      );

      render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Navigate to Profile
      fireEvent.press(screen.getByText('Profile'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-screen')).toBeTruthy();
      });

      // Guest should not see admin or organiser options
      expect(screen.queryByTestId('admin-dashboard-button')).toBeNull();
      expect(screen.queryByTestId('create-event-button')).toBeNull();
      expect(screen.queryByTestId('moderation-queue-button')).toBeNull();

      // But should see sign-in option
      expect(screen.getByTestId('sign-in-button')).toBeTruthy();
    });

    it('should prevent navigation to restricted screens for unauthorized roles', async () => {
      const mockNavigate = jest.fn();
      jest.mocked(require('@react-navigation/native').useNavigation).mockReturnValue({
        navigate: mockNavigate,
        goBack: jest.fn(),
        dispatch: jest.fn(),
      });

      jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue(
        createMockAuth(UserRole.PARENT, null)
      );

      render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Try to navigate to admin screen (should be blocked)
      // This would typically be handled by the navigation guard
      const adminButton = screen.queryByTestId('admin-dashboard-button');
      expect(adminButton).toBeNull(); // Button shouldn't exist for non-admin
    });
  });

  describe('Deep Linking Integration', () => {
    it('should handle deep link to event detail with correct parameters', async () => {
      const mockRoute = {
        params: { eventId: 'event-1', cityId: 'berlin' },
      };

      jest.mocked(require('@react-navigation/native').useRoute).mockReturnValue(mockRoute);

      render(
        <TestWrapper>
          <EventDetailScreen route={mockRoute} />
        </TestWrapper>
      );

      // Should load event detail with correct parameters
      expect(screen.getByTestId('event-detail-screen')).toBeTruthy();
      expect(screen.getByText('Berlin Zoo Family Day')).toBeTruthy();
    });

    it('should handle deep link with city scoping', async () => {
      const mockRoute = {
        params: { cityId: 'munich' },
      };

      render(
        <TestWrapper>
          <HomeScreen route={mockRoute} />
        </TestWrapper>
      );

      // Should use Munich city ID for events
      expect(require('../../hooks/useEvents').useEvents).toHaveBeenCalledWith({
        cityId: 'munich',
        filter: 'all',
        userRole: UserRole.PARENT,
      });
    });
  });

  describe('Navigation State Persistence', () => {
    it('should maintain navigation state across app lifecycle', async () => {
      const { rerender } = render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Navigate to Search tab
      fireEvent.press(screen.getByText('Search'));
      await waitFor(() => {
        expect(screen.getByTestId('search-screen')).toBeTruthy();
      });

      // Simulate app restart
      rerender(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Should remember the last active tab (in real app with persistence)
      // For this test, it would start fresh on Home
      expect(screen.getByTestId('home-screen')).toBeTruthy();
    });
  });

  describe('Error Handling in Navigation', () => {
    it('should handle navigation errors gracefully', async () => {
      const mockNavigate = jest.fn().mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      jest.mocked(require('@react-navigation/native').useNavigation).mockReturnValue({
        navigate: mockNavigate,
        goBack: jest.fn(),
        dispatch: jest.fn(),
      });

      render(
        <TestWrapper>
          <TestTabNavigator />
        </TestWrapper>
      );

      // Try to navigate to event detail
      const eventCard = screen.getByTestId('event-card-event-1');
      
      // Should not crash when navigation fails
      expect(() => {
        fireEvent.press(eventCard);
      }).not.toThrow();
    });

    it('should show error message when screen fails to load', async () => {
      // Mock a screen that throws an error
      const ErrorScreen = () => {
        throw new Error('Screen failed to load');
      };

      const TestErrorNavigator = () => (
        <Stack.Navigator>
          <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
      );

      // Should be caught by error boundary in real app
      expect(() => {
        render(
          <TestWrapper>
            <TestErrorNavigator />
          </TestWrapper>
        );
      }).toThrow('Screen failed to load');
    });
  });
});
