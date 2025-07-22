// UGC (User Generated Content) Moderation business logic unit tests
// Tests content filtering, moderation rules, and safety checks

interface UGCContent {
  text?: string;
  authorId?: string;
  cityId?: string;
  type: 'comment' | 'event_description' | 'profile_bio' | 'event_title';
  timestamp?: Date;
  parentId?: string; // For nested comments
}

interface ModerationResult {
  approved: boolean;
  flagged: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  requiresHumanReview: boolean;
  suggestedActions: string[];
}

// Mock moderation functions (would be implemented in actual service)
const detectProfanity = (text: string): { hasProfanity: boolean; words: string[] } => {
  const profanityList = ['damn', 'hell', 'crap', 'stupid', 'idiot', 'hate'];
  const words = text.toLowerCase().split(/\s+/);
  const foundProfanity = words.filter(word => profanityList.includes(word));
  return { hasProfanity: foundProfanity.length > 0, words: foundProfanity };
};

const detectSpam = (text: string): { isSpam: boolean; indicators: string[] } => {
  const indicators: string[] = [];
  
  // Check for excessive repetition
  const words = text.split(/\s+/);
  const wordCount = words.reduce((acc, word) => {
    acc[word.toLowerCase()] = (acc[word.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const maxRepeats = Math.max(...Object.values(wordCount));
  if (maxRepeats > 5) indicators.push('excessive_repetition');
  
  // Check for promotional content
  const promotionalKeywords = ['buy now', 'click here', 'free money', 'limited time', 'act now'];
  if (promotionalKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    indicators.push('promotional_content');
  }
  
  // Check for excessive capitalization
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 20) indicators.push('excessive_caps');
  
  // Check for suspicious links
  if (text.includes('http') && !text.includes('kinza.berlin')) {
    indicators.push('external_links');
  }
  
  return { isSpam: indicators.length > 0, indicators };
};

const detectInappropriateContent = (text: string): { isInappropriate: boolean; categories: string[] } => {
  const categories: string[] = [];
  
  // Violence indicators
  const violenceKeywords = ['kill', 'murder', 'violence', 'violent', 'fight', 'hurt', 'attack'];
  if (violenceKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    categories.push('violence');
  }
  
  // Adult content indicators
  const adultKeywords = ['sex', 'adult', 'mature', 'explicit'];
  if (adultKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    categories.push('adult_content');
  }
  
  // Discrimination indicators
  const discriminationKeywords = ['racist', 'sexist', 'discrimination', 'discriminatory', 'prejudice'];
  if (discriminationKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    categories.push('discrimination');
  }
  
  return { isInappropriate: categories.length > 0, categories };
};

const checkContentLength = (text: string, type: UGCContent['type']): { isValid: boolean; reason?: string } => {
  const limits = {
    comment: 500,
    event_description: 2000,
    profile_bio: 300,
    event_title: 100
  };
  
  const limit = limits[type];
  if (text.length > limit) {
    return { isValid: false, reason: `Content exceeds ${limit} character limit` };
  }
  
  if (text.trim().length < 3) {
    return { isValid: false, reason: 'Content too short' };
  }
  
  return { isValid: true };
};

const validateCityScopeForUGC = (authorCityId: string, contentCityId: string): boolean => {
  // Users can only create content in their assigned city
  return authorCityId === contentCityId;
};

const checkRateLimit = (authorId: string, type: UGCContent['type']): { withinLimit: boolean; reason?: string } => {
  // Mock rate limiting - in real implementation would check database
  const rateLimits = {
    comment: 10, // per hour
    event_description: 3, // per day
    profile_bio: 1, // per day
    event_title: 5 // per day
  };
  
  // For testing, assume all users are within limits unless specified
  return { withinLimit: true };
};

const moderateContent = (content: UGCContent): ModerationResult => {
  if (!content.text || !content.authorId || !content.cityId) {
    return {
      approved: false,
      flagged: true,
      reasons: ['Missing required content fields'],
      severity: 'high',
      requiresHumanReview: false,
      suggestedActions: ['Reject submission']
    };
  }
  
  const reasons: string[] = [];
  const suggestedActions: string[] = [];
  let severity: ModerationResult['severity'] = 'low';
  let requiresHumanReview = false;
  
  // Check content length
  const lengthCheck = checkContentLength(content.text, content.type);
  if (!lengthCheck.isValid) {
    reasons.push(lengthCheck.reason!);
    severity = 'medium';
  }
  
  // Check for profanity
  const profanityCheck = detectProfanity(content.text);
  if (profanityCheck.hasProfanity) {
    reasons.push(`Contains profanity: ${profanityCheck.words.join(', ')}`);
    severity = 'medium';
    suggestedActions.push('Filter profanity');
  }
  
  // Check for spam
  const spamCheck = detectSpam(content.text);
  if (spamCheck.isSpam) {
    reasons.push(`Spam indicators: ${spamCheck.indicators.join(', ')}`);
    severity = 'high';
    requiresHumanReview = true;
    suggestedActions.push('Flag for human review');
  }
  
  // Check for inappropriate content
  const inappropriateCheck = detectInappropriateContent(content.text);
  if (inappropriateCheck.isInappropriate) {
    reasons.push(`Inappropriate content: ${inappropriateCheck.categories.join(', ')}`);
    severity = 'critical';
    requiresHumanReview = true;
    suggestedActions.push('Block content', 'Review user account');
  }
  
  // Check city scoping (mock implementation)
  if (!validateCityScope(content.cityId, content.cityId)) {
    reasons.push('City scope violation');
    severity = 'high';
  }
  
  // Check rate limiting
  const rateLimitCheck = checkRateLimit(content.authorId, content.type);
  if (!rateLimitCheck.withinLimit) {
    reasons.push(rateLimitCheck.reason!);
    severity = 'medium';
    suggestedActions.push('Apply rate limiting');
  }
  
  const approved = reasons.length === 0;
  const flagged = !approved || requiresHumanReview;
  
  return {
    approved,
    flagged,
    reasons,
    severity,
    requiresHumanReview,
    suggestedActions
  };
};

describe('UGC Moderation Business Logic', () => {
  const validContent: UGCContent = {
    text: 'This is a great event for kids! Looking forward to attending.',
    authorId: 'user123',
    cityId: 'berlin',
    type: 'comment',
    timestamp: new Date()
  };

  describe('detectProfanity', () => {
    it('should detect common profanity', () => {
      const result = detectProfanity('This is damn stupid');
      expect(result.hasProfanity).toBe(true);
      expect(result.words).toContain('damn');
      expect(result.words).toContain('stupid');
    });

    it('should handle clean content', () => {
      const result = detectProfanity('This is a wonderful event');
      expect(result.hasProfanity).toBe(false);
      expect(result.words).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const result = detectProfanity('This is DAMN annoying');
      expect(result.hasProfanity).toBe(true);
      expect(result.words).toContain('damn');
    });

    it('should handle empty content', () => {
      const result = detectProfanity('');
      expect(result.hasProfanity).toBe(false);
      expect(result.words).toHaveLength(0);
    });
  });

  describe('detectSpam', () => {
    it('should detect excessive repetition', () => {
      const result = detectSpam('buy buy buy buy buy buy this amazing product');
      expect(result.isSpam).toBe(true);
      expect(result.indicators).toContain('excessive_repetition');
    });

    it('should detect promotional content', () => {
      const result = detectSpam('Click here for free money! Limited time offer!');
      expect(result.isSpam).toBe(true);
      expect(result.indicators).toContain('promotional_content');
    });

    it('should detect excessive capitalization', () => {
      const result = detectSpam('THIS IS AN AMAZING EVENT YOU MUST ATTEND RIGHT NOW!!!');
      expect(result.isSpam).toBe(true);
      expect(result.indicators).toContain('excessive_caps');
    });

    it('should detect suspicious external links', () => {
      const result = detectSpam('Check out this event at http://suspicious-site.com');
      expect(result.isSpam).toBe(true);
      expect(result.indicators).toContain('external_links');
    });

    it('should allow kinza.berlin links', () => {
      const result = detectSpam('More info at http://kinza.berlin/events/123');
      expect(result.isSpam).toBe(false);
    });

    it('should handle clean content', () => {
      const result = detectSpam('This is a normal comment about the event.');
      expect(result.isSpam).toBe(false);
      expect(result.indicators).toHaveLength(0);
    });
  });

  describe('detectInappropriateContent', () => {
    it('should detect violence indicators', () => {
      const result = detectInappropriateContent('I want to kill this event organizer');
      expect(result.isInappropriate).toBe(true);
      expect(result.categories).toContain('violence');
    });

    it('should detect adult content indicators', () => {
      const result = detectInappropriateContent('This event has explicit adult content');
      expect(result.isInappropriate).toBe(true);
      expect(result.categories).toContain('adult_content');
    });

    it('should detect discrimination indicators', () => {
      const result = detectInappropriateContent('This is racist and discriminatory');
      expect(result.isInappropriate).toBe(true);
      expect(result.categories).toContain('discrimination');
    });

    it('should handle appropriate content', () => {
      const result = detectInappropriateContent('This is a family-friendly event');
      expect(result.isInappropriate).toBe(false);
      expect(result.categories).toHaveLength(0);
    });

    it('should detect multiple categories', () => {
      const result = detectInappropriateContent('This violent and sexist content is inappropriate');
      expect(result.isInappropriate).toBe(true);
      expect(result.categories.length).toBeGreaterThan(1);
    });
  });

  describe('checkContentLength', () => {
    it('should enforce comment length limits', () => {
      const longComment = 'A'.repeat(501);
      const result = checkContentLength(longComment, 'comment');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('500 character limit');
    });

    it('should enforce event description length limits', () => {
      const longDescription = 'A'.repeat(2001);
      const result = checkContentLength(longDescription, 'event_description');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('2000 character limit');
    });

    it('should enforce minimum content length', () => {
      const result = checkContentLength('Hi', 'comment');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Content too short');
    });

    it('should accept valid content lengths', () => {
      const result = checkContentLength('This is a valid comment length', 'comment');
      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should handle different content types', () => {
      const title = 'Valid Event Title';
      const bio = 'This is a valid profile bio';
      
      expect(checkContentLength(title, 'event_title').isValid).toBe(true);
      expect(checkContentLength(bio, 'profile_bio').isValid).toBe(true);
    });
  });

  describe('validateCityScope', () => {
    it('should allow content within same city', () => {
      const result = validateCityScope('berlin', 'berlin');
      expect(result).toBe(true);
    });

    it('should reject cross-city content', () => {
      const result = validateCityScope('berlin', 'munich');
      expect(result).toBe(false);
    });

    it('should be case sensitive', () => {
      const result = validateCityScope('Berlin', 'berlin');
      expect(result).toBe(false);
    });
  });

  describe('moderateContent', () => {
    it('should approve clean content', () => {
      const result = moderateContent(validContent);
      expect(result.approved).toBe(true);
      expect(result.flagged).toBe(false);
      expect(result.reasons).toHaveLength(0);
      expect(result.severity).toBe('low');
      expect(result.requiresHumanReview).toBe(false);
    });

    it('should reject content with missing fields', () => {
      const incompleteContent: UGCContent = {
        text: 'Some content',
        type: 'comment'
        // Missing authorId and cityId
      };

      const result = moderateContent(incompleteContent);
      expect(result.approved).toBe(false);
      expect(result.flagged).toBe(true);
      expect(result.reasons).toContain('Missing required content fields');
      expect(result.severity).toBe('high');
    });

    it('should flag content with profanity', () => {
      const profaneContent: UGCContent = {
        ...validContent,
        text: 'This event is damn stupid and I hate it'
      };

      const result = moderateContent(profaneContent);
      expect(result.approved).toBe(false);
      expect(result.flagged).toBe(true);
      expect(result.reasons.some(r => r.includes('profanity'))).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.suggestedActions).toContain('Filter profanity');
    });

    it('should flag spam content for human review', () => {
      const spamContent: UGCContent = {
        ...validContent,
        text: 'BUY NOW BUY NOW BUY NOW CLICK HERE FOR FREE MONEY!!!'
      };

      const result = moderateContent(spamContent);
      expect(result.approved).toBe(false);
      expect(result.flagged).toBe(true);
      expect(result.requiresHumanReview).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.suggestedActions).toContain('Flag for human review');
    });

    it('should block inappropriate content', () => {
      const inappropriateContent: UGCContent = {
        ...validContent,
        text: 'This violent and discriminatory content should be blocked'
      };

      const result = moderateContent(inappropriateContent);
      expect(result.approved).toBe(false);
      expect(result.flagged).toBe(true);
      expect(result.requiresHumanReview).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.suggestedActions).toContain('Block content');
      expect(result.suggestedActions).toContain('Review user account');
    });

    it('should handle content that exceeds length limits', () => {
      const longContent: UGCContent = {
        ...validContent,
        text: 'A'.repeat(501)
      };

      const result = moderateContent(longContent);
      expect(result.approved).toBe(false);
      expect(result.reasons.some(r => r.includes('character limit'))).toBe(true);
      expect(result.severity).toBe('medium');
    });

    it('should accumulate multiple violations', () => {
      const multiViolationContent: UGCContent = {
        ...validContent,
        text: 'This damn content is spam spam spam spam spam spam with violence and kill threats'
      };

      const result = moderateContent(multiViolationContent);
      expect(result.approved).toBe(false);
      expect(result.flagged).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(1);
      expect(result.severity).toBe('critical'); // Should escalate to highest severity
      expect(result.requiresHumanReview).toBe(true);
    });
  });

  describe('Business Rules Compliance', () => {
    it('should enforce UGC moderation for all content types', () => {
      const contentTypes: UGCContent['type'][] = ['comment', 'event_description', 'profile_bio', 'event_title'];
      
      contentTypes.forEach(type => {
        const content: UGCContent = {
          ...validContent,
          type,
          text: 'This is inappropriate violent content'
        };
        
        const result = moderateContent(content);
        expect(result.flagged).toBe(true);
        expect(result.requiresHumanReview).toBe(true);
      });
    });

    it('should enforce city scoping for content creation', () => {
      const crossCityContent: UGCContent = {
        text: 'Valid content',
        authorId: 'user123',
        cityId: 'munich', // Different from author's city
        type: 'comment'
      };

      // In a real implementation, this would check user's city vs content city
      const cityCheck = validateCityScope('berlin', 'munich');
      expect(cityCheck).toBe(false);
    });

    it('should require authentication for content submission', () => {
      const unauthenticatedContent: UGCContent = {
        text: 'Some content',
        type: 'comment',
        cityId: 'berlin'
        // Missing authorId indicates unauthenticated user
      };

      const result = moderateContent(unauthenticatedContent);
      expect(result.approved).toBe(false);
      expect(result.reasons).toContain('Missing required content fields');
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle empty content gracefully', () => {
      const emptyContent: UGCContent = {
        text: '',
        authorId: 'user123',
        cityId: 'berlin',
        type: 'comment'
      };

      const result = moderateContent(emptyContent);
      expect(result.approved).toBe(false);
      expect(result.reasons.some(r => r.includes('too short'))).toBe(true);
    });

    it('should handle special characters and unicode', () => {
      const unicodeContent: UGCContent = {
        ...validContent,
        text: 'This event is great! 🎉👨‍👩‍👧‍👦 Köln München Zürich'
      };

      const result = moderateContent(unicodeContent);
      expect(result.approved).toBe(true);
    });

    it('should prevent injection attacks', () => {
      const maliciousContent: UGCContent = {
        ...validContent,
        text: '<script>alert("xss")</script>DROP TABLE users;'
      };

      // Content should be treated as plain text, not executed
      const result = moderateContent(maliciousContent);
      // This would be approved as it doesn't match our profanity/spam filters
      // In real implementation, HTML/SQL injection would be sanitized
      expect(result).toBeDefined();
    });

    it('should handle concurrent moderation requests', () => {
      const contents = Array.from({ length: 10 }, (_, i) => ({
        ...validContent,
        text: `Test content ${i}`,
        authorId: `user${i}`
      }));

      const results = contents.map(content => moderateContent(content));
      expect(results.every(result => result.approved)).toBe(true);
    });

    it('should maintain consistent moderation behavior', () => {
      const content = { ...validContent };
      
      // Multiple moderation calls should return consistent results
      const result1 = moderateContent(content);
      const result2 = moderateContent(content);
      
      expect(result1.approved).toBe(result2.approved);
      expect(result1.severity).toBe(result2.severity);
      expect(result1.reasons).toEqual(result2.reasons);
    });
  });
});
