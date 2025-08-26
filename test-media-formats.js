// Test different media parameter formats for Waapify
const axios = require('axios');

const CONFIG = {
  test: {
    phone: '+60168970072',
    waapify_access_token: '1740aed492830374b432091211a6628d',
    waapify_instance_id: '673F5A50E7194'
  }
};

async function testMediaFormats() {
  console.log('🧪 === TESTING DIFFERENT MEDIA PARAMETER FORMATS ===\n');
  
  const formatTests = [
    {
      name: '📋 Format 1: type=image with media_url',
      params: {
        number: '60168970072',
        type: 'image',
        message: 'Format 1 test',
        media_url: 'https://via.placeholder.com/400x300.jpg?text=Format1',
        filename: 'format1.jpg',
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    },
    {
      name: '📋 Format 2: type=media with media_url',
      params: {
        number: '60168970072',
        type: 'media',
        message: 'Format 2 test',
        media_url: 'https://via.placeholder.com/400x300.jpg?text=Format2',
        filename: 'format2.jpg',
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    },
    {
      name: '📋 Format 3: type=image with url (not media_url)',
      params: {
        number: '60168970072',
        type: 'image',
        message: 'Format 3 test',
        url: 'https://via.placeholder.com/400x300.jpg?text=Format3',
        filename: 'format3.jpg',
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    },
    {
      name: '📋 Format 4: type=document for PDF',
      params: {
        number: '60168970072',
        type: 'document',
        message: 'Format 4 test document',
        media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        filename: 'test.pdf',
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    },
    {
      name: '📋 Format 5: Simple image URL (GitHub raw)',
      params: {
        number: '60168970072',
        type: 'image',
        message: 'GitHub image test',
        media_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        filename: 'github-logo.png',
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      }
    }
  ];
  
  for (let i = 0; i < formatTests.length; i++) {
    const test = formatTests[i];
    console.log(`\n${i + 1}. ${test.name}`);
    console.log('   📋 Params:', JSON.stringify(test.params, null, 4));
    
    try {
      const response = await axios.get('https://stag.waapify.com/api/send.php', {
        params: test.params,
        timeout: 10000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📤 Response:`, JSON.stringify(response.data, null, 4));
      
      if (response.data && response.data.status === 'success') {
        console.log(`   🎯 SUCCESS! This format works!`);
      } else if (response.data && response.data.status === 'error') {
        console.log(`   ❌ Error: ${response.data.message}`);
      } else {
        console.log(`   ⚠️ Unexpected response format`);
      }
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      if (error.response && error.response.data) {
        console.error(`   🔍 Error Data:`, JSON.stringify(error.response.data, null, 4));
      }
    }
    
    // Wait between tests
    console.log('   ⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n=== MEDIA FORMAT TEST SUMMARY ===');
  console.log('📱 Check WhatsApp at +60168970072 for any successful media');
  console.log('🔍 Look for format that returned "success" status');
}

console.log('🚀 Starting media format testing in 3 seconds...');
setTimeout(testMediaFormats, 3000);