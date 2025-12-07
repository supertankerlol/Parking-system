import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

interface Config {
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
  };
  redis: {
    url: string;
  };
  minio: {
    endpoint: string;
    port: number;
    accessKey: string;
    secretKey: string;
    useSSL: boolean;
    bucket: string;
  };
  cv: {
    secret: string;
  };
}

// Helper function to get required env variable (throws only in non-dev)
function getRequiredEnv(key: string, errorMessage?: string): string {
  const value = process.env[key];
  if (!value) {
    if (!isDevelopment) {
      const message = errorMessage || `Missing required environment variable: ${key}`;
      throw new Error(message);
    }
    // In development, return a placeholder to allow the app to start
    // but it will likely fail when trying to use these values
    return '';
  }
  return value;
}

// Helper function to get optional env variable with default
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Validate required environment variables in non-dev environments
// This check happens before building the config object
if (!isDevelopment) {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missingVars.join(', ')}. ` +
      `Please set these in your environment or .env file.`
    );
  }
}

// Build config object
export const config: Config = {
  port: parseInt(getOptionalEnv('PORT', '5000'), 10),
  database: {
    url: getRequiredEnv(
      'DATABASE_URL',
      'DATABASE_URL is required. Please set it in your .env file.'
    ),
  },
  jwt: {
    secret: getRequiredEnv(
      'JWT_SECRET',
      'JWT_SECRET is required. Please set it in your .env file.'
    ),
  },
  redis: {
    url: getOptionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },
  minio: {
    endpoint: getOptionalEnv('MINIO_ENDPOINT', 'localhost'),
    port: parseInt(getOptionalEnv('MINIO_PORT', '9000'), 10),
    accessKey: getOptionalEnv('MINIO_ACCESS_KEY', 'minioadmin'),
    secretKey: getOptionalEnv('MINIO_SECRET_KEY', 'minioadmin'),
    useSSL: getOptionalEnv('MINIO_USE_SSL', 'false').toLowerCase() === 'true',
    bucket: getOptionalEnv('MINIO_BUCKET', 'parking-system'),
  },
  cv: {
    secret: getRequiredEnv(
      'CV_SECRET',
      'CV_SECRET is required. Please set it in your .env file.'
    ),
  },
};

// Validate PORT is a valid number
if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}. Must be a number between 1 and 65535.`);
}

// Validate MINIO_PORT is a valid number
if (isNaN(config.minio.port) || config.minio.port < 1 || config.minio.port > 65535) {
  throw new Error(
    `Invalid MINIO_PORT value: ${process.env.MINIO_PORT}. Must be a number between 1 and 65535.`
  );
}

export default config;
