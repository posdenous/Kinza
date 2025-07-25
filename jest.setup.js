import '@testing-library/jest-native/extend-expect';

// Mock React Native components that cause Jest scoping issues
jest.mock('react-native', () => {
  const React = require('react');
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => styles),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Text: jest.fn(({ children, ...props }) => React.createElement('Text', props, children)),
    View: jest.fn(({ children, ...props }) => React.createElement('View', props, children)),
    TouchableOpacity: jest.fn(({ children, onPress, ...props }) => 
      React.createElement('TouchableOpacity', { ...props, onPress }, children)),
    ScrollView: jest.fn(({ children, ...props }) => React.createElement('ScrollView', props, children)),
    FlatList: jest.fn(({ data, renderItem, ...props }) => 
      React.createElement('FlatList', props, data?.map(renderItem) || [])),
    Image: jest.fn(({ source, ...props }) => React.createElement('Image', { ...props, source })),
    TextInput: jest.fn(({ ...props }) => React.createElement('TextInput', props)),
    StatusBar: jest.fn(({ ...props }) => React.createElement('StatusBar', props)),
    SafeAreaView: jest.fn(({ children, ...props }) => 
      React.createElement('SafeAreaView', props, children)),
    ActivityIndicator: jest.fn(({ ...props }) => React.createElement('ActivityIndicator', props)),
    Modal: jest.fn(({ children, ...props }) => React.createElement('Modal', props, children)),
    Alert: {
      alert: jest.fn(),
    },
    Animated: {
      Value: jest.fn(() => ({
        interpolate: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      timing: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
      View: jest.fn(({ children, ...props }) => 
        React.createElement('Animated.View', props, children)),
      Text: jest.fn(({ children, ...props }) => 
        React.createElement('Animated.Text', props, children)),
    },
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
    },
  };
});

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn().mockImplementation(({ name, size, color, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement('Text', {
      testID: `icon-${name}`,
      style: { fontSize: size, color },
      ...props
    }, name);
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  Trans: ({ children }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Silence console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes?.('Warning: React.createFactory() is deprecated') ||
      args[0]?.includes?.('componentWillReceiveProps has been renamed') ||
      args[0]?.includes?.('componentWillMount has been renamed')
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes?.('Warning: React.createFactory() is deprecated')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({
    params: {},
    key: 'test-route-key',
    name: 'TestScreen',
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
  CardStyleInterpolators: {
    forHorizontalIOS: {},
  },
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ name: 'Test Event', cityId: 'berlin' }),
  })),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [
      {
        id: 'test-event-1',
        data: () => ({ name: 'Test Event 1', cityId: 'berlin' }),
      },
      {
        id: 'test-event-2',
        data: () => ({ name: 'Test Event 2', cityId: 'berlin' }),
      },
    ],
  })),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  default: {
    statusBarHeight: 44,
    deviceName: 'iPhone',
    platform: {
      ios: {
        platform: 'ios',
      },
    },
    appOwnership: 'standalone',
    expoVersion: '45.0.0',
  },
}));

// Mock Expo Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 52.5200,
      longitude: 13.4050,
    },
  })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{
    city: 'Berlin',
    country: 'Germany',
  }])),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (options && typeof options === 'object') {
        let result = key;
        Object.keys(options).forEach(optionKey => {
          result = result.replace(`{{${optionKey}}}`, options[optionKey]);
        });
        return result;
      }
      return key;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
