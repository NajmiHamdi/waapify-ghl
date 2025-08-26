// Simple database connection test and fix
const mysql = require('mysql2/promise');

async function testAndFixDatabase() {
  console.log('🔧 === FIXING DATABASE CONNECTION ONLY ===\n');
  
  // Try different connection methods
  const credentials = [
    {
      host: '127.0.0.1',
      user: 'waapify_user',
      password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: 'waapify_ghl'
    },
    {
      host: 'localhost',
      user: 'waapify_user',
      password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: 'waapify_ghl'
    },
    {
      socketPath: '/tmp/mysql.sock',
      user: 'waapify_user',
      password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: 'waapify_ghl'
    }
  ];
  
  console.log('Testing different connection methods...');
  
  for (let i = 0; i < credentials.length; i++) {
    const cred = credentials[i];
    console.log(`\nTrying method ${i + 1}:`, cred.host || cred.socketPath);
    
    try {
      // Test connection
      const connection = await mysql.createConnection(cred);
      console.log('✅ Database connection successful!');
      
      // Test basic query
      const [result] = await connection.execute('SELECT 1 as test');
      console.log('✅ Database query successful:', result);
      
      // Check if tables exist
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`✅ Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]).join(', '));
      
      await connection.end();
      console.log('\n🎉 DATABASE IS WORKING! Connection method:', cred.host || cred.socketPath);
      
      // Update .env file with working connection
      console.log('✅ This connection method works - ready for app testing!');
      
      return true;
      
    } catch (error) {
      console.error(`❌ Method ${i + 1} failed:`, error.message);
    }
  }
  
  console.log('\n💡 All connection methods failed.');
  console.log('Direct MySQL CLI works, but Node.js connection has issues.');
  
  return false;
}

testAndFixDatabase();