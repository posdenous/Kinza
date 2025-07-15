/**
 * Event types for the Kinza Berlin app
 */

export interface Location {
  placeId?: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface EventPrice {
  amount: number;
  currency: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organiser: {
    id: string;
    name: string;
  };
  location: Location;
  startDate: Date;
  endDate?: Date;
  minAge: number;
  maxAge: number;
  categories: string[];
  images: string[];
  isFree: boolean;
  price?: EventPrice;
  isApproved: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationComment?: string;
  cityId: string;
  createdAt: Date;
  updatedAt: Date;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity?: number;
  registrationRequired: boolean;
  registrationUrl?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  translations?: {
    [locale: string]: {
      title: string;
      description: string;
    };
  };
}

export interface EventFilter {
  ageRange?: [number, number];
  categories?: string[];
  date?: Date;
  free?: boolean;
  search?: string;
}

export interface SavedEvent {
  userId: string;
  eventId: string;
  savedAt: Date;
  reminderSet?: boolean;
  reminderTime?: Date;
  notes?: string;
}
