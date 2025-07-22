module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-clone-referenced-element|@react-native-community|expo-constants|expo-permissions|@unimodules|@react-native/js-polyfills)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: ['babel-preset-expo'],
      plugins: []
    }]
  },
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@firebase/(.*)$': '<rootDir>/node_modules/@firebase/$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/android/',
    '/ios/'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**'
  ]
};
