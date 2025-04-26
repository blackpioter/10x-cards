# E2E Tests

## Environment Variables

The following environment variables are required to run the E2E tests:

| Variable | Description | Example |
|----------|-------------|---------|
| E2E_USERNAME | Test user email address | test@example.com |
| E2E_PASSWORD | Test user password | your_test_password |

You can set these variables in your environment or create a `.env.test` file in the root directory:

```bash
E2E_USERNAME=test@example.com
E2E_PASSWORD=your_test_password_here
```

## Running Tests

To run the tests:

```bash
# Make sure environment variables are set
npx playwright test
```

## Page Object Models

The tests use the Page Object Model pattern to encapsulate page interactions and provide a clean testing API. See the `pages` directory for available page models.
