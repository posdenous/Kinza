import { test, expect } from '@playwright/test';

/**
 * End-to-End tests for the Kinza Berlin app
 * These tests verify the main user flows and functionality
 */

test.describe('Kinza App - Main Navigation', () => {
  test('should load the home page and display navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Check if the main navigation is visible
    await expect(page.locator('[testID="tab-bar"]')).toBeVisible();
    
    // Verify navigation tabs are present
    await expect(page.locator('[testID="tab-home"]')).toBeVisible();
    await expect(page.locator('[testID="tab-search"]')).toBeVisible();
    await expect(page.locator('[testID="tab-profile"]')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on Search tab
    await page.click('[testID="tab-search"]');
    await expect(page.locator('[testID="search-screen"]')).toBeVisible();
    
    // Click on Profile tab
    await page.click('[testID="tab-profile"]');
    await expect(page.locator('[testID="profile-screen"]')).toBeVisible();
    
    // Return to Home tab
    await page.click('[testID="tab-home"]');
    await expect(page.locator('[testID="home-screen"]')).toBeVisible();
  });
});

test.describe('Kinza App - Language Support', () => {
  test('should switch languages correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if language switcher exists
    const languageSwitcher = page.locator('[data-testid="language-switcher"]');
    if (await languageSwitcher.isVisible()) {
      // Switch to German
      await page.selectOption('[data-testid="language-switcher"]', 'de');
      
      // Verify German text is displayed
      await expect(page.locator('text=Start')).toBeVisible(); // "Home" in German
      
      // Switch to Italian
      await page.selectOption('[data-testid="language-switcher"]', 'it');
      
      // Verify Italian text is displayed
      await expect(page.locator('text=Home')).toBeVisible(); // "Home" in Italian
      
      // Switch back to English
      await page.selectOption('[data-testid="language-switcher"]', 'en');
      await expect(page.locator('text=Home')).toBeVisible();
    }
  });
});

test.describe('Kinza App - Event Functionality', () => {
  test('should display events list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to events
    await page.click('[data-testid="tab-events"]');
    
    // Check if events container is visible
    await expect(page.locator('[data-testid="events-container"]')).toBeVisible();
    
    // Verify event cards are displayed (if any exist)
    const eventCards = page.locator('[data-testid^="event-card-"]');
    const eventCount = await eventCards.count();
    
    if (eventCount > 0) {
      // Verify first event card has required elements
      const firstEvent = eventCards.first();
      await expect(firstEvent.locator('[data-testid="event-title"]')).toBeVisible();
      await expect(firstEvent.locator('[data-testid="event-date"]')).toBeVisible();
    }
  });
});

test.describe('Kinza App - Privacy and Trust', () => {
  test('should access privacy settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to profile
    await page.click('[data-testid="tab-profile"]');
    
    // Look for privacy settings link
    const privacyLink = page.locator('[data-testid="privacy-settings"]');
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      
      // Verify privacy screen is displayed
      await expect(page.locator('[data-testid="privacy-screen"]')).toBeVisible();
      
      // Check for consent toggles
      await expect(page.locator('[data-testid="child-profile-consent"]')).toBeVisible();
    }
  });

  test('should access trust and safety features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to profile
    await page.click('[data-testid="tab-profile"]');
    
    // Look for trust/safety link
    const trustLink = page.locator('[data-testid="trust-safety"]');
    if (await trustLink.isVisible()) {
      await trustLink.click();
      
      // Verify trust screen is displayed
      await expect(page.locator('[data-testid="trust-screen"]')).toBeVisible();
      
      // Check for community guidelines
      await expect(page.locator('[data-testid="community-guidelines"]')).toBeVisible();
    }
  });
});
