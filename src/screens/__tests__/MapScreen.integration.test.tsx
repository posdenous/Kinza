import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../utils/i18n';
import MapScreen from '../MapScreen';
import { UserRole } from '../../auth/roles';

// Mock hooks
const mockUseAuth = {
  user: { id: 'test-user', email: 'test@example.com' },
  userRole: UserRole.PARENT,
  loading: false,
};

const mockUseEvents = {
  events: [
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
    {
      id: 'event-2',
      title: 'Kids Cooking Workshop',
      description: 'Learn to cook healthy meals',
      startTime: new Date('2024-01-16T14:00:00Z'),
      endTime: new Date('2024-01-16T17:00:00Z'),
      venue: 'Community Center',
      ageRange: '6-14',
      price: 15,
      cityId: 'berlin',
      organizerId: 'org-2',
      status: 'approved',
      tags: ['indoor', 'cooking'],
    },
  ],
  loading: false,
  error: null,
  refreshEvents: jest.fn(),
};

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

jest.mock('../../hooks/useEvents', () => ({
  useEvents: () => mockUseEvents,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </I18nextProvider>
);

describe('MapScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Interactions', () => {
    it('should render all main components together', async () => {
      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Verify all main components are rendered
      expect(screen.getByTestId('map-screen')).toBeTruthy();
      expect(screen.getByTestId('screen-title')).toBeTruthy();
      expect(screen.getByTestId('map-container')).toBeTruthy();
      expect(screen.getByTestId('filter-bar')).toBeTruthy();
      expect(screen.getByTestId('events-list')).toBeTruthy();
    });

    it('should toggle map visibility when toggle button is pressed', async () => {
      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Map should be visible initially
      expect(screen.getByTestId('map-container')).toBeTruthy();
      expect(screen.getByTestId('toggle-map-button')).toBeTruthy();

      // Hide map
      fireEvent.press(screen.getByTestId('toggle-map-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('map-container')).toBeNull();
        expect(screen.getByTestId('show-map-button')).toBeTruthy();
      });

      // Show map again
      fireEvent.press(screen.getByTestId('show-map-button'));

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeTruthy();
        expect(screen.getByTestId('toggle-map-button')).toBeTruthy();
      });
    });

    it('should filter events when filter is changed', async () => {
      const mockEventsWithFilter = {
        ...mockUseEvents,
        events: [mockUseEvents.events[0]], // Only free events
      };

      (require('../../hooks/useEvents').useEvents as jest.Mock).mockReturnValue(mockEventsWithFilter);

      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Initially should show all events
      expect(screen.getByTestId('events-list')).toBeTruthy();

      // Click on "Free" filter
      const freeFilter = screen.getByTestId('filter-free');
      fireEvent.press(freeFilter);

      await waitFor(() => {
        // Should only show free events now
        expect(screen.getByText('Berlin Zoo Family Day')).toBeTruthy();
        expect(screen.queryByText('Kids Cooking Workshop')).toBeNull();
      });
    });

    it('should navigate to event detail when event card is pressed', async () => {
      const mockNavigate = jest.fn();
      (require('@react-navigation/native').useNavigation as jest.Mock).mockReturnValue({
        navigate: mockNavigate,
        goBack: jest.fn(),
        dispatch: jest.fn(),
      });

      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Press on first event card
      const eventCard = screen.getByTestId('event-card-event-1');
      fireEvent.press(eventCard);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('EventDetail', {
          eventId: 'event-1',
          cityId: 'berlin',
        });
      });
    });

    it('should refresh events when pull-to-refresh is triggered', async () => {
      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      const eventsList = screen.getByTestId('events-list');
      
      // Simulate pull-to-refresh
      fireEvent(eventsList, 'refresh');

      await waitFor(() => {
        expect(mockUseEvents.refreshEvents).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should display error message and retry button when events fail to load', async () => {
      const mockEventsWithError = {
        ...mockUseEvents,
        events: [],
        loading: false,
        error: new Error('Failed to load events'),
      };

      (require('../../hooks/useEvents').useEvents as jest.Mock).mockReturnValue(mockEventsWithError);

      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Should show error message
      expect(screen.getByTestId('error-message')).toBeTruthy();
      expect(screen.getByText('errors.loadingEvents')).toBeTruthy();

      // Should show retry button
      const retryButton = screen.getByText('common.retry');
      expect(retryButton).toBeTruthy();

      // Press retry button
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(mockEventsWithError.refreshEvents).toHaveBeenCalled();
      });
    });

    it('should display empty state when no events are available', async () => {
      const mockEventsEmpty = {
        ...mockUseEvents,
        events: [],
        loading: false,
        error: null,
      };

      (require('../../hooks/useEvents').useEvents as jest.Mock).mockReturnValue(mockEventsEmpty);

      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Should show empty state
      expect(screen.getByTestId('empty-state')).toBeTruthy();
      expect(screen.getByText('screens.home.noEvents')).toBeTruthy();
      expect(screen.getByText('screens.home.tryDifferentFilter')).toBeTruthy();
    });
  });

  describe('Loading States Integration', () => {
    it('should display loading indicator when events are being fetched', async () => {
      const mockEventsLoading = {
        ...mockUseEvents,
        events: [],
        loading: true,
        error: null,
      };

      (require('../../hooks/useEvents').useEvents as jest.Mock).mockReturnValue(mockEventsLoading);

      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Should show loading indicator
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      expect(screen.getByText('common.loading')).toBeTruthy();
    });
  });

  describe('Role-Based Access Integration', () => {
    it('should pass correct user role to child components', async () => {
      const mockAuthAdmin = {
        ...mockUseAuth,
        userRole: UserRole.ADMIN,
      };

      (require('../../hooks/useAuth').useAuth as jest.Mock).mockReturnValue(mockAuthAdmin);

      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Verify that useEvents hook receives admin role
      expect(require('../../hooks/useEvents').useEvents).toHaveBeenCalledWith({
        cityId: 'berlin',
        filter: 'all',
        userRole: UserRole.ADMIN,
      });
    });

    it('should handle guest user role correctly', async () => {
      const mockAuthGuest = {
        ...mockUseAuth,
        user: null,
        userRole: UserRole.GUEST,
      };

      (require('../../hooks/useAuth').useAuth as jest.Mock).mockReturnValue(mockAuthGuest);

      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Verify that useEvents hook receives guest role
      expect(require('../../hooks/useEvents').useEvents).toHaveBeenCalledWith({
        cityId: 'berlin',
        filter: 'all',
        userRole: UserRole.GUEST,
      });
    });
  });

  describe('City Scoping Integration', () => {
    it('should use correct cityId from route params', async () => {
      const mockRoute = {
        params: { cityId: 'munich' },
      };

      (require('@react-navigation/native').useRoute as jest.Mock).mockReturnValue(mockRoute);

      render(
        <TestWrapper>
          <MapScreen route={mockRoute} />
        </TestWrapper>
      );

      // Verify that useEvents hook receives correct cityId
      expect(require('../../hooks/useEvents').useEvents).toHaveBeenCalledWith({
        cityId: 'munich',
        filter: 'all',
        userRole: UserRole.PARENT,
      });
    });

    it('should default to berlin when no cityId is provided', async () => {
      render(
        <TestWrapper>
          <MapScreen />
        </TestWrapper>
      );

      // Verify that useEvents hook uses default berlin cityId
      expect(require('../../hooks/useEvents').useEvents).toHaveBeenCalledWith({
        cityId: 'berlin',
        filter: 'all',
        userRole: UserRole.PARENT,
      });
    });
  });
});
