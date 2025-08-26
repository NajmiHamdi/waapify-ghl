// Test without database dependency
const express = require('express');
const axios = require('axios');

// Real Waapify credentials
const WAAPIFY_CONFIG = {
  access_token: "1740aed492830374b432091211a6628d",
  instance_id: "673F5A50E7194",
  phone: "+60168970072",
  message: "🚀 Test dari Waapify-GHL NO DATABASE TEST! Working?"
};

async function sendWhatsAppMessage(phone, message, accessToken, instanceId, type = 'text', mediaUrl = null, filename = null) {
  try {
    console.log(`📤 Sending ${type} message to ${phone}`);
    console.log(`💬 Message: ${message}`);
    console.log(`🔑 Instance: ${instanceId}`);
    
    const payload = {
      number: phone.startsWith('+') ? phone.substring(1) : phone,
      message: message,
      instance_id: instanceId
    };
    
    if (type === 'media' && mediaUrl) {
      payload.media_url = mediaUrl;
      payload.filename = filename || 'file';
    }
    
    console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
    
    // Use correct Waapify endpoint
    const url = `https://stag.waapify.com/api/send.php?number=${payload.number}&type=text&message=${encodeURIComponent(message)}&instance_id=${instanceId}&access_token=${accessToken}`;
    
    console.log(`🔗 API URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000
    });
    
    console.log(`✅ Waapify Response:`, response.data);
    
    return {
      success: true,
      messageId: response.data.message_id,
      data: response.data
    };
    
  } catch (error) {
    console.error(`❌ WhatsApp send error:`, error.message);
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📄 Response:`, error.response.data);
    }
    
    return {
      success: false,
      error: error.message,
      response: error.response?.data
    };
  }
}

async function testDirectSend() {
  console.log('🧪 === DIRECT WAAPIFY MESSAGE SEND TEST ===\n');
  
  // Test 1: Direct API call
  const result = await sendWhatsAppMessage(
    WAAPIFY_CONFIG.phone,
    WAAPIFY_CONFIG.message,
    WAAPIFY_CONFIG.access_token,
    WAAPIFY_CONFIG.instance_id
  );
  
  if (result.success) {
    console.log('🎉 SUCCESS! Message sent successfully!');
    console.log('📱 Check your WhatsApp for the message!');
    console.log('Message ID:', result.messageId);
  } else {
    console.log('❌ FAILED! Message not sent');
    console.log('Error:', result.error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY:');
  console.log('- Direct Waapify API call:', result.success ? 'SUCCESS' : 'FAILED');
  console.log('- Phone number:', WAAPIFY_CONFIG.phone);
  console.log('- Message sent:', WAAPIFY_CONFIG.message);
  console.log('='.repeat(50));
}

testDirectSend();