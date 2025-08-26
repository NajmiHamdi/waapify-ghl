// Simple database connection test and fix
const mysql = require('mysql2/promise');

async function testAndFixDatabase() {
  console.log('🔧 === FIXING DATABASE CONNECTION ONLY ===\n');
  
  const credentials = {
    host: 'localhost',
    user: 'waapify_user',
    password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
    database: 'waapify_ghl'
  };
  
  console.log('Testing database connection...');
  console.log('Host:', credentials.host);
  console.log('User:', credentials.user);
  console.log('Database:', credentials.database);
  
  try {
    // Test connection
    const connection = await mysql.createConnection(credentials);
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query successful:', result);
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]).join(', '));
    
    await connection.end();
    console.log('\n🎉 DATABASE IS WORKING! No changes needed.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 SOLUTIONS:');
    console.log('1. Start local MySQL server');
    console.log('2. Create database and user in phpMyAdmin:');
    console.log('   - Database: waapify_ghl');
    console.log('   - User: waapify_user');
    console.log('   - Password: QyXnDWo*OPoqCV#sW+++k~eXU?RCub++');
    console.log('3. Grant ALL PRIVILEGES to waapify_user');
    
    return false;
  }
}

testAndFixDatabase();