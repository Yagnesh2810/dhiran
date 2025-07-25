/**
 * Environment Configuration
 * Centralized environment variable management with validation
 */

// Required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const

// Optional environment variables with defaults
const optionalEnvVars = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
} as const

// Validate required environment variables
function validateRequiredEnvVars() {
  const missingVars: string[] = []
  
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key)
    }
  })

  if (missingVars.length > 0) {
    const errorMessage = `
❌ Missing required environment variables:
${missingVars.map(v => `   - ${v}`).join('\n')}

Please create a .env.local file with these variables.
See .env.example for reference.
    `.trim()
    
    throw new Error(errorMessage)
  }
}

// Only validate in runtime, not during build
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  validateRequiredEnvVars()
}

// Export typed environment configuration
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: optionalEnvVars.SUPABASE_SERVICE_ROLE_KEY,
  
  // Application
  NEXT_PUBLIC_APP_URL: optionalEnvVars.NEXT_PUBLIC_APP_URL,
  NODE_ENV: optionalEnvVars.NODE_ENV,
  
  // Database
  DATABASE_URL: optionalEnvVars.DATABASE_URL,
  
  // Authentication
  NEXTAUTH_SECRET: optionalEnvVars.NEXTAUTH_SECRET,
  NEXTAUTH_URL: optionalEnvVars.NEXTAUTH_URL,
  
  // Helpers
  isDevelopment: optionalEnvVars.NODE_ENV === 'development',
  isProduction: optionalEnvVars.NODE_ENV === 'production',
} as const

export type Env = typeof env