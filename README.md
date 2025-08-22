# 📱 Waapify-GHL: WhatsApp Integration for GoHighLevel

Convert SMS to WhatsApp messages seamlessly in your GoHighLevel CRM with AI chatbot support, media messaging, and automated workflows.

![WhatsApp + GHL Integration](https://img.shields.io/badge/WhatsApp-GHL-25D366?style=for-the-badge&logo=whatsapp)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🚀 Features

### 📬 **Core Messaging**
- ✅ **SMS to WhatsApp Conversion** - Automatically send WhatsApp messages when SMS is triggered in GHL
- ✅ **Media Support** - Send images, documents, PDFs through WhatsApp
- ✅ **Phone Auto-formatting** - Malaysian number formatting (0123456789 → 60123456789)
- ✅ **Rate Limiting** - Prevent WhatsApp account bans with intelligent rate limiting
- ✅ **Message Logging** - Track all sent messages with delivery status

### 🤖 **AI Chatbot Integration**
- ✅ **ChatGPT Integration** - Intelligent auto-responses with OpenAI GPT
- ✅ **Keyword Triggers** - Set custom keywords to trigger AI responses
- ✅ **Custom Personas** - Define AI personality and context per location
- ✅ **User API Keys** - Each user uses their own OpenAI API key

### ⚙️ **GHL Workflow Actions**
- ✅ **Send WhatsApp Message** - Direct workflow action
- ✅ **Send WhatsApp Media** - Send files/images in workflows  
- ✅ **AI Generate & Send** - Generate AI response and send to WhatsApp
- ✅ **Check WhatsApp Number** - Validate phone numbers
- ✅ **Test Mode** - Test without sending real messages

### 🏢 **Multi-User & Scalability**
- ✅ **Per-Location Configuration** - Each GHL location has separate Waapify credentials
- ✅ **MySQL Database** - Persistent data storage, no more lost configurations
- ✅ **Auto-Recovery System** - Automatically restore lost installations
- ✅ **Production Ready** - Deployed with RunCloud, PM2, and SSL

## 🛠️ Installation & Setup

### Prerequisites
- GoHighLevel Developer Account
- Waapify Account ([Get API access](https://waapify.com))
- RunCloud Hosting (recommended) or any Node.js hosting
- MySQL Database
- OpenAI API Key (for AI features)

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/NajmiHamdi/waapify-ghl.git
cd waapify-ghl
npm install
```

2. **Environment Setup**
```bash
cp .env.production .env
# Edit .env with your credentials
```

3. **Database Setup**
- Import `database/schema.sql` to your MySQL database
- Update DB credentials in `.env`

4. **Deploy to RunCloud**
```bash
# Follow the complete guide in RUNCLOUD_SETUP.md
npm run build
npm run pm2:start
```

5. **Configure GHL Marketplace**
- Add your domain to GHL marketplace app settings
- Configure OAuth redirect URI
- Install the app in your GHL account

## 📋 Detailed Setup Guides

### 🚀 [RunCloud Deployment Guide](RUNCLOUD_SETUP.md)
Complete step-by-step instructions for deploying to RunCloud with auto-git, database setup, and SSL configuration.

### 🔗 [GHL Marketplace Integration](DOCS_GHL.md)
Comprehensive guide for setting up the GoHighLevel marketplace app, OAuth flow, and workflow actions.

### 📱 [Waapify API Documentation](WAAPIFY_FULL_API_DOCS.md)
Complete Waapify API reference for WhatsApp messaging, media, and instance management.

## ⚙️ Configuration

### Environment Variables
```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=waapify_ghl

# GHL OAuth
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret
GHL_REDIRECT_URI=https://yourdomain.com/authorize-handler
```

### Waapify Configuration (Per Location)
- **Access Token**: Your Waapify API access token
- **Instance ID**: WhatsApp instance identifier
- **Phone Number**: WhatsApp business number

### AI Chatbot Configuration (Optional)
- **OpenAI API Key**: User's own OpenAI API key
- **Keywords**: Comma-separated trigger words
- **Context**: AI assistant background context
- **Persona**: AI personality and tone

## 🚀 Usage

### In GoHighLevel Workflows

1. **Send WhatsApp Message**
   - Action: "Send WhatsApp Message"
   - Fields: Phone, Message
   - Auto-uses stored Waapify credentials

2. **Send WhatsApp Media**
   - Action: "Send WhatsApp Media"  
   - Fields: Phone, Message, File URL, Filename

3. **AI Generate & Send**
   - Action: "AI Generate & Send WhatsApp"
   - Fields: Phone, Customer Message, Context, Keywords

### Direct API Usage

```javascript
// Send text message
POST /api/send-message
{
  "number": "60123456789",
  "message": "Hello from GHL!",
  "locationId": "your_location_id",
  "companyId": "your_company_id"
}

// Send media message
POST /api/send-media
{
  "number": "60123456789", 
  "message": "Check out this image",
  "media_url": "https://example.com/image.jpg",
  "filename": "image.jpg",
  "locationId": "your_location_id",
  "companyId": "your_company_id"
}
```

## 🤖 AI Chatbot Features

### Auto-Response System
- Monitors incoming WhatsApp messages
- Triggers on configured keywords
- Generates contextual responses using ChatGPT
- Sends responses automatically via WhatsApp

### Keyword Configuration
```javascript
// Example keywords setup
{
  "keywords": "price,cost,pricing,how much,hours,help,support",
  "context": "You are a helpful customer service representative for ABC Company",
  "persona": "friendly, professional, and knowledgeable"
}
```

## 📊 Monitoring & Analytics

### Message Tracking
- All sent messages logged to database
- Delivery status tracking
- Error message logging
- Usage statistics per location

### Admin Endpoints
```bash
# Get message logs
GET /api/messages?companyId=xxx&locationId=xxx

# Get usage statistics  
GET /api/stats?companyId=xxx

# Backup installations
GET /admin/backup
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents WhatsApp API abuse
- **OAuth Authentication**: Secure GHL integration
- **API Key Isolation**: Each user's credentials stored separately
- **Error Handling**: Comprehensive error logging and recovery
- **Auto-Recovery**: Automatic restoration of lost configurations

## 📱 Supported Features

### WhatsApp Message Types
- ✅ Text messages
- ✅ Images (JPG, PNG, GIF)
- ✅ Documents (PDF, DOC, etc.)
- ✅ Media with captions

### GHL Integration
- ✅ SMS replacement in workflows
- ✅ Contact synchronization
- ✅ Conversation forwarding
- ✅ Custom workflow actions
- ✅ Marketplace app compliance

### Waapify API Coverage
- ✅ Send text messages
- ✅ Send media messages
- ✅ Check phone number validity
- ✅ Instance management
- ✅ Connection status monitoring

## 🔧 Development

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run production   # Run production build
npm run pm2:start    # Start with PM2
npm run pm2:logs     # View logs
```

### Database Schema
The app uses 5 main tables:
- `installations` - GHL OAuth data
- `waapify_configs` - Waapify credentials per location
- `message_logs` - Message tracking
- `ai_configs` - AI chatbot settings
- `rate_limits` - API usage limits

## 🚨 Troubleshooting

### Common Issues

1. **Messages Not Sending**
   - Check Waapify credentials in external auth
   - Verify phone number format
   - Check rate limits in logs

2. **Database Connection Errors**
   - Verify MySQL credentials
   - Check if database exists
   - Import schema.sql if needed

3. **GHL OAuth Issues**
   - Update redirect URI in GHL marketplace
   - Check client ID/secret configuration
   - Verify domain matches exactly

4. **AI Chatbot Not Responding**
   - Check OpenAI API key validity
   - Verify keyword configuration
   - Check AI config enabled status

### Logs & Debugging
```bash
# Application logs
npm run pm2:logs

# Database connection test
npm run test-db

# Waapify connection test
curl -X POST https://yourdomain.com/api/test-waapify
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/NajmiHamdi/waapify-ghl/issues)
- **API Questions**: Refer to [Waapify API Docs](WAAPIFY_FULL_API_DOCS.md)
- **GHL Integration**: See [GHL Documentation](DOCS_GHL.md)

## 🙏 Acknowledgments

- [GoHighLevel](https://gohighlevel.com) for the amazing CRM platform
- [Waapify](https://waapify.com) for reliable WhatsApp API services
- [OpenAI](https://openai.com) for GPT integration
- [RunCloud](https://runcloud.io) for excellent hosting platform

---

**Made with ❤️ for the GHL Community**

**Ready to transform your SMS workflows into WhatsApp conversations? Get started now! 🚀**