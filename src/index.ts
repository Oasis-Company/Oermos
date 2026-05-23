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
export {
  OasisBioClient,
  OasisBioApiError,
  OasisBioNetworkError,
  WebhookVerificationError,
  WebhookProcessingError,
} from './client';

// Export services
export { IdentityService, WebhookHandler, type WebhookEventHandler } from './services';

// Export utilities
export { TTLCache, type CacheOptions } from './utils/cache';
export { verifyWebhookSignature, type VerifyWebhookOptions } from './utils/verify-webhook';

// Export webhook endpoint
export {
  createWebhookEndpoint,
  createWebhookProcessor,
  type WebhookEndpointOptions,
  type ExpressRequest,
  type ExpressResponse,
} from './webhook';
