import { MinimalUser, MinimalProfile } from './oasisbio';

/**
 * GET /api/profile response
 */
export interface GetProfileResponse {
  user: MinimalUser;
  profile: MinimalProfile | null;
}

/**
 * PUT /api/profile request body
 */
export interface UpdateProfileRequest {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  locale?: string;
  defaultLanguage?: string;
}

/**
 * PUT /api/profile response
 */
export interface UpdateProfileResponse {
  message: string;
  profile: MinimalProfile;
}

/**
 * Generic error response
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Base API response type
 */
export type ApiResponse<T> = T | ErrorResponse;
