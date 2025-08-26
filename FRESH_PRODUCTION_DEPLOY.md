# 🚀 Waapify-GHL COMPLETE FRESH PRODUCTION DEPLOYMENT

## 🆕 What's New in This Fresh Deploy:
- **Database**: `waapify_production` (completely new)
- **User**: `waapify_prod` / `WaaProd2024#SecurePass!`
- **Port**: `3001` (new port)
- **App Name**: `waapify-ghl-prod`
- **All New Credentials**: Fresh secrets and tokens

---

## 🔧 Step 1: Database Setup

### Create Fresh Database & User
```bash
cd /home/runcloud/webapps/waapify-ghl
git pull origin main

# Create fresh database and user
mysql -u root -p < database/deploy-fresh.sql
```

### Verify Database Setup
```bash
# Test connection
mysql -u waapify_prod -p'WaaProd2024#SecurePass!' waapify_production -e "SHOW TABLES;"

# Should show 5 empty tables:
# ai_configs, installations, message_logs, rate_limits, waapify_configs
```

---

## 🌐 Step 2: Nginx Configuration

### Update Nginx Config
```bash
# Copy new nginx config
sudo cp nginx/waapify-production.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/waapify-production.conf /etc/nginx/sites-enabled/

# Remove old config if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 📱 Step 3: Application Deployment

### Environment Setup
```bash
# Copy production environment
cp .env.production .env

# Install dependencies and build
npm install
npm run build
```

### PM2 Deployment
```bash
# Stop any existing PM2 processes
pm2 delete all

# Start fresh production app
pm2 start ecosystem.production.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs waapify-ghl-prod
```

---

## ✅ Step 4: Verification

### Test Database Connection
```bash
node check-production-db.js
```

Expected output:
```
✅ Production database connection successful
📋 Found 5 tables
👥 Found 0 installations
⚙️ Found 0 Waapify configurations  
💬 Found 0 message logs
🎉 Production database ready for fresh plugin installation!
```

### Test Application
```bash
# Test local connection
curl http://localhost:3001/provider/status

# Test domain
curl http://waaghl.waapify.com/provider/status
```

### Check Logs
```bash
# Application logs
pm2 logs waapify-ghl-prod

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔌 Step 5: Plugin Installation

### Fresh Plugin Install
1. **Uninstall old plugin** (if exists):
   - Go to GHL → Apps → Installed Apps
   - Remove Waapify plugin

2. **Install fresh**:
   - Go to GHL Marketplace
   - Install Waapify plugin
   - Complete OAuth flow
   - Configure Waapify credentials via external auth

3. **Verify installation**:
   ```bash
   node check-production-db.js
   # Should now show: 1 installation, 1 waapify config
   ```

4. **Test message sending**:
   - Send test message via GHL
   - Check database:
   ```bash
   node check-production-db.js  
   # Should show: 1+ message logs
   ```

---

## 📊 System Information

### Production Configuration
- **Domain**: waaghl.waapify.com
- **Port**: 3001 (internal)
- **Database**: waapify_production
- **App Name**: waapify-ghl-prod
- **Process Manager**: PM2

### Database Schema
- **installations**: GHL OAuth data
- **waapify_configs**: User Waapify credentials
- **message_logs**: Message history tracking
- **ai_configs**: AI chatbot settings
- **rate_limits**: API usage tracking

### Key Files
- **Environment**: `.env.production`
- **PM2 Config**: `ecosystem.production.config.js`
- **Database Schema**: `database/deploy-fresh.sql`
- **Nginx Config**: `nginx/waapify-production.conf`
- **DB Check**: `check-production-db.js`

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Recreate user if access denied
mysql -u root -p -e "
DROP USER IF EXISTS 'waapify_prod'@'localhost';
CREATE USER 'waapify_prod'@'localhost' IDENTIFIED BY 'WaaProd2024#SecurePass!';
GRANT ALL PRIVILEGES ON waapify_production.* TO 'waapify_prod'@'localhost';
FLUSH PRIVILEGES;
"

# Test manual connection
mysql -u waapify_prod -p'WaaProd2024#SecurePass!' waapify_production -e "SELECT 'Connected!' as status;"
```

### Application Issues
```bash
# Restart application
pm2 restart waapify-ghl-prod

# Check port is listening
netstat -tlnp | grep 3001

# Check application response
curl -v http://localhost:3001/
```

### Nginx Issues
```bash
# Check nginx config syntax
sudo nginx -t

# Check nginx is running
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx
```

---

## 🎯 Success Checklist

- ✅ Fresh database created and accessible
- ✅ Application running on port 3001
- ✅ PM2 managing the process
- ✅ Nginx proxying correctly
- ✅ Domain accessible: http://waaghl.waapify.com
- ✅ Plugin installs and creates records
- ✅ Messages send and log to database
- ✅ All endpoints respond correctly

---

## 🔄 Next Steps After Deployment

1. **Install GHL Plugin** - Fresh installation
2. **Configure External Auth** - Each user adds their Waapify credentials  
3. **Test Message Flow** - Send test messages and verify database logging
4. **Monitor Logs** - Watch for any errors or issues
5. **Setup Backup** - Regular database backups for production

**Database will remain EMPTY until plugin is installed - this is expected behavior for fresh deployment!** 🎉