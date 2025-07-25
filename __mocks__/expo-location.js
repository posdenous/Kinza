// Mock for expo-location
module.exports = {
  __esModule: true,
  default: {
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({
      coords: {
        latitude: 52.5200,
        longitude: 13.4050,
        accuracy: 10,
      }
    })),
    watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
    Accuracy: {
      High: 3,
      Balanced: 2,
      Low: 1,
    },
  },
  Accuracy: {
    High: 3,
    Balanced: 2,
    Low: 1,
  },
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 52.5200,
      longitude: 13.4050,
      accuracy: 10,
    }
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
};
