import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      pathname: '/',
    };
  },
  useParams() {
    return {
      locale: 'en',
    };
  },
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
};
