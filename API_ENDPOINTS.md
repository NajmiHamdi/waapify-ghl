# 🚀 Waapify-GHL API Endpoints

## Core Integration Endpoints

### 📱 GHL Conversation Provider
- **POST** `/webhook/provider-outbound` - Handles SMS→WhatsApp conversion from GHL
- **GET** `/provider/status` - Check provider health and configuration
- **GET** `/api/phone-numbers` - List available WhatsApp numbers for GHL

### 🔐 Authentication & Setup  
- **GET** `/authorize-handler` - OAuth callback for GHL marketplace
- **POST** `/external-auth` - Validate and store Waapify credentials
- **GET** `/configure` - Configuration UI for Waapify setup

## 📨 WhatsApp Messaging

### ✉️ Direct Message Sending
- **POST** `/action/send-whatsapp-text` - Send text message
- **POST** `/action/send-whatsapp-media` - Send media (images, files)
- **POST** `/action/check-whatsapp-phone` - Verify if number has WhatsApp

### 👥 Group Messages
- **POST** `/api/waapify/send-group` - Send message to WhatsApp group

### 📊 Message Tracking
- **GET** `/api/message-logs` - Get message history and delivery status
- **GET** `/api/message-status/:messageId` - Check specific message status

## 🔧 Instance Management

### ⚙️ Waapify Instance Control
- **GET** `/api/waapify/qr-code` - Get QR code for WhatsApp login
- **POST** `/api/waapify/reboot` - Reboot WhatsApp instance

## 📋 Contact Management
- **GET** `/list-contacts` - List GHL contacts
- **POST** `/test-create-contact` - Create test contact
- **PUT** `/update-contact` - Update contact information
- **DELETE** `/delete-contact` - Delete contact

## 🛡️ Safety Features

### 🚦 Rate Limiting
- **Automatic**: 10 messages per minute per location
- **Response**: HTTP 429 with retry-after when exceeded
- **Purpose**: Prevents WhatsApp account bans

### 📝 Message Logging
- **Storage**: In-memory (last 1000 messages per location)
- **Tracking**: Send time, delivery status, message type
- **Access**: Via `/api/message-logs` endpoint

### 🎯 Media Support
- **Types**: Images, documents, audio files
- **Method**: Via `attachments` field in GHL webhook
- **API**: Waapify media endpoint integration

## 🔄 Webhook Endpoints

### 📥 Incoming Messages
- **POST** `/webhook/waapify` - Receive WhatsApp messages from Waapify
- **Forward**: Automatically creates GHL conversation

## 🏠 UI & Static Files
- **GET** `/` - Main dashboard interface
- **Static**: Vue.js frontend in `/ui/dist/`

---

## 🚀 Quick Test Commands

```bash
# Test provider status
curl -X GET "http://localhost:3068/provider/status?locationId=test&companyId=test"

# Test external auth
curl -X POST http://localhost:3068/external-auth \
  -H "Content-Type: application/json" \
  -d '{"access_token":"your_token","instance_id":"your_instance"}'

# Send WhatsApp message
curl -X POST http://localhost:3068/action/send-whatsapp-text \
  -H "Content-Type: application/json" \
  -d '{"number":"60123456789","message":"Hello","instance_id":"your_instance","access_token":"your_token"}'

# Check message logs
curl -X GET "http://localhost:3068/api/message-logs?companyId=test&locationId=test"
```

## 📈 Production Deployment Checklist

- [ ] Replace JSON file storage with proper database
- [ ] Set up real domain and SSL certificates
- [ ] Configure production-level rate limiting
- [ ] Add proper authentication for admin endpoints
- [ ] Set up monitoring and alerting
- [ ] Implement webhook security verification
- [ ] Add backup and recovery procedures