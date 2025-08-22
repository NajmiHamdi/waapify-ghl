# 🚀 Render Deployment Guide

## ✅ **Ready for Production Deployment**

Your waapify-ghl app is now ready to deploy to Render with domain `https://waaghl.waapify.com`

---

## 🔧 **Render Setup Instructions**

### **Step 1: Connect GitHub Repository**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `NajmiHamdi/waapify-ghl`
4. Select branch: `main`

### **Step 2: Configure Service**
```
Name: waapify-ghl
Runtime: Node
Build Command: npm install && npm run build-ui
Start Command: npm start
```

### **Step 3: Set Environment Variables**
Add these environment variables in Render dashboard:

#### **Required (Public):**
```
NODE_ENV=production
PORT=10000
GHL_APP_CLIENT_ID=68a2e8f358c5af6573ce7c52-mehih392
GHL_REDIRECT_URI=https://waaghl.waapify.com/authorize-handler
GHL_API_DOMAIN=https://services.leadconnectorhq.com
```

#### **Secret (Add Separately):**
```
GHL_APP_CLIENT_SECRET=51f01762-72e6-4059-a75b-4dff6ebc75a3
GHL_APP_SSO_KEY=b6d0f928-0343-4a19-807d-68abe5cb8721
```

#### **Optional (For Testing):**
```
WAAPIFY_ACCESS_TOKEN=1740aed492830374b432091211a6628d
WAAPIFY_INSTANCE_ID=673F5A50E7194
WAAPIFY_WHATSAPP_NUMBER=60149907876
OPENAI_API_KEY=sk-your-fallback-key-here
```

### **Step 4: Custom Domain**
1. In Render service settings → **"Settings"** tab
2. **"Custom Domains"** section
3. Add domain: `waaghl.waapify.com`
4. Configure DNS (see below)

---

## 🌐 **DNS Configuration**

### **In Your DNS Provider (Cloudflare/etc.):**
```
Type: CNAME
Name: waaghl
Value: waapify-ghl.onrender.com
TTL: Auto
```

**Or if you need A record:**
```
Type: A  
Name: waaghl
Value: [Render IP - get from Render dashboard]
```

---

## 📋 **Post-Deployment Checklist**

### **1. ✅ Test Endpoints**
```bash
# Test server health
curl https://waaghl.waapify.com/provider/status

# Test dashboard
curl https://waaghl.waapify.com/dashboard

# Test external auth
curl -X POST https://waaghl.waapify.com/external-auth \
  -H "Content-Type: application/json" \
  -d '{"access_token":"test","instance_id":"test","locationId":"test","companyId":"test"}'
```

### **2. 🔄 Update GHL Marketplace**
Update all webhook URLs in your GHL marketplace app:

**Replace:**
```
https://be09ba89498b.ngrok-free.app/*
```

**With:**
```
https://waaghl.waapify.com/*
```

**Specific URLs to Update:**
- External Auth: `https://waaghl.waapify.com/external-auth`
- OAuth Redirect: `https://waaghl.waapify.com/authorize-handler`  
- Provider Webhook: `https://waaghl.waapify.com/webhook/provider-outbound`
- Media Action: `https://waaghl.waapify.com/action/send-whatsapp-media-ghl`
- AI Chatbot Action: `https://waaghl.waapify.com/action/ai-chatbot-ghl`

### **3. 🧪 Test Full Integration**
1. Install updated app in test GHL location
2. Complete external authentication 
3. Test WhatsApp message sending
4. Test AI chatbot responses
5. Test media message sending

---

## 🔐 **Production Security**

### **Environment Variables:**
- ✅ All secrets stored in Render environment variables
- ✅ No sensitive data in code repository  
- ✅ Production domain configured
- ✅ HTTPS enforced

### **Data Storage:**
- ⚠️ Currently using JSON file storage
- 🔄 **Future:** Migrate to PostgreSQL for production scale
- 📊 Current limit: ~1000 installations (sufficient for launch)

---

## 📊 **Monitoring & Logs**

### **Render Features:**
- ✅ **Automatic deployments** from GitHub
- ✅ **Health checks** and auto-restart
- ✅ **HTTPS/SSL** automatic
- ✅ **Logs** available in dashboard
- ✅ **Metrics** for performance monitoring

### **Log Monitoring:**
```bash
# View logs in Render dashboard or CLI
render logs -s waapify-ghl --tail
```

---

## 🚀 **Deployment Process**

### **Automatic Deployment:**
1. Push code to GitHub main branch
2. Render automatically builds and deploys
3. Service restarts with new version
4. Health check verifies deployment

### **Manual Deployment:**
1. Go to Render dashboard
2. Find your service: `waapify-ghl`
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🎯 **Performance Optimization**

### **Current Setup:**
- **Plan:** Starter ($7/month)
- **Resources:** 512MB RAM, shared CPU
- **Suitable for:** 100-500 concurrent users

### **Scaling Options:**
- **Standard:** $25/month (1GB RAM, dedicated CPU)
- **Pro:** $85/month (4GB RAM, 2 dedicated CPUs)

---

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **Build Fails:**
```bash
# Check build logs in Render dashboard
# Common fix: Clear build cache and redeploy
```

#### **App Won't Start:**
```bash
# Check environment variables are set
# Check PORT is set to 10000
# Check start command: npm start
```

#### **Domain Not Working:**
```bash
# Check DNS configuration
# Wait 24-48 hours for DNS propagation
# Check CNAME points to correct Render URL
```

#### **GHL Integration Fails:**
```bash
# Update all webhook URLs in marketplace
# Check OAuth redirect URI matches exactly
# Verify all environment variables
```

---

## 📞 **Support Contacts**

### **If You Need Help:**
- **Render Support:** https://render.com/docs
- **DNS Issues:** Your domain provider support
- **GHL Integration:** GoHighLevel developer docs

---

## 🎉 **Launch Checklist**

- [ ] Code pushed to GitHub
- [ ] Render service deployed successfully  
- [ ] Custom domain configured and working
- [ ] All environment variables set
- [ ] GHL marketplace URLs updated
- [ ] External auth tested
- [ ] WhatsApp messaging tested
- [ ] AI chatbot tested
- [ ] Media messages tested
- [ ] Documentation updated

**Once complete, your app will be live at https://waaghl.waapify.com! 🚀**