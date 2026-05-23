import { User, Profile } from './oasisbio';

/**
 * Webhook event types
 */
export enum WebhookEventType {
  ProfileUpdated = 'profile.updated',
  UserCreated = 'user.created',
  UserDeleted = 'user.deleted',
}

/**
 * Base webhook payload structure
 */
export interface WebhookPayloadBase {
  eventType: WebhookEventType;
  timestamp: number;
  id: string;
}

/**
 * Payload for UserCreated webhook event
 */
export interface UserCreatedWebhookPayload extends WebhookPayloadBase {
  eventType: WebhookEventType.UserCreated;
  data: {
    user: User;
  };
}

/**
 * Payload for UserDeleted webhook event
 */
export interface UserDeletedWebhookPayload extends WebhookPayloadBase {
  eventType: WebhookEventType.UserDeleted;
  data: {
    userId: string;
  };
}

/**
 * Payload for ProfileUpdated webhook event
 */
export interface ProfileUpdatedWebhookPayload extends WebhookPayloadBase {
  eventType: WebhookEventType.ProfileUpdated;
  data: {
    userId: string;
    profile: Profile;
  };
}

/**
 * Union type for all webhook payloads
 */
export type WebhookPayload =
  | UserCreatedWebhookPayload
  | UserDeletedWebhookPayload
  | ProfileUpdatedWebhookPayload;

/**
 * Webhook request headers
 */
export interface WebhookRequestHeaders {
  'x-oasisbio-signature'?: string;
  'x-oasisbio-timestamp'?: string;
  'content-type'?: string;
}

/**
 * Webhook request interface
 */
export interface WebhookRequest {
  headers: WebhookRequestHeaders;
  body: string;
}
