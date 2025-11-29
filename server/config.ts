/**
 * Configuration validation and management for IWRITE
 * Ensures all required environment variables are set at startup
 */

export interface Config {
  // Server
  nodeEnv: 'development' | 'production';
  port: number;
  
  // Database
  databaseUrl: string;
  
  // AI Services
  aiBaseUrl: string;
  aiApiKey: string;
  
  // Cloud Storage (optional)
  googleStorageBucket?: string;
  
  // CORS
  corsOrigin: string | string[];
  
  // Admin
  adminEmail?: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

export function loadConfig(): Config {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production';
  
  // Validate critical env vars
  if (nodeEnv === 'production') {
    try {
      getEnvVar('DATABASE_URL');
      getEnvVar('AI_INTEGRATIONS_OPENAI_BASE_URL');
      getEnvVar('AI_INTEGRATIONS_OPENAI_API_KEY');
    } catch (error) {
      console.error('❌ PRODUCTION CONFIGURATION ERROR');
      console.error(error instanceof Error ? error.message : String(error));
      console.error('\nRequired environment variables for production:');
      console.error('  - DATABASE_URL');
      console.error('  - AI_INTEGRATIONS_OPENAI_BASE_URL');
      console.error('  - AI_INTEGRATIONS_OPENAI_API_KEY');
      process.exit(1);
    }
  }

  const config: Config = {
    nodeEnv,
    port: parseInt(process.env.PORT || '5000', 10),
    databaseUrl: getEnvVar('DATABASE_URL', 'postgresql://localhost/iwrite'),
    aiBaseUrl: getEnvVar('AI_INTEGRATIONS_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    aiApiKey: getEnvVar('AI_INTEGRATIONS_OPENAI_API_KEY', 'sk-test'),
    googleStorageBucket: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID,
    corsOrigin: process.env.CORS_ORIGIN || '*',
    adminEmail: process.env.ADMIN_EMAIL,
  };

  if (nodeEnv === 'production') {
    console.log('✓ Production configuration loaded and validated');
  }

  return config;
}

export const config = loadConfig();
