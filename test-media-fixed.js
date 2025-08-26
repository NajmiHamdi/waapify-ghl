// Test media messages with correct format from API docs
const axios = require('axios');

const CONFIG = {
  test: {
    phone: '60168970072', // No need for +, docs show number only
    waapify_access_token: '1740aed492830374b432091211a6628d',
    waapify_instance_id: '673F5A50E7194'
  }
};

async function testCorrectMediaFormat() {
  console.log('🎯 === TESTING MEDIA WITH CORRECT API FORMAT ===\n');
  
  const mediaTests = [
    {
      name: '📷 JPEG Image (via.placeholder)',
      params: {
        number: CONFIG.test.phone,
        type: 'media',
        message: 'FIXED: Test JPEG image dengan format betul!',
        media_url: 'https://via.placeholder.com/400x300.jpg?text=FIXED+Media+Test',
        filename: 'test-image.jpg',
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    },
    {
      name: '📄 PDF Document',
      params: {
        number: CONFIG.test.phone,
        type: 'media',
        message: 'FIXED: Test PDF document',
        media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        filename: 'test-document.pdf', // Important for documents
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    },
    {
      name: '🖼️ PNG Image (Simple)',
      params: {
        number: CONFIG.test.phone,
        type: 'media', 
        message: 'FIXED: PNG image test',
        media_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    }
  ];
  
  for (let i = 0; i < mediaTests.length; i++) {
    const test = mediaTests[i];
    console.log(`\n${i + 1}. Testing ${test.name}`);
    console.log('   📋 Parameters:', JSON.stringify(test.params, null, 4));
    
    try {
      const response = await axios.post('https://stag.waapify.com/api/send.php', null, {
        params: test.params,
        timeout: 10000
      });
      
      console.log(`   ✅ HTTP Status: ${response.status}`);
      console.log(`   📤 API Response:`, JSON.stringify(response.data, null, 4));
      
      if (response.data && response.data.status === 'success') {
        console.log(`   🎉 🎉 MEDIA MESSAGE SUCCESS! 🎉 🎉`);
        console.log(`   📱 Check WhatsApp NOW for: ${test.name}`);
        console.log(`   🆔 Message ID: ${response.data.data?.key?.id || 'N/A'}`);
      } else if (response.data && response.data.status === 'error') {
        console.log(`   ❌ API Error: ${response.data.message}`);
      } else {
        console.log(`   ⚠️ Unexpected response format`);
      }
      
    } catch (error) {
      console.error(`   ❌ Request Failed: ${error.message}`);
      if (error.response) {
        console.error(`   🔍 Error Response:`, JSON.stringify(error.response.data, null, 4));
      }
    }
    
    // Wait between tests
    console.log('   ⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Also test the check_phone functionality
  console.log('\n4. Testing Phone Check (for comparison)');
  try {
    const checkParams = {
      number: CONFIG.test.phone,
      type: 'check_phone',
      instance_id: CONFIG.test.waapify_instance_id,
      access_token: CONFIG.test.waapify_access_token
    };
    
    const checkResponse = await axios.post('https://stag.waapify.com/api/send.php', null, {
      params: checkParams
    });
    
    console.log('   📞 Phone Check Response:', JSON.stringify(checkResponse.data, null, 4));
    
  } catch (error) {
    console.error('   ❌ Phone check failed:', error.message);
  }
  
  console.log('\n=== MEDIA TEST RESULTS ===');
  console.log('📱 Check WhatsApp at +60168970072 dalam 30-60 saat');
  console.log('🔍 If successful, media messages should now work in main app!');
  console.log('⏳ Media delivery biasa lebih lambat dari text...');
}

console.log('🚀 Testing media with correct format dari API docs...');
console.log('📖 Based on: type=media, media_url, filename (optional for docs)');
setTimeout(testCorrectMediaFormat, 2000);