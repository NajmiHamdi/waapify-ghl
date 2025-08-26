// Comprehensive API testing with real data
const mysql = require('mysql2/promise');
require('dotenv').config();

// Real credentials (same as production)
const TEST_DATA = {
  // GHL Test Data
  companyId: 'TEST_COMPANY_001',
  locationId: 'TEST_LOCATION_001',
  contactId: 'TEST_CONTACT_001',
  messageId: 'TEST_MSG_001',
  
  // Real phone number for testing (replace with your number)
  phoneNumber: '+60168970072',
  testMessage: 'Test message from Waapify-GHL local testing',
  
  // Real Waapify credentials (update these with your real credentials)
  waapifyAccessToken: 'YOUR_REAL_WAAPIFY_ACCESS_TOKEN_HERE',
  waapifyInstanceId: 'YOUR_REAL_INSTANCE_ID_HERE'
};

async function testAllAPIs() {
  console.log('🧪 === COMPREHENSIVE API TESTING WITH REAL DATA ===\n');
  
  try {
    // 1. Test Database Connection
    console.log('1️⃣ Testing database connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'waapify_user',
      password: process.env.DB_PASSWORD || 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: process.env.DB_NAME || 'waapify_ghl'
    });
    
    console.log('✅ Database connected successfully!');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    // 2. Setup Test Data in Database
    console.log('\n2️⃣ Setting up test data...');
    
    // Insert test installation
    await connection.execute(`
      INSERT IGNORE INTO installations (company_id, location_id, access_token, refresh_token, expires_in) 
      VALUES (?, ?, 'test_access_token', 'test_refresh_token', 3600)
    `, [TEST_DATA.companyId, TEST_DATA.locationId]);
    
    // Get installation ID
    const [installations] = await connection.execute(
      'SELECT id FROM installations WHERE company_id = ? AND location_id = ?',
      [TEST_DATA.companyId, TEST_DATA.locationId]
    );
    const installationId = installations[0].id;
    
    // Insert test Waapify config
    await connection.execute(`
      INSERT INTO waapify_configs (installation_id, company_id, location_id, access_token, instance_id, whatsapp_number, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE 
      access_token = VALUES(access_token), 
      instance_id = VALUES(instance_id),
      whatsapp_number = VALUES(whatsapp_number)
    `, [installationId, TEST_DATA.companyId, TEST_DATA.locationId, TEST_DATA.waapifyAccessToken, TEST_DATA.waapifyInstanceId, TEST_DATA.phoneNumber]);
    
    console.log('✅ Test data setup completed');
    
    await connection.end();
    
    // 3. Start Express App for Testing
    console.log('\n3️⃣ Starting Express app...');
    
    // Import and start the app
    const { spawn } = require('child_process');
    const appProcess = spawn('node', ['dist/index.js'], {
      env: { ...process.env, PORT: '3003' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let appStarted = false;
    
    appProcess.stdout.on('data', (data) => {
      console.log(`📱 App: ${data.toString().trim()}`);
      if (data.toString().includes('listening on port 3003')) {
        appStarted = true;
        setTimeout(() => runAPITests(), 2000);
      }
    });
    
    appProcess.stderr.on('data', (data) => {
      console.log(`❌ App Error: ${data.toString().trim()}`);
    });
    
    // Wait for app to start or timeout
    setTimeout(() => {
      if (!appStarted) {
        console.log('⚠️ App taking too long to start, running tests anyway...');
        runAPITests();
      }
    }, 5000);
    
    async function runAPITests() {
      console.log('\n4️⃣ Running API tests...');
      
      try {
        const fetch = await import('node-fetch').then(m => m.default);
        const baseURL = 'http://localhost:3003';
        
        // Test 1: Provider Status
        console.log('\n🧪 Testing Provider Status...');
        const statusResponse = await fetch(`${baseURL}/provider/status?locationId=${TEST_DATA.locationId}&companyId=${TEST_DATA.companyId}`);
        const statusResult = await statusResponse.json();
        console.log('Status Result:', JSON.stringify(statusResult, null, 2));
        
        // Test 2: External Auth
        console.log('\n🧪 Testing External Auth...');
        const authResponse = await fetch(`${baseURL}/external-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: TEST_DATA.companyId,
            locationId: TEST_DATA.locationId,
            access_token: TEST_DATA.waapifyAccessToken,
            instance_id: TEST_DATA.waapifyInstanceId,
            whatsapp_number: TEST_DATA.phoneNumber
          })
        });
        const authResult = await authResponse.json();
        console.log('External Auth Result:', JSON.stringify(authResult, null, 2));
        
        // Test 3: Send WhatsApp Message (REAL MESSAGE SENDING)
        console.log('\n🧪 Testing WhatsApp Message Sending (REAL)...');
        console.log(`📱 Sending to: ${TEST_DATA.phoneNumber}`);
        console.log(`💬 Message: ${TEST_DATA.testMessage}`);
        
        const messageResponse = await fetch(`${baseURL}/conversation-provider`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locationId: TEST_DATA.locationId,
            contactId: TEST_DATA.contactId,
            messageId: TEST_DATA.messageId,
            phone: TEST_DATA.phoneNumber,
            message: TEST_DATA.testMessage,
            type: 'SMS',
            attachments: []
          })
        });
        const messageResult = await messageResponse.json();
        console.log('WhatsApp Send Result:', JSON.stringify(messageResult, null, 2));
        
        // Test 4: Check Database Logs
        console.log('\n🧪 Checking database logs...');
        const dbConnection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'waapify_user',
          password: process.env.DB_PASSWORD || 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
          database: process.env.DB_NAME || 'waapify_ghl'
        });
        
        const [messageLogs] = await dbConnection.execute(
          'SELECT * FROM message_logs ORDER BY sent_at DESC LIMIT 5'
        );
        console.log('📋 Recent message logs:', messageLogs);
        
        const [installationLogs] = await dbConnection.execute(
          'SELECT * FROM installations ORDER BY installed_at DESC LIMIT 3'
        );
        console.log('📦 Recent installations:', installationLogs);
        
        const [waapifyConfigs] = await dbConnection.execute(
          'SELECT * FROM waapify_configs ORDER BY created_at DESC LIMIT 3'
        );
        console.log('⚙️ Waapify configs:', waapifyConfigs);
        
        await dbConnection.end();
        
        console.log('\n🎉 All API tests completed!');
        console.log('\n📊 Check your phpMyAdmin at http://localhost/phpmyadmin/');
        console.log('Database: waapify_ghl');
        console.log('Look for new records in message_logs table!');
        
      } catch (error) {
        console.error('❌ API test failed:', error.message);
      }
      
      // Clean up
      setTimeout(() => {
        console.log('\n🛑 Stopping test app...');
        appProcess.kill();
        process.exit(0);
      }, 3000);
    }
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

// Instructions
console.log('📝 BEFORE RUNNING THIS TEST:');
console.log('1. Setup local MySQL database by running setup-local-db.sql');
console.log('2. Update TEST_DATA.waapifyAccessToken and TEST_DATA.waapifyInstanceId with real credentials');
console.log('3. Update TEST_DATA.phoneNumber with your real phone number');
console.log('4. Make sure local MySQL is running');
console.log('5. Build the app: npm run build');
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  testAllAPIs();
}, 5000);