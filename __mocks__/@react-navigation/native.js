// Mock for @react-navigation/native
const React = require('react');

const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(() => ({ routes: [], index: 0 })),
  getId: jest.fn(),
});

const createMockRoute = () => ({
  params: {},
  key: 'test-route-key',
  name: 'TestScreen',
});

const Navigation = {
  useNavigation: () => createMockNavigation(),
  useRoute: () => createMockRoute(),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  useNavigationState: jest.fn(() => ({
    routes: [],
    index: 0,
  })),
  NavigationContainer: ({ children }) => React.createElement('NavigationContainer', {}, children),
  createNavigationContainerRef: jest.fn(() => ({
    current: null,
  })),
  DefaultTheme: {
    dark: false,
    colors: {
      primary: 'rgb(0, 122, 255)',
      background: 'rgb(242, 242, 242)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(216, 216, 216)',
      notification: 'rgb(255, 59, 48)',
    },
  },
  DarkTheme: {
    dark: true,
    colors: {
      primary: 'rgb(10, 132, 255)',
      background: 'rgb(1, 1, 1)',
      card: 'rgb(18, 18, 18)',
      text: 'rgb(229, 229, 231)',
      border: 'rgb(39, 39, 41)',
      notification: 'rgb(255, 69, 58)',
    },
  },
  ThemeProvider: ({ children }) => React.createElement('ThemeProvider', {}, children),
  useTheme: jest.fn(() => ({
    dark: false,
    colors: {
      primary: 'rgb(0, 122, 255)',
      background: 'rgb(242, 242, 242)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(216, 216, 216)',
      notification: 'rgb(255, 59, 48)',
    },
  })),
};

module.exports = Navigation;
