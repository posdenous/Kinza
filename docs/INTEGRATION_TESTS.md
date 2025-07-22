# Level 2 Integration Tests Documentation

## Overview

Level 2 integration tests focus on testing component interactions, navigation flows, and API integration in the Kinza Berlin app. These tests sit between unit tests (Level 1) and end-to-end tests (Level 3) in the testing pyramid.

## Test Categories

### 1. Component Integration Tests
**Location:** `src/screens/__tests__/*.integration.test.tsx`

Tests component interactions within screens:
- Component rendering with real hooks and context
- User interactions (tap, scroll, input)
- State management across components
- Error handling and loading states
- Role-based UI rendering

**Example:**
```typescript
// HomeScreen.integration.test.tsx
it('should toggle map visibility when toggle button is pressed', async () => {
  render(<TestWrapper><HomeScreen /></TestWrapper>);
  
  fireEvent.press(screen.getByTestId('toggle-map-button'));
  
  await waitFor(() => {
    expect(screen.queryByTestId('map-container')).toBeNull();
    expect(screen.getByTestId('show-map-button')).toBeTruthy();
  });
});
```

### 2. Navigation Integration Tests
**Location:** `src/__tests__/navigation.integration.test.tsx`

Tests navigation flows between screens:
- Tab navigation state persistence
- Stack navigation with parameters
- Role-based navigation restrictions
- Deep linking handling
- Back navigation behavior

**Example:**
```typescript
it('should navigate from event list to event detail', async () => {
  render(<TestWrapper><TestStackNavigator /></TestWrapper>);
  
  const eventCard = screen.getByTestId('event-card-event-1');
  fireEvent.press(eventCard);
  
  await waitFor(() => {
    expect(screen.getByTestId('event-detail-screen')).toBeTruthy();
  });
});
```

### 3. API Integration Tests
**Location:** `src/__tests__/api.integration.test.tsx`

Tests API interactions and data flow:
- Firebase authentication flows
- Firestore data fetching with city scoping
- Real-time data synchronization
- Error handling and offline support
- Data validation and sanitization

**Example:**
```typescript
it('should fetch events with proper city scoping', async () => {
  const { result } = renderHook(() => useEvents({
    cityId: 'berlin',
    filter: 'all',
    userRole: UserRole.PARENT,
  }));
  
  await waitFor(() => {
    expect(mockFirestore.where).toHaveBeenCalledWith('cityId', '==', 'berlin');
    expect(result.current.events).toHaveLength(1);
  });
});
```

## Setup and Configuration

### Dependencies
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native react-test-renderer
```

### Jest Configuration
The integration tests use a separate Jest project configuration:

```javascript
// jest.config.js
config.projects = [
  {
    displayName: 'Unit Tests',
    testMatch: ['<rootDir>/src/**/*.test.(js|jsx|ts|tsx)'],
  },
  {
    displayName: 'Integration Tests',
    testMatch: ['<rootDir>/src/**/*.integration.test.(js|jsx|ts|tsx)'],
    testTimeout: 10000, // Longer timeout for integration tests
  },
];
```

### Mock Setup
Integration tests use comprehensive mocks in `jest.setup.js`:

- **React Navigation:** Mock navigation hooks and functions
- **Firebase:** Mock Firestore and Auth services
- **Expo modules:** Mock platform-specific functionality
- **i18n:** Mock translation functions

## Running Integration Tests

### Command Line Options

```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch

# Run specific integration test file
npm run test:integration -- HomeScreen.integration.test.tsx

# Run integration tests with coverage
npm run test:coverage -- --selectProjects="Integration Tests"

# Run all tests (unit + integration)
npm run test:all
```

### Test Categories

```bash
# Run only component integration tests
npm run test:integration -- --testPathPattern="screens.*integration"

# Run only navigation integration tests
npm run test:integration -- --testPathPattern="navigation.integration"

# Run only API integration tests
npm run test:integration -- --testPathPattern="api.integration"
```

## Coverage Requirements

Integration tests have specific coverage thresholds:

- **Global Coverage:** 70% (branches, functions, lines, statements)
- **Auth Module:** 90% (critical security functionality)
- **Services Module:** 85% (API and data handling)

```javascript
// jest.config.js
config.coverageThreshold = {
  global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  'src/auth/**/*.{js,jsx,ts,tsx}': { branches: 90, functions: 90, lines: 90, statements: 90 },
  'src/services/**/*.{js,jsx,ts,tsx}': { branches: 85, functions: 85, lines: 85, statements: 85 },
};
```

## Test Patterns and Best Practices

### 1. Test Wrapper Pattern
Always wrap components with necessary providers:

```typescript
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </I18nextProvider>
);
```

### 2. Mock Management
Use consistent mock patterns:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset specific mocks
  jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue(mockAuthData);
});
```

### 3. Async Testing
Use proper async patterns:

```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByTestId('loading-indicator')).toBeTruthy();
});

// Use act for state updates
await act(async () => {
  await result.current.refreshEvents();
});
```

### 4. Role-Based Testing
Test different user roles:

```typescript
const createMockAuth = (role: UserRole, user?: any) => ({
  user: user || { id: 'test-user', email: 'test@example.com' },
  userRole: role,
  loading: false,
});

// Test admin functionality
jest.mocked(useAuth).mockReturnValue(createMockAuth(UserRole.ADMIN));
```

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Run Integration Tests
  run: npm run test:integration -- --coverage --watchAll=false

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:all"
    }
  }
}
```

## Debugging Integration Tests

### Common Issues

1. **Mock not working:** Check mock setup in `jest.setup.js`
2. **Async timeout:** Increase `testTimeout` in Jest config
3. **Navigation errors:** Ensure proper navigation mock setup
4. **Firebase errors:** Verify Firebase mock configuration

### Debug Commands

```bash
# Run with verbose output
npm run test:integration -- --verbose

# Run single test with debug info
npm run test:integration -- --testNamePattern="should toggle map" --verbose

# Debug specific test file
node --inspect-brk node_modules/.bin/jest --runInBand HomeScreen.integration.test.tsx
```

## Test Data Management

### Mock Data Structure
```typescript
const mockEventData = {
  id: 'event-1',
  title: 'Berlin Zoo Family Day',
  description: 'Fun day at the zoo',
  startTime: new Date('2024-01-15T10:00:00Z'),
  endTime: new Date('2024-01-15T16:00:00Z'),
  venue: 'Berlin Zoo',
  ageRange: '3-12',
  price: 0,
  cityId: 'berlin',
  organizerId: 'org-1',
  status: 'approved',
  tags: ['outdoor', 'animals'],
};
```

### Test Factories
Create reusable test data factories:

```typescript
const createMockEvent = (overrides = {}) => ({
  ...mockEventData,
  ...overrides,
});

const createMockUser = (role: UserRole) => ({
  id: `user-${role}`,
  email: `${role}@example.com`,
  role,
});
```

## Performance Considerations

- **Parallel Execution:** Integration tests run in parallel by default
- **Test Isolation:** Each test file runs in isolation
- **Memory Management:** Mocks are cleared between tests
- **Timeout Handling:** Longer timeouts for complex interactions

## Maintenance

### Regular Tasks
1. **Update mocks** when APIs change
2. **Review coverage** reports monthly
3. **Refactor common patterns** into utilities
4. **Update test data** to match production scenarios

### When to Add Integration Tests
- New screen components
- Complex user interactions
- API integration changes
- Navigation flow updates
- Role-based feature additions

## Troubleshooting

### Common Errors

**Error:** `Cannot find module '@testing-library/react-native'`
**Solution:** Run `npm install --save-dev @testing-library/react-native`

**Error:** `Navigation mock not working`
**Solution:** Check `jest.setup.js` navigation mock configuration

**Error:** `Firebase mock errors`
**Solution:** Verify Firebase service mocks in setup file

**Error:** `Async test timeouts`
**Solution:** Increase `testTimeout` or use proper `waitFor` patterns

For additional help, check the test output logs and ensure all dependencies are properly installed and configured.
