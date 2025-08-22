# 🚀 GHL Marketplace Actions Configuration

## 📋 **Actions to Add in GHL Marketplace Developer Panel**

### **Action 1: Send WhatsApp Media**

**Basic Info:**
- **Name:** Send WhatsApp Media
- **Description:** Send images, documents, and files via WhatsApp
- **Category:** Messaging
- **Type:** Webhook

**Webhook Configuration:**
```
Method: POST
URL: https://your-domain.com/action/send-whatsapp-media
Headers: Content-Type: application/json
```

**Input Fields:**
1. **Phone Number** (required)
   - Type: Text
   - Field Name: `number`
   - Placeholder: 60123456789
   - Description: Recipient WhatsApp number

2. **Message** (required)
   - Type: Text Area
   - Field Name: `message`
   - Placeholder: Your message here
   - Description: Text message to send with media

3. **Media URL** (required)
   - Type: Text
   - Field Name: `media_url`
   - Placeholder: https://example.com/image.jpg
   - Description: Direct URL to the file/image

4. **Filename** (optional)
   - Type: Text
   - Field Name: `filename`
   - Placeholder: document.pdf
   - Description: Custom filename for the media

**Expected Response:**
```json
{
  "success": true,
  "messageId": "3EB084B8AC3EEEED5E0E1F",
  "data": {
    "status": "success",
    "message": "Media sent successfully"
  }
}
```

---

### **Action 2: AI Chatbot Response**

**Basic Info:**
- **Name:** AI Chatbot Response
- **Description:** Generate intelligent responses using ChatGPT and send via WhatsApp
- **Category:** AI/Automation
- **Type:** Webhook

**Webhook Configuration:**
```
Method: POST
URL: https://your-domain.com/action/ai-chatbot-response
Headers: Content-Type: application/json
```

**Input Fields:**
1. **Customer Message** (required)
   - Type: Text Area
   - Field Name: `customerMessage`
   - Placeholder: What are your hours?
   - Description: The customer's message to respond to

2. **Keywords** (required)
   - Type: Text
   - Field Name: `keywords`
   - Placeholder: hours,time,open,closed
   - Description: Comma-separated trigger keywords

3. **Business Context** (required)
   - Type: Text Area
   - Field Name: `context`
   - Placeholder: You are a restaurant assistant. Hours: 8AM-10PM daily.
   - Description: Business information for AI context

4. **AI Persona** (required)
   - Type: Text
   - Field Name: `persona`
   - Placeholder: friendly and professional
   - Description: AI response style/personality

5. **Phone Number** (optional)
   - Type: Text
   - Field Name: `phone`
   - Placeholder: 60123456789
   - Description: Send response via WhatsApp (leave empty to just generate)

**Expected Response:**
```json
{
  "success": true,
  "triggered": true,
  "aiResponse": "We're open from 8AM to 10PM daily! 🍽️ Is there anything specific you'd like to know?",
  "triggeredKeywords": ["hours"],
  "whatsappSent": true
}
```

---

### **Action 3: Check WhatsApp Number**

**Basic Info:**
- **Name:** Check WhatsApp Number
- **Description:** Verify if a phone number has WhatsApp
- **Category:** Validation
- **Type:** Webhook

**Webhook Configuration:**
```
Method: POST
URL: https://your-domain.com/action/check-whatsapp-phone
Headers: Content-Type: application/json
```

**Input Fields:**
1. **Phone Number** (required)
   - Type: Text
   - Field Name: `number`
   - Placeholder: 60123456789
   - Description: Phone number to check

**Expected Response:**
```json
{
  "success": true,
  "isWhatsApp": true,
  "data": {
    "registered": true,
    "number": "60123456789"
  }
}
```

---

## 🔧 **How to Add These Actions in GHL Marketplace**

### **Step 1: Login to GHL Marketplace Developer**
1. Go to https://marketplace.gohighlevel.com/developer
2. Login with your developer account
3. Find your app: `68a2e8f358c5af6573ce7c52-mehih392`

### **Step 2: Add New Actions**
1. Click **"Workflow Actions"** tab
2. Click **"Add New Action"**
3. Fill in the details above for each action
4. **Important:** Use your real domain (not localhost)

### **Step 3: Update Domain URLs**
Replace `https://your-domain.com` with your actual domain:
- Production: `https://your-production-domain.com`  
- Testing: `https://your-ngrok-url.ngrok-free.app`

### **Step 4: Test Actions**
1. Install app in test GHL location
2. Create workflow with new actions
3. Test each action functionality

---

## 📋 **Current vs New Actions**

### **Before (What You Have):**
```
✅ Send Message - Basic text messaging
✅ External Auth - Waapify credential setup
```

### **After (What You'll Have):**
```
✅ Send Message - Basic text messaging
✅ Send WhatsApp Media - Images, documents, files
✅ AI Chatbot Response - Intelligent auto-replies
✅ Check WhatsApp Number - Validate recipients
✅ External Auth - Waapify credential setup
```

---

## 🚀 **Advanced Workflow Examples**

### **Example 1: Smart Customer Support**
```
Trigger: New contact message
Action 1: Check WhatsApp Number
Condition: If has WhatsApp
Action 2: AI Chatbot Response (keywords: support,help,issue)
Action 3: Send WhatsApp Media (send FAQ PDF if needed)
```

### **Example 2: Marketing Campaign**
```
Trigger: Contact tagged as "interested"
Action 1: Send WhatsApp Media (product catalog image)
Action 2: Wait 5 minutes
Action 3: AI Chatbot Response (persona: sales assistant)
```

### **Example 3: Appointment Booking**
```
Trigger: Contact requests appointment
Action 1: AI Chatbot Response (keywords: book,appointment,schedule)
Action 2: Send WhatsApp Media (calendar booking link image)
```

---

## 🔑 **Important Notes**

### **Domain Requirements:**
- Use **real domain** for production
- Use **ngrok URL** for testing
- Update webhook URLs when domain changes

### **Authentication:**
- All actions use existing External Auth setup
- No additional authentication needed
- Waapify credentials stored per location

### **Rate Limiting:**
- Built-in 10 messages/minute per location
- Prevents WhatsApp account bans
- Automatic retry handling

---

## ✅ **Action Priority**

### **High Priority (Add First):**
1. **AI Chatbot Response** - Most valuable for automation
2. **Send WhatsApp Media** - Essential for rich messaging

### **Medium Priority:**
3. **Check WhatsApp Number** - Good for validation

**Start with AI Chatbot Response - it's the game-changer!** 🤖