import { OasisBioClient } from '../client';
import { GetProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from '../types';
import { TTLCache } from '../utils/cache';

interface IdentityServiceOptions {
  cacheTTL?: number;
}

const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

export class IdentityService {
  private client: OasisBioClient;
  private profileCache: TTLCache<string, GetProfileResponse>;

  constructor(options?: IdentityServiceOptions) {
    this.client = new OasisBioClient();
    this.profileCache = new TTLCache<string, GetProfileResponse>({
      ttl: options?.cacheTTL ?? DEFAULT_CACHE_TTL,
    });
  }

  /**
   * Resolves the current user's identity with caching
   * @param authToken - Optional authentication token
   * @param skipCache - Whether to skip cache and force fresh fetch
   * @returns Promise resolving to the profile response
   */
  async resolveIdentity(authToken?: string, skipCache = false): Promise<GetProfileResponse> {
    const cacheKey = authToken || 'anonymous';

    if (!skipCache) {
      const cached = this.profileCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.client.getProfile({ authToken });
      this.profileCache.set(cacheKey, response);
      return response;
    } catch (error) {
      if (!skipCache) {
        const cached = this.profileCache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      throw error;
    }
  }

  /**
   * Updates the user's profile and invalidates the cache
   * @param data - The profile data to update
   * @param authToken - Optional authentication token
   * @returns Promise resolving to the updated profile response
   */
  async updateProfile(
    data: UpdateProfileRequest,
    authToken?: string
  ): Promise<UpdateProfileResponse> {
    const response = await this.client.updateProfile(data, { authToken });

    const cacheKey = authToken || 'anonymous';
    this.profileCache.delete(cacheKey);

    return response;
  }

  /**
   * Invalidates the identity cache for a specific user
   * @param authToken - Optional authentication token
   */
  invalidateCache(authToken?: string): void {
    const cacheKey = authToken || 'anonymous';
    this.profileCache.delete(cacheKey);
  }

  /**
   * Clears all cached identities
   */
  clearAllCache(): void {
    this.profileCache.clear();
  }

  /**
   * Gets the current cache size
   * @returns Number of cached entries
   */
  getCacheSize(): number {
    return this.profileCache.size();
  }
}
