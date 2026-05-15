import { oasisBioConfig } from '../config';
import { GetProfileResponse, UpdateProfileRequest, UpdateProfileResponse, ErrorResponse } from '../types';
import { OasisBioApiError, OasisBioNetworkError } from './errors';

interface RequestOptions {
  authToken?: string;
  retries?: number;
}

const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function isTransientError(status: number): boolean {
  return status >= 500 && status < 600;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class OasisBioClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = oasisBioConfig.apiUrl;
  }

  private async request<T>(
    method: 'GET' | 'PUT',
    endpoint: string,
    options?: RequestOptions & { body?: unknown }
  ): Promise<T> {
    const retries = options?.retries ?? DEFAULT_RETRIES;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (options?.authToken) {
          headers['Authorization'] = `Bearer ${options.authToken}`;
        }

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
          method,
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        const responseBody = await response.json();

        if (!response.ok) {
          const errorBody = responseBody as ErrorResponse;
          lastError = new OasisBioApiError(
            errorBody.error || `Request failed with status ${response.status}`,
            response.status,
            responseBody
          );

          if (isTransientError(response.status) && attempt < retries - 1) {
            await delay(RETRY_DELAY_MS * (attempt + 1));
            continue;
          }

          throw lastError;
        }

        return responseBody as T;
      } catch (error) {
        if (error instanceof OasisBioApiError) {
          throw error;
        }

        lastError = new OasisBioNetworkError(
          'Network error occurred',
          error instanceof Error ? error : undefined
        );

        if (attempt < retries - 1) {
          await delay(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new OasisBioNetworkError('Request failed after multiple attempts');
  }

  /**
   * Retrieves the user's profile from OasisBio API
   * @param options - Request options including optional auth token and retry count
   * @returns Promise resolving to the profile response
   */
  async getProfile(options?: RequestOptions): Promise<GetProfileResponse> {
    return this.request<GetProfileResponse>('GET', '/api/profile', options);
  }

  /**
   * Updates the user's profile in OasisBio API
   * @param data - The profile data to update
   * @param options - Request options including optional auth token and retry count
   * @returns Promise resolving to the updated profile response
   */
  async updateProfile(data: UpdateProfileRequest, options?: RequestOptions): Promise<UpdateProfileResponse> {
    return this.request<UpdateProfileResponse>('PUT', '/api/profile', {
      ...options,
      body: data,
    });
  }
}
