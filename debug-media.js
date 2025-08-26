// Debug media message issue - test direct Waapify API calls
const axios = require('axios');

const CONFIG = {
  test: {
    phone: '+60168970072',
    waapify_access_token: '1740aed492830374b432091211a6628d',
    waapify_instance_id: '673F5A50E7194'
  }
};

async function debugMediaMessages() {
  console.log('🔍 === DEBUGGING MEDIA MESSAGE DELIVERY ===\n');
  
  // Test different media message formats
  const mediaTests = [
    {
      name: '📷 Small JPEG Image (via.placeholder)',
      media_url: 'https://via.placeholder.com/400x300.jpg?text=Test+Media+Waapify',
      filename: 'test-image.jpg',
      message: 'Test image dari debug script'
    },
    {
      name: '📷 PNG Image (via.placeholder)', 
      media_url: 'https://via.placeholder.com/500x400.png?text=PNG+Test',
      filename: 'test-image.png',
      message: 'Test PNG image'
    },
    {
      name: '📷 Direct Image URL (picsum)',
      media_url: 'https://picsum.photos/400/300',
      filename: 'random-image.jpg',
      message: 'Random test image from picsum'
    },
    {
      name: '📄 PDF Document',
      media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      filename: 'test-document.pdf',
      message: 'Test PDF document'
    }
  ];
  
  for (let i = 0; i < mediaTests.length; i++) {
    const test = mediaTests[i];
    console.log(`\n${i + 1}. Testing ${test.name}...`);
    
    try {
      // Clean phone number
      const cleanNumber = CONFIG.test.phone.replace(/[^\d]/g, '');
      
      const params = {
        number: cleanNumber,
        type: 'media',
        message: test.message,
        media_url: test.media_url,
        filename: test.filename,
        instance_id: CONFIG.test.waapify_instance_id,
        access_token: CONFIG.test.waapify_access_token
      };
      
      console.log('   📋 Parameters:', JSON.stringify(params, null, 6));
      
      const response = await axios.get('https://stag.waapify.com/api/send.php', {
        params: params
      });
      
      console.log(`   ✅ API Response: ${response.status}`);
      console.log(`   📤 Response Data:`, JSON.stringify(response.data, null, 6));
      
      if (response.data.status === 'success') {
        console.log(`   🎯 Message ID: ${response.data.data?.key?.id || 'N/A'}`);
        console.log(`   📱 Check WhatsApp now for: ${test.name}`);
      } else {
        console.log(`   ⚠️ API returned non-success status`);
      }
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      if (error.response) {
        console.error(`   🔍 Error Details:`, JSON.stringify(error.response.data, null, 6));
      }
    }
    
    // Wait between tests
    console.log('   ⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Test text message to compare
  console.log('\n5. Testing Text Message (for comparison)...');
  try {
    const cleanNumber = CONFIG.test.phone.replace(/[^\d]/g, '');
    
    const textParams = {
      number: cleanNumber,
      type: 'text',
      message: 'Debug test: Text message untuk compare dengan media',
      instance_id: CONFIG.test.waapify_instance_id,
      access_token: CONFIG.test.waapify_access_token
    };
    
    const textResponse = await axios.get('https://stag.waapify.com/api/send.php', {
      params: textParams
    });
    
    console.log('   ✅ Text API Response:', JSON.stringify(textResponse.data, null, 6));
    console.log('   📱 Text message should arrive first!');
    
  } catch (error) {
    console.error('   ❌ Text test failed:', error.message);
  }
  
  console.log('\n=== DEBUG SUMMARY ===');
  console.log('📱 Check your WhatsApp at +60168970072 for:');
  console.log('   1. Test image (JPEG)');
  console.log('   2. PNG image');
  console.log('   3. Random image');
  console.log('   4. PDF document');
  console.log('   5. Text message');
  console.log('\n🔍 If you receive text but not media, the issue is:');
  console.log('   - Media URL accessibility');
  console.log('   - Waapify media processing');
  console.log('   - WhatsApp media delivery delay');
  console.log('\n⏳ Media messages may take 30-60 seconds to arrive...');
}

console.log('🚀 Starting media debug in 3 seconds...');
setTimeout(debugMediaMessages, 3000);