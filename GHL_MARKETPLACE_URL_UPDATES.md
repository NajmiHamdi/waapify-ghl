# 🔗 GHL Marketplace URL Updates

## 🎯 **All URLs to Update in GHL Marketplace Developer Panel**

**Replace all instances of:**
```
https://be09ba89498b.ngrok-free.app
```

**With:**
```
https://waaghl.waapify.com
```

---

## 📋 **Section-by-Section URL Updates**

### **1. 🔐 OAuth & Authentication Settings**

#### **OAuth Redirect URIs:**
```
OLD: https://be09ba89498b.ngrok-free.app/authorize-handler
NEW: https://waaghl.waapify.com/authorize-handler
```

#### **External Authentication API Endpoint:**
```
OLD: https://be09ba89498b.ngrok-free.app/external-auth
NEW: https://waaghl.waapify.com/external-auth
```

---

### **2. 💬 Conversation Provider Settings**

#### **Provider Webhook URL (Outbound Messages):**
```
OLD: https://be09ba89498b.ngrok-free.app/webhook/provider-outbound
NEW: https://waaghl.waapify.com/webhook/provider-outbound
```

#### **Provider Status Endpoint:**
```
OLD: https://be09ba89498b.ngrok-free.app/provider/status
NEW: https://waaghl.waapify.com/provider/status
```

#### **Phone Numbers API:**
```
OLD: https://be09ba89498b.ngrok-free.app/api/phone-numbers
NEW: https://waaghl.waapify.com/api/phone-numbers
```

---

### **3. ⚡ Workflow Actions**

#### **Existing Action - Send Message:**
```
OLD: https://be09ba89498b.ngrok-free.app/action/send-whatsapp-text
NEW: https://waaghl.waapify.com/action/send-whatsapp-text
```

#### **NEW Action - Send WhatsApp Media:**
```
Name: Send WhatsApp Media
URL: https://waaghl.waapify.com/action/send-whatsapp-media-ghl
Method: POST
Fields:
  - number (text, required): WhatsApp Number
  - message (textarea, required): Message Text  
  - media_url (text, required): Media File URL
  - filename (text, optional): Custom Filename
```

#### **NEW Action - AI Chatbot Response:**
```
Name: AI Chatbot Response  
URL: https://waaghl.waapify.com/action/ai-chatbot-ghl
Method: POST
Fields:
  - customerMessage (textarea, required): Customer Message
  - keywords (text, required): Trigger Keywords (comma-separated)
  - context (textarea, required): Business Context
  - persona (text, required): AI Personality
  - phone (text, optional): WhatsApp Number (to send response)
```

#### **NEW Action - Check WhatsApp Number:**
```
Name: Check WhatsApp Number
URL: https://waaghl.waapify.com/action/check-whatsapp-phone
Method: POST
Fields:
  - number (text, required): Phone Number to Check
```

---

### **4. 🔔 Webhook Settings (if applicable)**

#### **Incoming Webhook URL:**
```
OLD: https://be09ba89498b.ngrok-free.app/webhook/waapify
NEW: https://waaghl.waapify.com/webhook/waapify
```

---

### **5. 📱 External Authentication Form Fields**

Update the external auth form to include:

#### **Existing Fields:**
```
1. Waapify Access Token (required)
   - Field Name: access_token
   - Type: password
   - Label: Waapify Access Token
   - Help: Get from your Waapify dashboard

2. Waapify Instance ID (required)
   - Field Name: instance_id  
   - Type: text
   - Label: Waapify Instance ID
   - Help: WhatsApp instance ID from Waapify

3. WhatsApp Number (required)
   - Field Name: whatsapp_number
   - Type: text
   - Label: Business WhatsApp Number
   - Help: Your WhatsApp Business number with country code
```

#### **NEW Field to Add:**
```
4. OpenAI API Key (optional)
   - Field Name: openai_api_key
   - Type: password
   - Label: OpenAI API Key (for AI Features)
   - Help: Optional. Required for AI Chatbot features. Get from https://platform.openai.com/api-keys
   - Required: No
```

---

## 📝 **Step-by-Step Update Process**

### **Step 1: Access Marketplace Developer**
1. Go to: https://marketplace.gohighlevel.com/developer
2. Login with your developer account
3. Find your app: **Waapify Integration** (ID: `68a2e8f358c5af6573ce7c52-mehih392`)

### **Step 2: Update OAuth Settings**
1. Go to **"OAuth Settings"** tab
2. Update **Redirect URI** to: `https://waaghl.waapify.com/authorize-handler`

### **Step 3: Update External Authentication**
1. Go to **"External Authentication"** tab
2. Update **API Endpoint** to: `https://waaghl.waapify.com/external-auth`
3. **Add OpenAI API Key field** (see field configuration above)

### **Step 4: Update Conversation Provider**
1. Go to **"Conversation Providers"** tab
2. Update **Webhook URL** to: `https://waaghl.waapify.com/webhook/provider-outbound`
3. Update **Status Endpoint** to: `https://waaghl.waapify.com/provider/status`

### **Step 5: Update Existing Workflow Actions**
1. Go to **"Workflow Actions"** tab
2. Find existing **"Send Message"** action
3. Update URL to: `https://waaghl.waapify.com/action/send-whatsapp-text`

### **Step 6: Add New Workflow Actions**
1. Click **"Add New Action"**
2. **Add "Send WhatsApp Media"** action (see config above)
3. **Add "AI Chatbot Response"** action (see config above)  
4. **Add "Check WhatsApp Number"** action (see config above)

---

## 🧪 **Testing After Updates**

### **Test OAuth Flow:**
1. Try installing your app in a test GHL location
2. Should redirect to: `https://waaghl.waapify.com/authorize-handler`
3. Should redirect to external auth: `https://waaghl.waapify.com/external-auth`

### **Test External Auth:**
```bash
curl -X POST https://waaghl.waapify.com/external-auth \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "your_waapify_token",
    "instance_id": "your_instance_id", 
    "whatsapp_number": "60123456789",
    "openai_api_key": "sk-your-openai-key",
    "locationId": "test_location",
    "companyId": "test_company"
  }'
```

### **Test Workflow Actions:**
Create test workflows in GHL using the new actions and verify they call the correct URLs.

---

## ⚠️ **Important Notes**

### **URL Format:**
- ✅ Always use `https://waaghl.waapify.com` (with HTTPS)
- ✅ No trailing slashes on base domain
- ✅ Exact path matching (case-sensitive)

### **Field Names:**
- ✅ Use exact field names as specified
- ✅ Maintain field types (text, textarea, password)
- ✅ Mark required fields correctly

### **Testing:**
- 🧪 Test in a staging/test GHL location first
- 🧪 Verify all endpoints respond correctly
- 🧪 Test complete user flow from install to usage

---

## 📋 **Quick Checklist**

- [ ] OAuth Redirect URI updated
- [ ] External Auth API endpoint updated  
- [ ] External Auth form has OpenAI field
- [ ] Conversation Provider webhook updated
- [ ] Provider status endpoint updated
- [ ] Existing "Send Message" action updated
- [ ] NEW "Send WhatsApp Media" action added
- [ ] NEW "AI Chatbot Response" action added
- [ ] NEW "Check WhatsApp Number" action added
- [ ] All URLs tested and working
- [ ] Full integration tested in GHL

**Once all URLs are updated, your app will be fully production-ready! 🚀**

---

## 🎯 **Final Result**

After these updates, users will be able to:
1. **Install** your app from GHL marketplace ✅
2. **Authenticate** with their Waapify + OpenAI credentials ✅
3. **Use** all workflow actions for WhatsApp automation ✅
4. **Enjoy** unlimited AI responses with their own API key ✅

**Your app will be the most advanced WhatsApp solution in the GHL marketplace! 🏆**