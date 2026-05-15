import { getEnv, oasisBioConfig, validateConfig } from './config';

describe('config module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnv', () => {
    it('should return the value of an existing environment variable', () => {
      process.env.OASIS_BIO_API_URL = 'https://api.example.com';
      const value = getEnv('OASIS_BIO_API_URL');
      expect(value).toBe('https://api.example.com');
    });

    it('should throw an error when environment variable is missing', () => {
      delete process.env.OASIS_BIO_API_URL;
      expect(() => getEnv('OASIS_BIO_API_URL')).toThrow(
        'Missing required environment variable: OASIS_BIO_API_URL'
      );
    });

    it('should throw an error when environment variable is empty', () => {
      process.env.OASIS_BIO_API_URL = '';
      expect(() => getEnv('OASIS_BIO_API_URL')).toThrow(
        'Missing required environment variable: OASIS_BIO_API_URL'
      );
    });
  });

  describe('oasisBioConfig', () => {
    it('should return the API URL from environment variable', () => {
      process.env.OASIS_BIO_API_URL = 'https://api.oasisbio.com';
      expect(oasisBioConfig.apiUrl).toBe('https://api.oasisbio.com');
    });
  });

  describe('validateConfig', () => {
    it('should not throw when all required variables are present', () => {
      process.env.OASIS_BIO_API_URL = 'https://api.example.com';
      expect(() => validateConfig()).not.toThrow();
    });

    it('should throw when required variables are missing', () => {
      delete process.env.OASIS_BIO_API_URL;
      expect(() => validateConfig()).toThrow(
        /Configuration validation failed/
      );
    });

    it('should only validate once', () => {
      process.env.OASIS_BIO_API_URL = 'https://api.example.com';
      validateConfig();
      delete process.env.OASIS_BIO_API_URL;
      expect(() => validateConfig()).not.toThrow();
    });
  });
});
