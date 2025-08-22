# 🤖 AI Chatbot Setup Guide

## ✅ **What You Now Have:**

### 🎯 **Management Dashboard**
Visit: **http://localhost:3068/dashboard** 
- Test all endpoints
- View system status  
- Check message logs
- Test WhatsApp sending

### 🚀 **New AI Chatbot Action for GHL Workflows**
**Endpoint:** `POST /action/ai-chatbot-response`

---

## 🔧 **Setup Instructions**

### 1. **Add OpenAI API Key**
Add this to your `.env` file:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. **Get OpenAI API Key**
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy and paste into your `.env` file

### 3. **Restart Server**
```bash
npm run dev
```

---

## 🎯 **How to Use AI Chatbot in GHL Workflows**

### **Method 1: Direct API Call**
```json
POST /action/ai-chatbot-response
{
  "customerMessage": "What are your hours?",
  "keywords": ["hours", "time", "open", "closed"],
  "context": "You are a restaurant assistant. Our hours are 8AM-10PM daily.",
  "persona": "friendly and helpful",
  "locationId": "your_ghl_location_id",
  "companyId": "your_ghl_company_id",
  "phone": "60123456789"
}
```

### **Method 2: GHL Workflow Action**
1. **Trigger:** When customer sends WhatsApp message
2. **Action:** Call webhook to `/action/ai-chatbot-response`
3. **AI Response:** Auto-generated and sent via WhatsApp

---

## 🔧 **GHL Workflow Setup Example**

### **Workflow Steps:**
1. **Trigger:** New WhatsApp message received
2. **Action:** HTTP Request to AI Chatbot
3. **Response:** AI automatically replies via WhatsApp

### **Webhook Configuration:**
```
URL: https://your-domain.com/action/ai-chatbot-response
Method: POST
Headers: Content-Type: application/json

Body:
{
  "customerMessage": "{{contact.last_message}}",
  "keywords": ["hours", "menu", "booking", "price"],
  "context": "You are a restaurant assistant. Hours: 8AM-10PM. We serve Italian cuisine.",
  "persona": "friendly and professional",
  "locationId": "{{contact.location_id}}",
  "companyId": "{{company.id}}",
  "phone": "{{contact.phone}}"
}
```

---

## 🎨 **Customization Examples**

### **Restaurant Bot:**
```json
{
  "keywords": ["hours", "menu", "booking", "reservation"],
  "context": "You are a fine dining restaurant assistant. Hours: 6PM-11PM. Reservations required.",
  "persona": "elegant and professional"
}
```

### **E-commerce Bot:**
```json
{
  "keywords": ["price", "shipping", "return", "product"],
  "context": "You are an e-commerce customer service rep. Free shipping over $50. 30-day returns.",
  "persona": "helpful and efficient"
}
```

### **Real Estate Bot:**
```json
{
  "keywords": ["viewing", "price", "location", "mortgage"],
  "context": "You are a real estate agent. Specializing in luxury properties in KL.",
  "persona": "knowledgeable and trustworthy"
}
```

---

## 📋 **Advanced Configuration**

### **Configure Bot Settings:**
```bash
POST /api/ai-chatbot/configure
{
  "companyId": "your_company",
  "locationId": "your_location", 
  "config": {
    "enabled": true,
    "keywords": ["support", "help", "info"],
    "context": "You are a business assistant",
    "persona": "professional"
  }
}
```

### **Get Bot Settings:**
```bash
GET /api/ai-chatbot/config?companyId=test&locationId=test
```

---

## 🔄 **Integration Flow**

### **Customer Journey:**
1. 📱 Customer sends: "What time do you close?"
2. 🔍 System detects keyword: "close" 
3. 🤖 AI generates response with your context
4. 📤 Auto-sends via WhatsApp: "We close at 10PM daily! 🕙"

### **Technical Flow:**
```
WhatsApp Message → GHL Webhook → AI Chatbot Action → ChatGPT API → WhatsApp Response
```

---

## 🧪 **Testing Your Setup**

### **1. Test AI Response (without WhatsApp):**
```bash
curl -X POST http://localhost:3068/action/ai-chatbot-response \
  -H "Content-Type: application/json" \
  -d '{
    "customerMessage": "What are your hours?",
    "keywords": ["hours"],
    "context": "Restaurant hours: 8AM-10PM",
    "persona": "friendly",
    "locationId": "test",
    "companyId": "test"
  }'
```

### **2. Test Full Integration (with WhatsApp):**
Add `"phone": "60123456789"` to the above request

### **3. Check Logs:**
```bash
curl "http://localhost:3068/api/message-logs?companyId=test&locationId=test"
```

---

## 🎯 **GHL Marketplace Action Setup**

### **Create Custom Action:**
1. **Name:** "AI Chatbot Response"
2. **Type:** "Webhook" 
3. **URL:** `https://your-domain.com/action/ai-chatbot-response`
4. **Method:** POST
5. **Fields:**
   - customerMessage (text)
   - keywords (array)
   - context (textarea)
   - persona (text)

### **Use in Workflows:**
- **Trigger:** Message received
- **Action:** AI Chatbot Response
- **Result:** Automated intelligent replies

---

## 🚀 **Production Deployment**

### **Required:**
- ✅ OpenAI API key configured
- ✅ Real domain (not localhost)
- ✅ SSL certificate 
- ✅ Webhook URLs updated in GHL

### **Recommended:**
- 🗄️ Database migration (from JSON files)
- 📊 Monitoring and analytics
- 🛡️ Rate limiting for OpenAI API
- 💾 Conversation history storage

---

## 🎉 **Ready to Use!**

Your AI Chatbot is now ready for:
- ✅ Keyword-triggered responses
- ✅ Custom business context
- ✅ Personality configuration  
- ✅ Automatic WhatsApp replies
- ✅ GHL workflow integration
- ✅ Message logging and tracking

**Next:** Add your OpenAI API key and start testing! 🚀