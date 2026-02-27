// Test environment setup
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.TGWD_TOKEN = 'test_bot_token';
process.env.TGWD_SECRET = 'test_signature_secret';
process.env.TGWD_PORT = '3001';
process.env.TGWD_FRONTEND_DOMAIN = 'localhost:4173';
process.env.TGWD_CFTS_API_KEY = 'test_turnstile_key';
process.env.TGWD_DOMAIN = 'localhost';

// Silence console during tests unless explicitly needed
global.console = {
  ...console,
  // Uncomment below to suppress specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
