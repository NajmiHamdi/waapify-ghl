const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.production' });

async function checkProductionDatabase() {
  try {
    console.log('🔍 Checking PRODUCTION database connection...');
    
    const DB_CONFIG = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'waapify_user',
      password: process.env.DB_PASSWORD || 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: process.env.DB_NAME || 'waapify_ghl'
    };
    
    console.log('Production Database config:', {
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database,
      password: DB_CONFIG.password ? '***exists***' : 'empty'
    });
    
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Production database connection successful');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    const [installations] = await connection.execute('SELECT COUNT(*) as count FROM installations');
    console.log(`👥 Found ${installations[0].count} installations`);
    
    const [configs] = await connection.execute('SELECT COUNT(*) as count FROM waapify_configs');
    console.log(`⚙️ Found ${configs[0].count} Waapify configurations`);
    
    const [messages] = await connection.execute('SELECT COUNT(*) as count FROM message_logs');
    console.log(`💬 Found ${messages[0].count} message logs`);
    
    await connection.end();
    console.log('\n🎉 Production database ready!');
    
  } catch (error) {
    console.error('❌ Production database error:', error.message);
  }
}

checkProductionDatabase();