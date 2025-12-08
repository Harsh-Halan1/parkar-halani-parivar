# E2E Testing with Playwright

This directory contains end-to-end tests for the Parakar Halani Parivar frontend application.

## Overview

The E2E test suite covers:
- **Authentication**: Login, registration, OTP verification
- **Families**: List view, detail view, search, filtering
- **Persons**: List view, detail view, search, family filtering
- **Events**: List view, detail view, type filtering
- **Dark Mode & Localization**: Theme switching, language changes
- **Responsive Design**: Mobile, tablet, desktop viewports
- **Navigation & UI**: Menu navigation, breadcrumbs, footer

## Prerequisites

1. Install Playwright browsers:
```bash
npm run e2e -- --install
```

2. Ensure the frontend dev server can start:
```bash
npm run dev
```

## Running Tests

### Run all E2E tests
```bash
npm run e2e
```

### Run in UI mode (interactive)
```bash
npm run e2e:ui
```

### Run with headed browser (visible)
```bash
npm run e2e:headed
```

### Debug mode
```bash
npm run e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/e2e/app.spec.ts
```

### Run tests matching a pattern
```bash
npx playwright test -g "Authentication"
```

## Test Results

Test reports are generated in:
- HTML: `playwright-report/`
- JUnit: `test-results/junit.xml`
- JSON: `test-results/results.json`

View HTML report:
```bash
npx playwright show-report
```

## Configuration

Playwright configuration is in `playwright.config.ts`:
- **Base URL**: http://localhost:3000
- **Timeout**: 30 seconds per test
- **Retries**: 1 retry on failure
- **Screenshots**: On failure only
- **Videos**: On failure only
- **Trace**: On first retry

## Test Structure

Tests are organized by feature:
- Authentication flows
- Families management
- Persons management
- Events management
- Dark mode and localization
- Responsive design
- Navigation and UI

## Best Practices

1. **Use descriptive test names** - Clearly state what is being tested
2. **Keep tests independent** - Each test should work standalone
3. **Use meaningful selectors** - Prefer `data-testid` attributes
4. **Handle async operations** - Wait for elements and network requests
5. **Clean up after tests** - Leave the app in a clean state
6. **Test user workflows** - Focus on realistic user journeys

## Debugging

1. **Print to console**: Use `console.log()` in tests
2. **Screenshot**: `await page.screenshot({ path: 'screenshot.png' })`
3. **Debug mode**: `await page.pause()` to pause execution
4. **Inspector**: Run with `--debug` flag to open inspector

## CI/CD Integration

In your GitHub Actions workflow:
```yaml
- name: Install Playwright Browsers
  run: npm run e2e -- --install

- name: Run E2E Tests
  run: npm run e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: e2e-test-results
    path: test-results/
```

## Troubleshooting

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running on port 3000
- Verify network connectivity

### Element not found
- Use `page.pause()` to debug
- Check selectors with browser DevTools
- Verify element visibility with `isVisible()`

### Flaky tests
- Add proper waits for network requests
- Use `waitForLoadState()` after navigation
- Increase retry count for unreliable tests

## Future Improvements

- [ ] Add API mocking with MSW
- [ ] Add accessibility testing with axe
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add load testing with k6
- [ ] Setup test data factories
- [ ] Add Slack notifications for test results

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debug Guide](https://playwright.dev/docs/debug)
- [Selectors](https://playwright.dev/docs/selectors)
