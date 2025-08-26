const mysql = require('mysql2/promise');

async function testSimple() {
  try {
    console.log('Testing with simple password...');
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'waapify_user',
      password: 'simple123',
      database: 'waapify_ghl'
    });
    
    console.log('✅ Simple password works!');
    
    // Test a query
    const [result] = await conn.execute('SELECT COUNT(*) as count FROM installations');
    console.log('Installation count:', result[0].count);
    
    await conn.end();
  } catch (error) {
    console.log('❌ Simple password failed:', error.message);
  }
}

testSimple();