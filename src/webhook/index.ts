import { WebhookRequest, WebhookPayload, WebhookRequestHeaders } from '../types';
import { WebhookHandler } from '../services/webhook-handler';
import { verifyWebhookSignature } from '../utils/verify-webhook';
import { WebhookVerificationError } from '../client/errors';

/**
 * Options for creating a webhook endpoint
 */
export interface WebhookEndpointOptions {
  /** The webhook secret from OasisBio */
  secret: string;
  /** The webhook handler instance */
  handler: WebhookHandler;
  /** Tolerance for timestamp validation in milliseconds (default: 5 minutes) */
  tolerance?: number;
}

/**
 * Express-style request interface
 */
export interface ExpressRequest {
  headers: Record<string, string | string[] | undefined>;
  body: any;
  rawBody?: string;
}

/**
 * Express-style response interface
 */
export interface ExpressResponse {
  status(code: number): ExpressResponse;
  send(body: any): void;
  json(body: any): void;
}

/**
 * Creates an Express-compatible webhook endpoint handler
 */
export function createWebhookEndpoint(options: WebhookEndpointOptions) {
  const { secret, handler, tolerance } = options;

  return async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    try {
      // Get raw body
      const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

      // Extract headers
      const headers: WebhookRequestHeaders = {
        'x-oasisbio-signature': Array.isArray(req.headers['x-oasisbio-signature'])
          ? req.headers['x-oasisbio-signature'][0]
          : req.headers['x-oasisbio-signature'],
        'x-oasisbio-timestamp': Array.isArray(req.headers['x-oasisbio-timestamp'])
          ? req.headers['x-oasisbio-timestamp'][0]
          : req.headers['x-oasisbio-timestamp'],
        'content-type': Array.isArray(req.headers['content-type'])
          ? req.headers['content-type'][0]
          : req.headers['content-type'],
      };

      // Verify signature
      if (!headers['x-oasisbio-signature'] || !headers['x-oasisbio-timestamp']) {
        throw new WebhookVerificationError('Missing required headers');
      }

      verifyWebhookSignature({
        secret,
        body: rawBody,
        signature: headers['x-oasisbio-signature'],
        timestamp: headers['x-oasisbio-timestamp'],
        tolerance,
      });

      // Parse payload
      const payload: WebhookPayload = JSON.parse(rawBody);

      // Handle event
      handler.handleEvent(payload);

      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error('[Oermos Webhook] Verification failed', { error: error.message });
        res.status(401).json({ success: false, error: 'Invalid signature' });
      } else {
        console.error('[Oermos Webhook] Error processing request', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  };
}

/**
 * Creates a raw webhook processor (for use with other frameworks)
 */
export function createWebhookProcessor(options: WebhookEndpointOptions) {
  const { secret, handler, tolerance } = options;

  return async (request: WebhookRequest): Promise<{ success: boolean; status: number; body: any }> => {
    try {
      const { headers, body } = request;

      // Verify signature
      if (!headers['x-oasisbio-signature'] || !headers['x-oasisbio-timestamp']) {
        throw new WebhookVerificationError('Missing required headers');
      }

      verifyWebhookSignature({
        secret,
        body,
        signature: headers['x-oasisbio-signature'],
        timestamp: headers['x-oasisbio-timestamp'],
        tolerance,
      });

      // Parse payload
      const payload: WebhookPayload = JSON.parse(body);

      // Handle event
      handler.handleEvent(payload);

      return { success: true, status: 200, body: { success: true } };
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error('[Oermos Webhook] Verification failed', { error: error.message });
        return { success: false, status: 401, body: { success: false, error: 'Invalid signature' } };
      } else {
        console.error('[Oermos Webhook] Error processing request', { error });
        return { success: false, status: 500, body: { success: false, error: 'Internal server error' } };
      }
    }
  };
}
