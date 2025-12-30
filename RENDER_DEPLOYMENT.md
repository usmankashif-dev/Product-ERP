# Render Deployment Guide

## Prerequisites
- GitHub repository with code pushed
- Render account (https://render.com)

## Deployment Steps

### 1. Generate Laravel Application Key
Before deploying, generate an APP_KEY locally:
```bash
php artisan key:generate --show
```
Copy the generated key (it starts with `base64:...`)

### 2. Connect Repository to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Choose this repository

### 3. Configure Web Service
- **Name:** `erp-app` (or your preferred name)
- **Runtime:** Docker
- **Plan:** Starter (or higher for production)
- **Build Command:** (leave empty - uses Dockerfile)
- **Start Command:** (leave empty - uses Dockerfile)

### 4. Add Environment Variables
In the Render dashboard, add these environment variables:

**Required:**
```
APP_KEY=base64:your_generated_key_here
APP_URL=https://your-app-name.onrender.com
APP_DEBUG=false
APP_ENV=production
LOG_CHANNEL=stderr
```

**Database:** (Auto-provided by Render PostgreSQL)
```
DB_CONNECTION=pgsql
DB_HOST=${{INTERNAL_DB_HOST}}
DB_PORT=${{DB_PORT}}
DB_DATABASE=${{DB_NAME}}
DB_USERNAME=${{DB_USER}}
DB_PASSWORD=${{DB_PASSWORD}}
```

**Optional (for email, storage, etc):**
```
MAIL_MAILER=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database
```

### 5. Create Database
1. In Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Set a name (e.g., `erp-db`)
4. Choose region matching your web service
5. Select plan (Starter is free tier)
6. Create

### 6. Connect Database to Web Service
1. Go to your Web Service settings
2. Scroll to "Environment"
3. Copy the database internal connection string
4. Use the variables provided by Render (they'll be available as `${{INTERNAL_DB_HOST}}`, etc.)

### 7. Deploy
- Push changes to GitHub
- Render automatically deploys on push
- Monitor build logs in the Render dashboard
- First deployment may take 5-10 minutes

## Troubleshooting

### Check Logs
```
Render Dashboard → Your Service → Logs
```

### Database Connection Issues
- Ensure PostgreSQL database is running
- Verify DB credentials in environment variables
- Check internal network connectivity is enabled

### Asset Build Issues
- Ensure `npm run build` completes in Dockerfile
- Check `public/build` directory is copied

### Storage Permissions
- The Dockerfile sets proper permissions
- Use `public/storage` symbolic link for file uploads

## Production Best Practices

1. **Enable HTTPS** - Render provides free SSL
2. **Set LOG_CHANNEL=stderr** - Render captures stderr for logs
3. **Use PostgreSQL** - More reliable than SQLite on Render
4. **Monitor Performance** - Use Render's monitoring tools
5. **Regular Backups** - Set up database backups
6. **Environment Secrets** - Never commit `.env` file, use Render's dashboard

## Scaling
- Increase instance type for better performance
- Add Redis for caching if needed
- Consider separate worker for queue jobs

## Support
- Render docs: https://render.com/docs
- Laravel docs: https://laravel.com/docs
