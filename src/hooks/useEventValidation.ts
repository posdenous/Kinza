import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Event } from '../types/events';

interface ValidationErrors {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  ageRange?: string;
  categories?: string;
  images?: string;
  price?: string;
  organiser?: string;
  general?: string;
}

interface UseEventValidationResult {
  validateEvent: (event: Partial<Event>) => ValidationErrors;
  isEventValid: (event: Partial<Event>) => boolean;
}

/**
 * Custom hook for event validation logic
 * Enforces the rule that events must include title, age range, venue, and start time
 */
const useEventValidation = (): UseEventValidationResult => {
  const { t } = useTranslation();

  // Validate event data
  const validateEvent = (event: Partial<Event>): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Title validation
    if (!event.title || event.title.trim() === '') {
      errors.title = t('validation.titleRequired');
    } else if (event.title.length < 5) {
      errors.title = t('validation.titleTooShort');
    } else if (event.title.length > 100) {
      errors.title = t('validation.titleTooLong');
    }

    // Description validation
    if (!event.description || event.description.trim() === '') {
      errors.description = t('validation.descriptionRequired');
    } else if (event.description.length < 20) {
      errors.description = t('validation.descriptionTooShort');
    }

    // Location validation
    if (!event.location) {
      errors.location = t('validation.locationRequired');
    } else if (!event.location.name || event.location.name.trim() === '') {
      errors.location = t('validation.venueNameRequired');
    } else if (!event.location.address || event.location.address.trim() === '') {
      errors.location = t('validation.addressRequired');
    } else if (!event.location.coordinates) {
      errors.location = t('validation.coordinatesRequired');
    }

    // Start date validation
    if (!event.startDate) {
      errors.startDate = t('validation.startDateRequired');
    } else {
      const now = new Date();
      const startDate = new Date(event.startDate);
      
      if (startDate < now) {
        errors.startDate = t('validation.startDatePast');
      }
    }

    // End date validation
    if (event.endDate) {
      const startDate = new Date(event.startDate || new Date());
      const endDate = new Date(event.endDate);
      
      if (endDate < startDate) {
        errors.endDate = t('validation.endDateBeforeStart');
      }
    }

    // Age range validation
    if (event.minAge === undefined || event.maxAge === undefined) {
      errors.ageRange = t('validation.ageRangeRequired');
    } else if (event.minAge < 0) {
      errors.ageRange = t('validation.minAgeInvalid');
    } else if (event.maxAge < event.minAge) {
      errors.ageRange = t('validation.maxAgeLessThanMin');
    } else if (event.maxAge > 18) {
      errors.ageRange = t('validation.maxAgeExceeded');
    }

    // Categories validation
    if (!event.categories || event.categories.length === 0) {
      errors.categories = t('validation.categoriesRequired');
    }

    // Price validation
    if (event.isFree === false && (!event.price || !event.price.amount)) {
      errors.price = t('validation.priceRequired');
    }

    // Organiser validation
    if (!event.organiser || !event.organiser.name) {
      errors.organiser = t('validation.organiserRequired');
    }

    return errors;
  };

  // Check if event is valid
  const isEventValid = (event: Partial<Event>): boolean => {
    const errors = validateEvent(event);
    return Object.keys(errors).length === 0;
  };

  return {
    validateEvent,
    isEventValid,
  };
};

export default useEventValidation;
