# Environment Setup Guide

This guide will help you set up the environment variables required for the Dhiran Software application.

## Quick Setup

Run the interactive setup script:

```bash
npm run setup
```

This will guide you through setting up all required environment variables.

## Manual Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual values.

## Required Environment Variables

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (optional)

### Database Configuration (Optional)
If you're using a direct database connection instead of Supabase:
- `DATABASE_URL`: Full PostgreSQL connection string
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: dhiran_software)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

### Application Configuration
- `NEXT_PUBLIC_APP_URL`: Your application URL (default: http://localhost:3000)
- `NODE_ENV`: Environment (development/production)

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the Project URL and anon/public key
5. For service role key, copy the service_role key (keep this secret!)

## Database Schema

If you're setting up a new database, run the SQL scripts in the `scripts/` folder:

```sql
-- Run create-database-schema-v2.sql in your Supabase SQL editor
-- or PostgreSQL database
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your service role key secure
- Use different keys for development and production
- Regularly rotate your secrets

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your URL and keys
2. **Database connection errors**: Verify your database credentials
3. **Build errors**: Ensure all required variables are set

### Validation

The application will validate required environment variables on startup. If any are missing, you'll see an error message indicating which variables need to be set.

## Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Supabase service role key | - |
| `DATABASE_URL` | ❌ | PostgreSQL connection string | - |
| `NEXT_PUBLIC_APP_URL` | ❌ | Application URL | http://localhost:3000 |
| `NODE_ENV` | ❌ | Environment | development |
| `NEXTAUTH_SECRET` | ❌ | NextAuth secret | - |
| `JWT_SECRET` | ❌ | JWT signing secret | - |
| `ENCRYPTION_KEY` | ❌ | Data encryption key | - |

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use production Supabase project
3. Set secure secrets
4. Configure proper CORS settings
5. Set up SSL certificates

## Support

If you encounter issues with environment setup, check:
1. All required variables are set
2. Supabase project is active
3. Database schema is properly created
4. Network connectivity to Supabase