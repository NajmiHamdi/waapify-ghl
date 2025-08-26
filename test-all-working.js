// Test all APIs with working database
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
    port: 3008,
    baseUrl: 'http://localhost:3008'
  }
};

async function testAllAPIs() {
  console.log('🚀 === TESTING ALL APIS WITH WORKING DATABASE ===\n');
  
  let appProcess;
  let dbConnection;
  
  try {
    // 1. Test database connection first
    console.log('1️⃣ Testing database connection...');
    dbConnection = await mysql.createConnection(CONFIG.database);
    const [result] = await dbConnection.execute('SELECT COUNT(*) as count FROM installations');
    console.log(`✅ Database connected - ${result[0].count} installations found\n`);
    
    // 2. Start app
    console.log('2️⃣ Starting application...');
    appProcess = spawn('node', ['dist/index.js'], {
      env: { ...process.env, PORT: CONFIG.app.port },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Wait for app to start
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
        if (error && !error.includes('Warning')) {
          console.log('⚠️', error);
        }
      });
    });
    
    console.log('✅ App started successfully!\n');
    
    // 3. Test endpoints
    const tests = [
      {
        name: 'Provider Status',
        url: `${CONFIG.app.baseUrl}/provider/status?locationId=${CONFIG.test.location_id}&companyId=${CONFIG.test.company_id}`,
        method: 'GET'
      },
      {
        name: 'External Auth',
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
      {
        name: 'Send WhatsApp Message (Real)',
        url: `${CONFIG.app.baseUrl}/webhook/provider-outbound`,
        method: 'POST',
        data: {
          contactId: 'TEST_CONTACT_123',
          locationId: CONFIG.test.location_id,
          type: 'SMS',
          phone: CONFIG.test.phone,
          message: '🎉 Test dari local MacBook dengan working database! Success!',
          messageId: `test_${Date.now()}`
        }
      },
      {
        name: 'Check Phone Number',
        url: `${CONFIG.app.baseUrl}/action/check-whatsapp-phone`,
        method: 'POST',
        data: {
          number: CONFIG.test.phone,
          instance_id: CONFIG.test.waapify_instance_id,
          access_token: CONFIG.test.waapify_access_token,
          locationId: CONFIG.test.location_id,
          companyId: CONFIG.test.company_id
        }
      }
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
      try {
        console.log(`3️⃣ Testing ${test.name}...`);
        
        const response = test.method === 'GET' 
          ? await axios.get(test.url)
          : await axios.post(test.url, test.data);
        
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        
        if (test.name.includes('WhatsApp Message')) {
          console.log(`   📱 Check your WhatsApp at ${CONFIG.test.phone}!`);
        }
        
        passedTests++;
        
      } catch (error) {
        console.error(`❌ ${test.name}: FAILED`);
        if (error.response) {
          console.error(`   Status: ${error.response.status}`);
          console.error(`   Error: ${error.response.data?.error || error.message}`);
        } else {
          console.error(`   Error: ${error.message}`);
        }
      }
      
      console.log(''); // Add spacing
    }
    
    // 4. Check database for logged messages
    console.log('4️⃣ Checking database for message logs...');
    const [messages] = await dbConnection.execute(
      'SELECT * FROM message_logs ORDER BY sent_at DESC LIMIT 3'
    );
    console.log(`📋 Found ${messages.length} message logs in database`);
    
    if (messages.length > 0) {
      console.log('Recent messages:');
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. To: ${msg.recipient}, Status: ${msg.status}, Message: ${msg.message.substring(0, 30)}...`);
      });
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 === FINAL SUMMARY ===');
    console.log(`✅ Tests Passed: ${passedTests}/${tests.length}`);
    console.log(`📋 Messages in database: ${messages.length}`);
    console.log(`📱 Phone tested: ${CONFIG.test.phone}`);
    console.log(`🔑 Waapify Instance: ${CONFIG.test.waapify_instance_id}`);
    
    if (passedTests === tests.length && messages.length > 0) {
      console.log('🎉 ALL TESTS PASSED! Local setup is working perfectly!');
    } else {
      console.log('⚠️ Some tests failed or no messages logged');
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    // Cleanup
    if (dbConnection) await dbConnection.end();
    if (appProcess) appProcess.kill();
    
    setTimeout(() => {
      console.log('\n🧹 Cleanup completed');
      process.exit(0);
    }, 2000);
  }
}

testAllAPIs();