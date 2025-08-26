const mysql = require('mysql2/promise');

async function finalTest() {
  console.log('🧪 FINAL DIRECT TEST');
  console.log('===================');
  
  try {
    // Test direct root connection
    console.log('\n1. Testing root connection...');
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'waapify_local_test'
    });
    
    console.log('✅ Root connection successful!');
    
    // Test table access
    console.log('\n2. Testing table access...');
    const [tables] = await conn.execute('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    // Test data insertion
    console.log('\n3. Testing data operations...');
    await conn.execute(`
      INSERT IGNORE INTO installations (company_id, location_id, access_token, refresh_token, expires_in)
      VALUES ('TEST_LOCAL', 'TEST_LOC', 'test_token', 'test_refresh', 3600)
    `);
    
    const [result] = await conn.execute(`
      SELECT COUNT(*) as count FROM installations WHERE company_id = 'TEST_LOCAL'
    `);
    
    console.log('✅ Data insertion successful! Count:', result[0].count);
    
    // Test Waapify config insert
    const [instResult] = await conn.execute(`
      SELECT id FROM installations WHERE company_id = 'TEST_LOCAL' LIMIT 1
    `);
    
    if (instResult.length > 0) {
      await conn.execute(`
        INSERT IGNORE INTO waapify_configs (installation_id, company_id, location_id, access_token, instance_id, whatsapp_number)
        VALUES (?, 'TEST_LOCAL', 'TEST_LOC', '1740aed492830374b432091211a6628d', '673F5A50E7194', '60168970072')
      `, [instResult[0].id]);
      
      console.log('✅ Waapify config insertion successful!');
    }
    
    // Test message log
    await conn.execute(`
      INSERT INTO message_logs (installation_id, company_id, location_id, recipient, message, message_type, status)
      VALUES (?, 'TEST_LOCAL', 'TEST_LOC', '60168970072', 'Local test message', 'text', 'sent')
    `, [instResult[0].id]);
    
    console.log('✅ Message log insertion successful!');
    
    // Final verification
    console.log('\n4. Final verification...');
    const [installations] = await conn.execute('SELECT COUNT(*) as count FROM installations');
    const [configs] = await conn.execute('SELECT COUNT(*) as count FROM waapify_configs');
    const [messages] = await conn.execute('SELECT COUNT(*) as count FROM message_logs');
    
    console.log(`Installations: ${installations[0].count}`);
    console.log(`Waapify Configs: ${configs[0].count}`);
    console.log(`Message Logs: ${messages[0].count}`);
    
    await conn.end();
    
    console.log('\n🎉 LOCAL DATABASE TESTING COMPLETE!');
    console.log('===================================');
    console.log('✅ Connection: WORKING');
    console.log('✅ Tables: WORKING');  
    console.log('✅ Data Operations: WORKING');
    console.log('✅ Ready for Application Testing!');
    
  } catch (error) {
    console.error('\n❌ FINAL TEST FAILED:', error.message);
    console.error('Error code:', error.code);
  }
}

finalTest();