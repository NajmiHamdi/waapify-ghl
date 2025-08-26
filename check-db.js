const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'waapify_user',
      password: process.env.DB_PASSWORD || 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: process.env.DB_NAME || 'waapify_ghl'
    });
    
    console.log('✅ Database connection successful');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables`);
    
    const [installations] = await connection.execute('SELECT COUNT(*) as count FROM installations');
    console.log(`👥 Installations: ${installations[0].count}`);
    
    const [configs] = await connection.execute('SELECT COUNT(*) as count FROM waapify_configs');
    console.log(`⚙️ Waapify configs: ${configs[0].count}`);
    
    const [messages] = await connection.execute('SELECT COUNT(*) as count FROM message_logs');
    console.log(`💬 Message logs: ${messages[0].count}`);
    
    await connection.end();
    console.log('🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkDatabase();