import 'dotenv/config';

const requiredVars = {
  OASIS_BIO_API_URL: process.env.OASIS_BIO_API_URL,
  OASISBIO_WEBHOOK_SECRET: process.env.OASISBIO_WEBHOOK_SECRET,
} as const;

type RequiredKey = keyof typeof requiredVars;

export function getEnv(key: RequiredKey): string {
  const value = requiredVars[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const oasisBioConfig = {
  get apiUrl(): string {
    return getEnv('OASIS_BIO_API_URL');
  },
};

let validated = false;

export function validateConfig(): void {
  if (validated) return;
  validated = true;

  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredVars)) {
    if (value === undefined || value === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Configuration validation failed. Missing environment variables:\n  - ${missing.join('\n  - ')}\n\n` +
      'Please set these variables before starting the server.'
    );
  }
}

if (process.env.NODE_ENV !== 'production' || process.env.VALIDATE_CONFIG === 'true') {
  try {
    validateConfig();
  } catch (err) {
    console.error('[config]', (err as Error).message);
  }
}
