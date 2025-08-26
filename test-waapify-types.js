// Test what message types are supported by Waapify API
const axios = require('axios');

const CONFIG = {
  test: {
    phone: '60168970072',
    waapify_access_token: '1740aed492830374b432091211a6628d',
    waapify_instance_id: '673F5A50E7194'
  }
};

async function testSupportedTypes() {
  console.log('🧪 === TESTING SUPPORTED MESSAGE TYPES ===\n');
  
  const typeTests = [
    { type: 'text', message: 'Text test' },
    { type: 'media', message: 'Media test' },
    { type: 'image', message: 'Image test' },
    { type: 'document', message: 'Document test' },
    { type: 'photo', message: 'Photo test' },
    { type: 'file', message: 'File test' },
    { type: 'video', message: 'Video test' },
    { type: 'audio', message: 'Audio test' }
  ];
  
  for (const test of typeTests) {
    console.log(`Testing type: "${test.type}"`);
    
    try {
      const params = {
        number: CONFIG.test.phone,
        type: test.type,
        message: test.message,
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      };
      
      const response = await axios.get('https://stag.waapify.com/api/send.php', {
        params: params,
        timeout: 5000
      });
      
      console.log(`   ✅ Response:`, JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.status === 'success') {
        console.log(`   🎯 ✅ TYPE "${test.type}" IS SUPPORTED!`);
      } else if (response.data && response.data.message === 'Message type not supported') {
        console.log(`   ❌ Type "${test.type}" not supported`);
      } else {
        console.log(`   ⚠️ Unexpected response for type "${test.type}"`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error testing "${test.type}":`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== CHECKING API CAPABILITIES ===');
  
  // Test API info endpoint if available
  try {
    const infoResponse = await axios.get('https://stag.waapify.com/api/info.php', {
      params: {
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    });
    console.log('📋 API Info:', JSON.stringify(infoResponse.data, null, 2));
  } catch (error) {
    console.log('⚠️ No info endpoint available');
  }
  
  // Test instance status
  try {
    const statusResponse = await axios.get('https://stag.waapify.com/api/status.php', {
      params: {
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    });
    console.log('📊 Instance Status:', JSON.stringify(statusResponse.data, null, 2));
  } catch (error) {
    console.log('⚠️ No status endpoint available');
  }
}

console.log('🚀 Starting type support testing...');
testSupportedTypes();