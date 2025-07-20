# Detox Native Mobile E2E Testing Setup Guide

## 📱 Overview
Detox is now configured for native iOS and Android E2E testing in your Kinza project. This guide will help you complete the setup and run your first native mobile tests.

## 🚀 Prerequisites

### For iOS Testing:
- **macOS** (required for iOS development)
- **Xcode** (latest version from App Store)
- **iOS Simulator** (comes with Xcode)
- **CocoaPods** (`sudo gem install cocoapods`)

### For Android Testing:
- **Android Studio** (download from developer.android.com)
- **Android SDK** (installed via Android Studio)
- **Android Emulator** (set up via Android Studio AVD Manager)
- **Java Development Kit (JDK)** 8 or 11

## 🔧 Step 1: Generate Native Projects

Since you're using Expo managed workflow, you need to eject to bare workflow for Detox:

```bash
# Generate native iOS and Android folders
npx expo prebuild

# Or if you want to customize the process
npx expo prebuild --clean
```

**⚠️ Important:** This will create `ios/` and `android/` folders in your project.

## 🍎 Step 2: iOS Setup

### Install iOS Dependencies:
```bash
cd ios
pod install
cd ..
```

### Build iOS App for Testing:
```bash
npm run build:detox:ios
```

### Run iOS Tests:
```bash
npm run test:detox:ios
```

## 🤖 Step 3: Android Setup

### Create Android Emulator:
1. Open Android Studio
2. Go to Tools → AVD Manager
3. Create a new Virtual Device:
   - Choose Pixel 3a
   - Select API Level 30 (Android 11)
   - Name it `Pixel_3a_API_30_x86`

### Build Android App for Testing:
```bash
npm run build:detox:android
```

### Run Android Tests:
```bash
npm run test:detox:android
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test:detox:ios` | Run iOS native tests |
| `npm run test:detox:android` | Run Android native tests |
| `npm run build:detox:ios` | Build iOS app for testing |
| `npm run build:detox:android` | Build Android app for testing |
| `npm run detox:clean` | Clean Detox cache |

## 🧪 Test Files

- **Playwright Tests** (Web): `/e2e/kinza-app.spec.ts`
- **Detox Tests** (Native): `/e2e/kinza-mobile.test.js`

## 🔍 What Detox Tests Cover

### Native Mobile Features:
- ✅ **App Launch & Navigation** - Tab switching, screen transitions
- ✅ **Device Interactions** - Rotation, backgrounding/foregrounding
- ✅ **Touch Gestures** - Taps, swipes, scrolling
- ✅ **Performance** - Memory usage, crash testing
- ✅ **Privacy Settings** - Native toggle interactions
- ✅ **Trust & Safety** - Community guidelines access

### Mobile-Specific Testing:
- **Device Rotation** - Portrait/landscape mode testing
- **App State Management** - Background/foreground transitions
- **Native Gestures** - Swipe navigation, pull-to-refresh
- **Performance Under Load** - Rapid navigation testing

## 🐛 Troubleshooting

### iOS Issues:
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod install && cd ..

# Reset simulator
xcrun simctl erase all
```

### Android Issues:
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset emulator
emulator -avd Pixel_3a_API_30_x86 -wipe-data
```

### General Detox Issues:
```bash
# Clean Detox cache
npm run detox:clean

# Reinstall Detox
npm uninstall detox detox-cli
npm install --save-dev detox detox-cli
```

## 🚀 Next Steps

1. **Run `npx expo prebuild`** to generate native projects
2. **Set up iOS/Android development environment**
3. **Build and test on your preferred platform**
4. **Expand test coverage** for your specific app features

## 📊 Testing Strategy

### Current Setup:
- **Playwright** → Web E2E testing (fast, reliable)
- **Detox** → Native mobile E2E testing (comprehensive)
- **Jest** → Unit testing (components, hooks)

### Recommended Workflow:
1. **Unit tests** for business logic
2. **Playwright tests** for web functionality
3. **Detox tests** for mobile-specific features
4. **Manual testing** for edge cases

## 🔗 Useful Links

- [Detox Documentation](https://wix.github.io/Detox/)
- [Expo Prebuild Guide](https://docs.expo.dev/workflow/prebuild/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

---

Your native mobile E2E testing infrastructure is ready! 🎉
