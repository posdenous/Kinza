import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OrganiserDashboardScreen } from '../OrganiserDashboardScreen';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

jest.mock('../../hooks/useUserRole', () => ({
  useUserRole: jest.fn()
}));

jest.mock('../../hooks/useOrganiserEvents', () => ({
  useOrganiserEvents: jest.fn()
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('OrganiserDashboardScreen', () => {
  const mockUseUserRole = require('../../hooks/useUserRole').useUserRole;
  const mockUseOrganiserEvents = require('../../hooks/useOrganiserEvents').useOrganiserEvents;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserRole.mockReturnValue({
      role: 'organiser',
      userCityId: 'berlin'
    });
    mockUseOrganiserEvents.mockReturnValue({
      events: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
      stats: {
        totalEvents: 0,
        pendingEvents: 0,
        approvedEvents: 0,
        rejectedEvents: 0
      }
    });
  });

  describe('Access Control', () => {
    it('should render dashboard for organiser users', () => {
      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('organiser.dashboard')).toBeTruthy();
      expect(getByText('organiser.myEvents')).toBeTruthy();
    });

    it('should deny access to non-organiser users', () => {
      mockUseUserRole.mockReturnValue({
        role: 'parent',
        userCityId: 'berlin'
      });
      
      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('errors.notAuthorized')).toBeTruthy();
      expect(getByText('errors.organiserOnly')).toBeTruthy();
    });
  });

  describe('Event Management', () => {
    it('should display event statistics', () => {
      mockUseOrganiserEvents.mockReturnValue({
        events: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: {
          totalEvents: 15,
          pendingEvents: 3,
          approvedEvents: 10,
          rejectedEvents: 2
        }
      });

      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('15')).toBeTruthy(); // Total events
      expect(getByText('3')).toBeTruthy();  // Pending events
      expect(getByText('10')).toBeTruthy(); // Approved events
      expect(getByText('2')).toBeTruthy();  // Rejected events
    });

    it('should show create event button', () => {
      const { getByTestId } = render(<OrganiserDashboardScreen />);
      
      expect(getByTestId('create-event-button')).toBeTruthy();
    });

    it('should navigate to event creation', () => {
      const { getByTestId } = render(<OrganiserDashboardScreen />);
      
      fireEvent.press(getByTestId('create-event-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('SubmitEvent');
    });
  });

  describe('Event Filtering', () => {
    it('should show event filter tabs', () => {
      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('organiser.allEvents')).toBeTruthy();
      expect(getByText('organiser.pending')).toBeTruthy();
      expect(getByText('organiser.approved')).toBeTruthy();
      expect(getByText('organiser.rejected')).toBeTruthy();
    });

    it('should filter events by status', () => {
      const mockEvents = [
        { id: '1', title: 'Event 1', status: 'pending' },
        { id: '2', title: 'Event 2', status: 'approved' },
        { id: '3', title: 'Event 3', status: 'rejected' }
      ];

      mockUseOrganiserEvents.mockReturnValue({
        events: mockEvents,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalEvents: 3, pendingEvents: 1, approvedEvents: 1, rejectedEvents: 1 }
      });

      const { getByTestId, getByText } = render(<OrganiserDashboardScreen />);
      
      // Filter by pending
      fireEvent.press(getByTestId('filter-pending'));
      
      expect(getByText('Event 1')).toBeTruthy();
    });
  });

  describe('Event List', () => {
    it('should display event list', () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Kids Art Workshop',
          status: 'approved',
          startDate: new Date('2025-08-01'),
          location: { name: 'Art Center' },
          attendeeCount: 15
        },
        {
          id: '2',
          title: 'Science Fair',
          status: 'pending',
          startDate: new Date('2025-08-15'),
          location: { name: 'Science Museum' },
          attendeeCount: 0
        }
      ];

      mockUseOrganiserEvents.mockReturnValue({
        events: mockEvents,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalEvents: 2, pendingEvents: 1, approvedEvents: 1, rejectedEvents: 0 }
      });

      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('Kids Art Workshop')).toBeTruthy();
      expect(getByText('Science Fair')).toBeTruthy();
      expect(getByText('Art Center')).toBeTruthy();
      expect(getByText('Science Museum')).toBeTruthy();
    });

    it('should show empty state when no events', () => {
      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('organiser.noEvents')).toBeTruthy();
      expect(getByText('organiser.createFirstEvent')).toBeTruthy();
    });
  });

  describe('Event Actions', () => {
    it('should allow editing events', () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Test Event',
          status: 'approved',
          startDate: new Date(),
          location: { name: 'Test Venue' }
        }
      ];

      mockUseOrganiserEvents.mockReturnValue({
        events: mockEvents,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalEvents: 1, pendingEvents: 0, approvedEvents: 1, rejectedEvents: 0 }
      });

      const { getByTestId } = render(<OrganiserDashboardScreen />);
      
      fireEvent.press(getByTestId('edit-event-1'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('EditEvent', { eventId: '1' });
    });

    it('should show event analytics', () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Test Event',
          status: 'approved',
          startDate: new Date(),
          location: { name: 'Test Venue' },
          attendeeCount: 25,
          viewCount: 150
        }
      ];

      mockUseOrganiserEvents.mockReturnValue({
        events: mockEvents,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalEvents: 1, pendingEvents: 0, approvedEvents: 1, rejectedEvents: 0 }
      });

      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('25')).toBeTruthy(); // Attendee count
      expect(getByText('150')).toBeTruthy(); // View count
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      mockUseOrganiserEvents.mockReturnValue({
        events: [],
        loading: true,
        error: null,
        refresh: jest.fn(),
        stats: { totalEvents: 0, pendingEvents: 0, approvedEvents: 0, rejectedEvents: 0 }
      });

      const { getByTestId } = render(<OrganiserDashboardScreen />);
      
      expect(getByTestId('events-loading')).toBeTruthy();
    });

    it('should show error state', () => {
      mockUseOrganiserEvents.mockReturnValue({
        events: [],
        loading: false,
        error: 'Failed to load events',
        refresh: jest.fn(),
        stats: { totalEvents: 0, pendingEvents: 0, approvedEvents: 0, rejectedEvents: 0 }
      });

      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('errors.loadingFailed')).toBeTruthy();
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh events on pull to refresh', async () => {
      const mockRefresh = jest.fn();
      mockUseOrganiserEvents.mockReturnValue({
        events: [],
        loading: false,
        error: null,
        refresh: mockRefresh,
        stats: { totalEvents: 0, pendingEvents: 0, approvedEvents: 0, rejectedEvents: 0 }
      });

      const { getByTestId } = render(<OrganiserDashboardScreen />);
      
      fireEvent(getByTestId('events-list'), 'refresh');
      
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('City Scoping', () => {
    it('should show events only for organiser city', () => {
      const { getByText } = render(<OrganiserDashboardScreen />);
      
      expect(getByText('berlin')).toBeTruthy();
    });
  });
});
