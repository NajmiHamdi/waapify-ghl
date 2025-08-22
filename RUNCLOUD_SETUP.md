# 🚀 RunCloud Deployment Guide - Waapify GHL

## Step-by-Step Setup Instructions

### 1. Create RunCloud Web Application
1. Login to RunCloud panel
2. Click "**Web Application**" → "**Create Web App**"
3. **App Name**: `waapify-ghl`
4. **App Type**: **Node.js** 
5. **Node Version**: 18.x or 20.x (latest stable)
6. **Domain**: Your domain (e.g., `waaghl.waapify.com`)
7. **Document Root**: `/public_html` (default)
8. Click **Create**

### 2. Setup Git Auto-Deployment
1. In your web app, go to "**Git**" tab
2. **Repository URL**: `https://github.com/yourusername/waapify-ghl.git`
3. **Branch**: `main`
4. **Deploy Key**: Copy the generated key and add to GitHub repo settings
5. Enable "**Auto Deploy on Push**"
6. **Deploy Path**: `/public_html`

### 3. Create MySQL Database
1. Go to "**Database**" in RunCloud
2. Click "**Create Database**"
3. **Database Name**: `waapify_ghl`
4. **Username**: `waapify_user`
5. **Password**: Generate strong password and save it
6. **Host**: `localhost`
7. Click **Create**

### 4. Import Database Schema
1. Go to "**phpMyAdmin**" in RunCloud
2. Select your `waapify_ghl` database
3. Click "**Import**" tab
4. Upload the `database/schema.sql` file
5. Click "**Go**" to execute

### 5. Configure Environment Variables
1. In your web app, go to "**Environment Variables**"
2. Add these variables (update values with your credentials):

```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=waapify_user
DB_PASSWORD=your_database_password_here
DB_NAME=waapify_ghl
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret
GHL_REDIRECT_URI=https://yourdomain.com/authorize-handler
```

### 6. Deploy Application
1. Push your code to GitHub (triggers auto-deployment)
2. Or manually deploy in RunCloud Git tab
3. SSH into your server and run:
```bash
cd /home/runcloud/webapps/your-app-name
npm ci
npm run build
npm run pm2:start
```

### 7. Configure Reverse Proxy (if needed)
1. In RunCloud, go to your web app "**Settings**"
2. **App Port**: Set to `3000`
3. Enable "**Reverse Proxy**"
4. **Backend**: `http://127.0.0.1:3000`

### 8. SSL Certificate
1. Go to "**SSL**" tab in your web app
2. Choose "**Let's Encrypt**" for free SSL
3. Click "**Install**"

### 9. Verify Deployment
Visit your domain and check:
- ✅ App loads without errors
- ✅ Database connection works
- ✅ GHL OAuth flow functions
- ✅ WhatsApp message sending works

### 10. Monitor Application
```bash
# View application logs
npm run pm2:logs

# Restart application
npm run pm2:restart

# Check status
pm2 status
```

## Troubleshooting

### Common Issues:

1. **Database Connection Fails**
   - Verify DB credentials in environment variables
   - Check if database exists in phpMyAdmin
   - Test connection: `mysql -u waapify_user -p waapify_ghl`

2. **Application Won't Start**
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Check logs: `npm run pm2:logs`

3. **Build Fails**
   - Ensure all dependencies are installed: `npm ci`
   - Check TypeScript compilation: `npx tsc`
   - Verify UI build: `npm run build-ui`

4. **Auto-Deploy Not Working**
   - Verify GitHub deploy key is added
   - Check webhook settings in GitHub
   - Manually trigger deploy in RunCloud

## Production Checklist
- [ ] Domain configured and SSL enabled
- [ ] Database created and schema imported
- [ ] Environment variables configured
- [ ] Application deployed and running
- [ ] GHL marketplace app updated with new domain
- [ ] WhatsApp API integration tested
- [ ] Backup system configured

## Support
For issues, check the application logs and verify all steps above are completed correctly.