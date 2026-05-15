/**
 * User model from OasisBio's Prisma schema
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Profile model from OasisBio's Prisma schema
 */
export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  locale: string;
  defaultLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Minimal User type used in API responses (without sensitive fields)
 */
export interface MinimalUser {
  id: string;
  name: string | null;
  email: string;
}

/**
 * Minimal Profile type used in API responses (without timestamps and userId)
 */
export interface MinimalProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  locale: string;
  defaultLanguage: string;
}
