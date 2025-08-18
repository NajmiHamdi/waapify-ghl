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

// Body parser
app.use(json({ type: "application/json" }));

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

    // Instead of direct redirect, show configuration page
    const latestInstallation = installations[installations.length - 1];
    res.redirect(`/configure?companyId=${latestInstallation.companyId}&locationId=${latestInstallation.locationId}`);
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

/* -------------------- SMS Override Endpoint (Custom Conversation Provider) -------------------- */
app.post("/api/send-sms", async (req: Request, res: Response) => {
  const { to, message, locationId, companyId } = req.body;
  
  if (!to || !message || !locationId) {
    return res.status(400).json({ error: "Missing required fields: to, message, locationId" });
  }
  
  try {
    // Get Waapify configuration for this location
    const waapifyConfig = Storage.getWaapifyConfig(companyId, locationId);
    if (!waapifyConfig) {
      return res.status(400).json({ error: "Waapify not configured for this location" });
    }
    
    // Send via Waapify instead of SMS
    const whatsappResult = await sendWhatsAppMessage(
      to,
      message,
      waapifyConfig.accessToken,
      waapifyConfig.instanceId
    );
    
    if (whatsappResult.success) {
      res.json({
        success: true,
        messageId: whatsappResult.messageId,
        provider: "waapify",
        deliveredVia: "whatsapp"
      });
    } else {
      res.status(500).json({ error: whatsappResult.error });
    }
  } catch (error: any) {
    console.error("SMS override error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- WhatsApp Actions Endpoints -------------------- */

// Send WhatsApp Text Message
app.post("/action/send-whatsapp-text", async (req: Request, res: Response) => {
  const { number, message, instance_id, access_token, type = "text" } = req.body;
  
  if (!number || !message || !instance_id || !access_token) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    const result = await sendWhatsAppMessage(number, message, access_token, instance_id, type);
    res.json(result);
  } catch (error: any) {
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
      
      // Forward to GHL as incoming SMS
      await forwardToGHLConversation(messageData);
    }
    
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

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
      type: "SMS",
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

/* -------------------- Root -------------------- */
app.get("/", (req, res) => res.sendFile(path + "index.html"));

/* -------------------- Start server -------------------- */
app.listen(port, () => console.log(`GHL app listening on port ${port}`));
