import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ModerationWrapper from '../ModerationWrapper';
import { Text } from 'react-native';

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color, ...props }: any) => (
    <Text testID={`icon-${name}`} style={{ fontSize: size, color }}>{name}</Text>
  ),
}));

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useUgcModeration hook with more control for testing
const mockCheckModerationStatus = jest.fn();
jest.mock('../../hooks/useUgcModeration', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      checkModerationStatus: mockCheckModerationStatus,
    })),
    ContentType: {
      comment: 'comment',
      event: 'event',
      profile: 'profile',
      venue: 'venue',
    },
  };
});

// Mock the useUserRole hook with ability to change roles for tests
const mockUseUserRole = jest.fn();
jest.mock('../../hooks/useUserRole', () => ({
  useUserRole: () => mockUseUserRole(),
}));

describe('ModerationWrapper', () => {
  const TestChild = () => <Text testID="test-child">Test Content</Text>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mock implementations
    mockUseUserRole.mockReturnValue({ role: 'user' });
    
    mockCheckModerationStatus.mockImplementation(async (contentType, contentId) => {
      // Simulate different moderation statuses based on contentId
      if (contentId === 'approved-content') {
        return 'approved';
      } else if (contentId === 'rejected-content') {
        return 'rejected';
      } else if (contentId === 'pending-content') {
        return 'pending';
      } else if (contentId === 'error-content') {
        throw new Error('Moderation check failed');
      } else if (contentId === 'slow-content') {
        // Simulate a slow response
        await new Promise(resolve => setTimeout(resolve, 11000));
        return 'approved';
      } else {
        return null;
      }
    });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children when content is approved', async () => {
    const { getByTestId, queryByText } = render(
      <ModerationWrapper contentId="approved-content" contentType="comment">
        <TestChild />
      </ModerationWrapper>
    );

    await waitFor(() => {
      expect(getByTestId('test-child')).toBeTruthy();
    });
    
    expect(queryByText('moderation.pending')).toBeNull();
    expect(queryByText('moderation.rejected')).toBeNull();
  });

  it('shows pending message when content is pending and user is not admin', async () => {
    const { queryByTestId, getByText } = render(
      <ModerationWrapper contentId="pending-content" contentType="comment">
        <TestChild />
      </ModerationWrapper>
    );

    await waitFor(() => {
      expect(getByText('moderation.pending')).toBeTruthy();
    });
    
    expect(queryByTestId('test-child')).toBeNull();
  });

  it('shows rejected message when content is rejected', async () => {
    const { queryByTestId, getByText } = render(
      <ModerationWrapper contentId="rejected-content" contentType="comment">
        <TestChild />
      </ModerationWrapper>
    );

    await waitFor(() => {
      expect(getByText('moderation.rejected')).toBeTruthy();
    });
    
    expect(queryByTestId('test-child')).toBeNull();
  });

  it('shows loading indicator initially', () => {
    const { getByTestId } = render(
      <ModerationWrapper contentId="approved-content" contentType="comment">
        <TestChild />
      </ModerationWrapper>
    );

    expect(getByTestId('moderation-loading')).toBeTruthy();
  });

  it('shows retry button when loading times out', async () => {
    jest.useFakeTimers();
    
    const { getByText } = render(
      <ModerationWrapper 
        contentId="slow-content" 
        contentType="comment"
        loadingTimeout={1000}
      >
        <TestChild />
      </ModerationWrapper>
    );

    // Fast-forward past the timeout
    jest.advanceTimersByTime(1500);
    
    await waitFor(() => {
      expect(getByText('moderation.loadingTimedOut')).toBeTruthy();
    });
    
    const retryButton = getByText('moderation.retry');
    expect(retryButton).toBeTruthy();
    
    // Test retry functionality
    fireEvent.press(retryButton);
    
    // Should show loading again
    expect(getByText('moderation.loading')).toBeTruthy();
    
    jest.useRealTimers();
  });

  it('shows custom loading component when provided', () => {
    const CustomLoading = () => <Text testID="custom-loading">Custom Loading...</Text>;
    
    const { getByTestId, queryByTestId } = render(
      <ModerationWrapper 
        contentId="approved-content" 
        contentType="comment"
        customLoadingComponent={<CustomLoading />}
      >
        <TestChild />
      </ModerationWrapper>
    );

    expect(getByTestId('custom-loading')).toBeTruthy();
    expect(queryByTestId('moderation-loading')).toBeNull();
  });

  it('allows admin users to see pending content', async () => {
    // Override the mock to return admin role
    require('../../hooks/useUserRole').useUserRole.mockImplementation(() => ({
      role: 'admin',
    }));
    
    const { getByTestId, queryByText } = render(
      <ModerationWrapper contentId="pending-content" contentType="comment">
        <TestChild />
      </ModerationWrapper>
    );

    await waitFor(() => {
      expect(getByTestId('test-child')).toBeTruthy();
    });
    
    // Admin should see the content but also the pending badge
    expect(getByTestId('moderation-badge')).toBeTruthy();
    expect(queryByText('moderation.adminView')).toBeTruthy();
  });

  it('calls onModerate when moderate button is pressed', async () => {
    // Override the mock to return admin role
    require('../../hooks/useUserRole').useUserRole.mockImplementation(() => ({
      role: 'admin',
    }));
    
    const mockOnModerate = jest.fn();
    
    const { getByText } = render(
      <ModerationWrapper 
        contentId="pending-content" 
        contentType="comment"
        onModerate={mockOnModerate}
      >
        <TestChild />
      </ModerationWrapper>
    );

    await waitFor(() => {
      const moderateButton = getByText('moderation.moderate');
      fireEvent.press(moderateButton);
      expect(mockOnModerate).toHaveBeenCalled();
    });
  });
});
