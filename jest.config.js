module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-navigation/.*|expo|expo-.*|@expo/.*|react-native-safe-area-context|@react-native-community/.*|@react-native-async-storage/.*|@expo/vector-icons/.*)/',
  ],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    'react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    'react-native': '<rootDir>/__mocks__/react-native.js',
    '@react-navigation/native': '<rootDir>/__mocks__/@react-navigation/native.js',
    '@react-navigation/stack': '<rootDir>/__mocks__/@react-navigation/stack.js',
    '@react-navigation/bottom-tabs': '<rootDir>/__mocks__/@react-navigation/bottom-tabs.js',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '@react-native-community/geolocation': '<rootDir>/__mocks__/@react-native-community/geolocation.js',
    '@expo/vector-icons': '<rootDir>/__mocks__/@expo/vector-icons.js',
    'expo-location': '<rootDir>/__mocks__/expo-location.js',
    'expo-constants': '<rootDir>/__mocks__/expo-constants.js',
    'expo-permissions': '<rootDir>/__mocks__/expo-permissions.js',
    'react-native-maps': '<rootDir>/__mocks__/react-native-maps.js',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.(ts|tsx|js)',
    '<rootDir>/src/**/__tests__/**/*.integration.test.(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'src/auth/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/services/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.test.(ts|tsx|js)']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.integration.test.(ts|tsx|js)']
    }
  ]
};
