// Test live External Auth endpoint
const axios = require('axios');

async function testLiveExternalAuth() {
  console.log('🔍 === TESTING LIVE EXTERNAL AUTH ENDPOINT ===\n');
  
  const baseUrl = 'https://waaghl.waapify.com';
  
  // Test 1: What GHL sends during installation
  console.log('1️⃣ Testing installation request (minimal data)...');
  try {
    const response = await axios.post(`${baseUrl}/external-auth`, {
      locationId: 'rjsdYp4AhllL4EJDzQCP',
      companyId: 'NQFaKZYtxW6gENuYYALt'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GHL-External-Auth-Test'
      }
    });
    
    console.log('✅ Installation Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Installation Error:', error.response?.status, error.response?.data || error.message);
  }
  
  // Test 2: What GHL should send when user submits External Auth form
  console.log('\n2️⃣ Testing External Auth with credentials...');
  try {
    const response = await axios.post(`${baseUrl}/external-auth`, {
      locationId: 'rjsdYp4AhllL4EJDzQCP',
      companyId: 'NQFaKZYtxW6gENuYYALt',
      access_token: '1740aed492830374b432091211a6628d',
      instance_id: '673F5A50E7194',
      whatsapp_number: '60168970072'
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GHL-External-Auth-Test'
      }
    });
    
    console.log('✅ Credentials Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Credentials Error:', error.response?.status, error.response?.data || error.message);
  }
  
  // Test 3: Check if endpoint is working at all
  console.log('\n3️⃣ Testing endpoint availability...');
  try {
    const response = await axios.get(`${baseUrl}/health`);
    console.log('✅ Health Check:', response.data);
  } catch (error) {
    console.log('⚠️ Health endpoint not available');
  }
  
  // Test 4: Check database on server
  console.log('\n4️⃣ Would need to check server database directly for current state');
  console.log('   SSH to server and check installations/waapify_configs tables');
}

console.log('🚀 Starting live External Auth testing...');
testLiveExternalAuth();