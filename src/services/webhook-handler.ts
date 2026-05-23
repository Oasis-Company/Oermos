import { WebhookPayload, WebhookEventType } from '../types';
import { IdentityService } from './identity';
import { WebhookProcessingError } from '../client/errors';

/**
 * Custom event handler function type
 */
export type WebhookEventHandler = (payload: WebhookPayload) => void | Promise<void>;

interface WebhookHandlerOptions {
  identityService: IdentityService;
}

interface FailedEvent {
  id: string;
  payload: WebhookPayload;
  error: Error;
  timestamp: number;
}

export class WebhookHandler {
  private identityService: IdentityService;
  private customHandlers: Map<WebhookEventType, WebhookEventHandler[]> = new Map();
  private failedEvents: FailedEvent[] = [];
  private maxFailedEvents: number = 100;

  constructor(options: WebhookHandlerOptions) {
    this.identityService = options.identityService;
  }

  /**
   * Register a custom event handler for a specific event type
   */
  on(eventType: WebhookEventType, handler: WebhookEventHandler): void {
    if (!this.customHandlers.has(eventType)) {
      this.customHandlers.set(eventType, []);
    }
    this.customHandlers.get(eventType)!.push(handler);
  }

  /**
   * Unregister a custom event handler
   */
  off(eventType: WebhookEventType, handler: WebhookEventHandler): void {
    const handlers = this.customHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get all failed events
   */
  getFailedEvents(): FailedEvent[] {
    return [...this.failedEvents];
  }

  /**
   * Clear all failed events
   */
  clearFailedEvents(): void {
    this.failedEvents = [];
  }

  handleEvent(payload: WebhookPayload): void {
    if (!payload || !payload.eventType) {
      const error = new WebhookProcessingError('Invalid webhook payload', payload);
      console.error('[Oermos Webhook] Invalid payload', { payload, error });
      throw error;
    }

    try {
      console.log('[Oermos Webhook] Processing event', {
        eventId: payload.id,
        eventType: payload.eventType,
        timestamp: payload.timestamp,
      });

      // Handle built-in handlers first
      this.handleBuiltInEvent(payload);

      // Then call custom handlers
      const customHandlers = this.customHandlers.get(payload.eventType) || [];
      for (const handler of customHandlers) {
        try {
          handler(payload);
        } catch (handlerError) {
          console.error('[Oermos Webhook] Custom handler failed', {
            eventId: payload.id,
            error: handlerError,
          });
        }
      }

      console.log('[Oermos Webhook] Event processed successfully', {
        eventId: payload.id,
      });
    } catch (error) {
      const processingError = error instanceof Error
        ? new WebhookProcessingError(
            `Failed to process webhook event: ${error.message}`,
            payload,
            error
          )
        : new WebhookProcessingError('Failed to process webhook event', payload);

      this.trackFailedEvent(payload, processingError);
      console.error('[Oermos Webhook] Event processing failed', {
        eventId: payload.id,
        error: processingError,
      });
      throw processingError;
    }
  }

  private handleBuiltInEvent(payload: WebhookPayload): void {
    switch (payload.eventType) {
      case WebhookEventType.ProfileUpdated:
        this.handleProfileUpdated(payload);
        break;
      case WebhookEventType.UserCreated:
        this.handleUserCreated(payload);
        break;
      case WebhookEventType.UserDeleted:
        this.handleUserDeleted(payload);
        break;
      default:
        throw new Error(`Unsupported event type: ${(payload as any).eventType}`);
    }
  }

  private handleProfileUpdated(payload: WebhookPayload & { data: { userId: string } }): void {
    console.log('[Oermos Webhook] Invalidating cache for profile update', {
      userId: payload.data.userId,
    });
    this.identityService.clearAllCache();
  }

  private handleUserCreated(payload: WebhookPayload & { data: { user: { id: string } } }): void {
    console.log('[Oermos Webhook] Invalidating cache for user created', {
      userId: payload.data.user.id,
    });
    this.identityService.clearAllCache();
  }

  private handleUserDeleted(payload: WebhookPayload & { data: { userId: string } }): void {
    console.log('[Oermos Webhook] Invalidating cache for user deleted', {
      userId: payload.data.userId,
    });
    this.identityService.clearAllCache();
  }

  private trackFailedEvent(payload: WebhookPayload, error: Error): void {
    this.failedEvents.push({
      id: payload.id,
      payload,
      error,
      timestamp: Date.now(),
    });

    if (this.failedEvents.length > this.maxFailedEvents) {
      this.failedEvents.shift();
    }
  }
}
