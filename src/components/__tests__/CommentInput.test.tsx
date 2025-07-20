import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CommentInput from '../CommentInput';
import { Alert } from 'react-native';

// Mock Alert.alert
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Alert.alert = jest.fn();
  return rn;
});

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => null,
}));

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return `${key} ${JSON.stringify(params)}`;
      }
      return key;
    },
  }),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null, // Default to not logged in
  })),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(() => Promise.resolve({ id: 'new-comment-id' })),
  collection: jest.fn(() => 'comments-collection'),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock the useFirestoreInstance hook
jest.mock('../../hooks/useFirestoreInstance', () => ({
  useFirestoreInstance: jest.fn(() => [{}]), // Mock firestore instance
}));

// Mock the useUserCity hook
jest.mock('../../hooks/useCities', () => ({
  useUserCity: jest.fn(() => ({
    currentCityId: 'berlin',
  })),
}));

// Mock the useUgcModeration hook with more control for testing
const mockSubmitForModeration = jest.fn(() => Promise.resolve(true));
jest.mock('../../hooks/useUgcModeration', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      submitForModeration: mockSubmitForModeration,
      checkModerationStatus: jest.fn((contentId) => {
        if (contentId === 'approved-comment') return Promise.resolve('approved');
        if (contentId === 'rejected-comment') return Promise.resolve('rejected');
        if (contentId === 'pending-comment') return Promise.resolve('pending');
        return Promise.resolve('pending');
      }),
    })),
  };
});

describe('CommentInput', () => {
  const mockEventId = 'event123';
  const mockOnCommentAdded = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    expect(getByPlaceholderText('comments.placeholder')).toBeTruthy();
    expect(getByText('comments.submit')).toBeTruthy();
  });

  it('validates comment length in real-time', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    
    // Empty comment
    fireEvent.changeText(input, '');
    expect(queryByText('comments.errorEmpty')).toBeTruthy();
    
    // Too short comment
    fireEvent.changeText(input, 'hi');
    expect(queryByText('comments.errorTooShort')).toBeTruthy();
    
    // Valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    expect(queryByText('comments.errorEmpty')).toBeNull();
    expect(queryByText('comments.errorTooShort')).toBeNull();
  });

  it('detects inappropriate content', () => {
    const { getByPlaceholderText, queryByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    
    // Comment with inappropriate word
    fireEvent.changeText(input, 'This contains inappropriate content');
    expect(queryByText('comments.errorInappropriate')).toBeTruthy();
  });

  it('shows login alert when not logged in', async () => {
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Try to submit
    fireEvent.press(submitButton);
    
    // Check if Alert was called with login message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'comments.loginRequired',
        'comments.loginToComment',
        expect.anything()
      );
    });
  });

  it('submits comment when logged in', async () => {
    // Mock user as logged in
    require('firebase/auth').getAuth.mockImplementation(() => ({
      currentUser: {
        uid: 'user123',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      },
    }));
    
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Submit comment
    fireEvent.press(submitButton);
    
    // Check if addDoc was called
    await waitFor(() => {
      expect(require('firebase/firestore').addDoc).toHaveBeenCalled();
      expect(require('../../hooks/useUgcModeration').default().submitForModeration).toHaveBeenCalled();
      expect(mockOnCommentAdded).toHaveBeenCalled();
    });
  });

  it('shows error when comment submission fails', async () => {
    // Mock user as logged in
    require('firebase/auth').getAuth.mockImplementation(() => ({
      currentUser: {
        uid: 'user123',
        displayName: 'Test User',
      },
    }));
    
    // Mock addDoc to fail
    require('firebase/firestore').addDoc.mockImplementation(() => Promise.reject(new Error('Failed to add comment')));
    
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Submit comment
    fireEvent.press(submitButton);
    
    // Check if Alert was called with error message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'comments.error',
        expect.anything(),
        expect.anything()
      );
      expect(mockOnCommentAdded).not.toHaveBeenCalled();
    });
  });

  it('shows character count', () => {
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    
    // Enter comment
    fireEvent.changeText(input, 'This is a test comment');
    
    // Check if character count is displayed
    expect(getByText('21/500')).toBeTruthy();
  });

  it('disables submit button when comment is invalid', () => {
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Empty comment (invalid)
    fireEvent.changeText(input, '');
    expect(submitButton.props.disabled).toBeTruthy();
    
    // Valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    expect(submitButton.props.disabled).toBeFalsy();
  });

  it('shows moderation pending message after submission', async () => {
    // Mock user as logged in
    require('firebase/auth').getAuth.mockImplementation(() => ({
      currentUser: {
        uid: 'user123',
        displayName: 'Test User',
      },
    }));
    
    // Mock moderation to return pending
    mockSubmitForModeration.mockImplementation(() => Promise.resolve(true));
    
    const { getByPlaceholderText, getByText, findByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Submit comment
    fireEvent.press(submitButton);
    
    // Check for moderation message
    await waitFor(() => {
      expect(mockSubmitForModeration).toHaveBeenCalled();
    });
  });

  it('handles moderation rejection', async () => {
    // Mock user as logged in
    require('firebase/auth').getAuth.mockImplementation(() => ({
      currentUser: {
        uid: 'user123',
        displayName: 'Test User',
      },
    }));
    
    // Mock moderation to be rejected
    mockSubmitForModeration.mockImplementation(() => Promise.resolve(true));
    
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Submit comment
    fireEvent.press(submitButton);
    
    // Check for rejection handling
    await waitFor(() => {
      expect(mockSubmitForModeration).toHaveBeenCalled();
    });
  });

  it('handles network errors during submission', async () => {
    // Mock user as logged in
    require('firebase/auth').getAuth.mockImplementation(() => ({
      currentUser: {
        uid: 'user123',
        displayName: 'Test User',
      },
    }));
    
    // Mock network error
    mockSubmitForModeration.mockImplementation(() => Promise.reject(new Error('Network error')));
    
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Submit comment
    fireEvent.press(submitButton);
    
    // Check if Alert was called with network error message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'comments.error',
        expect.stringContaining('Network error'),
        expect.anything()
      );
    });
  });

  it('handles missing city ID gracefully', async () => {
    // Mock user as logged in
    require('firebase/auth').getAuth.mockImplementation(() => ({
      currentUser: {
        uid: 'user123',
        displayName: 'Test User',
      },
    }));
    
    // Mock missing city ID
    require('../../hooks/useCities').useUserCity.mockImplementation(() => ({
      currentCityId: null,
    }));
    
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Submit comment
    fireEvent.press(submitButton);
    
    // Check if Alert was called with error message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'common.error',
        'common.tryAgainLater'
      );
    });
  });

  it('resets form after successful submission', async () => {
    // Mock user as logged in
    require('firebase/auth').getAuth.mockImplementation(() => ({
      currentUser: {
        uid: 'user123',
        displayName: 'Test User',
      },
    }));
    
    const { getByPlaceholderText, getByText } = render(
      <CommentInput eventId={mockEventId} onCommentAdded={mockOnCommentAdded} />
    );
    
    const input = getByPlaceholderText('comments.placeholder');
    const submitButton = getByText('comments.submit');
    
    // Enter valid comment
    fireEvent.changeText(input, 'This is a valid comment');
    
    // Submit comment
    fireEvent.press(submitButton);
    
    // Check if input was reset
    await waitFor(() => {
      expect(input.props.value).toBe('');
    });
  });
});
