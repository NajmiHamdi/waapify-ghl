# 🚀 Waapify-GHL Fresh Install Guide

## Prerequisites
- MySQL 5.7+ or 8.0+
- Node.js 16+
- PM2 installed globally

## 🗄️ Database Setup

### Step 1: Create Fresh Database & User
```bash
# Login to MySQL as root
mysql -u root -p

# Run the fresh schema
mysql -u root -p < database/fresh-schema.sql
```

This will create:
- Database: `waapify_ghl_fresh`
- User: `waapify_fresh` with password `WaapifyFresh2024!@#`
- All required tables (empty, ready for fresh install)

### Step 2: Verify Database Setup
```bash
# Test connection
mysql -u waapify_fresh -p'WaapifyFresh2024!@#' waapify_ghl_fresh -e "SHOW TABLES;"
```

Should show:
```
+---------------------------+
| Tables_in_waapify_ghl_fresh |
+---------------------------+
| ai_configs               |
| installations            |
| message_logs             |
| rate_limits              |
| waapify_configs          |
+---------------------------+
```

## 🔧 Application Setup

### Step 3: Update Environment Variables
```bash
# Copy fresh environment template
cp .env.fresh .env

# Or manually create .env with these values:
NODE_ENV=production
PORT=3000

DB_HOST=127.0.0.1
DB_USER=waapify_fresh
DB_PASSWORD=WaapifyFresh2024!@#
DB_NAME=waapify_ghl_fresh

GHL_CLIENT_ID=68a2e8f358c5af6573ce7c52-meh8wdt6
GHL_CLIENT_SECRET=2bada39f-520e-4ba0-afe9-b1817dacc6df
GHL_REDIRECT_URI=https://waaghl.waapify.com/authorize-handler
```

### Step 4: Install Dependencies & Build
```bash
npm install
npm run build
```

### Step 5: Test Database Connection
```bash
node check-database.js
```

Expected output:
```
✅ Database connection successful
📋 Checking tables... Found 5 tables
👥 Checking installations... Found 0 installations
⚙️ Checking Waapify configs... Found 0 Waapify configurations
💬 Checking message logs... Found 0 message logs
```

### Step 6: Start Application
```bash
# Development
npm run dev

# Production with PM2
pm2 start ecosystem.config.js
pm2 logs waapify-ghl
```

## 🔌 Plugin Installation & Testing

### Step 7: Install GHL Plugin
1. Go to GHL Marketplace
2. Install Waapify Plugin
3. Complete OAuth authorization
4. Configure Waapify credentials via external auth

### Step 8: Verify Installation
```bash
# Check database after plugin install
node check-database.js
```

Should now show:
```
👥 Checking installations... Found 1 installations
⚙️ Checking Waapify configs... Found 1 Waapify configurations
```

### Step 9: Test Message Sending
1. Send test message via GHL workflow
2. Check database for message logs:
```bash
node check-database.js
```

Should show:
```
💬 Checking message logs... Found 1+ message logs
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
sudo service mysql status

# Check user exists
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user = 'waapify_fresh';"

# Recreate user if needed
mysql -u root -p -e "
DROP USER IF EXISTS 'waapify_fresh'@'localhost';
CREATE USER 'waapify_fresh'@'localhost' IDENTIFIED BY 'WaapifyFresh2024!@#';
GRANT ALL PRIVILEGES ON waapify_ghl_fresh.* TO 'waapify_fresh'@'localhost';
FLUSH PRIVILEGES;
"
```

### Application Issues
```bash
# Check PM2 logs
pm2 logs waapify-ghl

# Restart application
pm2 restart waapify-ghl

# Check application status
curl http://localhost:3000/provider/status
```

## ✅ Success Indicators

Fresh install is successful when:
1. ✅ Database connection works
2. ✅ All 5 tables exist and empty
3. ✅ Application starts without errors
4. ✅ Plugin installs and creates records
5. ✅ Messages send and store in database

## 📊 Monitoring

Check database periodically:
```bash
# Quick check
node check-database.js

# Detailed message logs
mysql -u waapify_fresh -p'WaapifyFresh2024!@#' waapify_ghl_fresh -e "
SELECT 
  COUNT(*) as total_messages,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM message_logs;
"
```