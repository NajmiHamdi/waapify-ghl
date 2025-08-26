# 🚀 Waapify-GHL Production Deployment

## 📋 **Simple Deployment Steps:**

### **1. Pull Latest Code**
```bash
cd /home/runcloud/webapps/waapify-ghl
git pull origin main
```

### **2. Install & Build**
```bash
npm install
npm run build
```

### **3. Test Database**
```bash
node check-db.js
```
Should show:
- ✅ Database connection successful
- 📋 Found 5 tables
- 👥 Installations: X
- ⚙️ Waapify configs: X
- 💬 Message logs: X

### **4. Deploy with PM2**
```bash
# Stop existing
pm2 delete all

# Start production app (port 3001)
pm2 start ecosystem.config.js

# Save and monitor
pm2 save
pm2 status
pm2 logs waapify-ghl
```

### **5. Test Application**
```bash
# Test locally
curl http://localhost:3001/provider/status

# Test domain (update nginx to port 3001 first)
curl https://waaghl.waapify.com/provider/status
```

## 🔧 **Production Settings:**
- **Database**: `waapify_ghl`
- **User**: `waapify_user`
- **Port**: `3001`
- **App Name**: `waapify-ghl`

## 📊 **Monitoring:**
```bash
# App status
pm2 status

# Logs
pm2 logs waapify-ghl

# Database check
node check-db.js
```

## ✅ **Success Indicators:**
- PM2 shows app online
- Database connection working
- Domain responds correctly
- Messages send and log properly

**That's it! Simple and clean deployment.** 🎉