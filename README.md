# Oermos

Unified communication layer for Oasis ecosystem – connect any place, in anyway.

## Overview

Oermos is the unified communication layer that integrates with OasisBio for identity resolution and communication preferences. It provides a robust API client, caching layer, and clean abstractions for working with user identities from OasisBio.

## Features

- **Identity Resolution**: Fetch and cache user profiles from OasisBio
- **Type Safety**: Full TypeScript support with types matching OasisBio's models
- **Caching**: In-memory TTL cache for improved performance
- **Error Handling**: Graceful error handling with retries for transient failures
- **Configurable**: Easy configuration via environment variables

## Installation

```bash
npm install oermos
```

## Quick Start

### 1. Configure Environment

Create a `.env` file in your project root:

```env
OASIS_BIO_API_URL=https://api.oasisbio.com
```

### 2. Using the Identity Service

```typescript
import { IdentityService } from 'oermos';

// Create service instance
const identityService = new IdentityService({
  cacheTTL: 5 * 60 * 1000, // 5 minutes
});

// Resolve identity (with caching)
async function getCurrentUser(authToken: string) {
  try {
    const profile = await identityService.resolveIdentity(authToken);
    console.log('User:', profile.user);
    console.log('Profile:', profile.profile);
    return profile;
  } catch (error) {
    console.error('Failed to resolve identity:', error);
    throw error;
  }
}

// Update profile (automatically invalidates cache)
async function updateUserProfile(authToken: string, data: any) {
  try {
    const response = await identityService.updateProfile(data, authToken);
    console.log('Updated:', response.message);
    return response;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}
```

### 3. Using the API Client Directly

```typescript
import { OasisBioClient, OasisBioApiError, OasisBioNetworkError } from 'oermos';

const client = new OasisBioClient();

// Get profile
try {
  const profile = await client.getProfile({ authToken: 'your-token' });
  console.log(profile);
} catch (error) {
  if (error instanceof OasisBioApiError) {
    console.error(`API Error: ${error.message} (Status: ${error.status})`);
  } else if (error instanceof OasisBioNetworkError) {
    console.error(`Network Error: ${error.message}`);
  }
}

// Update profile with retries
try {
  const result = await client.updateProfile(
    { displayName: 'New Name' },
    { authToken: 'your-token', retries: 3 }
  );
  console.log(result);
} catch (error) {
  console.error(error);
}
```

## API Reference

### IdentityService

```typescript
class IdentityService {
  constructor(options?: { cacheTTL?: number })
  
  resolveIdentity(authToken?: string, skipCache?: boolean): Promise<GetProfileResponse>
  updateProfile(data: UpdateProfileRequest, authToken?: string): Promise<UpdateProfileResponse>
  invalidateCache(authToken?: string): void
  clearAllCache(): void
  getCacheSize(): number
}
```

### OasisBioClient

```typescript
class OasisBioClient {
  constructor()
  
  getProfile(options?: { authToken?: string; retries?: number }): Promise<GetProfileResponse>
  updateProfile(data: UpdateProfileRequest, options?: { authToken?: string; retries?: number }): Promise<UpdateProfileResponse>
}
```

### Types

All types are exported from the main module. Key types include:

- `User` - Full user model
- `Profile` - Full profile model  
- `GetProfileResponse` - Response from GET /api/profile
- `UpdateProfileRequest` - Request body for PUT /api/profile
- `UpdateProfileResponse` - Response from PUT /api/profile

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `OASIS_BIO_API_URL` | Yes | Base URL for OasisBio API |

## Error Handling

Oermos provides two error classes:

- `OasisBioApiError` - Thrown when the API returns an error response (4xx, 5xx)
- `OasisBioNetworkError` - Thrown when there's a network connectivity issue

```typescript
import { OasisBioApiError, OasisBioNetworkError } from 'oermos';

try {
  // ...
} catch (error) {
  if (error instanceof OasisBioApiError) {
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  } else if (error instanceof OasisBioNetworkError) {
    console.error('Cause:', error.cause);
  }
}
```

## Project Structure

```
src/
├── client/
│   ├── index.ts
│   ├── oasisbio.ts      # API client implementation
│   └── errors.ts        # Error classes
├── services/
│   ├── index.ts
│   └── identity.ts      # Identity resolution service
├── types/
│   ├── index.ts
│   ├── oasisbio.ts      # Core types from OasisBio
│   └── api.ts           # API request/response types
├── utils/
│   ├── index.ts
│   └── cache.ts         # TTL cache implementation
├── config.ts            # Environment configuration
└── index.ts             # Main entry point
```

## License

ISC
