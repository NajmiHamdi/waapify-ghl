// Simple local test dengan real Waapify credentials
const axios = require('axios');
const mysql = require('mysql2/promise');

// Real Waapify credentials (updated with correct ones)
const WAAPIFY_CONFIG = {
  access_token: "1740aed492830374b432091211a6628d", // Updated access token
  instance_id: "673F5A50E7194",                    // Updated instance ID
  phone: "+60168970072",                           // Najmi's phone number  
  message: "🧪 Test dari Waapify-GHL local testing! Kalau dapat ni, means API berfungsi!"
};

async function testWaapifySend() {
  console.log('📱 === TESTING REAL WAAPIFY MESSAGE SEND ===\n');
  
  try {
    console.log('Sending to:', WAAPIFY_CONFIG.phone);
    console.log('Message:', WAAPIFY_CONFIG.message);
    console.log('Instance ID:', WAAPIFY_CONFIG.instance_id);
    
    const waapifyResponse = await axios.post('https://api.waapify.com/v1/send', {
      number: WAAPIFY_CONFIG.phone,
      message: WAAPIFY_CONFIG.message,
      instance_id: WAAPIFY_CONFIG.instance_id
    }, {
      headers: {
        'Authorization': `Bearer ${WAAPIFY_CONFIG.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Waapify API Response:', waapifyResponse.data);
    
    if (waapifyResponse.data.success) {
      console.log('🎉 WhatsApp message sent successfully!');
      console.log('Message ID:', waapifyResponse.data.message_id);
    } else {
      console.log('❌ Waapify send failed:', waapifyResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Waapify send error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testAppEndpoints() {
  console.log('\n🌐 === TESTING APP ENDPOINTS ===\n');
  
  try {
    // Start app first
    const { spawn } = require('child_process');
    console.log('Starting app on port 3005...');
    
    const appProcess = spawn('node', ['dist/index.js'], {
      env: { ...process.env, PORT: '3005', NODE_ENV: 'development' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let appReady = false;
    
    appProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📱 App:', output.trim());
      if (output.includes('listening on port')) {
        appReady = true;
        setTimeout(runEndpointTests, 2000);
      }
    });
    
    appProcess.stderr.on('data', (data) => {
      console.log('❌ App Error:', data.toString().trim());
    });
    
    setTimeout(() => {
      if (!appReady) {
        console.log('⚠️ App not ready, trying tests anyway...');
        runEndpointTests();
      }
    }, 8000);
    
    async function runEndpointTests() {
      try {
        console.log('\n🧪 Testing endpoints...');
        
        // Test basic endpoint
        const response = await axios.get('http://localhost:3005/');
        console.log('✅ Root endpoint works');
        
        // Test provider status
        const statusResponse = await axios.get('http://localhost:3005/provider/status?locationId=TEST&companyId=TEST');
        console.log('📊 Provider status:', statusResponse.data);
        
        // Test external auth
        const authResponse = await axios.post('http://localhost:3005/external-auth', {
          companyId: 'TEST_LOCAL',
          locationId: 'TEST_LOCAL',
          access_token: WAAPIFY_CONFIG.access_token,
          instance_id: WAAPIFY_CONFIG.instance_id,
          whatsapp_number: WAAPIFY_CONFIG.phone
        });
        console.log('🔐 External auth:', authResponse.data);
        
        // Test message sending via app
        console.log('\n📱 Testing message send via app...');
        const messageResponse = await axios.post('http://localhost:3005/conversation-provider', {
          locationId: 'TEST_LOCAL',
          contactId: 'TEST_CONTACT',
          messageId: 'TEST_MSG_' + Date.now(),
          phone: WAAPIFY_CONFIG.phone,
          message: '🚀 Test dari app endpoint! Kalau dapat ni, full integration works!',
          type: 'SMS'
        });
        console.log('📤 Message send result:', messageResponse.data);
        
        console.log('\n🎉 All endpoint tests completed!');
        
      } catch (error) {
        console.error('❌ Endpoint test failed:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        }
      }
      
      // Stop app
      setTimeout(() => {
        console.log('\n🛑 Stopping app...');
        appProcess.kill();
        process.exit(0);
      }, 3000);
    }
    
  } catch (error) {
    console.error('❌ App test failed:', error.message);
  }
}

// Run tests
console.log('🔥 Starting comprehensive local tests...\n');

testWaapifySend().then(() => {
  console.log('\n⏳ Waiting 3 seconds before app tests...');
  setTimeout(() => {
    testAppEndpoints();
  }, 3000);
});