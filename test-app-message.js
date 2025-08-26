// Test app message sending via conversation provider endpoint
const axios = require('axios');
const { spawn } = require('child_process');

const TEST_DATA = {
  locationId: 'TEST_LOCATION',
  companyId: 'TEST_COMPANY', 
  contactId: 'TEST_CONTACT',
  messageId: 'TEST_MSG_' + Date.now(),
  phone: '+60168970072',
  message: '🚀 Test dari App Conversation Provider! Kalau dapat ni, full integration works!',
  waapifyAccessToken: '1740aed492830374b432091211a6628d',
  waapifyInstanceId: '673F5A50E7194'
};

async function testAppMessageSending() {
  console.log('🧪 === TESTING APP MESSAGE SENDING ===\n');
  
  // Start app
  console.log('Starting app on port 3006...');
  const appProcess = spawn('node', ['dist/index.js'], {
    env: { 
      ...process.env, 
      PORT: '3006',
      NODE_ENV: 'development'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let appReady = false;
  let testCompleted = false;
  
  appProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📱 App:', output.trim());
    
    if (output.includes('listening on port') && !appReady) {
      appReady = true;
      setTimeout(async () => {
        await runTests();
      }, 2000);
    }
  });
  
  appProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error && !error.includes('Database connection failed')) {
      console.log('❌ App Error:', error);
    }
  });
  
  setTimeout(() => {
    if (!appReady) {
      console.log('⚠️ App taking too long, trying tests anyway...');
      runTests();
    }
  }, 8000);
  
  async function runTests() {
    if (testCompleted) return;
    testCompleted = true;
    
    try {
      console.log('\n🧪 Testing app endpoints...');
      
      // Test 1: External Auth (setup Waapify config)
      console.log('\n1️⃣ Testing External Auth...');
      const authResponse = await axios.post('http://localhost:3006/external-auth', {
        companyId: TEST_DATA.companyId,
        locationId: TEST_DATA.locationId,
        access_token: TEST_DATA.waapifyAccessToken,
        instance_id: TEST_DATA.waapifyInstanceId,
        whatsapp_number: TEST_DATA.phone
      });
      console.log('✅ External Auth Result:', authResponse.data);
      
      // Wait a bit for setup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 2: Send Message via Conversation Provider
      console.log('\n2️⃣ Testing Message Sending...');
      console.log(`📱 Sending to: ${TEST_DATA.phone}`);
      console.log(`💬 Message: ${TEST_DATA.message}`);
      
      const messageResponse = await axios.post('http://localhost:3006/conversation-provider', {
        locationId: TEST_DATA.locationId,
        contactId: TEST_DATA.contactId,
        messageId: TEST_DATA.messageId,
        phone: TEST_DATA.phone,
        message: TEST_DATA.message,
        type: 'SMS',
        attachments: []
      });
      
      console.log('✅ Message Send Result:', JSON.stringify(messageResponse.data, null, 2));
      
      if (messageResponse.data.success) {
        console.log('🎉 SUCCESS! Message sent via app!');
        console.log('📱 Check your WhatsApp for the message!');
      } else {
        console.log('❌ FAILED! Message not sent');
        console.log('Error:', messageResponse.data.error);
      }
      
      // Test 3: Provider Status
      console.log('\n3️⃣ Testing Provider Status...');
      const statusResponse = await axios.get(`http://localhost:3006/provider/status?locationId=${TEST_DATA.locationId}&companyId=${TEST_DATA.companyId}`);
      console.log('📊 Provider Status:', statusResponse.data);
      
      console.log('\n' + '='.repeat(60));
      console.log('📋 FINAL SUMMARY:');
      console.log('- External Auth:', authResponse.data.success ? 'SUCCESS' : 'FAILED');
      console.log('- Message Sending:', messageResponse.data.success ? 'SUCCESS' : 'FAILED');
      console.log('- Provider Status:', statusResponse.data.status || 'UNKNOWN');
      console.log('- Phone:', TEST_DATA.phone);
      console.log('- Message:', TEST_DATA.message);
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
    
    // Clean up
    setTimeout(() => {
      console.log('\n🛑 Stopping app...');
      appProcess.kill();
      process.exit(0);
    }, 3000);
  }
}

testAppMessageSending();