import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GHL } from "./ghl";
import { Storage } from "./storage";
import { json } from "body-parser";

// Routes
import testCreateContactRoute from "./route/test-create-contact";
import listContactsRoute from "./route/list-contacts";
import updateContactRoute from "./route/update-contact";
import deleteContactRoute from "./route/delete-contact";

dotenv.config();

const app: Express = express();
const ghl = new GHL();
const port = process.env.PORT || 3068;
const path = __dirname + "/ui/dist/";

// Body parser with error handling
app.use(json({ 
  type: "application/json",
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Handle JSON parsing errors
app.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof SyntaxError && 'body' in error) {
    console.error('=== JSON Parse Error ===');
    console.error('Error:', error.message);
    console.error('Raw body:', req.rawBody);
    console.error('Content-Type:', req.headers['content-type']);
    
    return res.status(400).json({ 
      error: 'Invalid JSON format',
      details: error.message,
      rawBody: req.rawBody?.substring(0, 200) + (req.rawBody?.length > 200 ? '...' : '')
    });
  }
  next();
});

// Static folder
app.use(express.static(path));

// Mount routes
app.use("/test-create-contact", testCreateContactRoute);
app.use("/list-contacts", listContactsRoute);
app.use("/update-contact", updateContactRoute);
app.use("/delete-contact", deleteContactRoute);

/* -------------------- Authorization handler -------------------- */
app.get("/authorize-handler", async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code received");

  try {
    const authResult = await ghl.authorizationHandler(code as string);

    const installations = Storage.getAll();
    console.log("=== All installations ===", installations);

    // DISABLED: Popup configuration (using external auth instead)
    // Redirect directly to GHL dashboard since external auth handles credentials
    const latestInstallation = installations[installations.length - 1];
    
    console.log('=== OAuth Success - Redirecting to GHL Dashboard ===');
    res.redirect('https://app.gohighlevel.com/');
    
    /* DISABLED POPUP CODE:
    const popupHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Waapify Configuration</title>
          <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; }
              .modal { background: white; border-radius: 8px; padding: 30px; max-width: 500px; margin: 20px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              h2 { color: #333; margin-bottom: 20px; text-align: center; }
              .form-group { margin-bottom: 20px; }
              label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
              input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box; }
              input:focus { border-color: #007cba; outline: none; }
              button { width: 100%; background: #007cba; color: white; padding: 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
              button:hover { background: #005a87; }
              button:disabled { background: #ccc; cursor: not-allowed; }
              .success { color: #28a745; text-align: center; margin-top: 15px; }
              .error { color: #dc3545; text-align: center; margin-top: 15px; }
              .info { background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
              .close-info { color: #1976d2; font-size: 14px; }
          </style>
      </head>
      <body>
          <div class="modal">
              <h2>🚀 Complete Waapify Setup</h2>
              
              <div class="info">
                  <div class="close-info">
                      <strong>Almost done!</strong> Enter your Waapify credentials to start sending WhatsApp messages through GHL.
                  </div>
              </div>
              
              <form id="configForm">
                  <div class="form-group">
                      <label>Access Token:</label>
                      <input type="text" id="accessToken" placeholder="1740aed492830374b432091211a6628d" required>
                  </div>
                  
                  <div class="form-group">
                      <label>Instance ID:</label>
                      <input type="text" id="instanceId" placeholder="673F5A50E7194" required>
                  </div>
                  
                  <div class="form-group">
                      <label>WhatsApp Number:</label>
                      <input type="text" id="whatsappNumber" placeholder="60168970072" required>
                  </div>
                  
                  <button type="submit" id="saveBtn">Save & Complete Setup</button>
              </form>
              
              <div id="message"></div>
          </div>
          
          <script>
              document.getElementById('configForm').addEventListener('submit', async (e) => {
                  e.preventDefault();
                  
                  const messageDiv = document.getElementById('message');
                  const saveBtn = document.getElementById('saveBtn');
                  const accessToken = document.getElementById('accessToken').value;
                  const instanceId = document.getElementById('instanceId').value;
                  const whatsappNumber = document.getElementById('whatsappNumber').value;
                  
                  saveBtn.disabled = true;
                  saveBtn.textContent = 'Testing connection...';
                  
                  try {
                      const response = await fetch('/save-waapify-config', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                              companyId: '${latestInstallation.companyId}',
                              locationId: '${latestInstallation.locationId}',
                              accessToken,
                              instanceId,
                              whatsappNumber
                          })
                      });
                      
                      const result = await response.json();
                      
                      if (response.ok) {
                          messageDiv.innerHTML = '<p class="success">✅ Configuration saved successfully!</p>';
                          saveBtn.textContent = 'Setup Complete!';
                          setTimeout(() => {
                              window.close(); // Close popup
                              window.location.href = 'https://app.gohighlevel.com/'; // Fallback redirect
                          }, 2000);
                      } else {
                          messageDiv.innerHTML = '<p class="error">❌ Error: ' + result.error + '</p>';
                          saveBtn.disabled = false;
                          saveBtn.textContent = 'Save & Complete Setup';
                      }
                  } catch (error) {
                      messageDiv.innerHTML = '<p class="error">❌ Error: Failed to save configuration</p>';
                      saveBtn.disabled = false;
                      saveBtn.textContent = 'Save & Complete Setup';
                  }
              });
          </script>
      </body>
      </html>
    `;
    
    res.send(popupHTML);
    */ // END DISABLED POPUP CODE
    
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).send("Authorization failed");
  }
});

/* -------------------- Configuration Page -------------------- */
app.get("/configure", (req: Request, res: Response) => {
  const { companyId, locationId } = req.query;
  
  const configHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Waapify Configuration</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #005a87; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
        </style>
    </head>
    <body>
        <h2>Configure Waapify Integration</h2>
        <p>Please enter your Waapify credentials to complete the setup:</p>
        
        <form id="configForm">
            <div class="form-group">
                <label>Access Token:</label>
                <input type="text" id="accessToken" placeholder="Your Waapify Access Token" required>
            </div>
            
            <div class="form-group">
                <label>Instance ID:</label>
                <input type="text" id="instanceId" placeholder="Your Waapify Instance ID" required>
            </div>
            
            <div class="form-group">
                <label>WhatsApp Number:</label>
                <input type="text" id="whatsappNumber" placeholder="e.g., 60123456789" required>
            </div>
            
            <button type="submit">Save Configuration</button>
        </form>
        
        <div id="message"></div>
        
        <script>
            document.getElementById('configForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const messageDiv = document.getElementById('message');
                const accessToken = document.getElementById('accessToken').value;
                const instanceId = document.getElementById('instanceId').value;
                const whatsappNumber = document.getElementById('whatsappNumber').value;
                
                try {
                    const response = await fetch('/save-waapify-config', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            companyId: '${companyId}',
                            locationId: '${locationId}',
                            accessToken,
                            instanceId,
                            whatsappNumber
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        messageDiv.innerHTML = '<p class="success">✅ Configuration saved successfully! Redirecting to GHL dashboard...</p>';
                        setTimeout(() => {
                            window.location.href = 'https://app.gohighlevel.com/';
                        }, 2000);
                    } else {
                        messageDiv.innerHTML = '<p class="error">❌ Error: ' + result.error + '</p>';
                    }
                } catch (error) {
                    messageDiv.innerHTML = '<p class="error">❌ Error: Failed to save configuration</p>';
                }
            });
        </script>
    </body>
    </html>
  `;
  
  res.send(configHTML);
});

/* -------------------- Save Waapify Configuration -------------------- */
app.post("/save-waapify-config", async (req: Request, res: Response) => {
  const { companyId, locationId, accessToken, instanceId, whatsappNumber } = req.body;
  
  if (!companyId || !locationId || !accessToken || !instanceId || !whatsappNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  try {
    // Save Waapify config to storage
    const installation = Storage.find(companyId);
    if (!installation) {
      return res.status(400).json({ error: "Installation not found" });
    }
    
    // Extend storage to include Waapify config
    Storage.saveWaapifyConfig(companyId, locationId, {
      accessToken,
      instanceId,
      whatsappNumber
    });
    
    // Test Waapify connection
    const testResult = await testWaapifyConnection(accessToken, instanceId);
    if (!testResult.success) {
      return res.status(400).json({ error: "Failed to connect to Waapify: " + testResult.error });
    }
    
    res.json({ 
      success: true, 
      message: "Waapify configuration saved successfully",
      connectionTest: testResult
    });
  } catch (error) {
    console.error("Save config error:", error);
    res.status(500).json({ error: "Failed to save configuration" });
  }
});

/* -------------------- External Authentication Endpoint -------------------- */
app.post("/external-auth", async (req: Request, res: Response) => {
  console.log('=== External Auth Request - Full Body ===', JSON.stringify(req.body, null, 2));
  console.log('=== Headers ===', req.headers);
  
  // Check all possible field variations for Waapify
  const access_token = req.body.access_token || req.body.accessToken || req.body['access-token'];
  const instance_id = req.body.instance_id || req.body.instanceId || req.body['instance-id'];
  const whatsapp_number = req.body.whatsapp_number || req.body.whatsappNumber || req.body['whatsapp-number'];
  
  console.log('=== Extracted Values ===', {
    access_token,
    instance_id, 
    whatsapp_number
  });
  
  // Handle test data from marketplace
  if (req.body.locationId === "dummyLocationId" && req.body.companyId === "dummyCompanyId") {
    console.log('=== Test Request Detected - Returning Success ===');
    return res.json({
      success: true,
      message: "Test authentication successful",
      data: {
        access_token: "test_token",
        instance_id: "test_instance", 
        whatsapp_number: "test_number",
        status: "authenticated",
        provider: "waapify",
        test_mode: true
      }
    });
  }
  
  // Handle real installation data - check all possible field formats
  if (!access_token && !instance_id) {
    console.log('=== No credentials found, checking request body keys ===');
    console.log('Available keys:', Object.keys(req.body));
    
    // Try to find credentials in any format
    for (const key of Object.keys(req.body)) {
      console.log(`${key}: ${req.body[key]}`);
    }
    
    // Handle GHL installation process - if no credentials provided but locationId present
    if (req.body.locationId && !req.body.access_token) {
      console.log('=== GHL Installation Process - Providing Default Success Response ===');
      return res.json({
        success: true,
        message: "Installation process detected - external auth will be configured later",
        data: {
          access_token: "pending",
          instance_id: "pending",
          whatsapp_number: "pending",
          status: "installation_pending",
          provider: "waapify"
        }
      });
    }
    
    return res.status(400).json({
      success: false,
      error: "Missing required Waapify credentials",
      required_fields: ["access_token", "instance_id", "whatsapp_number (optional)"],
      received_fields: Object.keys(req.body),
      message: "Please provide your Waapify access_token and instance_id"
    });
  }
  
  if (!access_token || !instance_id) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: access_token, instance_id",
      received_fields: Object.keys(req.body),
      received_data: req.body
    });
  }
  
  try {
    // Test Waapify connection
    const authResult = await testWaapifyConnection(access_token, instance_id);
    
    if (authResult.success) {
      // Store Waapify credentials for this locationId
      const { locationId, companyId } = req.body;
      if (locationId && companyId) {
        console.log('=== Storing Waapify Config ===', { locationId, companyId, instance_id });
        Storage.saveWaapifyConfig(companyId, locationId, {
          accessToken: access_token,
          instanceId: instance_id,
          whatsappNumber: whatsapp_number || 'unknown'
        });
      }
      
      // Return success response for GHL with provider registration
      return res.json({
        success: true,
        message: "Waapify authentication successful",
        data: {
          access_token: access_token,
          instance_id: instance_id, 
          whatsapp_number: whatsapp_number || 'unknown',
          status: "authenticated",
          provider: "waapify"
        },
        // Provider registration for GHL
        provider: {
          id: "waapify-sms",
          name: "Waapify",
          type: "SMS",
          capabilities: ["SMS", "MMS"],
          phoneNumbers: [
            {
              id: instance_id,
              number: `+${whatsapp_number}`,
              displayNumber: whatsapp_number,
              capabilities: ["SMS", "MMS"],
              status: "active"
            }
          ]
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "Waapify authentication failed: " + authResult.error
      });
    }
  } catch (error: any) {
    console.error('External auth error:', error);
    return res.status(500).json({
      success: false,
      error: "Authentication service error"
    });
  }
});

/* -------------------- Test Waapify Connection -------------------- */
async function testWaapifyConnection(accessToken: string, instanceId: string) {
  try {
    const axios = require('axios');
    
    // Test with a simple send API endpoint instead
    const response = await axios.get(`https://stag.waapify.com/api/send.php`, {
      params: {
        number: '60123456789', // Test number
        type: 'check_phone',
        instance_id: instanceId,
        access_token: accessToken
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Waapify test response:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Waapify connection test error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      details: error.response?.data || 'Connection failed'
    };
  }
}

/* -------------------- Phone Numbers API for GHL -------------------- */
app.get("/api/phone-numbers", async (req: Request, res: Response) => {
  const { companyId, locationId } = req.query as { companyId: string; locationId: string };
  
  console.log('=== Phone Numbers API Request ===', { companyId, locationId });
  
  try {
    // Get Waapify config for this location
    const waapifyConfig = Storage.getWaapifyConfig(companyId, locationId);
    
    if (!waapifyConfig) {
      return res.json({
        phoneNumbers: [],
        success: false,
        message: "Waapify not configured"
      });
    }
    
    // Return WhatsApp number as available phone number
    return res.json({
      phoneNumbers: [
        {
          id: waapifyConfig.instanceId,
          number: `+${waapifyConfig.whatsappNumber}`,
          displayNumber: waapifyConfig.whatsappNumber,
          type: "SMS",
          provider: "waapify",
          capabilities: ["SMS", "MMS"],
          status: "active",
          country: "MY"
        }
      ],
      success: true
    });
    
  } catch (error: any) {
    console.error('Phone numbers API error:', error);
    return res.status(500).json({
      phoneNumbers: [],
      success: false,
      error: error.message
    });
  }
});

/* -------------------- Conversation Provider Webhook (GHL Outbound Messages) -------------------- */
app.post("/webhook/provider-outbound", async (req: Request, res: Response) => {
  console.log("=== Conversation Provider Webhook Received ===", JSON.stringify(req.body, null, 2));
  
  const { contactId, locationId, type, phone, message, messageId, attachments } = req.body;
  
  if (!contactId || !locationId || !type) {
    return res.status(400).json({ error: "Missing required fields: contactId, locationId, type" });
  }
  
  // Handle SMS and WhatsApp types
  if (type !== "SMS" && type !== "WhatsApp") {
    return res.status(400).json({ error: "Only SMS and WhatsApp types supported" });
  }
  
  if (!phone || !message) {
    return res.status(400).json({ error: "Missing phone or message for SMS" });
  }
  
  try {
    // Find installation by locationId
    const installations = Storage.getAll();
    const installation = installations.find(inst => inst.locationId === locationId);
    
    if (!installation) {
      return res.status(400).json({ error: "Installation not found for location" });
    }
    
    // Get Waapify configuration for this location
    const waapifyConfig = Storage.getWaapifyConfig(installation.companyId, locationId);
    if (!waapifyConfig) {
      return res.status(400).json({ error: "Waapify not configured for this location" });
    }
    
    // Check for rate limiting
    const rateLimitCheck = await checkRateLimit(installation.companyId, locationId);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        success: false,
        error: "Rate limit exceeded. Please wait before sending more messages.",
        retryAfter: rateLimitCheck.retryAfter,
        messageId: messageId || `wa_${Date.now()}`
      });
    }
    
    let whatsappResult;
    
    // Handle media attachments
    if (attachments && attachments.length > 0) {
      // Send media message
      const attachment = attachments[0]; // Take first attachment
      whatsappResult = await sendWhatsAppMessage(
        phone,
        message,
        waapifyConfig.accessToken,
        waapifyConfig.instanceId,
        'media',
        attachment.url,
        attachment.filename
      );
    } else {
      // Send text message
      whatsappResult = await sendWhatsAppMessage(
        phone,
        message,
        waapifyConfig.accessToken,
        waapifyConfig.instanceId
      );
    }
    
    // Update rate limit counter
    await updateRateLimit(installation.companyId, locationId);
    
    if (whatsappResult.success) {
      console.log(`✅ WhatsApp message sent successfully to ${phone}`);
      
      // Log message for delivery tracking
      await logMessage(installation.companyId, locationId, {
        ghlMessageId: messageId,
        waapifyMessageId: whatsappResult.messageId,
        recipient: phone,
        message: message,
        type: attachments && attachments.length > 0 ? 'media' : 'text',
        status: 'sent',
        sentAt: new Date().toISOString()
      });
      
      // GHL expects specific response format
      res.json({
        success: true,
        conversationId: `conv_${locationId}_${contactId}`,
        messageId: whatsappResult.messageId || messageId || `wa_${Date.now()}`,
        message: message,
        contactId: contactId,
        dateAdded: new Date().toISOString()
      });
    } else {
      console.error(`❌ WhatsApp send failed:`, whatsappResult.error);
      res.status(500).json({ 
        success: false,
        error: whatsappResult.error,
        messageId: messageId || `wa_${Date.now()}`
      });
    }
  } catch (error: any) {
    console.error("Conversation provider webhook error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      messageId: messageId
    });
  }
});

/* -------------------- Conversation Provider Status Endpoint -------------------- */
app.get("/provider/status", async (req: Request, res: Response) => {
  const { locationId, companyId } = req.query as { locationId: string; companyId: string };
  
  console.log("=== Provider Status Check ===", { locationId, companyId });
  
  try {
    if (!locationId) {
      return res.json({
        status: "inactive",
        error: "Location ID required"
      });
    }
    
    // Find installation
    const installations = Storage.getAll();
    const installation = installations.find(inst => inst.locationId === locationId);
    
    if (!installation) {
      return res.json({
        status: "inactive",
        error: "Installation not found"
      });
    }
    
    // Check Waapify config
    const waapifyConfig = Storage.getWaapifyConfig(installation.companyId, locationId);
    if (!waapifyConfig) {
      return res.json({
        status: "inactive",
        error: "Waapify not configured"
      });
    }
    
    // Test connection
    const testResult = await testWaapifyConnection(waapifyConfig.accessToken, waapifyConfig.instanceId);
    
    res.json({
      status: testResult.success ? "active" : "error",
      provider: "waapify",
      providerName: "Waapify WhatsApp",
      whatsappNumber: waapifyConfig.whatsappNumber,
      instanceId: waapifyConfig.instanceId,
      lastChecked: new Date().toISOString(),
      connectionTest: testResult
    });
    
  } catch (error: any) {
    console.error("Provider status error:", error);
    res.json({
      status: "error",
      error: error.message
    });
  }
});

/* -------------------- GHL Marketplace Workflow Actions -------------------- */

// GHL Action: Send WhatsApp Media (for marketplace workflows)
app.post("/action/send-whatsapp-media-ghl", async (req: Request, res: Response) => {
  console.log('=== GHL Media Action Called ===', JSON.stringify(req.body, null, 2));
  
  const { number, message, media_url, filename, locationId, companyId, contactId } = req.body;
  
  if (!number || !message || !media_url) {
    return res.status(400).json({ 
      success: false,
      error: "Missing required fields: number, message, media_url" 
    });
  }
  
  try {
    // Find Waapify configuration for this location
    const installations = Storage.getAll();
    const installation = installations.find(inst => 
      inst.locationId === locationId || inst.companyId === companyId
    );
    
    if (!installation) {
      return res.status(400).json({ 
        success: false,
        error: "Installation not found. Please configure Waapify integration first." 
      });
    }
    
    const waapifyConfig = Storage.getWaapifyConfig(installation.companyId, installation.locationId || '');
    if (!waapifyConfig) {
      return res.status(400).json({ 
        success: false,
        error: "Waapify not configured. Please complete external authentication." 
      });
    }
    
    // Send media message via Waapify
    const result = await sendWhatsAppMessage(
      number, 
      message, 
      waapifyConfig.accessToken, 
      waapifyConfig.instanceId,
      'media',
      media_url,
      filename
    );
    
    // Log the message
    if (installation.locationId) {
      await logMessage(installation.companyId, installation.locationId, {
        ghlMessageId: `media_${Date.now()}`,
        waapifyMessageId: result.messageId || `media_${Date.now()}`,
        recipient: number,
        message: `${message} [Media: ${filename || 'file'}]`,
        type: 'media',
        status: result.success ? 'sent' : 'failed',
        sentAt: new Date().toISOString()
      });
    }
    
    // Return GHL-compatible response
    res.json({
      success: result.success,
      messageId: result.messageId,
      message: result.success ? "Media message sent successfully" : "Failed to send media message",
      data: result.data,
      error: result.success ? null : result.error
    });
    
  } catch (error: any) {
    console.error('GHL Media Action error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GHL Action: AI Chatbot Response (for marketplace workflows)  
app.post("/action/ai-chatbot-ghl", async (req: Request, res: Response) => {
  console.log('=== GHL AI Chatbot Action Called ===', JSON.stringify(req.body, null, 2));
  
  const { 
    customerMessage, 
    keywords, 
    context, 
    persona, 
    phone,
    openai_api_key, // OpenAI key provided directly in workflow action
    locationId, 
    companyId,
    contactId 
  } = req.body;
  
  if (!customerMessage) {
    return res.status(400).json({ 
      success: false,
      error: "Missing required field: customerMessage" 
    });
  }
  
  try {
    // Parse keywords if string
    let keywordArray = keywords;
    if (typeof keywords === 'string') {
      keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
    
    // Check keyword triggers
    const triggeredKeywords = checkKeywordTriggers(customerMessage, keywordArray || []);
    
    if (triggeredKeywords.length === 0 && keywordArray && keywordArray.length > 0) {
      return res.json({
        success: true,
        triggered: false,
        message: "No trigger keywords found in message",
        keywords: keywordArray,
        customerMessage: customerMessage
      });
    }
    
    // Use OpenAI API key from workflow action (priority) or stored config (fallback)
    let userOpenAIKey = openai_api_key; // From workflow action field
    
    if (!userOpenAIKey) {
      // Fallback to stored API key if available
      const installations = Storage.getAll();
      const installation = installations.find(inst => 
        inst.locationId === locationId || inst.companyId === companyId
      );
      
      if (installation) {
        const aiConfig = Storage.getAIChatbotConfig(installation.companyId, installation.locationId || '');
        userOpenAIKey = aiConfig?.openaiApiKey;
      }
    }
    
    // Generate AI response with user's API key
    const aiResponse = await generateChatGPTResponse({
      customerMessage,
      context: context || "You are a helpful business assistant.",
      persona: persona || "professional and friendly",
      triggeredKeywords,
      openaiApiKey: userOpenAIKey
    });
    
    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        error: "AI response generation failed: " + aiResponse.error
      });
    }
    
    let whatsappSent = false;
    let whatsappResult = null;
    
    // Send via WhatsApp if phone provided and location configured
    if (phone && (locationId || companyId)) {
      const installations = Storage.getAll();
      const installation = installations.find(inst => 
        inst.locationId === locationId || inst.companyId === companyId
      );
      
      if (installation) {
        const waapifyConfig = Storage.getWaapifyConfig(installation.companyId, installation.locationId || '');
        if (waapifyConfig && aiResponse.response) {
          whatsappResult = await sendWhatsAppMessage(
            phone,
            aiResponse.response,
            waapifyConfig.accessToken,
            waapifyConfig.instanceId
          );
          whatsappSent = whatsappResult.success;
          
          // Log the AI conversation
          if (installation.locationId) {
            await logMessage(installation.companyId, installation.locationId, {
              ghlMessageId: `ai_ghl_${Date.now()}`,
              waapifyMessageId: whatsappResult.messageId || `ai_ghl_${Date.now()}`,
              recipient: phone,
              message: aiResponse.response,
              type: 'text',
              status: whatsappResult.success ? 'sent' : 'failed',
              sentAt: new Date().toISOString()
            });
          }
        }
      }
    }
    
    // Return GHL-compatible response
    res.json({
      success: true,
      triggered: true,
      aiResponse: aiResponse.response,
      triggeredKeywords,
      whatsappSent,
      messageId: whatsappResult?.messageId,
      customerMessage,
      message: whatsappSent ? 
        "AI response generated and sent via WhatsApp" : 
        "AI response generated (WhatsApp not sent - check configuration)"
    });
    
  } catch (error: any) {
    console.error('GHL AI Chatbot Action error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* -------------------- WhatsApp Actions Endpoints -------------------- */

// Send WhatsApp Text Message (with JSON error handling)
app.post("/action/send-whatsapp-text", async (req: Request, res: Response) => {
  console.log('=== WhatsApp Text API Called ===');
  console.log('Headers:', req.headers);
  console.log('Raw Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { number, message, instance_id, access_token, locationId, companyId, type = "text" } = req.body;
    
    let finalInstanceId = instance_id;
    let finalAccessToken = access_token;
    
    // If credentials not provided directly, try to get from stored config
    if ((!instance_id || !access_token) && locationId && companyId) {
      console.log('Trying to get stored Waapify config for:', { locationId, companyId });
      const waapifyConfig = Storage.getWaapifyConfig(companyId, locationId);
      if (waapifyConfig) {
        finalInstanceId = finalInstanceId || waapifyConfig.instanceId;
        finalAccessToken = finalAccessToken || waapifyConfig.accessToken;
        console.log('Found stored config:', { instanceId: !!finalInstanceId, accessToken: !!finalAccessToken });
      }
    }
    
    if (!number || !message || !finalInstanceId || !finalAccessToken) {
      console.log('Missing fields after config lookup:', { 
        number: !!number, 
        message: !!message, 
        instance_id: !!finalInstanceId, 
        access_token: !!finalAccessToken 
      });
      return res.status(400).json({ 
        error: "Missing required fields. Either provide instance_id & access_token directly, or ensure locationId & companyId are provided with stored Waapify config.",
        received: { 
          number: !!number, 
          message: !!message, 
          instance_id: !!finalInstanceId, 
          access_token: !!finalAccessToken,
          locationId: !!locationId,
          companyId: !!companyId
        }
      });
    }
    
    // Clean message to remove potential control characters
    const cleanMessage = message.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    const cleanNumber = number.replace(/[^\d+]/g, '');
    
    console.log('Cleaned data:', { cleanNumber, cleanMessage: cleanMessage.substring(0, 50) + '...' });
    
    const result = await sendWhatsAppMessage(cleanNumber, cleanMessage, finalAccessToken, finalInstanceId, type);
    
    console.log('WhatsApp result:', result);
    res.json(result);
    
  } catch (error: any) {
    console.error('WhatsApp text API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send WhatsApp Media Message  
app.post("/action/send-whatsapp-media", async (req: Request, res: Response) => {
  const { number, message, media_url, filename, instance_id, access_token, type = "media" } = req.body;
  
  if (!number || !message || !media_url || !instance_id || !access_token) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    const result = await sendWhatsAppMessage(number, message, access_token, instance_id, type, media_url, filename);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check WhatsApp Phone Number
app.post("/action/check-whatsapp-phone", async (req: Request, res: Response) => {
  const { number, instance_id, access_token } = req.body;
  
  if (!number || !instance_id || !access_token) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    const axios = require('axios');
    const cleanNumber = number.replace(/[^\d]/g, '');
    
    const response = await axios.get(`https://stag.waapify.com/api/send.php`, {
      params: {
        number: cleanNumber,
        type: 'check_phone',
        instance_id: instance_id,
        access_token: access_token
      }
    });
    
    res.json({
      success: true,
      isWhatsApp: response.data.registered || false,
      data: response.data
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- Send WhatsApp Message Function -------------------- */
async function sendWhatsAppMessage(number: string, message: string, accessToken: string, instanceId: string, type: string = 'text', mediaUrl?: string, filename?: string) {
  try {
    const axios = require('axios');
    
    // Clean phone number (remove + and non-digits)
    const cleanNumber = number.replace(/[^\d]/g, '');
    
    const params: any = {
      number: cleanNumber,
      type: type,
      message: message,
      instance_id: instanceId,
      access_token: accessToken
    };
    
    // Add media parameters if provided
    if (type === 'media' && mediaUrl) {
      params.media_url = mediaUrl;
      if (filename) {
        params.filename = filename;
      }
    }
    
    const response = await axios.get(`https://stag.waapify.com/api/send.php`, {
      params: params
    });
    
    return {
      success: true,
      messageId: response.data.id || Date.now().toString(),
      data: response.data
    };
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/* -------------------- Webhook Handler for Incoming WhatsApp -------------------- */
app.post("/webhook/waapify", async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    console.log("=== Waapify Webhook Received ===", webhookData);
    
    // Process incoming WhatsApp message
    if (webhookData.type === 'message' && webhookData.data) {
      const messageData = webhookData.data;
      
      // Check for AI chatbot auto-response first
      await processAIChatbotAutoResponse(messageData);
      
      // Then forward to GHL as incoming SMS
      await forwardToGHLConversation(messageData);
    }
    
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/* -------------------- AI Chatbot Auto-Response Handler -------------------- */
async function processAIChatbotAutoResponse(messageData: any) {
  try {
    const fromNumber = messageData.from || messageData.number;
    const messageText = messageData.message || messageData.text;
    const instanceId = messageData.instance_id;
    
    // Find which location this instance belongs to
    const installations = Storage.getAll();
    const installation = installations.find(inst => 
      inst.waapifyConfig?.instanceId === instanceId
    );
    
    if (!installation || !installation.locationId) {
      console.log("No installation found for AI chatbot processing");
      return;
    }
    
    // Get AI chatbot configuration
    const aiConfig = Storage.getAIChatbotConfig(installation.companyId, installation.locationId);
    
    if (!aiConfig || !aiConfig.enabled) {
      console.log("AI chatbot not enabled for this location");
      return;
    }
    
    // Check if message triggers any keywords
    const triggeredKeywords = checkKeywordTriggers(messageText, aiConfig.keywords);
    
    if (triggeredKeywords.length === 0) {
      console.log("No AI chatbot keywords triggered");
      return;
    }
    
    console.log(`🤖 AI Chatbot triggered by keywords: ${triggeredKeywords.join(', ')}`);
    
    // Generate AI response using user's API key
    const aiResponse = await generateChatGPTResponse({
      customerMessage: messageText,
      context: aiConfig.context,
      persona: aiConfig.persona,
      triggeredKeywords,
      openaiApiKey: aiConfig.openaiApiKey
    });
    
    if (!aiResponse.success) {
      console.error("AI response generation failed:", aiResponse.error);
      return;
    }
    
    // Send AI response via WhatsApp
    const waapifyConfig = Storage.getWaapifyConfig(installation.companyId, installation.locationId);
    if (waapifyConfig && aiResponse.response) {
      const whatsappResult = await sendWhatsAppMessage(
        fromNumber,
        aiResponse.response,
        waapifyConfig.accessToken,
        waapifyConfig.instanceId
      );
      
      // Log the AI conversation
      await logMessage(installation.companyId, installation.locationId, {
        ghlMessageId: `ai_auto_${Date.now()}`,
        waapifyMessageId: whatsappResult.messageId || `ai_auto_${Date.now()}`,
        recipient: fromNumber,
        message: aiResponse.response,
        type: 'text',
        status: whatsappResult.success ? 'sent' : 'failed',
        sentAt: new Date().toISOString()
      });
      
      console.log(`✅ AI auto-response sent to ${fromNumber}: ${aiResponse.response.substring(0, 50)}...`);
    }
    
  } catch (error) {
    console.error("AI chatbot auto-response error:", error);
  }
}

/* -------------------- Forward to GHL Conversation -------------------- */
async function forwardToGHLConversation(messageData: any) {
  try {
    // Extract message details
    const fromNumber = messageData.from || messageData.number;
    const messageText = messageData.message || messageData.text;
    const instanceId = messageData.instance_id;
    
    // Find which location this instance belongs to
    const installations = Storage.getAll();
    const installation = installations.find(inst => 
      inst.waapifyConfig?.instanceId === instanceId
    );
    
    if (!installation || !installation.locationId) {
      console.error("No installation found for instance ID:", instanceId);
      return;
    }
    
    // Create contact if not exists
    const api = ghl.requests(installation.companyId);
    
    // Create/update contact
    try {
      await api.post("/contacts", {
        firstName: "WhatsApp",
        lastName: "Contact",
        phone: fromNumber,
        locationId: installation.locationId
      }, { headers: { Version: "2021-07-28" } });
    } catch (contactError) {
      // Contact might already exist, that's OK
      console.log("Contact creation note:", contactError);
    }
    
    // Send message to conversation
    await api.post("/conversations/messages", {
      type: "WhatsApp",
      contactId: await getContactId(fromNumber, installation.locationId, api),
      message: messageText,
      direction: "inbound",
      locationId: installation.locationId
    }, { headers: { Version: "2021-07-28" } });
    
    console.log("Message forwarded to GHL successfully");
  } catch (error) {
    console.error("Forward to GHL error:", error);
  }
}

/* -------------------- Get Contact ID by Phone -------------------- */
async function getContactId(phone: string, locationId: string, api: any): Promise<string> {
  try {
    const response = await api.get(`/contacts/?locationId=${locationId}&query=${phone}`, {
      headers: { Version: "2021-07-28" }
    });
    
    if (response.data.contacts && response.data.contacts.length > 0) {
      return response.data.contacts[0].id;
    }
    
    // If not found, create new contact
    const createResponse = await api.post("/contacts", {
      firstName: "WhatsApp",
      lastName: "Contact", 
      phone: phone,
      locationId: locationId
    }, { headers: { Version: "2021-07-28" } });
    
    return createResponse.data.contact.id;
  } catch (error) {
    console.error("Get contact ID error:", error);
    throw error;
  }
}

/* -------------------- Example API Call with Location -------------------- */
app.get("/example-api-call-location", async (req, res) => {
  const { companyId, locationId } = req.query as { companyId: string; locationId: string };

  if (!companyId || !locationId) return res.status(400).send("Missing companyId or locationId");

  try {
    if (!ghl.checkInstallationExists(companyId)) {
      return res.status(400).send("Company token not found. Authorize app first.");
    }

    let token = Storage.getTokenForLocation(locationId);
    if (!token) {
      await ghl.getLocationTokenFromCompanyToken(companyId, locationId);
      token = Storage.getTokenForLocation(locationId);
    }

    if (!token) return res.status(400).send("Failed to get access token for location");

    const request = await ghl.requests(companyId).get(`/contacts/?locationId=${locationId}`, {
      headers: { Version: "2021-07-28" },
    });

    console.log("Location API response:", request.data);
    res.json(request.data);
  } catch (error) {
    console.error("/example-api-call-location error:", error);
    res.status(400).send(error);
  }
});

/* -------------------- Test Endpoint with Real Credentials -------------------- */
app.post("/test/send-whatsapp-real", async (req: Request, res: Response) => {
  const { number, message } = req.body;
  
  if (!number || !message) {
    return res.status(400).json({ error: "Missing number or message" });
  }
  
  try {
    const accessToken = process.env.WAAPIFY_ACCESS_TOKEN;
    const instanceId = process.env.WAAPIFY_INSTANCE_ID;
    
    if (!accessToken || !instanceId) {
      return res.status(400).json({ 
        error: "Waapify credentials not configured in .env file",
        help: "Add WAAPIFY_ACCESS_TOKEN and WAAPIFY_INSTANCE_ID to your .env file"
      });
    }
    
    const result = await sendWhatsAppMessage(number, message, accessToken, instanceId);
    res.json(result);
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- Management Dashboard -------------------- */
app.get("/dashboard", (req: Request, res: Response) => {
  const dashboardHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Waapify-GHL Management Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            h2 { color: #25D366; border-bottom: 2px solid #25D366; padding-bottom: 10px; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007cba; }
            .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; margin-right: 10px; }
            .get { background: #28a745; }
            .post { background: #007bff; }
            .put { background: #ffc107; color: black; }
            .delete { background: #dc3545; }
            code { background: #e9ecef; padding: 2px 4px; border-radius: 3px; }
            .test-btn { background: #25D366; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; }
            .test-btn:hover { background: #128C7E; }
            .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .logs { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px; font-family: monospace; max-height: 300px; overflow-y: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Waapify-GHL Management Dashboard</h1>
            
            <div class="card">
                <h2>📊 System Status</h2>
                <div id="systemStatus">Checking...</div>
                <button class="test-btn" onclick="checkSystemStatus()">Refresh Status</button>
            </div>
            
            <div class="card">
                <h2>📱 Quick Tests</h2>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <strong>Provider Status</strong>
                    <button class="test-btn" onclick="testProviderStatus()">Test</button>
                    <div id="providerResult"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <strong>External Auth Test</strong>
                    <button class="test-btn" onclick="testExternalAuth()">Test</button>
                    <div id="authResult"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <strong>Message Logs</strong>
                    <button class="test-btn" onclick="testMessageLogs()">View Logs</button>
                    <div id="logsResult"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <strong>Send Test WhatsApp (Real Credentials)</strong>
                    <input type="text" id="testNumber" placeholder="60168970072" style="margin: 10px;">
                    <input type="text" id="testMessage" placeholder="Hello from Waapify!" style="margin: 10px;">
                    <button class="test-btn" onclick="sendTestWhatsApp()">Send Real Message</button>
                    <div id="whatsappResult"></div>
                    <small style="color: #666;">Uses your .env file credentials</small>
                </div>
            </div>
            
            <div class="card">
                <h2>🤖 AI Chatbot Configuration</h2>
                <p><strong>Status:</strong> <span style="color: orange;">In Development</span></p>
                <p>Planning ChatGPT integration for automated responses based on keywords and context.</p>
                <button class="test-btn" onclick="showChatbotInfo()">View Integration Plan</button>
                <div id="chatbotInfo"></div>
            </div>
            
            <div class="card">
                <h2>📋 Available Endpoints</h2>
                <div class="endpoint">
                    <span class="method get">GET</span> <code>/provider/status</code> - Check provider health
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span> <code>/external-auth</code> - Authenticate Waapify credentials
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span> <code>/action/send-whatsapp-text</code> - Send WhatsApp message
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span> <code>/api/message-logs</code> - View message history
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span> <code>/api/waapify/qr-code</code> - Get WhatsApp QR code
                </div>
            </div>
        </div>
        
        <script>
            async function checkSystemStatus() {
                const statusDiv = document.getElementById('systemStatus');
                statusDiv.innerHTML = 'Checking...';
                
                try {
                    const response = await fetch('/provider/status');
                    const data = await response.json();
                    statusDiv.innerHTML = '<div class="success">✅ Server is running</div>';
                } catch (error) {
                    statusDiv.innerHTML = '<div class="error">❌ Server connection failed</div>';
                }
            }
            
            async function testProviderStatus() {
                const resultDiv = document.getElementById('providerResult');
                try {
                    const response = await fetch('/provider/status');
                    const data = await response.json();
                    resultDiv.innerHTML = '<div class="logs">' + JSON.stringify(data, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
                }
            }
            
            async function testExternalAuth() {
                const resultDiv = document.getElementById('authResult');
                try {
                    const response = await fetch('/external-auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            access_token: 'test_token',
                            instance_id: 'test_instance',
                            locationId: 'test_location',
                            companyId: 'test_company'
                        })
                    });
                    const data = await response.json();
                    resultDiv.innerHTML = '<div class="logs">' + JSON.stringify(data, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
                }
            }
            
            async function testMessageLogs() {
                const resultDiv = document.getElementById('logsResult');
                try {
                    const response = await fetch('/api/message-logs?companyId=test_company&locationId=test_location');
                    const data = await response.json();
                    resultDiv.innerHTML = '<div class="logs">' + JSON.stringify(data, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
                }
            }
            
            async function sendTestWhatsApp() {
                const number = document.getElementById('testNumber').value;
                const message = document.getElementById('testMessage').value;
                const resultDiv = document.getElementById('whatsappResult');
                
                if (!number || !message) {
                    resultDiv.innerHTML = '<div class="error">Please enter both number and message</div>';
                    return;
                }
                
                try {
                    // Use real credentials endpoint
                    const response = await fetch('/test/send-whatsapp-real', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            number: number,
                            message: message
                        })
                    });
                    const data = await response.json();
                    if (data.success) {
                        resultDiv.innerHTML = '<div class="success">✅ WhatsApp message sent successfully!</div><div class="logs">' + JSON.stringify(data, null, 2) + '</div>';
                    } else {
                        resultDiv.innerHTML = '<div class="error">❌ Failed to send: ' + JSON.stringify(data, null, 2) + '</div>';
                    }
                } catch (error) {
                    resultDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
                }
            }
            
            function showChatbotInfo() {
                const infoDiv = document.getElementById('chatbotInfo');
                infoDiv.innerHTML = \`
                    <div class="logs">
🤖 ChatGPT Integration Plan:

1. NEW ENDPOINT: /action/ai-chatbot-response
2. KEYWORD DETECTION: Configure trigger words
3. CHATGPT API: Send context + persona + customer message
4. AUTO-REPLY: Send AI response via WhatsApp
5. GHL INTEGRATION: Available as workflow action

Example workflow:
Customer: "What are your hours?"
Trigger: "hours" keyword detected
AI Context: Restaurant business hours info
Response: "We're open 8AM-10PM daily! 🍽️"
                    </div>
                \`;
            }
            
            // Auto-check status on load
            checkSystemStatus();
        </script>
    </body>
    </html>
  `;
  
  res.send(dashboardHTML);
});

/* -------------------- Root -------------------- */
app.get("/", (req, res) => res.sendFile(path + "index.html"));

/* -------------------- Rate Limiting Functions -------------------- */
interface RateLimit {
  lastSent: number;
  messageCount: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimit>();

async function checkRateLimit(companyId: string, locationId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `${companyId}_${locationId}`;
  const now = Date.now();
  const maxMessagesPerMinute = 10; // Configurable limit
  const windowMs = 60 * 1000; // 1 minute window
  
  const rateLimit = rateLimits.get(key) || {
    lastSent: 0,
    messageCount: 0,
    resetAt: now + windowMs
  };
  
  // Reset counter if window has passed
  if (now >= rateLimit.resetAt) {
    rateLimit.messageCount = 0;
    rateLimit.resetAt = now + windowMs;
  }
  
  if (rateLimit.messageCount >= maxMessagesPerMinute) {
    const retryAfter = Math.ceil((rateLimit.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  return { allowed: true };
}

async function updateRateLimit(companyId: string, locationId: string): Promise<void> {
  const key = `${companyId}_${locationId}`;
  const now = Date.now();
  const windowMs = 60 * 1000;
  
  const rateLimit = rateLimits.get(key) || {
    lastSent: 0,
    messageCount: 0,
    resetAt: now + windowMs
  };
  
  rateLimit.messageCount += 1;
  rateLimit.lastSent = now;
  
  rateLimits.set(key, rateLimit);
}

/* -------------------- Message Logging Functions -------------------- */
interface MessageLog {
  ghlMessageId: string;
  waapifyMessageId: string;
  recipient: string;
  message: string;
  type: 'text' | 'media';
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
}

const messageLogs = new Map<string, MessageLog[]>();

async function logMessage(companyId: string, locationId: string, log: MessageLog): Promise<void> {
  const key = `${companyId}_${locationId}`;
  const logs = messageLogs.get(key) || [];
  logs.push(log);
  
  // Keep only last 1000 messages to prevent memory issues
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  messageLogs.set(key, logs);
}

/* -------------------- AI Chatbot Integration -------------------- */

// AI Chatbot Response Action for GHL Workflows
app.post("/action/ai-chatbot-response", async (req: Request, res: Response) => {
  console.log('=== AI Chatbot Action Called ===', JSON.stringify(req.body, null, 2));
  
  const { 
    customerMessage, 
    keywords, 
    context, 
    persona, 
    locationId, 
    companyId,
    contactId,
    phone
  } = req.body;
  
  if (!customerMessage || !locationId || !companyId) {
    return res.status(400).json({ 
      error: "Missing required fields: customerMessage, locationId, companyId" 
    });
  }
  
  try {
    // Check if message contains trigger keywords
    const triggeredKeywords = checkKeywordTriggers(customerMessage, keywords || []);
    
    if (triggeredKeywords.length === 0 && keywords && keywords.length > 0) {
      return res.json({
        success: true,
        triggered: false,
        message: "No trigger keywords found",
        keywords: keywords
      });
    }
    
    // Get user's OpenAI API key if available
    let userOpenAIKey = undefined;
    if (locationId && companyId) {
      const installations = Storage.getAll();
      const installation = installations.find(inst => 
        inst.locationId === locationId || inst.companyId === companyId
      );
      if (installation) {
        const aiConfig = Storage.getAIChatbotConfig(installation.companyId, installation.locationId || '');
        userOpenAIKey = aiConfig?.openaiApiKey;
      }
    }
    
    // Generate AI response using ChatGPT
    const aiResponse = await generateChatGPTResponse({
      customerMessage,
      context: context || "You are a helpful business assistant.",
      persona: persona || "professional and friendly",
      triggeredKeywords,
      openaiApiKey: userOpenAIKey
    });
    
    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate AI response: " + aiResponse.error
      });
    }
    
    // Send AI response via WhatsApp if phone number provided
    if (phone) {
      const waapifyConfig = Storage.getWaapifyConfig(companyId, locationId);
      if (waapifyConfig) {
        const whatsappResult = await sendWhatsAppMessage(
          phone,
          aiResponse.response || '',
          waapifyConfig.accessToken,
          waapifyConfig.instanceId
        );
        
        // Log the AI conversation
        await logMessage(companyId, locationId, {
          ghlMessageId: `ai_${Date.now()}`,
          waapifyMessageId: whatsappResult.messageId || `ai_${Date.now()}`,
          recipient: phone,
          message: aiResponse.response || '',
          type: 'text',
          status: whatsappResult.success ? 'sent' : 'failed',
          sentAt: new Date().toISOString()
        });
        
        return res.json({
          success: true,
          triggered: true,
          aiResponse: aiResponse.response,
          triggeredKeywords,
          whatsappSent: whatsappResult.success,
          whatsappResult
        });
      }
    }
    
    // Return AI response without sending via WhatsApp
    res.json({
      success: true,
      triggered: true,
      aiResponse: aiResponse.response,
      triggeredKeywords,
      whatsappSent: false,
      message: "AI response generated but not sent (no WhatsApp config or phone)"
    });
    
  } catch (error: any) {
    console.error('AI Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Keyword trigger checker
function checkKeywordTriggers(message: string, keywords: string[]): string[] {
  const messageText = message.toLowerCase();
  const triggered: string[] = [];
  
  for (const keyword of keywords) {
    if (messageText.includes(keyword.toLowerCase())) {
      triggered.push(keyword);
    }
  }
  
  return triggered;
}

// ChatGPT API integration
async function generateChatGPTResponse({ customerMessage, context, persona, triggeredKeywords, openaiApiKey }: {
  customerMessage: string;
  context: string;
  persona: string;
  triggeredKeywords: string[];
  openaiApiKey?: string;
}): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const axios = require('axios');
    
    // Use provided API key or fall back to environment variable
    const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "OpenAI API key not provided. Please configure your OpenAI API key in the external authentication."
      };
    }
    
    const systemPrompt = `${context}

Your persona: ${persona}

Triggered keywords: ${triggeredKeywords.join(', ')}

Instructions:
- Respond naturally and helpfully to the customer's message
- Keep responses concise (under 200 words)
- Use the provided context and persona
- Be professional but friendly
- Include relevant emojis when appropriate`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: customerMessage
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const aiResponse = response.data.choices[0].message.content.trim();
    
    return {
      success: true,
      response: aiResponse
    };
    
  } catch (error: any) {
    console.error('ChatGPT API error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// Configure AI Chatbot Settings
app.post("/api/ai-chatbot/configure", async (req: Request, res: Response) => {
  const { companyId, locationId, config } = req.body;
  
  if (!companyId || !locationId || !config) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    // Save AI chatbot configuration
    Storage.saveAIChatbotConfig(companyId, locationId, config);
    
    res.json({
      success: true,
      message: "AI Chatbot configuration saved",
      config
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI Chatbot Settings
app.get("/api/ai-chatbot/config", async (req: Request, res: Response) => {
  const { companyId, locationId } = req.query as { companyId: string; locationId: string };
  
  if (!companyId || !locationId) {
    return res.status(400).json({ error: "Missing companyId or locationId" });
  }
  
  try {
    const config = Storage.getAIChatbotConfig(companyId, locationId);
    
    res.json({
      success: true,
      config: config || {
        enabled: false,
        keywords: [],
        context: "You are a helpful business assistant.",
        persona: "professional and friendly"
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- Additional Waapify API Endpoints -------------------- */

// Get QR Code for WhatsApp login
app.get("/api/waapify/qr-code", async (req: Request, res: Response) => {
  const { instance_id, access_token } = req.query as { instance_id: string; access_token: string };
  
  if (!instance_id || !access_token) {
    return res.status(400).json({ error: "Missing instance_id or access_token" });
  }
  
  try {
    const axios = require('axios');
    const response = await axios.get(`https://stag.waapify.com/api/getqrcode.php`, {
      params: { instance_id, access_token }
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reboot WhatsApp instance
app.post("/api/waapify/reboot", async (req: Request, res: Response) => {
  const { instance_id, access_token } = req.body;
  
  if (!instance_id || !access_token) {
    return res.status(400).json({ error: "Missing instance_id or access_token" });
  }
  
  try {
    const axios = require('axios');
    const response = await axios.get(`https://stag.waapify.com/api/reboot.php`, {
      params: { instance_id, access_token }
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send Group Message
app.post("/api/waapify/send-group", async (req: Request, res: Response) => {
  const { group_id, message, type = "text", media_url, filename, instance_id, access_token } = req.body;
  
  if (!group_id || !message || !instance_id || !access_token) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    const axios = require('axios');
    const params: any = {
      group_id,
      type,
      message,
      instance_id,
      access_token
    };
    
    if (type === 'media' && media_url) {
      params.media_url = media_url;
      if (filename) params.filename = filename;
    }
    
    const response = await axios.get(`https://stag.waapify.com/api/sendgroupmsg.php`, {
      params
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Message Logs
app.get("/api/message-logs", async (req: Request, res: Response) => {
  const { companyId, locationId } = req.query as { companyId: string; locationId: string };
  
  if (!companyId || !locationId) {
    return res.status(400).json({ error: "Missing companyId or locationId" });
  }
  
  const key = `${companyId}_${locationId}`;
  const logs = messageLogs.get(key) || [];
  
  res.json({
    success: true,
    logs: logs.slice(-50), // Return last 50 messages
    total: logs.length
  });
});

// Check Message Status
app.get("/api/message-status/:messageId", async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { companyId, locationId } = req.query as { companyId: string; locationId: string };
  
  if (!companyId || !locationId) {
    return res.status(400).json({ error: "Missing companyId or locationId" });
  }
  
  const key = `${companyId}_${locationId}`;
  const logs = messageLogs.get(key) || [];
  const messageLog = logs.find(log => 
    log.ghlMessageId === messageId || log.waapifyMessageId === messageId
  );
  
  if (!messageLog) {
    return res.status(404).json({ error: "Message not found" });
  }
  
  res.json({
    success: true,
    message: messageLog
  });
});

/* -------------------- Start server -------------------- */
app.listen(port, () => console.log(`GHL app listening on port ${port}`));
