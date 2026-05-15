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
