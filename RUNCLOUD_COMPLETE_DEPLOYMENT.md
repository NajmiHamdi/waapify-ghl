# 🚀 Complete RunCloud Deployment Guide - Waapify-GHL

**Complete step-by-step deployment guide with all command lines and screenshots locations**

## 📋 Prerequisites Checklist

- [ ] RunCloud account (Sign up at https://runcloud.io)
- [ ] Domain name pointed to your server
- [ ] GitHub repository with your code
- [ ] GHL Client ID and Secret
- [ ] Waapify API access

## 🖥️ Step 1: Create RunCloud Server (If Needed)

### 1.1 Create New Server
```bash
# If you don't have a server yet:
```
1. **Login to RunCloud** → https://manage.runcloud.io
2. **Click "Create Server"**
3. **Choose Provider**: DigitalOcean, Vultr, AWS, etc.
4. **Server Size**: Minimum 1GB RAM (2GB recommended)
5. **Server Location**: Choose closest to your users
6. **Server Name**: `waapify-production`
7. **Click "Create Server"**
8. **Wait 5-10 minutes** for server provisioning

### 1.2 Connect Domain to Server
1. **In your domain registrar** (Cloudflare, Namecheap, etc.)
2. **Add A Record**:
   ```
   Type: A
   Name: @ (or your subdomain)
   Value: YOUR_SERVER_IP (from RunCloud)
   TTL: Auto or 300
   ```
3. **Add CNAME for www** (optional):
   ```
   Type: CNAME  
   Name: www
   Value: yourdomain.com
   TTL: Auto or 300
   ```

## 🌐 Step 2: Create Web Application

### 2.1 Create Node.js Web App
1. **In RunCloud Dashboard** → Click **"Web Application"**
2. **Click "Create Web App"**
3. **Fill in details**:
   ```
   App Name: waapify-ghl
   Public HTML Path: /public_html/waapify-ghl
   App Type: Node.js
   Node.js Version: 20.x (latest stable)
   Domain: yourdomain.com (or subdomain.yourdomain.com)
   ```
4. **Click "Create Web App"**
5. **Wait for creation** (2-3 minutes)

### 2.2 Configure Web App Settings
1. **Go to your web app** → **"Settings"** tab
2. **Application Settings**:
   ```
   App Port: 3000
   Startup File: dist/index.js
   Document Root: /public_html/waapify-ghl
   ```
3. **Enable "Custom Nginx Config"** (we'll configure later)
4. **Click "Update"**

## 📁 Step 3: Setup Git Deployment

### 3.1 Configure Git Repository
1. **In your web app** → **"Git"** tab
2. **Repository Settings**:
   ```
   Repository Type: GitHub
   Repository URL: https://github.com/yourusername/waapify-ghl.git
   Branch: main
   Deploy Path: /public_html/waapify-ghl
   ```

### 3.2 Setup Deploy Key
1. **Copy the Deploy Key** provided by RunCloud
2. **Go to GitHub** → Your repository → **Settings** → **Deploy Keys**
3. **Click "Add Deploy Key"**:
   ```
   Title: RunCloud Deploy Key
   Key: [paste the key from RunCloud]
   ✅ Allow write access
   ```
4. **Click "Add Key"**

### 3.3 Enable Auto Deploy
1. **Back in RunCloud** → **Git tab**
2. **Enable "Auto Deploy"**
3. **Deploy Script** (important - add this):
   ```bash
   #!/bin/bash
   
   # Set production environment
   export NODE_ENV=production
   
   # Install dependencies
   npm ci --only=production
   
   # Build the application  
   npm run build
   
   # Create necessary directories
   mkdir -p logs
   mkdir -p uploads
   
   # Set permissions
   chmod -R 755 dist/
   chmod -R 755 logs/
   
   # Install PM2 globally if not exists
   npm list -g pm2 || npm install -g pm2
   
   # Stop existing process
   pm2 stop waapify-ghl || true
   pm2 delete waapify-ghl || true
   
   # Start the application
   pm2 start ecosystem.config.js
   pm2 save
   
   echo "✅ Deployment completed successfully!"
   ```
4. **Click "Update Git Settings"**

## 🗄️ Step 4: Create MySQL Database

### 4.1 Create Database
1. **In RunCloud** → **"Database"** tab
2. **Click "Create Database"**
3. **Database Details**:
   ```
   Database Name: waapify_ghl
   Username: waapify_user
   Password: [Generate strong password - SAVE THIS!]
   Host: localhost
   ```
4. **Click "Create Database"**
5. **Note down credentials** - you'll need them!

### 4.2 Import Database Schema
1. **Click "phpMyAdmin"** button next to your database
2. **Login with database credentials**
3. **Select `waapify_ghl` database** from left sidebar
4. **Click "Import" tab**
5. **Upload file**: Choose `database/schema.sql` from your project
6. **Click "Go"** to import
7. **Verify tables created**:
   ```sql
   SHOW TABLES;
   ```
   Should show: `ai_configs`, `installations`, `message_logs`, `rate_limits`, `waapify_configs`

## ⚙️ Step 5: Configure Environment Variables

### 5.1 Add Environment Variables
1. **In your web app** → **"Environment Variables"** tab
2. **Add these variables** (click "Add Variable" for each):

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration (use your actual credentials)
DB_HOST=localhost
DB_USER=waapify_user
DB_PASSWORD=your_generated_password_here
DB_NAME=waapify_ghl

# GHL OAuth Configuration (get from GHL Developer Portal)
GHL_CLIENT_ID=your_ghl_client_id_here
GHL_CLIENT_SECRET=your_ghl_client_secret_here
GHL_REDIRECT_URI=https://yourdomain.com/authorize-handler

# Optional: For auto-recovery system
INSTALLATION_BACKUP=[]

# Security (generate random strings)
SESSION_SECRET=generate-random-32-char-string-here
JWT_SECRET=another-random-32-char-string-here
```

### 5.2 Generate Secure Keys (Optional)
Run locally to generate secure keys:
```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Step 6: Deploy Application

### 6.1 Trigger First Deployment
1. **In Git tab** → **Click "Deploy Now"**
2. **Monitor deployment** in the log output
3. **Wait for completion** (5-10 minutes for first deploy)

### 6.2 SSH Access and Manual Commands (If Needed)
1. **Get SSH details** from RunCloud → Server → **"Credential"**
2. **Connect via SSH**:
```bash
# Connect to server
ssh runcloud@your-server-ip -p 22

# Navigate to app directory
cd /home/runcloud/webapps/waapify-ghl

# Check if files are deployed
ls -la

# Install dependencies if not done
npm ci --only=production

# Build application
npm run build

# Check if dist folder exists
ls -la dist/

# Start with PM2
pm2 start ecosystem.config.js

# Check PM2 status
pm2 status

# View logs
pm2 logs waapify-ghl

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Follow the command it gives you (copy-paste as sudo)
```

### 6.3 Test Application
```bash
# Test if app is running on port 3000
curl http://localhost:3000

# Check if process is listening
netstat -tlnp | grep :3000

# Check PM2 logs for errors
pm2 logs waapify-ghl --lines 50
```

## 🌐 Step 7: Configure Nginx Reverse Proxy

### 7.1 Custom Nginx Configuration
1. **In your web app** → **"Nginx Config"** tab
2. **Replace default config** with:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/runcloud/webapps/waapify-ghl/public_html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        access_log off;
    }
    
    # Static files (if any)
    location /static/ {
        alias /home/runcloud/webapps/waapify-ghl/public_html/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Security - block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)$ {
        deny all;
    }
}
```

3. **Click "Update Nginx Config"**
4. **Reload Nginx**:
```bash
# SSH to server and reload nginx
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

## 🔐 Step 8: Setup SSL Certificate

### 8.1 Install Let's Encrypt SSL
1. **In your web app** → **"SSL"** tab
2. **Method**: Select **"Let's Encrypt"**
3. **Domain**: Enter your domain (yourdomain.com)
4. **Include www**: ✅ Check if you want www.yourdomain.com
5. **Click "Install"**
6. **Wait for installation** (2-3 minutes)

### 8.2 Verify SSL
```bash
# Test SSL certificate
curl -I https://yourdomain.com

# Should return 200 OK with HTTPS
```

## ✅ Step 9: Verification & Testing

### 9.1 Application Health Check
```bash
# SSH to server
ssh runcloud@your-server-ip

# Check PM2 status
pm2 status

# Should show:
# ┌─────────────┬────┬─────────┬──────┬───────┬────────┬─────────┬────────┬─────┬───────────┬──────┬──────────┐
# │ App name    │ id │ version │ mode │ pid   │ status │ restart │ uptime │ cpu │ mem       │ user │ watching │
# ├─────────────┼────┼─────────┼──────┼───────┼────────┼─────────┼────────┼─────┼───────────┼──────┼──────────┤
# │ waapify-ghl │ 0  │ 1.0.0   │ fork │ 12345 │ online │ 0       │ 5m     │ 0%  │ 45.2 MB   │ runc │ disabled │
# └─────────────┴────┴─────────┴──────┴───────┴────────┴─────────┴────────┴─────┴───────────┴──────┴──────────┘

# Check application logs
pm2 logs waapify-ghl --lines 20

# Test database connection
cd /home/runcloud/webapps/waapify-ghl
node -e "
const { Database } = require('./dist/database');
Database.testConnection().then(result => {
  console.log('Database test:', result ? 'SUCCESS' : 'FAILED');
  process.exit(result ? 0 : 1);
});
"
```

### 9.2 External Testing
```bash
# Test from your local machine
curl https://yourdomain.com
curl https://yourdomain.com/health

# Should return application responses
```

### 9.3 Browser Testing
1. **Open browser** → https://yourdomain.com
2. **Should see**: Application loading properly
3. **Check**: No SSL warnings
4. **Test**: Basic endpoints working

## 🔧 Step 10: GHL Marketplace Configuration

### 10.1 Update GHL App Settings
1. **Go to GHL Developer Portal** → Your App
2. **Update OAuth Settings**:
   ```
   Redirect URI: https://yourdomain.com/authorize-handler
   Webhook URL: https://yourdomain.com/webhook/provider-outbound
   ```
3. **Update App Details**:
   ```
   App URL: https://yourdomain.com
   Privacy Policy: https://yourdomain.com/privacy
   Terms of Service: https://yourdomain.com/terms
   ```
4. **Save Changes**

### 10.2 Test OAuth Flow
1. **Install app** in a test GHL location
2. **Complete OAuth** flow
3. **Configure Waapify** credentials
4. **Test SMS to WhatsApp** conversion

## 📊 Step 11: Monitoring & Maintenance

### 11.1 Setup Log Monitoring
```bash
# View real-time logs
pm2 logs waapify-ghl -f

# View error logs only
pm2 logs waapify-ghl --err

# Monitor system resources
pm2 monit
```

### 11.2 Backup Scripts
Create backup script `/home/runcloud/backup-waapify.sh`:
```bash
#!/bin/bash

# Database backup
mysqldump -u waapify_user -p'your_password' waapify_ghl > /home/runcloud/backups/waapify_$(date +%Y%m%d_%H%M%S).sql

# Application backup  
tar -czf /home/runcloud/backups/waapify_app_$(date +%Y%m%d_%H%M%S).tar.gz /home/runcloud/webapps/waapify-ghl

# Keep only last 7 days of backups
find /home/runcloud/backups -name "waapify_*" -mtime +7 -delete

echo "Backup completed: $(date)"
```

Make executable and setup cron:
```bash
chmod +x /home/runcloud/backup-waapify.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add: 0 2 * * * /home/runcloud/backup-waapify.sh >> /home/runcloud/backup.log 2>&1
```

## 🚨 Troubleshooting Common Issues

### Issue 1: Application Won't Start
```bash
# Check PM2 status
pm2 status

# If stopped, check logs
pm2 logs waapify-ghl --lines 50

# Common fixes:
# 1. Environment variables missing
pm2 restart waapify-ghl

# 2. Port already in use
sudo netstat -tlnp | grep :3000
# Kill process if needed: sudo kill -9 PID

# 3. Dependencies missing
cd /home/runcloud/webapps/waapify-ghl
npm ci --only=production
npm run build
pm2 restart waapify-ghl
```

### Issue 2: Database Connection Failed
```bash
# Test database connection manually
mysql -u waapify_user -p waapify_ghl
# Enter password when prompted

# If connection fails:
# 1. Check credentials in environment variables
# 2. Ensure database exists
# 3. Check user permissions

# Grant permissions if needed (as root)
mysql -u root -p
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 3: SSL Certificate Issues
```bash
# Renew SSL certificate
/etc/letsencrypt/certbot-auto renew

# Or in RunCloud panel:
# SSL tab → Click "Renew Certificate"
```

### Issue 4: High Memory Usage
```bash
# Monitor memory
pm2 monit

# Restart application to clear memory
pm2 restart waapify-ghl

# Check for memory leaks in logs
pm2 logs waapify-ghl | grep -i memory
```

## ✅ Final Checklist

- [ ] ✅ RunCloud server created and configured
- [ ] ✅ Domain pointed to server IP
- [ ] ✅ Web application created (Node.js)
- [ ] ✅ Git deployment configured and working
- [ ] ✅ MySQL database created and schema imported
- [ ] ✅ Environment variables configured
- [ ] ✅ Application deployed and running
- [ ] ✅ PM2 process manager active
- [ ] ✅ Nginx reverse proxy configured
- [ ] ✅ SSL certificate installed
- [ ] ✅ GHL marketplace settings updated
- [ ] ✅ OAuth flow tested and working
- [ ] ✅ SMS to WhatsApp conversion tested
- [ ] ✅ Monitoring and logging setup
- [ ] ✅ Backup system configured

## 🎉 Success!

Your **Waapify-GHL application** is now **live in production** on RunCloud!

### 🔗 Important URLs:
- **Application**: https://yourdomain.com
- **Health Check**: https://yourdomain.com/health  
- **OAuth Redirect**: https://yourdomain.com/authorize-handler
- **Admin Backup**: https://yourdomain.com/admin/backup

### 📱 Next Steps:
1. **Test all features** thoroughly
2. **Monitor logs** for any issues
3. **Update GHL marketplace** with new domain
4. **Create user documentation**
5. **Launch to customers**! 🚀

**Congratulations! Your WhatsApp-GHL integration is now live and ready for users!** 🎉