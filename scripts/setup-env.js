#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function setupEnvironment() {
  console.log('🚀 Setting up environment variables for Dhiran Software...\n')

  const envPath = path.join(process.cwd(), '.env')
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.')
      rl.close()
      return
    }
  }

  console.log('Please provide the following information:\n')

  // Supabase Configuration
  console.log('📊 Supabase Configuration:')
  const supabaseUrl = await question('Supabase URL (https://your-project-id.supabase.co): ')
  const supabaseAnonKey = await question('Supabase Anon Key: ')
  const supabaseServiceKey = await question('Supabase Service Role Key (optional): ')

  // Database Configuration
  console.log('\n🗄️  Database Configuration (optional - if using direct DB connection):')
  const dbHost = await question('Database Host (localhost): ') || 'localhost'
  const dbPort = await question('Database Port (5432): ') || '5432'
  const dbName = await question('Database Name (dhiran_software): ') || 'dhiran_software'
  const dbUser = await question('Database User: ')
  const dbPassword = await question('Database Password: ')

  // Application Configuration
  console.log('\n⚙️  Application Configuration:')
  const appUrl = await question('Application URL (http://localhost:3000): ') || 'http://localhost:3000'
  const nodeEnv = await question('Node Environment (development): ') || 'development'

  // Generate secrets
  const generateSecret = () => require('crypto').randomBytes(32).toString('hex')
  const nextAuthSecret = generateSecret()
  const jwtSecret = generateSecret()
  const encryptionKey = generateSecret()

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
${supabaseServiceKey ? `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}` : '# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here'}

# Database Configuration
${dbUser ? `DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}` : '# DATABASE_URL=postgresql://username:password@localhost:5432/dhiran_software'}
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
${dbUser ? `DB_USER=${dbUser}` : '# DB_USER=your_db_username'}
${dbPassword ? `DB_PASSWORD=${dbPassword}` : '# DB_PASSWORD=your_db_password'}

# Application Configuration
NEXT_PUBLIC_APP_URL=${appUrl}
NODE_ENV=${nodeEnv}

# Authentication
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=${appUrl}
JWT_SECRET=${jwtSecret}

# File Upload Configuration
NEXT_PUBLIC_UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=5242880

# Email Configuration (configure as needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# FROM_EMAIL=your-email@gmail.com

# Security
ENCRYPTION_KEY=${encryptionKey}

# Development/Production flags
NEXT_PUBLIC_DEBUG=${nodeEnv === 'development' ? 'true' : 'false'}
ENABLE_LOGGING=true
`

  fs.writeFileSync(envPath, envContent)

  console.log('\n✅ Environment file created successfully!')
  console.log('📝 Generated secure secrets for authentication and encryption.')
  console.log('🔒 Make sure to keep your .env file secure and never commit it to version control.')
  console.log('\n🚀 You can now run: npm run dev')

  rl.close()
}

setupEnvironment().catch(console.error)