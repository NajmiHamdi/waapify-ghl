const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.production' });

async function checkProductionDatabase() {
  try {
    console.log('🔍 Checking PRODUCTION database connection...');
    
    // Production database configuration
    const DB_CONFIG = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'waapify_prod',
      password: process.env.DB_PASSWORD || 'WaaProd2024#SecurePass!',
      database: process.env.DB_NAME || 'waapify_production'
    };
    
    console.log('Production Database config:', {
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database,
      password: DB_CONFIG.password ? '***exists***' : 'empty',
      passwordLength: DB_CONFIG.password ? DB_CONFIG.password.length : 0
    });
    
    // Create connection
    const connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('✅ Production database connection successful');
    
    // Check if tables exist
    console.log('\n📋 Checking production tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    // Check installations table
    console.log('\n👥 Checking installations...');
    const [installations] = await connection.execute('SELECT COUNT(*) as count FROM installations');
    console.log(`Found ${installations[0].count} installations`);
    
    // Check waapify_configs table
    console.log('\n⚙️ Checking Waapify configs...');
    const [configs] = await connection.execute('SELECT COUNT(*) as count FROM waapify_configs');
    console.log(`Found ${configs[0].count} Waapify configurations`);
    
    // Check message logs
    console.log('\n💬 Checking message logs...');
    const [messages] = await connection.execute('SELECT COUNT(*) as count FROM message_logs');
    console.log(`Found ${messages[0].count} message logs`);
    
    // Check rate limits
    console.log('\n📊 Checking rate limits...');
    const [rateLimits] = await connection.execute('SELECT COUNT(*) as count FROM rate_limits');
    console.log(`Found ${rateLimits[0].count} rate limit records`);
    
    // Check AI configs
    console.log('\n🤖 Checking AI configs...');
    const [aiConfigs] = await connection.execute('SELECT COUNT(*) as count FROM ai_configs');
    console.log(`Found ${aiConfigs[0].count} AI configurations`);
    
    await connection.end();
    
    console.log('\n🎉 Production database ready for fresh plugin installation!');
    
  } catch (error) {
    console.error('❌ Production database check error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔑 Database access denied. Run deployment SQL first:');
      console.log('mysql -u root -p < database/deploy-fresh.sql');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 Database host not found. Check if MySQL is running.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🗄️ Database does not exist. Run:');
      console.log('mysql -u root -p < database/deploy-fresh.sql');
    }
  }
}

checkProductionDatabase();