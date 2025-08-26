const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and data...');
    
    // Database configuration
    const DB_CONFIG = {
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      user: process.env.DB_USER || 'waapify_fresh',
      password: process.env.DB_PASSWORD || 'WaapifyFresh2024!@#',
      database: process.env.DB_NAME || 'waapify_ghl_fresh'
    };
    
    console.log('Database config:', {
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database,
      password: DB_CONFIG.password ? '***hidden***' : 'empty',
      passwordLength: DB_CONFIG.password ? DB_CONFIG.password.length : 0
    });
    
    // Create connection
    const connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    console.log('\n📋 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables found:', tables);
    
    // Check installations table
    console.log('\n👥 Checking installations...');
    const [installations] = await connection.execute('SELECT * FROM installations LIMIT 5');
    console.log(`Found ${installations.length} installations:`);
    installations.forEach((inst, i) => {
      console.log(`  ${i+1}. Company: ${inst.company_id}, Location: ${inst.location_id}`);
    });
    
    // Check waapify_configs table
    console.log('\n⚙️ Checking Waapify configs...');
    const [configs] = await connection.execute('SELECT * FROM waapify_configs LIMIT 5');
    console.log(`Found ${configs.length} Waapify configurations:`);
    configs.forEach((config, i) => {
      console.log(`  ${i+1}. Company: ${config.company_id}, Instance: ${config.instance_id}, WhatsApp: ${config.whatsapp_number}`);
    });
    
    // Check message logs
    console.log('\n💬 Checking message logs...');
    const [messages] = await connection.execute('SELECT * FROM message_logs ORDER BY sent_at DESC LIMIT 10');
    console.log(`Found ${messages.length} message logs:`);
    messages.forEach((msg, i) => {
      console.log(`  ${i+1}. To: ${msg.recipient}, Message: "${msg.message.substring(0, 50)}...", Status: ${msg.status}, Time: ${msg.sent_at}`);
    });
    
    // Check rate limits
    console.log('\n📊 Checking rate limits...');
    const [rateLimits] = await connection.execute('SELECT * FROM rate_limits LIMIT 5');
    console.log(`Found ${rateLimits.length} rate limit records:`);
    rateLimits.forEach((rate, i) => {
      console.log(`  ${i+1}. Company: ${rate.company_id}, Count: ${rate.message_count}/${rate.limit_per_minute}`);
    });
    
    // Check AI configs
    console.log('\n🤖 Checking AI configs...');
    const [aiConfigs] = await connection.execute('SELECT * FROM ai_configs LIMIT 5');
    console.log(`Found ${aiConfigs.length} AI configurations:`);
    aiConfigs.forEach((ai, i) => {
      console.log(`  ${i+1}. Company: ${ai.company_id}, Enabled: ${ai.enabled}, Keywords: ${ai.keywords}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database check error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔑 Database access denied. Check your credentials in .env file:');
      console.log('DB_HOST=localhost');
      console.log('DB_USER=waapify_user'); 
      console.log('DB_PASSWORD=your_password');
      console.log('DB_NAME=waapify_ghl');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 Database host not found. Check if MySQL is running and hostname is correct.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🗄️ Database does not exist. Create the database first:');
      console.log('CREATE DATABASE waapify_ghl;');
    }
  }
}

checkDatabase();