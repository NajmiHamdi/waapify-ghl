// Debug External Auth - Test what GHL is sending
const axios = require('axios');

async function testExternalAuth() {
  console.log('🔍 === DEBUGGING EXTERNAL AUTH ENDPOINT ===\n');
  
  // Test 1: Simulate what GHL marketplace might send during initial install
  console.log('1️⃣ Testing installation request (no credentials)...');
  try {
    const response = await axios.post('http://localhost:3001/external-auth', {
      locationId: 'rjsdYp4AhllL4EJDzQCP',
      companyId: 'NQFaKZYtxW6gENuYYALt'
    }, { timeout: 5000 });
    
    console.log('✅ Installation Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Installation Error:', error.response?.data || error.message);
  }
  
  // Test 2: Simulate what GHL should send when user fills External Auth form
  console.log('\n2️⃣ Testing External Auth with credentials...');
  try {
    const response = await axios.post('http://localhost:3001/external-auth', {
      locationId: 'rjsdYp4AhllL4EJDzQCP',
      companyId: 'NQFaKZYtxW6gENuYYALt',
      access_token: '1740aed492830374b432091211a6628d',
      instance_id: '673F5A50E7194',
      whatsapp_number: '60168970072'
    }, { timeout: 10000 });
    
    console.log('✅ Credentials Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Credentials Error:', error.response?.data || error.message);
  }
  
  // Test 3: Try different field naming formats
  console.log('\n3️⃣ Testing alternative field formats...');
  const fieldFormats = [
    { accessToken: '1740aed492830374b432091211a6628d', instanceId: '673F5A50E7194' },
    { 'access-token': '1740aed492830374b432091211a6628d', 'instance-id': '673F5A50E7194' },
    { waapify_access_token: '1740aed492830374b432091211a6628d', waapify_instance_id: '673F5A50E7194' }
  ];
  
  for (const format of fieldFormats) {
    console.log(`\n   Testing format: ${Object.keys(format).join(', ')}`);
    try {
      const response = await axios.post('http://localhost:3001/external-auth', {
        locationId: 'rjsdYp4AhllL4EJDzQCP',
        companyId: 'NQFaKZYtxW6gENuYYALt',
        ...format
      }, { timeout: 5000 });
      
      console.log('   ✅ Response:', response.data.success ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('   ❌ Error:', error.response?.status || error.message);
    }
  }
  
  // Test 4: Check database state
  console.log('\n4️⃣ Checking database state...');
  try {
    const mysql = require('mysql2/promise');
    const db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'waapify_user',
      password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: 'waapify_ghl'
    });
    
    // Check installations
    const [installations] = await db.execute(
      'SELECT * FROM installations WHERE company_id = ? AND location_id = ?',
      ['NQFaKZYtxW6gENuYYALt', 'rjsdYp4AhllL4EJDzQCP']
    );
    console.log('📊 Installations:', installations.length);
    if (installations.length > 0) {
      console.log('   Last installation:', {
        id: installations[0].id,
        access_token: installations[0].access_token,
        created_at: installations[0].created_at
      });
    }
    
    // Check waapify configs
    const [configs] = await db.execute(
      'SELECT * FROM waapify_configs WHERE company_id = ? AND location_id = ?',
      ['NQFaKZYtxW6gENuYYALt', 'rjsdYp4AhllL4EJDzQCP']
    );
    console.log('📊 Waapify Configs:', configs.length);
    if (configs.length > 0) {
      console.log('   Last config:', {
        id: configs[0].id,
        access_token: configs[0].access_token.substring(0, 10) + '...',
        instance_id: configs[0].instance_id,
        is_active: configs[0].is_active
      });
    }
    
    await db.end();
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

console.log('🚀 Starting External Auth debugging...');
testExternalAuth();