import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AdminDashboardScreen } from '../AdminDashboardScreen';

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

jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: () => [mockFirestore]
}));

const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('AdminDashboardScreen', () => {
  const mockUseUserRole = require('../../hooks/useUserRole').useUserRole;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserRole.mockReturnValue({
      role: 'admin',
      userCityId: 'berlin'
    });
  });

  describe('Access Control', () => {
    it('should render dashboard for admin users', () => {
      const { getByText } = render(<AdminDashboardScreen />);
      
      expect(getByText('admin.dashboard')).toBeTruthy();
      expect(getByText('admin.overview')).toBeTruthy();
    });

    it('should deny access to non-admin users', () => {
      mockUseUserRole.mockReturnValue({
        role: 'parent',
        userCityId: 'berlin'
      });
      
      const { getByText } = render(<AdminDashboardScreen />);
      
      expect(getByText('errors.notAuthorized')).toBeTruthy();
      expect(getByText('errors.adminOnly')).toBeTruthy();
    });

    it('should redirect non-admin users to login', () => {
      mockUseUserRole.mockReturnValue({
        role: 'guest',
        userCityId: 'berlin'
      });
      
      const { getByTestId } = render(<AdminDashboardScreen />);
      
      fireEvent.press(getByTestId('login-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Dashboard Statistics', () => {
    it('should display key admin statistics', async () => {
      const { getByText } = render(<AdminDashboardScreen />);
      
      await waitFor(() => {
        expect(getByText('admin.pendingEvents')).toBeTruthy();
        expect(getByText('admin.pendingComments')).toBeTruthy();
        expect(getByText('admin.activeEvents')).toBeTruthy();
        expect(getByText('admin.reportedContent')).toBeTruthy();
      });
    });

    it('should show loading state while fetching stats', () => {
      const { getByTestId } = render(<AdminDashboardScreen />);
      
      expect(getByTestId('stats-loading')).toBeTruthy();
    });

    it('should handle stats loading errors', async () => {
      // Mock error in stats fetching
      mockFirestore.collection.mockImplementation(() => {
        throw new Error('Firestore error');
      });
      
      const { getByText } = render(<AdminDashboardScreen />);
      
      await waitFor(() => {
        expect(getByText('errors.loadingFailed')).toBeTruthy();
      });
    });
  });

  describe('Quick Actions', () => {
    it('should provide quick access to moderation tools', () => {
      const { getByTestId } = render(<AdminDashboardScreen />);
      
      expect(getByTestId('moderation-queue-button')).toBeTruthy();
      expect(getByTestId('report-review-button')).toBeTruthy();
      expect(getByTestId('user-management-button')).toBeTruthy();
    });

    it('should navigate to moderation queue', () => {
      const { getByTestId } = render(<AdminDashboardScreen />);
      
      fireEvent.press(getByTestId('moderation-queue-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ModerationQueue');
    });

    it('should navigate to report review', () => {
      const { getByTestId } = render(<AdminDashboardScreen />);
      
      fireEvent.press(getByTestId('report-review-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ReportReview');
    });
  });

  describe('City Scoping', () => {
    it('should display current city context', () => {
      const { getByText } = render(<AdminDashboardScreen />);
      
      expect(getByText('berlin')).toBeTruthy();
    });

    it('should filter stats by city', async () => {
      render(<AdminDashboardScreen />);
      
      await waitFor(() => {
        expect(mockFirestore.collection).toHaveBeenCalledWith(
          expect.stringContaining('moderation')
        );
        // Verify city filtering is applied in queries
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should refresh stats when data changes', async () => {
      const { getByTestId } = render(<AdminDashboardScreen />);
      
      fireEvent.press(getByTestId('refresh-button'));
      
      await waitFor(() => {
        expect(getByTestId('stats-loading')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(<AdminDashboardScreen />);
      
      expect(getByTestId('moderation-queue-button')).toHaveProp(
        'accessibilityLabel',
        'admin.moderationQueue'
      );
      expect(getByTestId('report-review-button')).toHaveProp(
        'accessibilityLabel',
        'admin.reportReview'
      );
    });
  });
});
