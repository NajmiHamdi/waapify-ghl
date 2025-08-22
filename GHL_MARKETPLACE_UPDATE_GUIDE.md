# 🏪 GHL Marketplace Update Guide

## 🎯 **What You Need to Add**

### **Current Actions (What You Have):**
- ✅ **Send Message** - Basic text messaging

### **New Actions (What to Add):**
- 🆕 **Send WhatsApp Media** - Images, documents, files
- 🆕 **AI Chatbot Response** - Intelligent auto-replies
- 🆕 **Check WhatsApp Number** - Validate recipients

---

## 📋 **Step-by-Step Marketplace Update**

### **Step 1: Access GHL Marketplace Developer**
1. Go to: https://marketplace.gohighlevel.com/developer
2. Login with your developer account
3. Find your app: **`Waapify Integration`** (ID: `68a2e8f358c5af6573ce7c52-mehih392`)

### **Step 2: Add Action #1 - Send WhatsApp Media**

**Click "Workflow Actions" → "Add New Action"**

```json
Name: Send WhatsApp Media
Description: Send images, documents, and files via WhatsApp using Waapify
Category: Messaging
Type: Webhook

Webhook URL: https://your-domain.com/action/send-whatsapp-media-ghl
Method: POST
Headers: Content-Type: application/json

Fields:
1. Phone Number (required)
   - Type: Text
   - Field Name: number
   - Label: WhatsApp Number
   - Placeholder: 60123456789
   - Help: Recipient's WhatsApp number with country code

2. Message (required)
   - Type: Textarea
   - Field Name: message
   - Label: Message Text
   - Placeholder: Check out this file!
   - Help: Text message to send with the media

3. Media URL (required)
   - Type: Text
   - Field Name: media_url
   - Label: Media File URL
   - Placeholder: https://example.com/image.jpg
   - Help: Direct URL to the image, document, or file

4. Filename (optional)
   - Type: Text
   - Field Name: filename
   - Label: Custom Filename
   - Placeholder: document.pdf
   - Help: Optional custom name for the file
```

### **Step 3: Add Action #2 - AI Chatbot Response**

**Click "Add New Action"**

```json
Name: AI Chatbot Response
Description: Generate intelligent responses using ChatGPT and send via WhatsApp
Category: AI/Automation
Type: Webhook

Webhook URL: https://your-domain.com/action/ai-chatbot-ghl
Method: POST
Headers: Content-Type: application/json

Fields:
1. Customer Message (required)
   - Type: Textarea
   - Field Name: customerMessage
   - Label: Customer Message
   - Placeholder: What are your hours?
   - Help: The customer's message to generate a response for

2. Trigger Keywords (required)
   - Type: Text
   - Field Name: keywords
   - Label: Keywords
   - Placeholder: hours,time,open,closed,menu,price
   - Help: Comma-separated keywords that trigger AI response

3. Business Context (required)
   - Type: Textarea
   - Field Name: context
   - Label: Business Context
   - Placeholder: You are a restaurant assistant. Hours: 8AM-10PM. We serve Italian cuisine.
   - Help: Business information and context for AI responses

4. AI Persona (required)
   - Type: Text
   - Field Name: persona
   - Label: AI Personality
   - Placeholder: friendly and professional
   - Help: How the AI should respond (friendly, formal, casual, etc.)

5. Phone Number (optional)
   - Type: Text
   - Field Name: phone
   - Label: WhatsApp Number
   - Placeholder: 60123456789
   - Help: Send AI response via WhatsApp (leave empty to just generate)
```

### **Step 4: Add Action #3 - Check WhatsApp Number**

**Click "Add New Action"**

```json
Name: Check WhatsApp Number
Description: Verify if a phone number has WhatsApp registered
Category: Validation
Type: Webhook

Webhook URL: https://your-domain.com/action/check-whatsapp-phone
Method: POST
Headers: Content-Type: application/json

Fields:
1. Phone Number (required)
   - Type: Text
   - Field Name: number
   - Label: Phone Number
   - Placeholder: 60123456789
   - Help: Phone number to check for WhatsApp registration
```

---

## 🌐 **Update Your Domain URLs**

### **For Testing (Ngrok):**
Replace all URLs with your current ngrok URL:
```
https://be09ba89498b.ngrok-free.app/action/send-whatsapp-media-ghl
https://be09ba89498b.ngrok-free.app/action/ai-chatbot-ghl
https://be09ba89498b.ngrok-free.app/action/check-whatsapp-phone
```

### **For Production:**
Replace with your production domain:
```
https://yourapp.com/action/send-whatsapp-media-ghl
https://yourapp.com/action/ai-chatbot-ghl
https://yourapp.com/action/check-whatsapp-phone
```

---

## 🧪 **Test Your New Actions**

### **Test Media Action:**
```bash
curl -X POST https://your-domain.com/action/send-whatsapp-media-ghl \
  -H "Content-Type: application/json" \
  -d '{
    "number": "60168970072",
    "message": "Here is your document",
    "media_url": "https://via.placeholder.com/300x200.png",
    "filename": "test-image.png",
    "locationId": "test_location",
    "companyId": "test_company"
  }'
```

### **Test AI Chatbot Action:**
```bash
curl -X POST https://your-domain.com/action/ai-chatbot-ghl \
  -H "Content-Type: application/json" \
  -d '{
    "customerMessage": "What are your hours?",
    "keywords": "hours,time,open",
    "context": "You are a restaurant assistant. Hours: 8AM-10PM daily.",
    "persona": "friendly and helpful",
    "phone": "60168970072",
    "locationId": "test_location",
    "companyId": "test_company"
  }'
```

---

## 🔧 **Field Mapping in GHL Workflows**

### **How Users Will Use These Actions:**

#### **Send WhatsApp Media Workflow:**
```
Trigger: Contact submits form
Action: Send WhatsApp Media
- Phone: {{contact.phone}}
- Message: "Thanks for your inquiry! Here's our brochure."
- Media URL: https://your-site.com/brochure.pdf
- Filename: Company-Brochure.pdf
```

#### **AI Chatbot Workflow:**
```
Trigger: WhatsApp message received
Condition: If message contains trigger words
Action: AI Chatbot Response
- Customer Message: {{trigger.message}}
- Keywords: "hours,menu,booking,price"
- Context: "Restaurant hours: 8AM-10PM. Italian cuisine. Reservations recommended."
- Persona: "friendly Italian restaurant host"
- Phone: {{contact.phone}}
```

---

## 📊 **Expected Action Responses**

### **Send WhatsApp Media Response:**
```json
{
  "success": true,
  "messageId": "3EB084B8AC3EEEED5E0E1F",
  "message": "Media message sent successfully",
  "data": {
    "status": "success"
  }
}
```

### **AI Chatbot Response:**
```json
{
  "success": true,
  "triggered": true,
  "aiResponse": "We're open from 8AM to 10PM daily! 🍽️ Is there anything else you'd like to know?",
  "triggeredKeywords": ["hours"],
  "whatsappSent": true,
  "messageId": "3EB084B8AC3EEEED5E0E1G"
}
```

---

## 🚀 **Deployment Checklist**

### **Before Publishing Actions:**
- [ ] Test all endpoints with curl/Postman
- [ ] Verify OpenAI API key is configured
- [ ] Update webhook URLs to production domain
- [ ] Test actions in GHL workflow builder
- [ ] Verify external auth still works

### **After Publishing:**
- [ ] Install updated app in test location
- [ ] Create test workflows with new actions
- [ ] Test end-to-end functionality
- [ ] Document usage for customers

---

## 💡 **Pro Tips**

### **Action Naming:**
Use clear, descriptive names:
- ✅ "Send WhatsApp Media"
- ✅ "AI Chatbot Response" 
- ❌ "Send Media" (too generic)
- ❌ "AI Reply" (unclear)

### **Field Help Text:**
Always include helpful placeholder text and descriptions to guide users.

### **Error Handling:**
Your endpoints already include proper error responses for GHL to display to users.

### **Keywords Strategy:**
For AI Chatbot, suggest common keyword combinations:
- Customer Service: "help,support,issue,problem"
- Business Hours: "hours,time,open,closed,when"
- Products: "price,cost,menu,catalog,product"
- Booking: "book,appointment,reservation,schedule"

---

## 🎉 **What Users Will Get**

After this update, your GHL marketplace app will offer:

1. **📱 Basic SMS→WhatsApp** (existing)
2. **🖼️ Rich Media Messaging** (new)
3. **🤖 AI-Powered Auto-Responses** (new)
4. **✅ WhatsApp Number Validation** (new)

This makes your app a **complete WhatsApp automation solution** for GHL users! 🚀

---

## 🔄 **Next Steps**

1. **Add the 3 new actions** to your marketplace app
2. **Update webhook URLs** to your domain
3. **Test each action** thoroughly
4. **Create example workflows** for documentation
5. **Publish the updated app**

**Your app will be the most comprehensive WhatsApp solution in the GHL marketplace!** 🎯