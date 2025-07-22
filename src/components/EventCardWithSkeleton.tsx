import React from 'react';
import EventCard from './EventCard';
import EventCardSkeleton from './common/EventCardSkeleton';
import { Event } from '../types/events';

interface EventCardWithSkeletonProps {
  event?: Event;
  loading?: boolean;
  onPress: (event: Event) => void;
  onSaveToggle?: (event: Event) => void;
  isSaved?: boolean;
  compact?: boolean;
  fallbackImage?: string;
  testID?: string;
}

/**
 * EventCard wrapper that shows skeleton loading state when event data is not available
 */
const EventCardWithSkeleton: React.FC<EventCardWithSkeletonProps> = ({
  event,
  loading = false,
  onPress,
  onSaveToggle,
  isSaved = false,
  compact = false,
  fallbackImage,
  testID,
}) => {
  // Show skeleton if loading or no event data
  if (loading || !event) {
    return (
      <EventCardSkeleton 
        compact={compact} 
        testID={testID ? `${testID}-skeleton` : 'event-card-skeleton'} 
      />
    );
  }

  return (
    <EventCard
      event={event}
      onPress={onPress}
      onSaveToggle={onSaveToggle}
      isSaved={isSaved}
      compact={compact}
      fallbackImage={fallbackImage}
    />
  );
};

export default EventCardWithSkeleton;
