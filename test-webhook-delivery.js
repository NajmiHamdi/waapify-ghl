// Test webhook delivery - simulate what GHL sends for SMS
const axios = require('axios');

async function testWebhookDelivery() {
  console.log('📡 === TESTING WEBHOOK DELIVERY FROM GHL ===\n');
  
  // First ensure we have external auth setup
  console.log('0️⃣ Setting up external auth first...');
  try {
    await axios.post('https://waaghl.waapify.com/external-auth', {
      locationId: 'rjsdYp4AhllL4EJDzQCP',
      companyId: 'NQFaKZYtxW6gENuYYALt',
      access_token: '1740aed492830374b432091211a6628d',
      instance_id: '673F5A50E7194',
      whatsapp_number: '60168970072'
    });
    console.log('✅ External auth setup complete');
  } catch (error) {
    console.log('⚠️ External auth setup error (might be already setup)');
  }
  
  // Test 1: SMS webhook from GHL
  console.log('\n1️⃣ Testing SMS webhook delivery...');
  const smsWebhook = {
    contactId: 'test_contact_123',
    locationId: 'rjsdYp4AhllL4EJDzQCP',
    type: 'SMS',
    phone: '+60168970072',
    message: '📡 Test SMS from GHL webhook',
    messageId: 'ghl_msg_' + Date.now(),
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await axios.post('https://waaghl.waapify.com/webhook/provider-outbound', smsWebhook, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GHL-SMS-Webhook'
      }
    });
    
    console.log('✅ SMS Webhook Response:', response.status);
    console.log('📱 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('🎉 SMS WEBHOOK WORKS!');
      console.log('📲 Check WhatsApp at +60168970072 for the message');
    }
    
  } catch (error) {
    console.error('❌ SMS Webhook Error:', error.response?.status, error.response?.data || error.message);
  }
  
  // Test 2: WhatsApp webhook from GHL (if supported)
  console.log('\n2️⃣ Testing WhatsApp webhook delivery...');
  const whatsappWebhook = {
    contactId: 'test_contact_124',
    locationId: 'rjsdYp4AhllL4EJDzQCP',
    type: 'WhatsApp',
    phone: '+60168970072',
    message: '📡 Test WhatsApp from GHL webhook',
    messageId: 'ghl_wa_' + Date.now(),
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await axios.post('https://waaghl.waapify.com/webhook/provider-outbound', whatsappWebhook, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GHL-WhatsApp-Webhook'
      }
    });
    
    console.log('✅ WhatsApp Webhook Response:', response.status);
    console.log('📱 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ WhatsApp Webhook Error:', error.response?.status, error.response?.data || error.message);
  }
  
  // Test 3: Media message webhook
  console.log('\n3️⃣ Testing media message webhook...');
  const mediaWebhook = {
    contactId: 'test_contact_125',
    locationId: 'rjsdYp4AhllL4EJDzQCP',
    type: 'SMS',
    phone: '+60168970072',
    message: '📡 Test media message from GHL',
    messageId: 'ghl_media_' + Date.now(),
    attachments: [
      {
        url: 'https://github.com/octocat.png',
        filename: 'octocat.png',
        type: 'image'
      }
    ],
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await axios.post('https://waaghl.waapify.com/webhook/provider-outbound', mediaWebhook, {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GHL-Media-Webhook'
      }
    });
    
    console.log('✅ Media Webhook Response:', response.status);
    console.log('📱 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Media Webhook Error:', error.response?.status, error.response?.data || error.message);
  }
  
  console.log('\n=== WEBHOOK TEST SUMMARY ===');
  console.log('If webhooks work but SMS still not sending from GHL:');
  console.log('1. Check GHL SMS Provider is enabled in account settings');
  console.log('2. Verify webhook URL in marketplace matches: https://waaghl.waapify.com/webhook/provider-outbound');
  console.log('3. Check GHL is sending to correct webhook endpoint');
  console.log('4. Verify locationId in GHL matches our database records');
}

testWebhookDelivery();