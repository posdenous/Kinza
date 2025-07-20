import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EventCard from '../EventCard';
import { Event } from '../../types/events';

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => null,
}));

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  }),
}));

// Mock the useFocusState hook
jest.mock('../../hooks/useFocusState', () => () => ({
  focusHandlers: {},
  focusStyles: {}
}));

describe('EventCard', () => {
  const mockEvent: Event = {
    id: 'event123',
    title: 'Test Event',
    description: 'This is a test event',
    startTime: new Date('2025-07-20T10:00:00'),
    endTime: new Date('2025-07-20T12:00:00'),
    location: {
      name: 'Test Venue',
      address: '123 Test St',
      coordinates: { latitude: 52.52, longitude: 13.405 }
    },
    categories: ['music'],
    ageRange: { min: 0, max: 12 },
    cityId: 'berlin',
    createdBy: 'user123',
    createdAt: new Date('2025-07-01'),
    images: ['https://example.com/image.jpg'],
    translations: {
      en: { title: 'Test Event', description: 'This is a test event' },
      de: { title: 'Test Veranstaltung', description: 'Dies ist eine Testveranstaltung' },
      it: { title: 'Evento di prova', description: 'Questo è un evento di prova' }
    }
  };

  const mockOnPress = jest.fn();
  const mockOnSaveToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all props', () => {
    const { getByText, getByTestId } = render(
      <EventCard 
        event={mockEvent} 
        onPress={mockOnPress} 
        onSaveToggle={mockOnSaveToggle} 
        isSaved={false}
      />
    );

    // Check if title is rendered
    expect(getByText('Test Event')).toBeTruthy();
    
    // Check if venue is rendered
    expect(getByText('Test Venue')).toBeTruthy();
    
    // Check if date is rendered (this will depend on the locale formatting)
    // We're using a partial match since the exact format may vary
    const dateElements = getByText(/Jul/);
    expect(dateElements).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByA11yRole } = render(
      <EventCard 
        event={mockEvent} 
        onPress={mockOnPress} 
        onSaveToggle={mockOnSaveToggle} 
      />
    );

    const card = getByA11yRole('button');
    fireEvent.press(card);
    
    expect(mockOnPress).toHaveBeenCalledWith(mockEvent);
  });

  it('calls onSaveToggle when save button is pressed', () => {
    const { getByTestId } = render(
      <EventCard 
        event={mockEvent} 
        onPress={mockOnPress} 
        onSaveToggle={mockOnSaveToggle} 
        isSaved={false}
      />
    );

    // Find and press the save button
    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);
    
    expect(mockOnSaveToggle).toHaveBeenCalledWith(mockEvent);
  });

  it('displays saved state correctly', () => {
    const { getByTestId } = render(
      <EventCard 
        event={mockEvent} 
        onPress={mockOnPress} 
        onSaveToggle={mockOnSaveToggle} 
        isSaved={true}
      />
    );

    // Check if the saved icon is displayed
    const saveButton = getByTestId('save-button');
    expect(saveButton.props.accessibilityLabel).toContain('unsave');
  });

  it('handles missing images gracefully', () => {
    const eventWithoutImage = {
      ...mockEvent,
      images: []
    };

    const { getByTestId } = render(
      <EventCard 
        event={eventWithoutImage} 
        onPress={mockOnPress} 
        onSaveToggle={mockOnSaveToggle} 
      />
    );

    // Check if fallback image is displayed
    const fallbackImage = getByTestId('fallback-image');
    expect(fallbackImage).toBeTruthy();
  });

  it('renders in compact mode correctly', () => {
    const { getByText, queryByText } = render(
      <EventCard 
        event={mockEvent} 
        onPress={mockOnPress} 
        compact={true}
      />
    );

    // Title should still be visible in compact mode
    expect(getByText('Test Event')).toBeTruthy();
    
    // Description should not be visible in compact mode
    expect(queryByText('This is a test event')).toBeNull();
  });
});
