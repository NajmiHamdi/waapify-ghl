// Comprehensive test of ALL APIs including media, AI, etc
const axios = require('axios');
const { spawn } = require('child_process');
const mysql = require('mysql2/promise');

const CONFIG = {
  database: {
    host: '127.0.0.1',
    user: 'waapify_user',
    password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
    database: 'waapify_ghl'
  },
  test: {
    company_id: 'LOCAL_TEST_COMPANY',
    location_id: 'LOCAL_TEST_LOCATION',
    phone: '+60168970072',
    waapify_access_token: '1740aed492830374b432091211a6628d',
    waapify_instance_id: '673F5A50E7194'
  },
  app: {
    port: 3009,
    baseUrl: 'http://localhost:3009'
  }
};

async function testAllCompleteAPIs() {
  console.log('🚀 === TESTING ALL COMPLETE APIS ===\n');
  
  let appProcess;
  let dbConnection;
  
  try {
    // 1. Database connection
    console.log('1️⃣ Connecting to database...');
    dbConnection = await mysql.createConnection(CONFIG.database);
    const [result] = await dbConnection.execute('SELECT COUNT(*) as count FROM installations');
    console.log(`✅ Database connected - ${result[0].count} installations\n`);
    
    // 2. Start app
    console.log('2️⃣ Starting application...');
    appProcess = spawn('node', ['dist/index.js'], {
      env: { ...process.env, PORT: CONFIG.app.port },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    await new Promise((resolve) => {
      appProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) console.log('📱', output);
        if (output.includes('listening on port')) {
          setTimeout(resolve, 2000);
        }
      });
      
      appProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error && !error.includes('Warning') && !error.includes('Browserslist')) {
          console.log('⚠️', error);
        }
      });
    });
    
    console.log('✅ App started successfully!\n');
    
    // 3. Complete API Tests
    const allTests = [
      // Basic endpoints
      {
        name: '🔍 Provider Status',
        url: `${CONFIG.app.baseUrl}/provider/status?locationId=${CONFIG.test.location_id}&companyId=${CONFIG.test.company_id}`,
        method: 'GET'
      },
      
      // Authentication 
      {
        name: '🔐 External Auth',
        url: `${CONFIG.app.baseUrl}/external-auth`,
        method: 'POST',
        data: {
          companyId: CONFIG.test.company_id,
          locationId: CONFIG.test.location_id,
          access_token: CONFIG.test.waapify_access_token,
          instance_id: CONFIG.test.waapify_instance_id,
          whatsapp_number: CONFIG.test.phone
        }
      },
      
      // Text Message Sending
      {
        name: '💬 Send Text Message',
        url: `${CONFIG.app.baseUrl}/action/send-whatsapp-text`,
        method: 'POST',
        data: {
          number: CONFIG.test.phone,
          message: '📝 Test text message dari Complete API Test!',
          locationId: CONFIG.test.location_id,
          companyId: CONFIG.test.company_id,
          instance_id: CONFIG.test.waapify_instance_id,
          access_token: CONFIG.test.waapify_access_token
        }
      },
      
      // Media Message Sending
      {
        name: '📷 Send Media Message',
        url: `${CONFIG.app.baseUrl}/action/send-whatsapp-media`,
        method: 'POST',
        data: {
          number: CONFIG.test.phone,
          message: '🖼️ Test media message dengan gambar!',
          media_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          filename: 'test-image.png',
          instance_id: CONFIG.test.waapify_instance_id,
          access_token: CONFIG.test.waapify_access_token
        }
      },
      
      // GHL Media Action
      {
        name: '🎬 GHL Media Action',
        url: `${CONFIG.app.baseUrl}/action/send-whatsapp-media-ghl`,
        method: 'POST',
        data: {
          number: CONFIG.test.phone,
          message: '🎥 Test GHL media action!',
          media_url: 'https://picsum.photos/400/300',
          filename: 'ghl-test.jpg',
          locationId: CONFIG.test.location_id,
          companyId: CONFIG.test.company_id,
          contactId: 'TEST_CONTACT_456',
          instance_id: CONFIG.test.waapify_instance_id,
          access_token: CONFIG.test.waapify_access_token
        }
      },
      
      // Phone Number Check
      {
        name: '📱 Check Phone Number',
        url: `${CONFIG.app.baseUrl}/action/check-whatsapp-phone`,
        method: 'POST',
        data: {
          number: CONFIG.test.phone,
          instance_id: CONFIG.test.waapify_instance_id,
          access_token: CONFIG.test.waapify_access_token,
          locationId: CONFIG.test.location_id,
          companyId: CONFIG.test.company_id
        }
      },
      
      // AI Chatbot Configuration
      {
        name: '🤖 AI Chatbot Config',
        url: `${CONFIG.app.baseUrl}/api/ai-chatbot/configure`,
        method: 'POST',
        data: {
          locationId: CONFIG.test.location_id,
          companyId: CONFIG.test.company_id,
          enabled: true,
          keywords: 'help,support,question',
          context: 'You are a helpful customer service assistant for testing',
          persona: 'friendly and professional',
          openai_api_key: 'sk-test-key-for-testing',
          model: 'gpt-3.5-turbo',
          max_tokens: 150,
          temperature: 0.7
        }
      },
      
      // AI Chatbot Response 
      {
        name: '🧠 AI Chatbot Response',
        url: `${CONFIG.app.baseUrl}/action/ai-chatbot-ghl`,
        method: 'POST',
        data: {
          locationId: CONFIG.test.location_id,
          companyId: CONFIG.test.company_id,
          contactId: 'TEST_CONTACT_AI',
          customerMessage: 'Hello, I need help with my order. Can you assist me?',
          phone: CONFIG.test.phone,
          context: 'You are a helpful customer service assistant',
          persona: 'friendly and professional',
          keywords: 'help,support,order',
          openai_api_key: 'sk-test-key'
        }
      },
      
      // Waapify QR Code
      {
        name: '📳 Get QR Code',
        url: `${CONFIG.app.baseUrl}/api/waapify/qr-code?instance_id=${CONFIG.test.waapify_instance_id}&access_token=${CONFIG.test.waapify_access_token}`,
        method: 'GET'
      },
      
      // Send Group Message
      {
        name: '👥 Send Group Message',
        url: `${CONFIG.app.baseUrl}/api/waapify/send-group`,
        method: 'POST',
        data: {
          group_id: 'test_group_id',
          message: 'Test group message from Complete API test',
          instance_id: CONFIG.test.waapify_instance_id,
          access_token: CONFIG.test.waapify_access_token
        }
      },
      
      // Message Logs API
      {
        name: '📋 Get Message Logs',
        url: `${CONFIG.app.baseUrl}/api/message-logs?companyId=${CONFIG.test.company_id}&locationId=${CONFIG.test.location_id}`,
        method: 'GET'
      },
      
      // Conversation Provider (Main GHL endpoint)
      {
        name: '📞 Conversation Provider',
        url: `${CONFIG.app.baseUrl}/webhook/provider-outbound`,
        method: 'POST',
        data: {
          contactId: 'TEST_CONTACT_FINAL',
          locationId: CONFIG.test.location_id,
          type: 'SMS',
          phone: CONFIG.test.phone,
          message: '🎯 Final test dari Conversation Provider - Complete API Test!',
          messageId: `final_test_${Date.now()}`
        }
      }
    ];
    
    let passedTests = 0;
    let failedTests = 0;
    const results = [];
    
    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      console.log(`\n${i + 3}️⃣ Testing ${test.name}...`);
      
      try {
        const response = test.method === 'GET' 
          ? await axios.get(test.url)
          : await axios.post(test.url, test.data);
        
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 150)}...`);
        
        // Special handling for message sending tests
        if (test.name.includes('Send') || test.name.includes('Message') || test.name.includes('Conversation')) {
          console.log(`   📱 Check WhatsApp at ${CONFIG.test.phone}!`);
        }
        
        passedTests++;
        results.push({ test: test.name, status: 'PASS', response: response.data });
        
      } catch (error) {
        console.error(`❌ ${test.name}: FAILED`);
        
        if (error.response) {
          console.error(`   Status: ${error.response.status}`);
          console.error(`   Error: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
        } else {
          console.error(`   Error: ${error.message}`);
        }
        
        failedTests++;
        results.push({ test: test.name, status: 'FAIL', error: error.message });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 4. Check database for all message types
    console.log(`\n${allTests.length + 3}️⃣ Checking database for message logs...`);
    
    const [messages] = await dbConnection.execute(`
      SELECT recipient, message, message_type, status, sent_at 
      FROM message_logs 
      ORDER BY sent_at DESC 
      LIMIT 10
    `);
    
    const [installations] = await dbConnection.execute(`
      SELECT company_id, location_id, access_token 
      FROM installations
    `);
    
    const [configs] = await dbConnection.execute(`
      SELECT company_id, location_id, instance_id, whatsapp_number, is_active 
      FROM waapify_configs
    `);
    
    console.log(`📋 Found ${messages.length} message logs`);
    console.log(`👥 Found ${installations.length} installations`);
    console.log(`⚙️ Found ${configs.length} Waapify configs`);
    
    if (messages.length > 0) {
      console.log('\nRecent messages:');
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.message_type} to ${msg.recipient}: ${msg.message.substring(0, 40)}... [${msg.status}]`);
      });
    }
    
    // 5. Final comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('🎯 === COMPLETE API TEST REPORT ===');
    console.log('='.repeat(80));
    
    console.log(`📊 Test Results: ${passedTests}/${allTests.length} passed (${Math.round((passedTests/allTests.length)*100)}%)`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    
    console.log(`\n📋 Database Status:`);
    console.log(`   Messages logged: ${messages.length}`);
    console.log(`   Installations: ${installations.length}`);
    console.log(`   Waapify configs: ${configs.length}`);
    
    console.log(`\n📱 Test Details:`);
    console.log(`   Phone: ${CONFIG.test.phone}`);
    console.log(`   Instance: ${CONFIG.test.waapify_instance_id}`);
    console.log(`   Company: ${CONFIG.test.company_id}`);
    console.log(`   Location: ${CONFIG.test.location_id}`);
    
    console.log(`\n🔍 Detailed Results:`);
    results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${status} ${result.test}`);
    });
    
    if (passedTests === allTests.length && messages.length > 0) {
      console.log('\n🎉 🎉 🎉 PERFECT! ALL APIS WORKING + DATABASE LOGGING! 🎉 🎉 🎉');
      console.log('🚀 Ready for production deployment!');
    } else if (passedTests >= allTests.length * 0.8) {
      console.log('\n✨ EXCELLENT! Most APIs working - minor issues only');
    } else {
      console.log('\n⚠️ Some issues found - needs investigation');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('💥 Complete test failed:', error.message);
  } finally {
    // Cleanup
    if (dbConnection) await dbConnection.end();
    if (appProcess) appProcess.kill();
    
    setTimeout(() => {
      console.log('\n🧹 Complete cleanup done');
      process.exit(0);
    }, 3000);
  }
}

console.log('🚀 Starting Complete API Testing in 3 seconds...');
console.log('📱 Make sure to check your WhatsApp for multiple test messages!');
console.log('Press Ctrl+C to cancel...\n');

setTimeout(() => {
  testAllCompleteAPIs();
}, 3000);