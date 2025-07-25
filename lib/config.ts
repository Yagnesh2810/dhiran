// Environment configuration utility
export const config = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'dhiran_software',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // Application
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
    enableLogging: process.env.ENABLE_LOGGING === 'true',
  },

  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
    jwtSecret: process.env.JWT_SECRET,
  },

  // File Upload
  upload: {
    folder: process.env.NEXT_PUBLIC_UPLOAD_FOLDER || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.FROM_EMAIL,
  },

  // Security
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
  },
}

// Validation function to check required environment variables
export function validateConfig() {
  // Only validate in browser or server runtime, not during build
  if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
    return // Skip validation during build time
  }

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    )
    // Don't throw during build, just log the error
    if (typeof window !== 'undefined') {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
      )
    }
  }
}

// Helper function to check if we're in development
export const isDevelopment = () => config.app.nodeEnv === 'development'
export const isProduction = () => config.app.nodeEnv === 'production'