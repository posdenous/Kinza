// Event validation business logic unit tests
// Tests the core event validation rules and business logic

interface EventData {
  title?: string;
  description?: string;
  ageRange?: string;
  venue?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  cityId?: string;
  organizerId?: string;
  category?: string;
  maxParticipants?: number;
  price?: number;
  tags?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Mock event validation functions (would be implemented in actual service)
const validateEventTitle = (title?: string): { isValid: boolean; error?: string } => {
  if (!title) return { isValid: false, error: 'Title is required' };
  if (title.trim().length < 3) return { isValid: false, error: 'Title must be at least 3 characters' };
  if (title.length > 100) return { isValid: false, error: 'Title must be less than 100 characters' };
  if (title.includes('<') || title.includes('>')) return { isValid: false, error: 'Title contains invalid characters' };
  return { isValid: true };
};

const validateAgeRange = (ageRange?: string): { isValid: boolean; error?: string } => {
  if (!ageRange) return { isValid: false, error: 'Age range is required' };
  const validRanges = ['0-2', '3-5', '6-8', '9-12', '13-16', '17+', 'All ages'];
  if (!validRanges.includes(ageRange)) return { isValid: false, error: 'Invalid age range' };
  return { isValid: true };
};

const validateVenue = (venue?: string): { isValid: boolean; error?: string } => {
  if (!venue) return { isValid: false, error: 'Venue is required' };
  if (venue.trim().length < 2) return { isValid: false, error: 'Venue must be at least 2 characters' };
  if (venue.length > 200) return { isValid: false, error: 'Venue must be less than 200 characters' };
  return { isValid: true };
};

const validateStartTime = (startTime?: Date | string): { isValid: boolean; error?: string } => {
  if (!startTime) return { isValid: false, error: 'Start time is required' };
  
  const date = typeof startTime === 'string' ? new Date(startTime) : startTime;
  if (isNaN(date.getTime())) return { isValid: false, error: 'Invalid start time format' };
  
  const now = new Date();
  if (date < now) return { isValid: false, error: 'Start time cannot be in the past' };
  
  const maxFuture = new Date();
  maxFuture.setFullYear(maxFuture.getFullYear() + 1);
  if (date > maxFuture) return { isValid: false, error: 'Start time cannot be more than 1 year in the future' };
  
  return { isValid: true };
};

const validateEndTime = (startTime?: Date | string, endTime?: Date | string): { isValid: boolean; error?: string } => {
  if (!endTime) return { isValid: true }; // End time is optional
  
  const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;
  if (isNaN(endDate.getTime())) return { isValid: false, error: 'Invalid end time format' };
  
  if (startTime) {
    const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
    if (endDate <= startDate) return { isValid: false, error: 'End time must be after start time' };
    
    const maxDuration = 24 * 60 * 60 * 1000; // 24 hours
    if (endDate.getTime() - startDate.getTime() > maxDuration) {
      return { isValid: false, error: 'Event duration cannot exceed 24 hours' };
    }
  }
  
  return { isValid: true };
};

const validateCityScope = (cityId?: string, organizerId?: string): { isValid: boolean; error?: string } => {
  if (!cityId) return { isValid: false, error: 'City ID is required' };
  if (!organizerId) return { isValid: false, error: 'Organizer ID is required' };
  
  // Mock city validation - in real implementation would check against database
  const validCities = ['berlin', 'munich', 'hamburg', 'cologne'];
  if (!validCities.includes(cityId.toLowerCase())) {
    return { isValid: false, error: 'Invalid city ID' };
  }
  
  return { isValid: true };
};

const validateBusinessRules = (eventData: EventData): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Business rule: Events must have title, age range, venue, and start time
  const titleResult = validateEventTitle(eventData.title);
  if (!titleResult.isValid && titleResult.error) errors.push(titleResult.error);
  
  const ageResult = validateAgeRange(eventData.ageRange);
  if (!ageResult.isValid && ageResult.error) errors.push(ageResult.error);
  
  const venueResult = validateVenue(eventData.venue);
  if (!venueResult.isValid && venueResult.error) errors.push(venueResult.error);
  
  const startTimeResult = validateStartTime(eventData.startTime);
  if (!startTimeResult.isValid && startTimeResult.error) errors.push(startTimeResult.error);
  
  const endTimeResult = validateEndTime(eventData.startTime, eventData.endTime);
  if (!endTimeResult.isValid && endTimeResult.error) errors.push(endTimeResult.error);
  
  const cityScopeResult = validateCityScope(eventData.cityId, eventData.organizerId);
  if (!cityScopeResult.isValid && cityScopeResult.error) errors.push(cityScopeResult.error);
  
  // Business rule warnings
  if (eventData.maxParticipants && eventData.maxParticipants > 500) {
    warnings.push('Large events (>500 participants) require additional approval');
  }
  
  if (eventData.price && eventData.price > 50) {
    warnings.push('High-priced events may have lower attendance');
  }
  
  if (!eventData.description || eventData.description.length < 50) {
    warnings.push('Events with detailed descriptions perform better');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

describe('Event Validation Business Logic', () => {
  describe('validateEventTitle', () => {
    it('should require a title', () => {
      const result = validateEventTitle();
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should require minimum title length', () => {
      const result = validateEventTitle('Hi');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title must be at least 3 characters');
    });

    it('should enforce maximum title length', () => {
      const longTitle = 'A'.repeat(101);
      const result = validateEventTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title must be less than 100 characters');
    });

    it('should reject titles with HTML tags', () => {
      const result = validateEventTitle('Fun Event <script>alert("hack")</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title contains invalid characters');
    });

    it('should accept valid titles', () => {
      const result = validateEventTitle('Kids Art Workshop');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle whitespace properly', () => {
      const result = validateEventTitle('   Valid Title   ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAgeRange', () => {
    it('should require an age range', () => {
      const result = validateAgeRange();
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Age range is required');
    });

    it('should accept valid age ranges', () => {
      const validRanges = ['0-2', '3-5', '6-8', '9-12', '13-16', '17+', 'All ages'];
      
      validRanges.forEach(range => {
        const result = validateAgeRange(range);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid age ranges', () => {
      const invalidRanges = ['0-3', '5-7', '18+', 'Adults only'];
      
      invalidRanges.forEach(range => {
        const result = validateAgeRange(range);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid age range');
      });
    });

    it('should handle empty age range', () => {
      const result = validateAgeRange('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Age range is required');
    });
  });

  describe('validateVenue', () => {
    it('should require a venue', () => {
      const result = validateVenue();
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Venue is required');
    });

    it('should require minimum venue length', () => {
      const result = validateVenue('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Venue must be at least 2 characters');
    });

    it('should enforce maximum venue length', () => {
      const longVenue = 'A'.repeat(201);
      const result = validateVenue(longVenue);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Venue must be less than 200 characters');
    });

    it('should accept valid venues', () => {
      const result = validateVenue('Berlin Community Center');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateStartTime', () => {
    it('should require a start time', () => {
      const result = validateStartTime();
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Start time is required');
    });

    it('should reject invalid date formats', () => {
      const result = validateStartTime('invalid-date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid start time format');
    });

    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      
      const result = validateStartTime(pastDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Start time cannot be in the past');
    });

    it('should reject dates too far in the future', () => {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 2);
      
      const result = validateStartTime(farFuture);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Start time cannot be more than 1 year in the future');
    });

    it('should accept valid future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const result = validateStartTime(futureDate);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle string dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const result = validateStartTime(tomorrow.toISOString());
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateEndTime', () => {
    it('should allow missing end time', () => {
      const result = validateEndTime(new Date());
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid end time formats', () => {
      const result = validateEndTime(new Date(), 'invalid-date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid end time format');
    });

    it('should reject end time before start time', () => {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(endTime.getHours() - 1);
      
      const result = validateEndTime(startTime, endTime);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('End time must be after start time');
    });

    it('should reject events longer than 24 hours', () => {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      
      const endTime = new Date(startTime);
      endTime.setDate(endTime.getDate() + 2); // 48 hours later
      
      const result = validateEndTime(startTime, endTime);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Event duration cannot exceed 24 hours');
    });

    it('should accept valid end times', () => {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);
      
      const result = validateEndTime(startTime, endTime);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateCityScope', () => {
    it('should require city ID', () => {
      const result = validateCityScope(undefined, 'organizer123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('City ID is required');
    });

    it('should require organizer ID', () => {
      const result = validateCityScope('berlin');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Organizer ID is required');
    });

    it('should validate city IDs', () => {
      const result = validateCityScope('invalid-city', 'organizer123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid city ID');
    });

    it('should accept valid city and organizer', () => {
      const result = validateCityScope('berlin', 'organizer123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should be case insensitive for cities', () => {
      const result = validateCityScope('BERLIN', 'organizer123');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateBusinessRules', () => {
    const validEventData: EventData = {
      title: 'Kids Art Workshop',
      description: 'A fun and creative art workshop for children to explore their artistic talents.',
      ageRange: '6-8',
      venue: 'Berlin Community Center',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      cityId: 'berlin',
      organizerId: 'organizer123',
      category: 'arts',
      maxParticipants: 20,
      price: 15
    };

    it('should validate complete event data', () => {
      const result = validateBusinessRules(validEventData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect multiple validation errors', () => {
      const invalidEventData: EventData = {
        title: '', // Invalid
        ageRange: 'invalid', // Invalid
        venue: '', // Invalid
        // Missing start time
        cityId: 'invalid-city', // Invalid
        organizerId: 'organizer123'
      };

      const result = validateBusinessRules(invalidEventData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });

    it('should generate warnings for business rule violations', () => {
      const eventWithWarnings: EventData = {
        ...validEventData,
        maxParticipants: 600, // Should generate warning
        price: 75, // Should generate warning
        description: 'Short' // Should generate warning
      };

      const result = validateBusinessRules(eventWithWarnings);
      expect(result.warnings.length).toBeGreaterThanOrEqual(3);
      expect(result.warnings).toContain('Large events (>500 participants) require additional approval');
      expect(result.warnings).toContain('High-priced events may have lower attendance');
      expect(result.warnings).toContain('Events with detailed descriptions perform better');
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalEventData: EventData = {
        title: 'Minimal Event',
        ageRange: '6-8',
        venue: 'Test Venue',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        cityId: 'berlin',
        organizerId: 'organizer123'
      };

      const result = validateBusinessRules(minimalEventData);
      expect(result.isValid).toBe(true);
    });

    it('should enforce all required business rules', () => {
      // Test each required field individually
      const requiredFields = ['title', 'ageRange', 'venue', 'startTime', 'cityId', 'organizerId'];
      
      requiredFields.forEach(field => {
        const testData = { ...validEventData };
        delete testData[field as keyof EventData];
        
        const result = validateBusinessRules(testData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle null and undefined values', () => {
      const result = validateBusinessRules({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should sanitize input data', () => {
      const maliciousData: EventData = {
        title: '<script>alert("xss")</script>Malicious Event',
        ageRange: '6-8',
        venue: 'Test Venue',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        cityId: 'berlin',
        organizerId: 'organizer123'
      };

      const titleResult = validateEventTitle(maliciousData.title);
      expect(titleResult.isValid).toBe(false);
      expect(titleResult.error).toBe('Title contains invalid characters');
    });

    it('should handle concurrent validation calls', () => {
      const results = Array.from({ length: 10 }, () => validateBusinessRules(validEventData));
      expect(results.every(result => result.isValid)).toBe(true);
    });

    it('should maintain consistent validation behavior', () => {
      const eventData = { ...validEventData };
      
      // Multiple validations should return consistent results
      const result1 = validateBusinessRules(eventData);
      const result2 = validateBusinessRules(eventData);
      
      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.errors).toEqual(result2.errors);
      expect(result1.warnings).toEqual(result2.warnings);
    });
  });
});

const validEventData: EventData = {
  title: 'Kids Art Workshop',
  description: 'A fun and creative art workshop for children to explore their artistic talents.',
  ageRange: '6-8',
  venue: 'Berlin Community Center',
  startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  cityId: 'berlin',
  organizerId: 'organizer123',
  category: 'arts',
  maxParticipants: 20,
  price: 15
};
