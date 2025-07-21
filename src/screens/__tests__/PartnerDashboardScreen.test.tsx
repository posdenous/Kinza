import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PartnerDashboardScreen } from '../PartnerDashboardScreen';

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

jest.mock('../../hooks/usePartnerVenues', () => ({
  usePartnerVenues: jest.fn()
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('PartnerDashboardScreen', () => {
  const mockUseUserRole = require('../../hooks/useUserRole').useUserRole;
  const mockUsePartnerVenues = require('../../hooks/usePartnerVenues').usePartnerVenues;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserRole.mockReturnValue({
      role: 'partner',
      userCityId: 'berlin'
    });
    mockUsePartnerVenues.mockReturnValue({
      venues: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
      stats: {
        totalVenues: 0,
        activeVenues: 0,
        totalEvents: 0,
        monthlyViews: 0
      }
    });
  });

  describe('Access Control', () => {
    it('should render dashboard for partner users', () => {
      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('partner.dashboard')).toBeTruthy();
      expect(getByText('partner.venueManagement')).toBeTruthy();
    });

    it('should deny access to non-partner users', () => {
      mockUseUserRole.mockReturnValue({
        role: 'parent',
        userCityId: 'berlin'
      });
      
      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('errors.notAuthorized')).toBeTruthy();
      expect(getByText('errors.partnerOnly')).toBeTruthy();
    });
  });

  describe('Venue Management', () => {
    it('should display venue statistics', () => {
      mockUsePartnerVenues.mockReturnValue({
        venues: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: {
          totalVenues: 5,
          activeVenues: 4,
          totalEvents: 25,
          monthlyViews: 1250
        }
      });

      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('5')).toBeTruthy();    // Total venues
      expect(getByText('4')).toBeTruthy();    // Active venues
      expect(getByText('25')).toBeTruthy();   // Total events
      expect(getByText('1250')).toBeTruthy(); // Monthly views
    });

    it('should show add venue button', () => {
      const { getByTestId } = render(<PartnerDashboardScreen />);
      
      expect(getByTestId('add-venue-button')).toBeTruthy();
    });

    it('should navigate to venue creation', () => {
      const { getByTestId } = render(<PartnerDashboardScreen />);
      
      fireEvent.press(getByTestId('add-venue-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('AddVenue');
    });
  });

  describe('Venue List', () => {
    it('should display venue list', () => {
      const mockVenues = [
        {
          id: '1',
          name: 'Kids Play Center',
          address: '123 Main St, Berlin',
          status: 'active',
          eventCount: 8,
          monthlyViews: 450,
          rating: 4.5
        },
        {
          id: '2',
          name: 'Adventure Playground',
          address: '456 Park Ave, Berlin',
          status: 'pending',
          eventCount: 3,
          monthlyViews: 200,
          rating: 4.2
        }
      ];

      mockUsePartnerVenues.mockReturnValue({
        venues: mockVenues,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalVenues: 2, activeVenues: 1, totalEvents: 11, monthlyViews: 650 }
      });

      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('Kids Play Center')).toBeTruthy();
      expect(getByText('Adventure Playground')).toBeTruthy();
      expect(getByText('123 Main St, Berlin')).toBeTruthy();
      expect(getByText('456 Park Ave, Berlin')).toBeTruthy();
    });

    it('should show venue status badges', () => {
      const mockVenues = [
        {
          id: '1',
          name: 'Active Venue',
          status: 'active',
          eventCount: 5,
          monthlyViews: 300
        },
        {
          id: '2',
          name: 'Pending Venue',
          status: 'pending',
          eventCount: 0,
          monthlyViews: 0
        }
      ];

      mockUsePartnerVenues.mockReturnValue({
        venues: mockVenues,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalVenues: 2, activeVenues: 1, totalEvents: 5, monthlyViews: 300 }
      });

      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('partner.statusActive')).toBeTruthy();
      expect(getByText('partner.statusPending')).toBeTruthy();
    });
  });

  describe('Venue Actions', () => {
    it('should allow editing venues', () => {
      const mockVenues = [
        {
          id: '1',
          name: 'Test Venue',
          status: 'active',
          eventCount: 3,
          monthlyViews: 150
        }
      ];

      mockUsePartnerVenues.mockReturnValue({
        venues: mockVenues,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalVenues: 1, activeVenues: 1, totalEvents: 3, monthlyViews: 150 }
      });

      const { getByTestId } = render(<PartnerDashboardScreen />);
      
      fireEvent.press(getByTestId('edit-venue-1'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('EditVenue', { venueId: '1' });
    });

    it('should show venue analytics', () => {
      const mockVenues = [
        {
          id: '1',
          name: 'Analytics Venue',
          status: 'active',
          eventCount: 12,
          monthlyViews: 800,
          rating: 4.7,
          totalBookings: 45
        }
      ];

      mockUsePartnerVenues.mockReturnValue({
        venues: mockVenues,
        loading: false,
        error: null,
        refresh: jest.fn(),
        stats: { totalVenues: 1, activeVenues: 1, totalEvents: 12, monthlyViews: 800 }
      });

      const { getByTestId } = render(<PartnerDashboardScreen />);
      
      fireEvent.press(getByTestId('view-analytics-1'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('VenueAnalytics', { venueId: '1' });
    });
  });

  describe('Business Features', () => {
    it('should show promotion tools', () => {
      const { getByText, getByTestId } = render(<PartnerDashboardScreen />);
      
      expect(getByText('partner.promotionTools')).toBeTruthy();
      expect(getByTestId('create-promotion-button')).toBeTruthy();
    });

    it('should display revenue analytics', () => {
      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('partner.revenueAnalytics')).toBeTruthy();
      expect(getByText('partner.monthlyRevenue')).toBeTruthy();
    });

    it('should show partnership benefits', () => {
      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('partner.benefits')).toBeTruthy();
      expect(getByText('partner.featuredListings')).toBeTruthy();
      expect(getByText('partner.prioritySupport')).toBeTruthy();
    });
  });

  describe('Event Integration', () => {
    it('should allow creating events for venues', () => {
      const { getByTestId } = render(<PartnerDashboardScreen />);
      
      fireEvent.press(getByTestId('create-venue-event-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('SubmitEvent', { 
        partnerMode: true 
      });
    });

    it('should show venue-specific event management', () => {
      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('partner.venueEvents')).toBeTruthy();
      expect(getByText('partner.eventCalendar')).toBeTruthy();
    });
  });

  describe('City Scoping', () => {
    it('should show venues only for partner city', () => {
      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('berlin')).toBeTruthy();
    });

    it('should enforce city-scoped venue creation', () => {
      const { getByTestId } = render(<PartnerDashboardScreen />);
      
      fireEvent.press(getByTestId('add-venue-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('AddVenue', {
        cityId: 'berlin'
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      mockUsePartnerVenues.mockReturnValue({
        venues: [],
        loading: true,
        error: null,
        refresh: jest.fn(),
        stats: { totalVenues: 0, activeVenues: 0, totalEvents: 0, monthlyViews: 0 }
      });

      const { getByTestId } = render(<PartnerDashboardScreen />);
      
      expect(getByTestId('venues-loading')).toBeTruthy();
    });

    it('should show error state', () => {
      mockUsePartnerVenues.mockReturnValue({
        venues: [],
        loading: false,
        error: 'Failed to load venues',
        refresh: jest.fn(),
        stats: { totalVenues: 0, activeVenues: 0, totalEvents: 0, monthlyViews: 0 }
      });

      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('errors.loadingFailed')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should show empty state for new partners', () => {
      const { getByText } = render(<PartnerDashboardScreen />);
      
      expect(getByText('partner.noVenues')).toBeTruthy();
      expect(getByText('partner.addFirstVenue')).toBeTruthy();
    });
  });
});
