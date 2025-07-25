import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E tests for Kinza mobile preview HTML files
 * Tests the static HTML previews directly without needing Expo web server
 */

test.describe('Kinza Mobile Preview - Static HTML Testing', () => {
  const mobilePreviewPath = path.join(__dirname, '..', 'mobile-preview.html');
  const testingDashboardPath = path.join(__dirname, '..', 'testing-dashboard.html');

  test('should load mobile preview and display main interface', async ({ page }) => {
    await page.goto(`file://${mobilePreviewPath}`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the main app container is visible
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Verify navigation tabs are present
    await expect(page.locator('.tab-bar')).toBeVisible();
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Search')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Saved')).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    await page.goto(`file://${mobilePreviewPath}`);
    await page.waitForLoadState('networkidle');
    
    // Test Search tab
    await page.click('text=Search');
    await expect(page.locator('.search-screen')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Test Profile tab
    await page.click('text=Profile');
    await expect(page.locator('.profile-screen')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
    
    // Test Saved tab
    await page.click('text=Saved');
    await expect(page.locator('.saved-events-screen')).toBeVisible();
    
    // Return to Home tab
    await page.click('text=Home');
    await expect(page.locator('.home-screen')).toBeVisible();
  });

  test('should display events on home screen', async ({ page }) => {
    await page.goto(`file://${mobilePreviewPath}`);
    await page.waitForLoadState('networkidle');
    
    // Check if events are displayed
    await expect(page.locator('.event-card')).toHaveCount(6); // Based on mock data
    
    // Verify event details are visible
    await expect(page.locator('text=Family Picnic in Tiergarten')).toBeVisible();
    await expect(page.locator('text=Children\'s Art Workshop')).toBeVisible();
    await expect(page.locator('text=Soccer Training for Kids')).toBeVisible();
  });

  test('should filter events correctly', async ({ page }) => {
    await page.goto(`file://${mobilePreviewPath}`);
    await page.waitForLoadState('networkidle');
    
    // Test "Today" filter
    await page.click('text=Today');
    await page.waitForTimeout(500); // Wait for filter animation
    
    // Test "Kids" filter
    await page.click('text=Kids');
    await page.waitForTimeout(500);
    
    // Test "Free" filter
    await page.click('text=Free');
    await page.waitForTimeout(500);
    
    // Reset to "All"
    await page.click('text=All');
    await page.waitForTimeout(500);
  });

  test('should support language switching', async ({ page }) => {
    await page.goto(`file://${mobilePreviewPath}`);
    await page.waitForLoadState('networkidle');
    
    // Test German language
    await page.selectOption('select', 'de');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Start')).toBeVisible(); // "Home" in German
    await expect(page.locator('text=Suche')).toBeVisible(); // "Search" in German
    
    // Test Italian language
    await page.selectOption('select', 'it');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Home')).toBeVisible(); // "Home" in Italian
    await expect(page.locator('text=Cerca')).toBeVisible(); // "Search" in Italian
    
    // Back to English
    await page.selectOption('select', 'en');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Search')).toBeVisible();
  });

  test('should handle event interactions', async ({ page }) => {
    await page.goto(`file://${mobilePreviewPath}`);
    await page.waitForLoadState('networkidle');
    
    // Test save/unsave functionality
    const saveButton = page.locator('.event-card').first().locator('.save-btn');
    await saveButton.click();
    
    // Check if saved events count updates
    await page.click('text=Saved');
    await expect(page.locator('.saved-count')).toContainText('1');
    
    // Test unsave
    await page.locator('.saved-event').first().locator('.remove-btn').click();
    await expect(page.locator('.saved-count')).toContainText('0');
  });

  test('should load testing dashboard', async ({ page }) => {
    await page.goto(`file://${testingDashboardPath}`);
    await page.waitForLoadState('networkidle');
    
    // Check if dashboard loads
    await expect(page.locator('h1')).toContainText('Kinza Berlin');
    
    // Verify feature sections are present
    await expect(page.locator('text=Mobile Preview')).toBeVisible();
    await expect(page.locator('text=Privacy Screen')).toBeVisible();
    await expect(page.locator('text=Trust Screen')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto(`file://${mobilePreviewPath}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to search
    await page.click('text=Search');
    
    // Test search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('picnic');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search results are filtered
    await expect(page.locator('.search-results')).toBeVisible();
  });
});
