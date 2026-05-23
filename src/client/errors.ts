export class OasisBioApiError extends Error {
  status: number;
  response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = 'OasisBioApiError';
    this.status = status;
    this.response = response;
  }
}

export class OasisBioNetworkError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'OasisBioNetworkError';
    this.cause = cause;
  }
}

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
  }
}

export class WebhookProcessingError extends Error {
  payload?: unknown;
  cause?: Error;

  constructor(message: string, payload?: unknown, cause?: Error) {
    super(message);
    this.name = 'WebhookProcessingError';
    this.payload = payload;
    this.cause = cause;
  }
}
