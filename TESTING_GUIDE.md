# Waapify-GHL Plugin Testing & Deployment Guide

## PART 1: LOCAL TESTING SETUP

### Step 1: Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# Server will run on http://localhost:3068

# 3. Install ngrok (if not installed)
brew install ngrok

# 4. Start ngrok tunnel
ngrok http 3068
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### Step 2: Update Environment for Testing
Your current .env file:
```
GHL_APP_CLIENT_ID=689f65551daa1d452273c422-meegkrcn
GHL_APP_CLIENT_SECRET=6178949b-7d74-406d-a139-aeba6251f2ce
GHL_APP_SSO_KEY=51f2396f-8368-4974-bca8-4c4da87f0610
GHL_REDIRECT_URI=https://waaghl.waapify.com/authorize-handler
GHL_API_DOMAIN=https://services.leadconnectorhq.com
PORT=3068
```

## PART 2: OAUTH & BASIC API TESTING

### Test 1: Check Server Health
```bash
curl https://YOUR_NGROK_URL.ngrok.io/
# Should return HTML page
```

### Test 2: OAuth Testing URLs
**Add to GHL Marketplace Redirect URLs:**
```
https://YOUR_NGROK_URL.ngrok.io/authorize-handler
```

**Test OAuth Success API (After OAuth):**
```bash
# Test Location-level API (existing endpoint in your code)
curl "https://YOUR_NGROK_URL.ngrok.io/example-api-call-location?companyId=NQFaKZYtxW6gENuYYALt&locationId=rjsdYp4AhllL4EJDzQCP"

# Expected Response: Contact list data from GHL
# If OAuth working: Returns JSON with contacts
# If OAuth broken: Returns error about token not found
```

**Note:** The `/example-api-call` endpoint doesn't exist in your original code, so use the location endpoint above to test OAuth functionality.

## PART 3: CONTACT API TESTING

### Test 3: Create Contact
**POST Request:**
```bash
curl -X POST https://YOUR_NGROK_URL.ngrok.io/test-create-contact \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "NQFaKZYtxW6gENuYYALt",
    "locationId": "rjsdYp4AhllL4EJDzQCP",
    "firstName": "Kamal",
    "lastName": "Zamri",
    "email": "kamalzamri96@gmail.com",
    "phone": "+60128973272"
  }'
```

**Postman Setup:**
- Method: POST
- URL: https://YOUR_NGROK_URL.ngrok.io/test-create-contact
- Headers: Content-Type: application/json
- Body (raw JSON):
```json
{
  "companyId": "NQFaKZYtxW6gENuYYALt",
  "locationId": "rjsdYp4AhllL4EJDzQCP",
  "firstName": "Kamal",
  "lastName": "Zamri",
  "email": "kamalzamri96@gmail.com",
  "phone": "+60128973272"
}
```

### Test 4: List Contacts
```bash
curl "https://YOUR_NGROK_URL.ngrok.io/list-contacts?companyId=NQFaKZYtxW6gENuYYALt&locationId=rjsdYp4AhllL4EJDzQCP"
```

### Test 5: Update Contact
```bash
curl -X PUT https://YOUR_NGROK_URL.ngrok.io/update-contact \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "NQFaKZYtxW6gENuYYALt",
    "locationId": "rjsdYp4AhllL4EJDzQCP",
    "contactId": "CONTACT_ID_FROM_CREATE_RESPONSE",
    "firstName": "Kamal Updated",
    "lastName": "Zamri Updated",
    "email": "kamalupdated@gmail.com"
  }'
```

### Test 6: Delete Contact
```bash
curl -X DELETE https://YOUR_NGROK_URL.ngrok.io/delete-contact \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "NQFaKZYtxW6gENuYYALt",
    "locationId": "rjsdYp4AhllL4EJDzQCP",
    "contactId": "CONTACT_ID_TO_DELETE"
  }'
```

## PART 4: WAAPIFY CONFIGURATION TESTING

### Test 7: Save Waapify Configuration
```bash
curl -X POST https://YOUR_NGROK_URL.ngrok.io/save-waapify-config \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "NQFaKZYtxW6gENuYYALt",
    "locationId": "rjsdYp4AhllL4EJDzQCP",
    "accessToken": "1740aed492830374b432091211a6628d",
    "instanceId": "673F5A50E7194",
    "whatsappNumber": "60123456789"
  }'
```

### Test 8: Configuration Page
```
Visit: https://YOUR_NGROK_URL.ngrok.io/configure?companyId=NQFaKZYtxW6gENuYYALt&locationId=rjsdYp4AhllL4EJDzQCP
```

## PART 5: WHATSAPP API TESTING

### Test 9: SMS Override (WhatsApp Send)
```bash
curl -X POST https://YOUR_NGROK_URL.ngrok.io/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "60123456789",
    "message": "Test WhatsApp dari GHL",
    "locationId": "rjsdYp4AhllL4EJDzQCP",
    "companyId": "NQFaKZYtxW6gENuYYALt"
  }'
```

### Test 10: WhatsApp Text Action
```bash
curl -X POST https://YOUR_NGROK_URL.ngrok.io/action/send-whatsapp-text \
  -H "Content-Type: application/json" \
  -d '{
    "number": "60123456789",
    "message": "Test dari GHL Marketplace Action",
    "instance_id": "673F5A50E7194",
    "access_token": "1740aed492830374b432091211a6628d",
    "type": "text"
  }'
```

### Test 11: WhatsApp Media Action
```bash
curl -X POST https://YOUR_NGROK_URL.ngrok.io/action/send-whatsapp-media \
  -H "Content-Type: application/json" \
  -d '{
    "number": "60123456789",
    "message": "Test media dari GHL",
    "media_url": "https://i.pravatar.cc/300",
    "filename": "avatar.jpg",
    "instance_id": "673F5A50E7194",
    "access_token": "1740aed492830374b432091211a6628d",
    "type": "media"
  }'
```

### Test 12: Check WhatsApp Phone
```bash
curl -X POST https://YOUR_NGROK_URL.ngrok.io/action/check-whatsapp-phone \
  -H "Content-Type: application/json" \
  -d '{
    "number": "60123456789",
    "instance_id": "673F5A50E7194",
    "access_token": "1740aed492830374b432091211a6628d"
  }'
```

### Test 13: Webhook Testing
```bash
# Test webhook endpoint manually
curl -X POST https://YOUR_NGROK_URL.ngrok.io/webhook/waapify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "data": {
      "from": "60123456789",
      "message": "Test incoming message",
      "instance_id": "673F5A50E7194"
    }
  }'
```

## PART 6: GHL MARKETPLACE SETTINGS

### Conversation Provider Settings
```
Name: Waapify
Type: SMS
Delivery URL: https://YOUR_NGROK_URL.ngrok.io/api/send-sms
Is this a Custom Conversation Provider?: ✅ YES
Always show this Conversation Provider?: ✅ YES
```

### Redirect URLs (Add ngrok URL temporarily)
```
https://YOUR_NGROK_URL.ngrok.io/authorize-handler
https://waaghl.waapify.com/authorize-handler (keep for production)
```

### Actions Setup

#### Action 1: Send WhatsApp Text
```
Name: Send WhatsApp Text
Description: Send text message via WhatsApp

Fields:
- number (string, required) - Phone number
- message (string, required) - Message text
- instance_id (string, required) - Waapify Instance ID  
- access_token (string, required) - Waapify Access Token
- type (string, required, default: "text") - Message type

URL: https://YOUR_NGROK_URL.ngrok.io/action/send-whatsapp-text
Method: POST
Headers: Content-Type: application/json
Body: Raw JSON
```

#### Action 2: Send WhatsApp Media
```
Name: Send WhatsApp Media
Description: Send media/file via WhatsApp

Fields:
- number (string, required) - Phone number
- message (string, required) - Caption text
- media_url (string, required) - Media file URL
- filename (string, optional) - File name
- instance_id (string, required) - Waapify Instance ID
- access_token (string, required) - Waapify Access Token  
- type (string, required, default: "media") - Message type

URL: https://YOUR_NGROK_URL.ngrok.io/action/send-whatsapp-media
Method: POST
```

#### Action 3: Check WhatsApp Phone
```
Name: Check WhatsApp Phone
Description: Check if phone number has WhatsApp

Fields:
- number (string, required) - Phone number to check
- instance_id (string, required) - Waapify Instance ID
- access_token (string, required) - Waapify Access Token

URL: https://YOUR_NGROK_URL.ngrok.io/action/check-whatsapp-phone
Method: POST
```

### Webhook Configuration (in Waapify Dashboard)
```
Webhook URL: https://YOUR_NGROK_URL.ngrok.io/webhook/waapify
Enable: true
```

## PART 7: GITHUB & RENDER DEPLOYMENT

### Step 1: Prepare for Production
```bash
# 1. Create .gitignore
echo "node_modules/
.env
dist/
*.log" > .gitignore

# 2. Initialize git (if not done)
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit - Waapify GHL integration"
```

### Step 2: Push to GitHub
```bash
# 1. Create repository on GitHub (waapify-ghl)

# 2. Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/waapify-ghl.git

# 3. Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

**Render Dashboard Setup:**
1. Go to https://render.com
2. Connect GitHub account
3. Create New → Web Service
4. Connect repository: waapify-ghl
5. Settings:
   ```
   Name: waapify-ghl
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

**Environment Variables in Render:**
```
GHL_APP_CLIENT_ID=689f65551daa1d452273c422-meegkrcn
GHL_APP_CLIENT_SECRET=6178949b-7d74-406d-a139-aeba6251f2ce
GHL_APP_SSO_KEY=51f2396f-8368-4974-bca8-4c4da87f0610
GHL_REDIRECT_URI=https://waaghl.waapify.com/authorize-handler
GHL_API_DOMAIN=https://services.leadconnectorhq.com
PORT=3068
NODE_ENV=production
```

### Step 4: Update Marketplace for Production
```
Remove ngrok URL from redirect URLs
Keep only: https://waaghl.waapify.com/authorize-handler

Update Conversation Provider:
Delivery URL: https://waaghl.waapify.com/api/send-sms

Update Actions URLs:
- Send WhatsApp Text: https://waaghl.waapify.com/action/send-whatsapp-text
- Send WhatsApp Media: https://waaghl.waapify.com/action/send-whatsapp-media  
- Check WhatsApp Phone: https://waaghl.waapify.com/action/check-whatsapp-phone
```

### Step 5: Update Waapify Webhook
```
In Waapify Dashboard:
Webhook URL: https://waaghl.waapify.com/webhook/waapify
```

## PART 8: PRODUCTION TESTING

### Test Production Deployment
```bash
# Test all endpoints with production URL
# Replace YOUR_NGROK_URL.ngrok.io with waaghl.waapify.com

# Example:
curl "https://waaghl.waapify.com/list-contacts?companyId=NQFaKZYtxW6gENuYYALt&locationId=rjsdYp4AhllL4EJDzQCP"
```

### End-to-End Testing Flow
1. Install plugin from marketplace
2. Complete OAuth flow → Should redirect to configuration page
3. Enter Waapify credentials → Should save and redirect to GHL
4. Test SMS sending from GHL → Should send via WhatsApp
5. Send WhatsApp message to your number → Should appear in GHL conversations
6. Test workflow actions → Should execute WhatsApp functions

## TROUBLESHOOTING

### Common Issues:
1. **OAuth fails**: Check client ID/secret in .env
2. **Configuration not saving**: Check companyId/locationId match
3. **WhatsApp not sending**: Verify Waapify credentials and instance status
4. **Webhook not receiving**: Check Waapify webhook URL setup
5. **Actions not working**: Verify marketplace action URLs and field mappings

### Debug Commands:
```bash
# Check server logs
npm run dev

# Test API responses
curl -v [ENDPOINT_URL]

# Check installations.json
cat src/installations.json
```

## USEFUL ENDPOINTS SUMMARY

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/authorize-handler` | GET | OAuth callback |
| `/configure` | GET | Configuration page |
| `/save-waapify-config` | POST | Save Waapify settings |
| `/api/send-sms` | POST | SMS override (WhatsApp) |
| `/action/send-whatsapp-text` | POST | Send text action |
| `/action/send-whatsapp-media` | POST | Send media action |
| `/action/check-whatsapp-phone` | POST | Check phone action |
| `/webhook/waapify` | POST | Incoming webhook |
| `/test-create-contact` | POST | Create contact |
| `/list-contacts` | GET | List contacts |
| `/update-contact` | PUT | Update contact |
| `/delete-contact` | DELETE | Delete contact |

---

**Important:** Always test with ngrok first, then deploy to production!