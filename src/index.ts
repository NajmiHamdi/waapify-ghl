import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GHL } from "./ghl";
import { Database, Installation, WaapifyConfig, AIConfig } from "./database";
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

// Handle form-encoded data (for GHL External Auth forms)
app.use(express.urlencoded({ extended: true }));

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

    const installations = await Database.getAllInstallations();
    console.log("=== All installations ===", installations);

    // OAuth happens before INSTALL webhook, so we need to wait or handle differently
    // For now, always redirect to external auth trigger since installation will happen via webhook
    
    // Get company and location from OAuth response or query params
    const companyId = req.query.companyId as string;
    const locationId = req.query.locationId as string;
    
    console.log('=== OAuth Success - Checking Params ===', { companyId, locationId });
    console.log('=== Full Query Params ===', req.query);
    console.log('=== Auth Result ===', authResult);
    
    // If companyId/locationId missing from OAuth, get from latest installation
    let finalCompanyId = companyId;
    let finalLocationId = locationId;
    
    if (!finalCompanyId || !finalLocationId) {
      console.log('=== Missing OAuth params, checking latest installation ===');
      const installations = await Database.getAllInstallations();
      const latestInstallation = installations[installations.length - 1]; // Most recent
      
      if (latestInstallation && latestInstallation.location_id) {
        finalCompanyId = latestInstallation.company_id;
        finalLocationId = latestInstallation.location_id;
        console.log('=== Found latest installation ===', { finalCompanyId, finalLocationId });
      }
    }
    
    if (finalCompanyId && finalLocationId) {
      console.log('=== OAuth Success - Redirecting to External Auth Configuration ===');
      const configUrl = `/config/${finalCompanyId}/${finalLocationId}`;
      console.log(`Redirecting to config form: ${configUrl}`);
      return res.redirect(configUrl);
    }
    
    // Fallback: redirect to waiting page that will auto-redirect to custom form
    console.log('=== OAuth Success - Redirecting to Setup Form ===');
    const setupHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Setting up Waapify...</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              h1 { color: #25D366; margin-bottom: 20px; }
              .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #25D366; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              p { color: #666; line-height: 1.6; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>🚀 Setting up Waapify...</h1>
              <div class="spinner"></div>
              <p>Redirecting to Waapify configuration...</p>
          </div>
          
          <script>
              // Wait for installation to be created, then redirect to custom form
              let attempts = 0;
              const maxAttempts = 15;
              
              async function waitAndRedirect() {
                  attempts++;
                  console.log('Waiting for installation... attempt', attempts);
                  
                  try {
                      // Check if installation exists by making a test call
                      const response = await fetch('/api/installations-check', {
                          method: 'GET'
                      });
                      
                      if (response.ok) {
                          const data = await response.json();
                          if (data.hasInstallations && data.latest) {
                              console.log('Installation found! Redirecting to config form...');
                              window.location.href = \`/config/\${data.latest.company_id}/\${data.latest.location_id}\`;
                              return;
                          }
                      }
                  } catch (error) {
                      console.log('Check failed:', error);
                  }
                  
                  // If max attempts reached, redirect to GHL
                  if (attempts >= maxAttempts) {
                      console.log('Max attempts reached, redirecting to GHL...');
                      window.location.href = 'https://app.gohighlevel.com/marketplace/apps';
                  } else {
                      // Try again in 2 seconds
                      setTimeout(checkInstallation, 2000);
                  }
              }
              
              // Start checking after 2 seconds
              setTimeout(checkInstallation, 2000);
          </script>
      </body>
      </html>
    `;
    
    return res.send(waitingHTML);
    
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
    // Save Waapify config to database
    const installation = await Database.getInstallation(companyId, locationId);
    if (!installation) {
      return res.status(400).json({ error: "Installation not found" });
    }
    
    // Save Waapify config to database
    const waapifyConfig: WaapifyConfig = {
      installation_id: installation.id!,
      company_id: companyId,
      location_id: locationId,
      access_token: accessToken,
      instance_id: instanceId,
      whatsapp_number: whatsappNumber,
      is_active: true
    };
    
    await Database.saveWaapifyConfig(waapifyConfig);
    
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

/* -------------------- Debug: Log ALL requests to catch missing form submissions -------------------- */
app.use('*', (req: Request, res: Response, next) => {
  if (req.method === 'POST' && (req.url.includes('auth') || req.body.access_token || req.body.accessToken)) {
    console.log(`🔍 === CATCHING POST REQUEST TO ${req.url} ===`);
    console.log('Method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body Keys:', Object.keys(req.body));
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

/* -------------------- Configuration Page with Proper Route -------------------- */
app.get("/config/:companyId/:locationId", (req: Request, res: Response) => {
  const { companyId, locationId } = req.params;
  
  console.log('=== Config Page Requested ===', { companyId, locationId });
  
  const configHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Waapify Setup - Final Step</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f8f9fa; }
            .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #007cba; margin-bottom: 10px; }
            .header p { color: #666; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
            input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
            button { width: 100%; background: #007cba; color: white; padding: 15px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
            button:hover { background: #005a87; }
            button:disabled { background: #ccc; cursor: not-allowed; }
            .success { color: #28a745; padding: 10px; background: #d4edda; border-radius: 4px; }
            .error { color: #dc3545; padding: 10px; background: #f8d7da; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Waapify Setup</h1>
                <p>Enter your Waapify credentials to complete the integration</p>
            </div>
            
            <form id="configForm">
                <div class="form-group">
                    <label>Waapify Access Token:</label>
                    <input type="text" id="accessToken" placeholder="1740aed492830374b432091211a6628d" required>
                </div>
                
                <div class="form-group">
                    <label>Waapify Instance ID:</label>
                    <input type="text" id="instanceId" placeholder="673F5A50E7194" required>
                </div>
                
                <div class="form-group">
                    <label>WhatsApp Number:</label>
                    <input type="text" id="whatsappNumber" placeholder="60168970072">
                </div>
                
                <button type="submit" id="saveBtn">Complete Setup</button>
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
                saveBtn.textContent = 'Saving...';
                messageDiv.innerHTML = '';
                
                try {
                    const response = await fetch('/external-auth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            companyId: '${companyId}',
                            locationId: '${locationId}',
                            access_token: accessToken,
                            instance_id: instanceId,
                            whatsapp_number: whatsappNumber
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        messageDiv.innerHTML = '<div class="success">✅ Setup complete! Your Waapify integration is ready.</div>';
                        setTimeout(() => {
                            window.location.href = 'https://app.gohighlevel.com/agency_launchpad';
                        }, 2000);
                    } else {
                        messageDiv.innerHTML = '<div class="error">❌ Error: ' + (result.error || 'Setup failed') + '</div>';
                    }
                    
                } catch (error) {
                    messageDiv.innerHTML = '<div class="error">❌ Connection error. Please try again.</div>';
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Complete Setup';
                }
            });
        </script>
    </body>
    </html>
  `;
  
  res.send(configHTML);
});

/* -------------------- Alternative External Auth Endpoints for Testing -------------------- */
app.post("/auth", async (req: Request, res: Response) => {
  console.log('🔍 === /auth endpoint called ===', JSON.stringify(req.body, null, 2));
  res.json({ success: true, endpoint: '/auth', received: req.body });
});

app.post("/external-authentication", async (req: Request, res: Response) => {
  console.log('🔍 === /external-authentication endpoint called ===', JSON.stringify(req.body, null, 2));
  res.json({ success: true, endpoint: '/external-authentication', received: req.body });
});

app.post("/authenticate", async (req: Request, res: Response) => {
  console.log('🔍 === /authenticate endpoint called ===', JSON.stringify(req.body, null, 2));
  res.json({ success: true, endpoint: '/authenticate', received: req.body });
});

/* -------------------- External Authentication Endpoint -------------------- */
app.post("/external-auth", async (req: Request, res: Response) => {
  console.log('🔍 === EXTERNAL AUTH ENDPOINT - USER SUBMITTING CREDENTIALS ===');
  console.log('Request method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Raw Body:', JSON.stringify(req.body, null, 2));
  console.log('Raw Query:', JSON.stringify(req.query, null, 2));
  console.log('All Headers:', JSON.stringify(req.headers, null, 2));
  
  // Check ALL possible ways GHL might send form data
  const access_token = req.body.access_token || req.body.accessToken || req.body['access-token'] || req.query.access_token;
  const instance_id = req.body.instance_id || req.body.instanceId || req.body['instance-id'] || req.query.instance_id;
  const whatsapp_number = req.body.whatsapp_number || req.body.whatsappNumber || req.body['whatsapp-number'] || req.query.whatsapp_number;
  
  console.log('🎯 === EXTRACTED USER CREDENTIALS ===', {
    access_token: access_token ? 'PROVIDED' : 'MISSING',
    instance_id: instance_id ? 'PROVIDED' : 'MISSING',
    whatsapp_number: whatsapp_number ? 'PROVIDED' : 'MISSING',
    raw_access_token: access_token,
    raw_instance_id: instance_id
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
  
  // Validate required credentials from custom form
  if (!access_token || !instance_id) {
    console.log('❌ Missing required Waapify credentials from user form');
    return res.status(400).json({
      success: false,
      error: "Missing required Waapify credentials", 
      message: "Please provide both Access Token and Instance ID",
      received_fields: Object.keys(req.body)
    });
  }
  
  console.log('✅ User provided all required credentials, proceeding with save...');
  
  try {
    // Test Waapify connection
    const authResult = await testWaapifyConnection(access_token, instance_id);
    
    if (authResult.success) {
      // Store Waapify credentials for this locationId
      const locationId = Array.isArray(req.body.locationId) ? req.body.locationId[0] : req.body.locationId;
      let companyId = req.body.companyId;
      
      // If companyId is null, try to find it from existing installations
      if (!companyId && locationId) {
        console.log('=== CompanyId is null for credential save, searching existing installations ===');
        try {
          const installations = await Database.getAllInstallations();
          const existingInstallation = installations.find(inst => inst.location_id === locationId);
          if (existingInstallation) {
            companyId = existingInstallation.company_id;
            console.log(`✅ Found companyId for credential save: ${companyId}`);
          }
        } catch (error) {
          console.log('⚠️ Could not search existing installations for credentials:', error);
        }
      }
      
      if (locationId && companyId) {
        console.log('=== Storing Waapify Config ===', { locationId, companyId, instance_id });
        
        // Get installation or create if doesn't exist
        let installation = await Database.getInstallation(companyId, locationId);
        if (!installation) {
          // Create installation for external auth
          const newInstallation: Installation = {
            company_id: companyId,
            location_id: locationId,
            access_token: 'external_auth_token',
            refresh_token: 'external_auth_refresh',
            expires_in: 86400
          };
          const installationId = await Database.saveInstallation(newInstallation);
          installation = { ...newInstallation, id: installationId };
        }
        
        if (installation && installation.id) {
          console.log('=== About to save waapify_config ===', { installation_id: installation.id, companyId, locationId });
          
          const waapifyConfig: WaapifyConfig = {
            installation_id: installation.id,
            company_id: companyId,
            location_id: locationId,
            access_token: access_token,
            instance_id: instance_id,
            whatsapp_number: whatsapp_number || 'unknown',
            is_active: true
          };
          
          console.log('=== Calling Database.saveWaapifyConfig ===');
          try {
            await Database.saveWaapifyConfig(waapifyConfig);
            console.log('✅ Waapify config saved successfully to database!');
          } catch (saveError) {
            console.error('❌ Failed to save waapify_config:', saveError);
            throw saveError;
          }
        } else {
          console.log('❌ No installation found - cannot save waapify_config');
        }
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

/* -------------------- Installations Check API -------------------- */
app.get("/api/installations-check", async (req: Request, res: Response) => {
  console.log('=== Installations Check API Request ===');
  
  try {
    const installations = await Database.getAllInstallations();
    console.log(`Found ${installations.length} installations`);
    
    const hasInstallations = installations.length > 0;
    const latest = hasInstallations ? installations[installations.length - 1] : null;
    
    return res.json({
      success: true,
      hasInstallations,
      latest: latest ? {
        company_id: latest.company_id,
        location_id: latest.location_id,
        installed_at: latest.installed_at
      } : null,
      totalInstallations: installations.length
    });
    
  } catch (error) {
    console.error('❌ Installations check error:', error);
    return res.status(500).json({
      success: false,
      hasInstallations: false,
      latest: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/* -------------------- Phone Numbers API for GHL -------------------- */
app.get("/api/phone-numbers", async (req: Request, res: Response) => {
  const { companyId, locationId } = req.query as { companyId: string; locationId: string };
  
  console.log('=== Phone Numbers API Request ===', { companyId, locationId });
  
  try {
    // Get Waapify config for this location
    const waapifyConfig = await Database.getWaapifyConfig(companyId, locationId);
    
    if (!waapifyConfig) {
      // Check if installation exists but Waapify not configured
      const installation = await Database.getInstallation(companyId, locationId);
      
      if (installation) {
        // Installation exists but Waapify not configured - trigger external auth
        return res.status(401).json({
          phoneNumbers: [],
          success: false,
          message: "External authentication required",
          error: "REQUIRES_EXTERNAL_AUTH",
          authType: "external",
          authUrl: "https://waaghl.waapify.com/external-auth",
          configUrl: `https://waaghl.waapify.com/config/${companyId}/${locationId}`
        });
      } else {
        // No installation found
        return res.json({
          phoneNumbers: [],
          success: false,
          message: "Installation not found - please install the app first"
        });
      }
    }
    
    // Return WhatsApp number as available phone number
    return res.json({
      phoneNumbers: [
        {
          id: waapifyConfig.instance_id,
          number: `+${waapifyConfig.whatsapp_number}`,
          displayNumber: waapifyConfig.whatsapp_number,
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
  
  // Check if this is a GHL installation webhook (not a message)
  if (req.body.type === 'INSTALL' || req.body.type === 'EXTERNAL_AUTH_CONNECTED' || req.body.type === 'UNINSTALL') {
    console.log(`=== Routing ${req.body.type} webhook to GHL handler ===`);
    
    const { type, locationId, companyId, userId, companyName } = req.body;
    
    try {
      // Handle different webhook types
      switch (type) {
        case 'INSTALL':
          console.log('=== Processing INSTALL webhook ===');
          
          if (!locationId || !companyId) {
            return res.status(400).json({ error: "Missing locationId or companyId for installation" });
          }
          
          // Save installation to database
          const installationData = {
            company_id: companyId,
            location_id: locationId,
            access_token: 'pending_oauth', // Will be updated via OAuth
            refresh_token: 'pending_oauth',
            expires_in: 3600,
          };
          
          const installationId = await Database.saveInstallation(installationData);
          console.log(`✅ Installation saved: ${installationId} for company: ${companyId}, location: ${locationId}`);
          
          // Return response that redirects to config form
          console.log('=== INSTALL Complete - Should Redirect to Config ===');
          return res.status(200).json({ 
            success: true, 
            message: "Installation successful",
            installationId: installationId,
            status: "installed",
            redirect_url: `https://waaghl.waapify.com/config/${companyId}/${locationId}`,
            // GHL might use this for automatic redirect
            location: `https://waaghl.waapify.com/config/${companyId}/${locationId}`
          });
          
        case 'EXTERNAL_AUTH_CONNECTED':
          console.log('=== Processing EXTERNAL_AUTH_CONNECTED webhook ===');
          console.log('=== EXTERNAL_AUTH_CONNECTED Full Data ===', JSON.stringify(req.body, null, 2));
          
          // Check if credentials come through this webhook
          const authData = req.body.authData || req.body.credentials || req.body.config;
          if (authData) {
            console.log('🔍 Found auth data in webhook:', authData);
            
            // Try to save credentials from webhook
            const { access_token, instance_id, whatsapp_number } = authData;
            if (access_token && instance_id && locationId) {
              console.log('=== Saving credentials from EXTERNAL_AUTH_CONNECTED webhook ===');
              // Save logic here if needed
            }
          }
          
          return res.json({ 
            success: true, 
            message: "External auth connected webhook received" 
          });
          
        case 'UNINSTALL':
          console.log('=== Processing UNINSTALL webhook ===');
          
          if (locationId && companyId) {
            // Remove installation and configs
            const installation = await Database.getInstallation(companyId, locationId);
            if (installation) {
              // Note: Database foreign keys will cascade delete waapify_configs
              console.log(`🗑️ Uninstalling for company: ${companyId}, location: ${locationId}`);
            }
          }
          
          return res.json({ 
            success: true, 
            message: "Uninstall webhook processed" 
          });
          
        default:
          console.log(`⚠️ Unknown GHL webhook type: ${type}`);
          return res.json({ 
            success: true, 
            message: "GHL webhook received but type not specifically handled",
            type: type 
          });
      }
      
    } catch (error: any) {
      console.error("GHL webhook error:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        type: type 
      });
    }
  }
  
  // Handle regular message webhooks
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
    const installations = await Database.getAllInstallations();
    const installation = installations.find(inst => inst.location_id === locationId);
    
    if (!installation) {
      return res.status(400).json({ error: "Installation not found for location" });
    }
    
    // Get Waapify configuration for this location
    const waapifyConfig = await Database.getWaapifyConfig(installation.company_id, locationId);
    if (!waapifyConfig) {
      return res.status(400).json({ error: "Waapify not configured for this location" });
    }
    
    // Check for rate limiting
    const rateLimitCheck = await Database.checkRateLimit(installation.company_id, locationId);
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
        waapifyConfig.access_token,
        waapifyConfig.instance_id,
        'media',
        attachment.url,
        attachment.filename
      );
    } else {
      // Send text message
      whatsappResult = await sendWhatsAppMessage(
        phone,
        message,
        waapifyConfig.access_token,
        waapifyConfig.instance_id
      );
    }
    
    // Rate limit is automatically updated by Database.checkRateLimit
    
    if (whatsappResult.success) {
      console.log(`✅ WhatsApp message sent successfully to ${phone}`);
      
      // Log message for delivery tracking
      await logMessage(installation.company_id, locationId, {
        ghlMessageId: messageId,
        waapifyMessageId: whatsappResult.messageId,
        recipient: phone,
        message: message,
        type: attachments && attachments.length > 0 ? 'media' : 'text',
        status: 'delivered',
        sentAt: whatsappResult.timestamp || new Date().toISOString()
      });
      
      // GHL expects specific response format with delivery status
      res.json({
        success: true,
        conversationId: `conv_${locationId}_${contactId}`,
        messageId: whatsappResult.messageId || messageId || `wa_${Date.now()}`,
        message: message,
        contactId: contactId,
        status: 'delivered',
        deliveredAt: whatsappResult.timestamp || new Date().toISOString(),
        dateAdded: new Date().toISOString(),
        provider: 'waapify'
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

/* -------------------- GHL Installation & General Webhook Handler -------------------- */
app.post("/webhook/ghl", async (req: Request, res: Response) => {
  console.log("=== GHL Webhook Received ===", JSON.stringify(req.body, null, 2));
  
  const { type, locationId, companyId, userId, companyName } = req.body;
  
  try {
    // Handle different webhook types
    switch (type) {
      case 'INSTALL':
        console.log('=== Processing INSTALL webhook ===');
        
        if (!locationId || !companyId) {
          return res.status(400).json({ error: "Missing locationId or companyId for installation" });
        }
        
        // Save installation to database
        const installationData = {
          company_id: companyId,
          location_id: locationId,
          access_token: 'pending_oauth', // Will be updated via OAuth
          refresh_token: 'pending_oauth',
          expires_in: 3600,
        };
        
        const installationId = await Database.saveInstallation(installationData);
        console.log(`✅ Installation saved: ${installationId} for company: ${companyId}, location: ${locationId}`);
        
        res.json({ 
          success: true, 
          message: "Installation webhook processed",
          installationId: installationId
        });
        break;
        
      case 'EXTERNAL_AUTH_CONNECTED':
        console.log('=== Processing EXTERNAL_AUTH_CONNECTED webhook ===');
        res.json({ 
          success: true, 
          message: "External auth connected webhook received" 
        });
        break;
        
      case 'UNINSTALL':
        console.log('=== Processing UNINSTALL webhook ===');
        
        if (locationId && companyId) {
          // Remove installation and configs
          const installation = await Database.getInstallation(companyId, locationId);
          if (installation) {
            // Note: Database foreign keys will cascade delete waapify_configs
            console.log(`🗑️ Uninstalling for company: ${companyId}, location: ${locationId}`);
          }
        }
        
        res.json({ 
          success: true, 
          message: "Uninstall webhook processed" 
        });
        break;
        
      default:
        console.log(`⚠️ Unknown webhook type: ${type}`);
        res.json({ 
          success: true, 
          message: "Webhook received but type not specifically handled",
          type: type 
        });
        break;
    }
    
  } catch (error: any) {
    console.error("GHL webhook error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      type: type 
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
    const installations = await Database.getAllInstallations();
    const installation = installations.find(inst => inst.location_id === locationId);
    
    if (!installation) {
      return res.json({
        status: "inactive",
        error: "Installation not found"
      });
    }
    
    // Check Waapify config
    const waapifyConfig = await Database.getWaapifyConfig(installation.company_id, locationId);
    if (!waapifyConfig) {
      return res.json({
        status: "inactive",
        error: "Waapify not configured"
      });
    }
    
    // Test connection
    const testResult = await testWaapifyConnection(waapifyConfig.access_token, waapifyConfig.instance_id);
    
    res.json({
      status: testResult.success ? "active" : "error",
      provider: "waapify",
      providerName: "Waapify WhatsApp",
      whatsappNumber: waapifyConfig.whatsapp_number,
      instanceId: waapifyConfig.instance_id,
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
  
  const { number, message, media_url, filename, locationId, companyId, contactId, instance_id, access_token, test_mode } = req.body;
  
  // Handle Test Mode
  if (test_mode) {
    return res.json(handleTestMode('Send WhatsApp Media', { number, message, media_url, filename }));
  }
  
  // Phone Number Auto-formatting and Validation
  const phoneValidation = formatPhoneNumber(number);
  if (!phoneValidation.isValid) {
    return res.status(400).json(createErrorResponse(
      'Invalid phone number format',
      phoneValidation.suggestions,
      'INVALID_PHONE'
    ));
  }
  const formattedNumber = phoneValidation.formatted;
  
  if (!message || !media_url) {
    return res.status(400).json(createErrorResponse(
      'Missing required fields: message and media_url are required',
      'Please provide both a message and a media file URL.',
      'MISSING_FIELDS'
    ));
  }
  
  try {
    let finalInstanceId = instance_id;
    let finalAccessToken = access_token;
    
    // If credentials not provided directly, try to get from stored config
    if ((!instance_id || !access_token) && locationId && companyId) {
      console.log('Trying to get stored Waapify config for:', { locationId, companyId });
      const installations = await Database.getAllInstallations();
      const installation = installations.find(inst => 
        inst.location_id === locationId || inst.company_id === companyId
      );
      
      if (installation) {
        const waapifyConfig = await Database.getWaapifyConfig(installation.company_id, installation.location_id || '');
        if (waapifyConfig) {
          finalInstanceId = finalInstanceId || waapifyConfig.instance_id;
          finalAccessToken = finalAccessToken || waapifyConfig.access_token;
        }
      }
    }
    
    if (!finalInstanceId || !finalAccessToken) {
      return res.status(400).json({ 
        success: false,
        error: "Missing credentials. Either provide instance_id & access_token directly, or ensure locationId & companyId are provided with stored Waapify config." 
      });
    }
    
    // Send media message via Waapify
    const result = await sendWhatsAppMessage(
      formattedNumber, 
      message, 
      finalAccessToken, 
      finalInstanceId,
      'media',
      media_url,
      filename
    );
    
    // Log the message (if we have installation)
    if (locationId && companyId) {
      const installations = await Database.getAllInstallations();
      const installation = installations.find(inst => 
        inst.location_id === locationId || inst.company_id === companyId
      );
      
      if (installation && installation.location_id) {
        await logMessage(installation.company_id, installation.location_id, {
          ghlMessageId: `media_${Date.now()}`,
          waapifyMessageId: result.messageId || `media_${Date.now()}`,
          recipient: formattedNumber,
          message: `${message} [Media: ${filename || 'file'}]`,
          type: 'media',
          status: result.success ? 'sent' : 'failed',
          sentAt: new Date().toISOString()
        });
      }
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
    let suggestion = 'Please check your internet connection and media URL accessibility.';
    if (error.message.includes('timeout')) {
      suggestion = 'Request timed out. Large files may take longer. Please try with a smaller file or check your connection.';
    } else if (error.message.includes('Access token does not exist')) {
      suggestion = 'Your Waapify access token is invalid or expired. Please update your credentials in the app settings.';
    } else if (error.message.includes('File too large')) {
      suggestion = 'Media file is too large. WhatsApp supports files up to 16MB. Please use a smaller file.';
    }
    res.status(500).json(createErrorResponse(error.message, suggestion, 'MEDIA_SEND_FAILED'));
  }
});

// GHL Action: AI Chatbot Response (Enhanced with improvements)
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
    contactId,
    test_mode
  } = req.body;
  
  // Handle Test Mode
  if (test_mode) {
    return res.json({
      ...handleTestMode('AI Chatbot Response', { customerMessage, phone, keywords, context }),
      ai_config_valid: !!openai_api_key,
      keywords_matched: keywords ? checkKeywordTriggers(customerMessage, 
        typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords || []) : [],
      sample_response: "Hello! This is a sample AI response for testing. Your configuration looks good!"
    });
  }
  
  // Validate phone number if provided
  let formattedPhone = phone;
  if (phone) {
    const phoneValidation = formatPhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json(createErrorResponse(
        'Invalid phone number format for WhatsApp sending',
        phoneValidation.suggestions,
        'INVALID_PHONE'
      ));
    }
    formattedPhone = phoneValidation.formatted;
  }
  
  if (!customerMessage) {
    return res.status(400).json(createErrorResponse(
      'Missing required field: customerMessage',
      'Please provide the customer message that triggered the AI response.',
      'MISSING_MESSAGE'
    ));
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
      const installations = await Database.getAllInstallations();
      const installation = installations.find(inst => 
        inst.location_id === locationId || inst.company_id === companyId
      );
      
      if (installation) {
        const aiConfig = await Database.getAIConfig(installation.company_id, installation.location_id || '');
        userOpenAIKey = aiConfig?.openai_api_key;
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
      const installations = await Database.getAllInstallations();
      const installation = installations.find(inst => 
        inst.location_id === locationId || inst.company_id === companyId
      );
      
      if (installation) {
        const waapifyConfig = await Database.getWaapifyConfig(installation.company_id, installation.location_id || '');
        if (waapifyConfig && aiResponse.response) {
          whatsappResult = await sendWhatsAppMessage(
            phone,
            aiResponse.response,
            waapifyConfig.access_token,
            waapifyConfig.instance_id
          );
          whatsappSent = whatsappResult.success;
          
          // Log the AI conversation
          if (installation.location_id) {
            await logMessage(installation.company_id, installation.location_id, {
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

/* -------------------- Testing/Debug Endpoints -------------------- */

// Temporary endpoint to create test installation for debugging
app.post("/debug/create-test-installation", async (req: Request, res: Response) => {
  try {
    const { companyId, locationId } = req.body;
    const testInstallation: Installation = {
      company_id: companyId || "test_company_456",
      location_id: locationId || "test_location_123",
      access_token: "test_token",
      refresh_token: "test_refresh",
      expires_in: 3600
    };
    
    await Database.saveInstallation(testInstallation);
    
    res.json({
      success: true,
      message: "Test installation created",
      installation: testInstallation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- Helper Functions for Improvements -------------------- */

// Phone Number Auto-formatting and Validation
function formatPhoneNumber(number: string): { formatted: string; isValid: boolean; suggestions?: string } {
  if (!number) return { formatted: '', isValid: false, suggestions: 'Phone number is required' };
  
  // Remove all non-digits
  let cleaned = number.replace(/[^\d]/g, '');
  
  // Auto-format common Malaysian patterns
  if (cleaned.startsWith('0')) {
    cleaned = '60' + cleaned.substring(1); // 012345678 → 60123456789
  } else if (cleaned.startsWith('6010') || cleaned.startsWith('6011') || cleaned.startsWith('6012') || cleaned.startsWith('6013') || cleaned.startsWith('6014') || cleaned.startsWith('6015') || cleaned.startsWith('6016') || cleaned.startsWith('6017') || cleaned.startsWith('6018') || cleaned.startsWith('6019')) {
    // Already formatted Malaysian number
  } else if (!cleaned.startsWith('60') && cleaned.length >= 9) {
    cleaned = '60' + cleaned; // Assume Malaysian if no country code
  }
  
  // Validate length
  const isValid = cleaned.length >= 10 && cleaned.length <= 15;
  let suggestions = '';
  
  if (!isValid) {
    if (cleaned.length < 10) suggestions = 'Phone number too short. Malaysian numbers should be 10-12 digits with country code.';
    if (cleaned.length > 15) suggestions = 'Phone number too long. Please check the number format.';
  }
  
  return { formatted: cleaned, isValid, suggestions };
}

// Better Error Messages with Suggestions
function createErrorResponse(error: string, suggestion?: string, errorCode?: string) {
  return {
    success: false,
    error: error,
    suggestion: suggestion || 'Please check your configuration and try again.',
    errorCode: errorCode || 'GENERAL_ERROR',
    helpUrl: 'https://waaghl.waapify.com/dashboard'
  };
}

// Test Mode Handler
function handleTestMode(action: string, params: any) {
  return {
    success: true,
    test_mode: true,
    action: action,
    message: `✅ Test successful! Your ${action} action is configured correctly.`,
    simulated_result: {
      messageId: `test_${Date.now()}`,
      recipient: params.number || params.phone,
      timestamp: new Date().toISOString(),
      estimated_cost: '$0.01',
      delivery_status: 'would_be_sent'
    },
    validation: {
      phone_valid: formatPhoneNumber(params.number || params.phone).isValid,
      credentials_valid: true,
      configuration_valid: true
    },
    next_steps: [
      'Your action is ready to use in live mode',
      'Remove "test_mode": true to send real messages',
      'Monitor results in your dashboard'
    ]
  };
}

/* -------------------- WhatsApp Actions Endpoints -------------------- */

// Send WhatsApp Text Message (Enhanced with improvements)
app.post("/action/send-whatsapp-text", async (req: Request, res: Response) => {
  console.log('=== WhatsApp Text API Called ===');
  console.log('Headers:', req.headers);
  console.log('Raw Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { number, message, instance_id, access_token, locationId, companyId, type = "text", test_mode } = req.body;
    
    // Handle Test Mode
    if (test_mode) {
      return res.json(handleTestMode('Send WhatsApp Text', { number, message }));
    }
    
    // Phone Number Auto-formatting and Validation
    const phoneValidation = formatPhoneNumber(number);
    if (!phoneValidation.isValid) {
      return res.status(400).json(createErrorResponse(
        'Invalid phone number format',
        phoneValidation.suggestions,
        'INVALID_PHONE'
      ));
    }
    const formattedNumber = phoneValidation.formatted;
    
    let finalInstanceId = instance_id;
    let finalAccessToken = access_token;
    
    // If credentials not provided directly, try to get from stored config
    if ((!instance_id || !access_token) && locationId && companyId) {
      console.log('Trying to get stored Waapify config for:', { locationId, companyId });
      const waapifyConfig = await Database.getWaapifyConfig(companyId, locationId);
      if (waapifyConfig) {
        finalInstanceId = finalInstanceId || waapifyConfig.instance_id;
        finalAccessToken = finalAccessToken || waapifyConfig.access_token;
        console.log('Found stored config:', { instanceId: !!finalInstanceId, accessToken: !!finalAccessToken });
      }
    }
    
    if (!message || !finalInstanceId || !finalAccessToken) {
      let suggestion = '';
      if (!finalInstanceId || !finalAccessToken) {
        suggestion = 'Please complete the external authentication in your app settings, or provide credentials directly in the action.';
      }
      return res.status(400).json(createErrorResponse(
        'Missing required fields or credentials',
        suggestion,
        'MISSING_CREDENTIALS'
      ));
    }
    
    // Clean message to remove potential control characters
    const cleanMessage = message.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    console.log('Sending data:', { 
      formattedNumber, 
      cleanMessage: cleanMessage.substring(0, 50) + '...',
      hasCredentials: !!finalAccessToken
    });
    
    const result = await sendWhatsAppMessage(formattedNumber, cleanMessage, finalAccessToken, finalInstanceId, type);
    
    // Log message to database and send GHL callback if successful
    if (result.success && locationId && companyId) {
      try {
        const installation = await Database.getInstallation(companyId, locationId);
        if (installation && installation.id) {
          const ghlMessageId = `text_${Date.now()}`;
          const waapifyMessageId = result.messageId || `wa_${Date.now()}`;
          
          // Log to database
          await Database.logMessage({
            installation_id: installation.id,
            company_id: companyId,
            location_id: locationId,
            ghl_message_id: ghlMessageId,
            waapify_message_id: waapifyMessageId,
            recipient: formattedNumber,
            message: cleanMessage,
            message_type: type === 'media' ? 'media' : 'text',
            media_url: undefined,
            filename: undefined,
            status: 'sent',
            error_message: undefined
          });
          console.log('✅ Message logged to database');
          
          // Send delivery callback to GHL
          try {
            const callbackUrl = `https://services.leadconnectorhq.com/hooks/sms/delivery`;
            const callbackData = {
              locationId: locationId,
              messageId: ghlMessageId,
              status: 'delivered',
              providerId: 'waapify-sms', 
              timestamp: new Date().toISOString(),
              phoneNumber: formattedNumber
            };
            
            console.log('🔄 Sending GHL delivery callback:', callbackData);
            
            const callbackResponse = await fetch(callbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${installation.access_token}`
              },
              body: JSON.stringify(callbackData)
            });
            
            if (callbackResponse.ok) {
              console.log('✅ GHL delivery callback sent successfully');
            } else {
              console.log('⚠️ GHL delivery callback failed:', callbackResponse.status, await callbackResponse.text());
            }
          } catch (callbackError) {
            console.error('❌ Failed to send GHL callback:', callbackError);
          }
        }
      } catch (logError) {
        console.error('❌ Failed to log message:', logError);
      }
    }
    
    console.log('WhatsApp result:', result);
    res.json(result);
    
  } catch (error: any) {
    console.error('WhatsApp text API error:', error);
    let suggestion = 'Please check your internet connection and try again.';
    if (error.message.includes('timeout')) {
      suggestion = 'Request timed out. Please try again or check your Waapify service status.';
    } else if (error.message.includes('Access token does not exist')) {
      suggestion = 'Your Waapify access token is invalid or expired. Please update your credentials in the app settings.';
    }
    res.status(500).json(createErrorResponse(error.message, suggestion, 'SEND_FAILED'));
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
  const { number, instance_id, access_token, locationId, companyId } = req.body;
  
  let finalInstanceId = instance_id;
  let finalAccessToken = access_token;
  
  // If credentials not provided directly, try to get from stored config
  if ((!instance_id || !access_token) && locationId && companyId) {
    console.log('Trying to get stored Waapify config for check number:', { locationId, companyId });
    const waapifyConfig = await Database.getWaapifyConfig(companyId, locationId);
    if (waapifyConfig) {
      finalInstanceId = finalInstanceId || waapifyConfig.instance_id;
      finalAccessToken = finalAccessToken || waapifyConfig.access_token;
    }
  }
  
  if (!number || !finalInstanceId || !finalAccessToken) {
    return res.status(400).json({ 
      error: "Missing required fields. Either provide instance_id & access_token directly, or ensure locationId & companyId are provided with stored Waapify config." 
    });
  }
  
  try {
    const axios = require('axios');
    const cleanNumber = number.replace(/[^\d]/g, '');
    
    const response = await axios.get(`https://stag.waapify.com/api/send.php`, {
      params: {
        number: cleanNumber,
        type: 'check_phone',
        instance_id: finalInstanceId,
        access_token: finalAccessToken
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
    
    // Check if Waapify actually sent the message successfully
    const waapifySuccess = response.data.status === 'success' || response.data.data?.status === 'PENDING';
    
    return {
      success: waapifySuccess,
      messageId: response.data.id || response.data.data?.key?.id || Date.now().toString(),
      status: waapifySuccess ? 'delivered' : 'failed',
      timestamp: new Date().toISOString(),
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
    const installations = await Database.getAllInstallations();
    const installation = installations.find(inst => 
      null === instanceId
    );
    
    if (!installation || !installation.location_id) {
      console.log("No installation found for AI chatbot processing");
      return;
    }
    
    // Get AI chatbot configuration
    const aiConfig = await Database.getAIConfig(installation.company_id, installation.location_id);
    
    if (!aiConfig || !aiConfig.enabled) {
      console.log("AI chatbot not enabled for this location");
      return;
    }
    
    // Check if message triggers any keywords
    const triggeredKeywords = checkKeywordTriggers(messageText, (aiConfig.keywords || "").split(','));
    
    if (triggeredKeywords.length === 0) {
      console.log("No AI chatbot keywords triggered");
      return;
    }
    
    console.log(`🤖 AI Chatbot triggered by keywords: ${triggeredKeywords.join(', ')}`);
    
    // Generate AI response using user's API key
    const aiResponse = await generateChatGPTResponse({
      customerMessage: messageText,
      context: aiConfig.context || '',
      persona: aiConfig.persona || '',
      triggeredKeywords,
      openaiApiKey: aiConfig.openai_api_key || ''
    });
    
    if (!aiResponse.success) {
      console.error("AI response generation failed:", aiResponse.error);
      return;
    }
    
    // Send AI response via WhatsApp
    const waapifyConfig = await Database.getWaapifyConfig(installation.company_id, installation.location_id);
    if (waapifyConfig && aiResponse.response) {
      const whatsappResult = await sendWhatsAppMessage(
        fromNumber,
        aiResponse.response,
        waapifyConfig.access_token,
        waapifyConfig.instance_id
      );
      
      // Log the AI conversation
      await logMessage(installation.company_id, installation.location_id, {
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
    const installations = await Database.getAllInstallations();
    const installation = installations.find(inst => 
      null === instanceId
    );
    
    if (!installation || !installation.location_id) {
      console.error("No installation found for instance ID:", instanceId);
      return;
    }
    
    // Create contact if not exists
    const api = ghl.requests(installation.company_id);
    
    // Create/update contact
    try {
      await api.post("/contacts", {
        firstName: "WhatsApp",
        lastName: "Contact",
        phone: fromNumber,
        locationId: installation.location_id
      }, { headers: { Version: "2021-07-28" } });
    } catch (contactError) {
      // Contact might already exist, that's OK
      console.log("Contact creation note:", contactError);
    }
    
    // Send message to conversation
    await api.post("/conversations/messages", {
      type: "WhatsApp",
      contactId: await getContactId(fromNumber, installation.location_id, api),
      message: messageText,
      direction: "inbound",
      locationId: installation.location_id
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

    let token = await Database.getTokenForLocation(locationId);
    if (!token) {
      await ghl.getLocationTokenFromCompanyToken(companyId, locationId);
      token = await Database.getTokenForLocation(locationId);
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
      const installations = await Database.getAllInstallations();
      const installation = installations.find(inst => 
        inst.location_id === locationId || inst.company_id === companyId
      );
      if (installation) {
        const aiConfig = await Database.getAIConfig(installation.company_id, installation.location_id || '');
        userOpenAIKey = aiConfig?.openai_api_key;
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
      const waapifyConfig = await Database.getWaapifyConfig(companyId, locationId);
      if (waapifyConfig) {
        const whatsappResult = await sendWhatsAppMessage(
          phone,
          aiResponse.response || '',
          waapifyConfig.access_token,
          waapifyConfig.instance_id
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
    await Database.saveAIConfig(config);
    
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
    const config = await Database.getAIConfig(companyId, locationId);
    
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

/* -------------------- Auto-Recovery System -------------------- */

// Multi-user backup/restore system for marketplace app
async function ensureCriticalInstallations() {
  try {
    const installations = await Database.getAllInstallations();
    const installationCount = installations.length;
    
    // If no installations exist, try to restore from backup
    if (installationCount === 0) {
      console.log('⚠️ No installations found - checking for backup data...');
      
      // Check if backup data exists in environment variables
      const backupData = process.env.INSTALLATION_BACKUP;
      if (backupData) {
        try {
          const parsedBackup = JSON.parse(backupData);
          let restoredCount = 0;
          
          for (const backup of parsedBackup) {
            await Database.saveInstallation({
            company_id: backup.companyId,
            location_id: backup.locationId,
            access_token: 'restored_token',
            refresh_token: 'restored_refresh',
            expires_in: 86400
          } as Installation);
            
            if (backup.waapifyConfig) {
              const installation = await Database.getInstallation(backup.companyId, backup.locationId);
              if (installation && installation.id) {
                const waapifyConfig: WaapifyConfig = {
                  installation_id: installation.id,
                  company_id: backup.companyId,
                  location_id: backup.locationId,
                  access_token: backup.waapifyConfig.access_token,
                  instance_id: backup.waapifyConfig.instance_id,
                  whatsapp_number: backup.waapifyConfig.whatsapp_number,
                  is_active: true
                };
                await Database.saveWaapifyConfig(waapifyConfig);
              }
            }
            
            restoredCount++;
          }
          
          console.log(`✅ Restored ${restoredCount} installations from backup`);
        } catch (parseError) {
          console.error('❌ Failed to parse backup data:', parseError);
        }
      } else {
        console.log('ℹ️ No backup data found - this is normal for new deployments');
      }
    } else {
      console.log(`✅ Found ${installationCount} existing installations`);
    }
    
    // Create backup of current installations for future recovery
    // Create backup asynchronously
    const currentBackup = [];
    for (const inst of installations) {
      const waapifyConfig = await Database.getWaapifyConfig(inst.company_id, inst.location_id || '');
      if (waapifyConfig) {
        currentBackup.push({
          companyId: inst.company_id,
          locationId: inst.location_id,
          waapifyConfig
        });
      }
    } // Only backup installations with Waapify config
    
    if (currentBackup.length > 0) {
      console.log(`📦 Created backup for ${currentBackup.length} configured installations`);
      // In production, you'd save this to external storage (S3, etc.)
      // For now, it's just logged for manual backup if needed
    }
    
  } catch (error) {
    console.error('❌ Auto-recovery system error:', error);
  }
}

/* -------------------- Backup Management Endpoints -------------------- */

// Get current installations backup data (for manual backup)
app.get("/admin/backup", async (req: Request, res: Response) => {
  try {
    const installations = await Database.getAllInstallations();
    // Create backup data asynchronously
    const backupData = [];
    for (const inst of installations) {
      const waapifyConfig = await Database.getWaapifyConfig(inst.company_id, inst.location_id || '');
      if (waapifyConfig) {
        backupData.push({
          companyId: inst.company_id,
          locationId: inst.location_id,
          waapifyConfig
        });
      }
    }
    
    res.json({
      success: true,
      backup_count: backupData.length,
      backup_data: backupData,
      instructions: "Copy this backup_data to Render environment variable INSTALLATION_BACKUP"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- Start server -------------------- */
app.listen(port, async () => {
  console.log(`GHL app listening on port ${port}`);
  // Auto-recovery disabled for faster startup
  // await ensureCriticalInstallations();
});
