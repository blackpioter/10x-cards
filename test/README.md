# Testing in 10x Cards Project

This document contains guidelines for testing the 10x Cards application.

## Unit Testing (Vitest)

Unit tests are used to test individual components and functions. We use Vitest as our testing framework.

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage
```

### Unit Test Structure

Tests should follow this directory structure:
```
src/
└── components/
    ├── ComponentName/
    │   ├── index.tsx
    │   └── ComponentName.test.tsx
    └── ...
test/
├── setup.ts
├── helpers/
│   └── testUtils.ts
└── fixtures/
    └── testData.ts
```

### Testing Tools
- `@testing-library/react` for React component testing
- `@testing-library/user-event` for user interaction simulation
- `msw` for API request mocking

### Types of Tests

1. **Unit Tests**
   - Test individual components and functions
   - Focus on isolated behavior
   - Use mocks for external dependencies

2. **Integration Tests**
   - Test component interactions
   - Verify data flow between components
   - Test hooks and context integration

### Testing Best Practices

1. **Component Testing**
   - Test behavior, not implementation
   - Use semantic queries (getByRole, getByText)
   - Test user interactions
   - Include accessibility testing

2. **Code Organization**
   - Keep tests close to components
   - Use descriptive test names
   - Group related tests with describe blocks
   - Use beforeEach for common setup

3. **Test Coverage**
   - Maintain minimum 80% coverage
   - Focus on critical business logic
   - Test edge cases and error states
   - Don't test implementation details

4. **Mocking**
   - Mock external dependencies
   - Use MSW for API mocking
   - Keep mocks simple and maintainable
   - Reset mocks between tests

## E2E Testing (Playwright)

E2E tests verify the application from a user's perspective. We use Playwright as our E2E testing framework.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Generate E2E test code
npm run codegen
```

### E2E Test Structure

- E2E tests are in the `e2e` directory
- Use Page Object Model (POM) pattern
- Page files in `e2e/pages`
- Test data in `e2e/fixtures`
- Helper functions in `e2e/utils`

## CI/CD Integration

- All tests run on pull requests
- Coverage reports generated automatically
- E2E tests run on staging environment
- Test failures block deployments

## Debugging Tests

- Use `test:ui` for interactive debugging
- Check test coverage reports
- Use test.only for focusing on specific tests
- Enable debug logging when needed
