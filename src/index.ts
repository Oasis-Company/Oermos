/**
 * Oermos - Unified communication layer for Oasis ecosystem
 *
 * @module oermos
 */

// Export types
export * from './types';

// Export configuration
export { oasisBioConfig, validateConfig, getEnv } from './config';

// Export client
export { OasisBioClient, OasisBioApiError, OasisBioNetworkError } from './client';

// Export services
export { IdentityService } from './services';

// Export utilities
export { TTLCache, type CacheOptions } from './utils/cache';
