// Comprehensive mock for React Native to handle ES module issues
const React = require('react');

const ReactNative = {
  // Platform
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },

  // StyleSheet
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((styles) => styles),
    hairlineWidth: 1,
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },

  // Dimensions
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // Core components
  Text: jest.fn(({ children, ...props }) => React.createElement('Text', props, children)),
  View: jest.fn(({ children, ...props }) => React.createElement('View', props, children)),
  Image: jest.fn(({ source, ...props }) => React.createElement('Image', { ...props, source })),
  TextInput: jest.fn(({ ...props }) => React.createElement('TextInput', props)),
  ScrollView: jest.fn(({ children, ...props }) => React.createElement('ScrollView', props, children)),
  FlatList: jest.fn(({ data, renderItem, ...props }) => 
    React.createElement('FlatList', props, data?.map(renderItem) || [])),
  SectionList: jest.fn(({ sections, renderItem, ...props }) => 
    React.createElement('SectionList', props, sections?.flatMap(section => section.data.map(renderItem)) || [])),
  
  // Touchables
  TouchableOpacity: jest.fn(({ children, onPress, ...props }) => 
    React.createElement('TouchableOpacity', { ...props, onPress }, children)),
  TouchableHighlight: jest.fn(({ children, onPress, ...props }) => 
    React.createElement('TouchableHighlight', { ...props, onPress }, children)),
  TouchableWithoutFeedback: jest.fn(({ children, onPress, ...props }) => 
    React.createElement('TouchableWithoutFeedback', { ...props, onPress }, children)),
  Pressable: jest.fn(({ children, onPress, ...props }) => 
    React.createElement('Pressable', { ...props, onPress }, children)),

  // Layout components
  SafeAreaView: jest.fn(({ children, ...props }) => 
    React.createElement('SafeAreaView', props, children)),
  StatusBar: jest.fn(({ ...props }) => React.createElement('StatusBar', props)),
  Modal: jest.fn(({ children, ...props }) => React.createElement('Modal', props, children)),

  // Activity indicators
  ActivityIndicator: jest.fn(({ ...props }) => React.createElement('ActivityIndicator', props)),

  // Alert
  Alert: {
    alert: jest.fn(),
  },

  // Animated
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      setValue: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    decay: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    View: jest.fn(({ children, ...props }) => 
      React.createElement('Animated.View', props, children)),
    Text: jest.fn(({ children, ...props }) => 
      React.createElement('Animated.Text', props, children)),
    Image: jest.fn(({ children, ...props }) => 
      React.createElement('Animated.Image', props, children)),
    ScrollView: jest.fn(({ children, ...props }) => 
      React.createElement('Animated.ScrollView', props, children)),
    FlatList: jest.fn(({ children, ...props }) => 
      React.createElement('Animated.FlatList', props, children)),
  },

  // PanResponder
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },

  // Easing
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    bezier: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },

  // Linking
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // AppState
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // Keyboard
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    dismiss: jest.fn(),
  },

  // BackHandler
  BackHandler: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },

  // NativeModules
  NativeModules: {
    StatusBarManager: {
      HEIGHT: 44,
    },
    UIManager: {
      RCTView: {
        directEventTypes: {},
      },
    },
  },

  // PixelRatio
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => Math.round(size)),
  },

  // DeviceInfo
  DeviceInfo: {
    isTablet: jest.fn(() => false),
    getModel: jest.fn(() => 'iPhone'),
    getBrand: jest.fn(() => 'Apple'),
    getSystemVersion: jest.fn(() => '14.0'),
    getVersion: jest.fn(() => '1.0.0'),
  },

  // AccessibilityInfo
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // InteractionManager
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => callback()),
    createInteractionHandle: jest.fn(),
    clearInteractionHandle: jest.fn(),
    setDeadline: jest.fn(),
  },

  // LayoutAnimation
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Types: {
      spring: 'spring',
      linear: 'linear',
      easeInEaseOut: 'easeInEaseOut',
      keyboard: 'keyboard',
    },
    Properties: {
      opacity: 'opacity',
      scaleXY: 'scaleXY',
    },
  },

  // Vibration
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },

  // Clipboard
  Clipboard: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(),
  },

  // Share
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },

  // Geolocation (deprecated)
  Geolocation: {
    getCurrentPosition: jest.fn(() => Promise.resolve({
      coords: { latitude: 52.5200, longitude: 13.4050 },
    })),
    watchPosition: jest.fn(() => 1),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
  },
};

module.exports = ReactNative;
