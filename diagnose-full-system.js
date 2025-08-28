// COMPREHENSIVE SYSTEM DIAGNOSIS
// Compare what worked (ngrok/Render + storage.js) vs what's broken (RunCloud + MySQL)

const axios = require('axios');
const mysql = require('mysql2/promise');

async function fullSystemDiagnosis() {
  console.log('🔍 === COMPREHENSIVE SYSTEM DIAGNOSIS ===\n');
  console.log('Comparing: Working (ngrok/Render + storage.js) vs Broken (RunCloud + MySQL)\n');
  
  const baseUrl = 'https://waaghl.waapify.com';
  const testData = {
    locationId: 'rjsdYp4AhllL4EJDzQCP',
    companyId: 'NQFaKZYtxW6gENuYYALt',
    access_token: '1740aed492830374b432091211a6628d',
    instance_id: '673F5A50E7194',
    whatsapp_number: '60168970072'
  };
  
  console.log('1️⃣ === DATABASE CONNECTION TEST ===');
  try {
    const db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'waapify_user',
      password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: 'waapify_ghl'
    });
    console.log('✅ Direct MySQL connection: SUCCESS');
    
    // Test database schema
    console.log('\n📊 Checking database schema...');
    const [tables] = await db.execute("SHOW TABLES");
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check installations table
    const [installSchema] = await db.execute("DESCRIBE installations");
    console.log('Installations table schema:', installSchema.map(col => col.Field));
    
    // Check waapify_configs table  
    const [configSchema] = await db.execute("DESCRIBE waapify_configs");
    console.log('Waapify_configs table schema:', configSchema.map(col => col.Field));
    
    // Check current data
    const [installations] = await db.execute('SELECT * FROM installations ORDER BY id DESC LIMIT 3');
    console.log('Recent installations:', installations.length);
    
    const [configs] = await db.execute('SELECT * FROM waapify_configs ORDER BY id DESC LIMIT 3');
    console.log('Recent waapify_configs:', configs.length);
    
    await db.end();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️ This might be the root cause!');
  }
  
  console.log('\n2️⃣ === API ENDPOINTS TEST ===');
  
  // Test External Auth (the problematic one)
  console.log('Testing External Auth endpoint...');
  try {
    const response = await axios.post(`${baseUrl}/external-auth`, testData, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ External Auth response:', response.data.success ? 'SUCCESS' : 'FAILED');
    
    if (response.data.success && response.data.data) {
      console.log('   Returned data:', {
        access_token: response.data.data.access_token ? 'SET' : 'MISSING',
        instance_id: response.data.data.instance_id || 'MISSING',
        status: response.data.data.status
      });
    }
  } catch (error) {
    console.error('❌ External Auth error:', error.response?.status, error.response?.data?.error);
  }
  
  // Test SMS sending
  console.log('\nTesting SMS sending endpoint...');
  try {
    const smsResponse = await axios.post(`${baseUrl}/action/send-whatsapp-text`, {
      number: '+60168970072',
      message: '🔍 DIAGNOSIS: Testing SMS after RunCloud MySQL migration',
      locationId: testData.locationId,
      companyId: testData.companyId
    }, { timeout: 15000 });
    
    console.log('✅ SMS Response:', smsResponse.status);
    if (smsResponse.data.success) {
      console.log('   SMS Status: SUCCESS - Message sent!');
    } else {
      console.log('   SMS Status: FAILED -', smsResponse.data.error);
    }
  } catch (error) {
    console.error('❌ SMS Error:', error.response?.status, error.response?.data?.error);
  }
  
  console.log('\n3️⃣ === ENVIRONMENT COMPARISON ===');
  console.log('WORKING VERSION (ngrok/Render):');
  console.log('  ✅ Storage: storage.js (simple file-based)');
  console.log('  ✅ Host: ngrok tunnel / render.com');
  console.log('  ✅ External Auth: Worked perfectly');
  console.log('  ✅ SMS Sending: Worked perfectly');
  
  console.log('\nBROKEN VERSION (RunCloud):');
  console.log('  ❌ Storage: MySQL database'); 
  console.log('  ❌ Host: RunCloud server');
  console.log('  ❌ External Auth: Not saving waapify_configs');
  console.log('  ❌ SMS Sending: Fails due to missing configs');
  
  console.log('\n4️⃣ === HYPOTHESIS ===');
  console.log('Possible causes:');
  console.log('1. MySQL connection issues on RunCloud server');
  console.log('2. Database schema/permissions problems'); 
  console.log('3. RunCloud environment differences (PHP vs Node.js)');
  console.log('4. Database operations failing silently');
  console.log('5. Transaction/async issues with MySQL queries');
  
  console.log('\n5️⃣ === RECOMMENDATIONS ===');
  console.log('Quick test: Deploy working ngrok version to RunCloud');
  console.log('1. Temporarily revert to storage.js on RunCloud');
  console.log('2. Test if External Auth works with file storage');
  console.log('3. If works, then MySQL migration is the issue');
  console.log('4. Debug MySQL operations step by step');
  
  console.log('\n6️⃣ === DATABASE VERIFICATION NEEDED ===');
  console.log('Run these commands on RunCloud server:');
  console.log('mysql -u waapify_user -p waapify_ghl');
  console.log('SELECT * FROM installations ORDER BY id DESC LIMIT 5;');
  console.log('SELECT * FROM waapify_configs ORDER BY id DESC LIMIT 5;');
  console.log('Check if External Auth actually saves data or fails silently');
}

fullSystemDiagnosis();