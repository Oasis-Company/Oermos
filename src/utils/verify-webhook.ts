import { createHmac, timingSafeEqual } from 'crypto';
import { WebhookVerificationError } from '../client/errors';

/**
 * Options for verifying webhook signatures
 */
export interface VerifyWebhookOptions {
  /** The webhook secret key from OasisBio */
  secret: string;
  /** The raw body of the request (string, not parsed JSON) */
  body: string;
  /** The x-oasisbio-signature header value */
  signature: string;
  /** The x-oasisbio-timestamp header value */
  timestamp: string;
  /** Maximum allowed time difference in milliseconds (default: 5 minutes) */
  tolerance?: number;
}

/**
 * Verifies the webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(options: VerifyWebhookOptions): boolean {
  const {
    secret,
    body,
    signature,
    timestamp,
    tolerance = 5 * 60 * 1000, // 5 minutes
  } = options;

  // Check timestamp validity
  const requestTimestamp = parseInt(timestamp, 10);
  if (isNaN(requestTimestamp)) {
    throw new WebhookVerificationError('Invalid timestamp');
  }

  const now = Date.now();
  if (Math.abs(now - requestTimestamp) > tolerance) {
    throw new WebhookVerificationError('Timestamp outside tolerance window');
  }

  // Create expected signature
  const signedPayload = `${timestamp}.${body}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Compare signatures using timing-safe equal
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length) {
    throw new WebhookVerificationError('Invalid signature');
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new WebhookVerificationError('Invalid signature');
  }

  return true;
}
