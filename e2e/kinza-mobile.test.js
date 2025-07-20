const { device, expect, element, by, waitFor } = require('detox');

describe('Kinza Mobile App - Native E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch and Navigation', () => {
    it('should launch app and display main navigation', async () => {
      // Wait for the app to load
      await waitFor(element(by.id('tab-bar')))
        .toBeVisible()
        .withTimeout(10000);

      // Verify main navigation tabs are present
      await expect(element(by.id('tab-home'))).toBeVisible();
      await expect(element(by.id('tab-search'))).toBeVisible();
      await expect(element(by.id('tab-profile'))).toBeVisible();
    });

    it('should navigate between tabs', async () => {
      // Tap on Search tab
      await element(by.id('tab-search')).tap();
      await waitFor(element(by.id('search-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap on Profile tab
      await element(by.id('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Return to Home tab
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Privacy Settings', () => {
    it('should access privacy settings from profile', async () => {
      // Navigate to profile
      await element(by.id('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap on privacy settings
      await element(by.id('privacy-settings')).tap();
      await waitFor(element(by.id('privacy-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify child profile consent toggle is present
      await expect(element(by.id('child-profile-consent'))).toBeVisible();
    });
  });

  describe('Trust and Safety', () => {
    it('should access trust and safety features', async () => {
      // Navigate to profile
      await element(by.id('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap on trust & safety
      await element(by.id('trust-safety')).tap();
      await waitFor(element(by.id('trust-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify community guidelines are accessible
      await expect(element(by.id('community-guidelines'))).toBeVisible();
    });
  });

  describe('Mobile-Specific Interactions', () => {
    it('should handle swipe gestures', async () => {
      // Test swipe navigation if implemented
      await element(by.id('tab-home')).tap();
      
      // Example: Swipe left to navigate (if your app supports it)
      // await element(by.id('home-screen')).swipe('left');
    });

    it('should handle device rotation', async () => {
      await device.setOrientation('landscape');
      
      // Verify UI still works in landscape
      await expect(element(by.id('tab-bar'))).toBeVisible();
      
      // Return to portrait
      await device.setOrientation('portrait');
      await expect(element(by.id('tab-bar'))).toBeVisible();
    });

    it('should handle app backgrounding and foregrounding', async () => {
      // Send app to background
      await device.sendToHome();
      
      // Bring app back to foreground
      await device.launchApp({ newInstance: false });
      
      // Verify app state is maintained
      await expect(element(by.id('tab-bar'))).toBeVisible();
    });
  });

  describe('Performance and Memory', () => {
    it('should not crash during heavy navigation', async () => {
      // Rapidly switch between tabs to test stability
      for (let i = 0; i < 5; i++) {
        await element(by.id('tab-search')).tap();
        await waitFor(element(by.id('search-screen'))).toBeVisible().withTimeout(3000);
        
        await element(by.id('tab-profile')).tap();
        await waitFor(element(by.id('profile-screen'))).toBeVisible().withTimeout(3000);
        
        await element(by.id('tab-home')).tap();
        await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(3000);
      }
      
      // App should still be responsive
      await expect(element(by.id('tab-bar'))).toBeVisible();
    });
  });
});
