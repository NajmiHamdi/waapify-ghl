// Quick live production test
const axios = require('axios');
const mysql = require('mysql2/promise');

const CONFIG = {
  database: {
    host: '127.0.0.1',
    user: 'waapify_user', 
    password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
    database: 'waapify_ghl'
  },
  live: {
    company_id: 'NQFaKZYtxW6gENuYYALt',
    location_id: 'rjsdYp4AhllL4EJDzQCP',
    phone: '+60168970072',
    waapify_access_token: '1740aed492830374b432091211a6628d',
    waapify_instance_id: '673F5A50E7194'
  }
};

async function quickLiveTest() {
  console.log('🚀 === QUICK LIVE PRODUCTION TEST ===\n');
  
  let dbConnection;
  
  try {
    // 1. Database test
    console.log('1️⃣ Testing database...');
    dbConnection = await mysql.createConnection(CONFIG.database);
    
    const [result] = await dbConnection.execute('SELECT COUNT(*) as count FROM installations');
    console.log(`✅ Database: ${result[0].count} installations`);
    
    // 2. Check/fix production data
    console.log('\n2️⃣ Ensuring production data...');
    
    // Insert real installation
    await dbConnection.execute(`
      INSERT INTO installations (company_id, location_id, access_token, refresh_token, expires_in, expires_at)
      VALUES (?, ?, 'live_token', 'live_refresh', 3600, DATE_ADD(NOW(), INTERVAL 1 HOUR))
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `, [CONFIG.live.company_id, CONFIG.live.location_id]);
    
    // Get installation ID
    const [instResult] = await dbConnection.execute(
      'SELECT id FROM installations WHERE company_id = ? AND location_id = ?',
      [CONFIG.live.company_id, CONFIG.live.location_id]
    );
    
    if (instResult.length === 0) {
      throw new Error('Failed to create installation');
    }
    
    const installationId = instResult[0].id;
    
    // Insert/update Waapify config
    await dbConnection.execute(`
      INSERT INTO waapify_configs (installation_id, company_id, location_id, access_token, instance_id, whatsapp_number, is_active)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE
        access_token = VALUES(access_token),
        instance_id = VALUES(instance_id), 
        whatsapp_number = VALUES(whatsapp_number),
        is_active = TRUE
    `, [installationId, CONFIG.live.company_id, CONFIG.live.location_id, CONFIG.live.waapify_access_token, CONFIG.live.waapify_instance_id, CONFIG.live.phone]);
    
    console.log('✅ Production data ready');
    
    // 3. Test API
    console.log('\n3️⃣ Testing WhatsApp message...');
    
    const response = await axios.post('http://localhost:3009/action/send-whatsapp-text', {
      number: CONFIG.live.phone,
      message: '🚀 LIVE PRODUCTION TEST: Message dari server!',
      locationId: CONFIG.live.location_id,
      companyId: CONFIG.live.company_id
    }, { timeout: 10000 });
    
    console.log('✅ API Response:', response.status);
    console.log('📋 Data:', JSON.stringify(response.data, null, 2));
    console.log('📱 Check WhatsApp at', CONFIG.live.phone);
    
    // 4. Check message was logged
    console.log('\n4️⃣ Checking message logs...');
    const [logs] = await dbConnection.execute(
      'SELECT * FROM message_logs WHERE company_id = ? AND location_id = ? ORDER BY sent_at DESC LIMIT 1',
      [CONFIG.live.company_id, CONFIG.live.location_id]
    );
    
    if (logs.length > 0) {
      console.log('✅ Message logged:', logs[0].message.substring(0, 50) + '...');
    } else {
      console.log('⚠️ No message logs found');
    }
    
    console.log('\n🎉 === LIVE TEST COMPLETE ===');
    console.log('📱 Check WhatsApp untuk confirm message received!');
    
  } catch (error) {
    console.error('❌ Live test failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    if (dbConnection) await dbConnection.end();
    process.exit(0);
  }
}

console.log('🚀 Starting live test in 2 seconds...');
setTimeout(quickLiveTest, 2000);