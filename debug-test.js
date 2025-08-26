const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugTest() {
  console.log('🔍 === WAAPIFY-GHL DEBUG TEST ===');
  
  // 1. Test database connection
  console.log('\n1️⃣ Testing database connection...');
  console.log('Using credentials:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'waapify_user',
    database: process.env.DB_NAME || 'waapify_ghl',
    password: process.env.DB_PASSWORD ? '[HIDDEN]' : 'NOT SET'
  });
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'waapify_user',
      password: process.env.DB_PASSWORD || 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: process.env.DB_NAME || 'waapify_ghl'
    });
    
    console.log('✅ Database connection successful!');
    
    // 2. Test tables exist
    console.log('\n2️⃣ Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    // 3. Test installations table
    console.log('\n3️⃣ Testing installations table...');
    const [installations] = await connection.execute('SELECT COUNT(*) as count FROM installations');
    console.log(`👥 Installations count: ${installations[0].count}`);
    
    if (installations[0].count > 0) {
      const [instData] = await connection.execute('SELECT * FROM installations LIMIT 3');
      console.log('Recent installations:', instData);
    }
    
    // 4. Test waapify_configs table  
    console.log('\n4️⃣ Testing waapify_configs table...');
    const [configs] = await connection.execute('SELECT COUNT(*) as count FROM waapify_configs');
    console.log(`⚙️ Waapify configs count: ${configs[0].count}`);
    
    if (configs[0].count > 0) {
      const [configData] = await connection.execute('SELECT company_id, location_id, instance_id, is_active FROM waapify_configs LIMIT 3');
      console.log('Recent configs:', configData);
    }
    
    // 5. Test message_logs table
    console.log('\n5️⃣ Testing message_logs table...');
    const [messages] = await connection.execute('SELECT COUNT(*) as count FROM message_logs');
    console.log(`💬 Message logs count: ${messages[0].count}`);
    
    if (messages[0].count > 0) {
      const [msgData] = await connection.execute('SELECT recipient, status, sent_at FROM message_logs ORDER BY sent_at DESC LIMIT 3');
      console.log('Recent messages:', msgData);
    }
    
    await connection.end();
    console.log('\n🎉 All database tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL state:', error.sqlState);
  }
}

debugTest();