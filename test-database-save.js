// Test if external auth credentials actually save to database
const axios = require('axios');

async function testDatabaseSave() {
  console.log('🔍 === TESTING DATABASE SAVE FOR EXTERNAL AUTH ===\n');
  
  const testData = {
    locationId: 'rjsdYp4AhllL4EJDzQCP',
    companyId: 'NQFaKZYtxW6gENuYYALt',
    access_token: '1740aed492830374b432091211a6628d',
    instance_id: '673F5A50E7194', 
    whatsapp_number: '60168970072'
  };
  
  // 1. Submit external auth
  console.log('1️⃣ Submitting external auth credentials...');
  try {
    const response = await axios.post('https://waaghl.waapify.com/external-auth', testData, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ External Auth Response:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log('📋 Message:', response.data.message);
    
    if (response.data.data) {
      console.log('📊 Data returned:', {
        access_token: response.data.data.access_token ? 'SET' : 'MISSING',
        instance_id: response.data.data.instance_id || 'MISSING',
        status: response.data.data.status || 'UNKNOWN'
      });
    }
    
  } catch (error) {
    console.error('❌ External Auth Error:', error.response?.status, error.response?.data || error.message);
    return;
  }
  
  // 2. Test if SMS sending works now
  console.log('\n2️⃣ Testing SMS sending after external auth...');
  try {
    const smsResponse = await axios.post('https://waaghl.waapify.com/action/send-whatsapp-text', {
      number: '+60168970072',
      message: '🧪 TEST: SMS after external auth setup',
      locationId: testData.locationId,
      companyId: testData.companyId
    }, { timeout: 15000 });
    
    console.log('✅ SMS Response:', smsResponse.status);
    console.log('📱 SMS Data:', JSON.stringify(smsResponse.data, null, 2));
    
    if (smsResponse.data.success) {
      console.log('🎉 SMS SENDING WORKS!');
    } else {
      console.log('❌ SMS Failed:', smsResponse.data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ SMS Sending Error:', error.response?.status, error.response?.data || error.message);
  }
  
  // 3. Test phone numbers API (this is what GHL calls to get available numbers)
  console.log('\n3️⃣ Testing phone numbers API...');
  try {
    const phoneResponse = await axios.get('https://waaghl.waapify.com/api/phone-numbers', {
      params: {
        companyId: testData.companyId,
        locationId: testData.locationId
      },
      timeout: 10000
    });
    
    console.log('✅ Phone Numbers Response:', phoneResponse.status);
    console.log('📞 Available Numbers:', JSON.stringify(phoneResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Phone Numbers Error:', error.response?.status, error.response?.data || error.message);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('If all above tests pass, then:');
  console.log('✅ External auth saves credentials correctly');
  console.log('✅ SMS sending should work');
  console.log('✅ Phone numbers API provides available numbers to GHL');
  console.log('\nIf SMS still not sending from GHL, check:');
  console.log('1. SMS Provider configured correctly in GHL marketplace');
  console.log('2. SMS Provider enabled in GHL account settings');
  console.log('3. Webhook delivery URL points to correct endpoint');
}

testDatabaseSave();