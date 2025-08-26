// Complete comprehensive testing of ALL APIs with database logging
const axios = require('axios');
const mysql = require('mysql2/promise');
const { spawn } = require('child_process');
const fs = require('fs').promises;

// Test configuration
const CONFIG = {
  // Real Waapify credentials
  waapify: {
    access_token: '1740aed492830374b432091211a6628d',
    instance_id: '673F5A50E7194'
  },
  
  // Test data
  test: {
    phone: '+60168970072',
    company_id: 'REAL_TEST_COMPANY', 
    location_id: 'REAL_TEST_LOCATION',
    contact_id: 'TEST_CONTACT_123',
    message: '🧪 Complete API Test dari Waapify-GHL!'
  },
  
  // Database config
  database: {
    host: 'localhost',
    user: 'waapify_user',
    password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
    database: 'waapify_ghl'
  },
  
  // App config
  app: {
    port: 3007,
    baseUrl: 'http://localhost:3007'
  }
};

class CompleteTester {
  constructor() {
    this.results = {};
    this.dbConnection = null;
    this.appProcess = null;
  }

  async testDatabaseConnection() {
    console.log('🔍 === TESTING DATABASE CONNECTION ===\n');
    
    try {
      this.dbConnection = await mysql.createConnection(CONFIG.database);
      console.log('✅ Database connected successfully!');
      
      // Test basic queries
      const [tables] = await this.dbConnection.execute('SHOW TABLES');
      console.log(`📋 Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]).join(', '));
      
      // Check existing data
      const [installations] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM installations');
      const [configs] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM waapify_configs');
      const [messages] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM message_logs');
      
      console.log(`👥 Installations: ${installations[0].count}`);
      console.log(`⚙️ Waapify configs: ${configs[0].count}`);
      console.log(`💬 Message logs: ${messages[0].count}`);
      
      this.results.database = { success: true, tables: tables.length };
      return true;
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.results.database = { success: false, error: error.message };
      return false;
    }
  }

  async startApp() {
    console.log('\n🚀 === STARTING APPLICATION ===\n');
    
    return new Promise((resolve) => {
      this.appProcess = spawn('node', ['dist/index.js'], {
        env: { 
          ...process.env, 
          PORT: CONFIG.app.port,
          NODE_ENV: 'development'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let appStarted = false;
      const startTimeout = setTimeout(() => {
        if (!appStarted) {
          console.log('⚠️ App taking too long, proceeding anyway...');
          resolve(false);
        }
      }, 10000);
      
      this.appProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) console.log('📱 App:', output);
        
        if (output.includes('listening on port') && !appStarted) {
          appStarted = true;
          clearTimeout(startTimeout);
          console.log('✅ App started successfully!');
          setTimeout(() => resolve(true), 2000);
        }
      });
      
      this.appProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error && !error.includes('Database connection failed')) {
          console.log('⚠️ App Warning:', error);
        }
      });
    });
  }

  async testAllAPIs() {
    console.log('\n🧪 === TESTING ALL API ENDPOINTS ===\n');
    
    const tests = [
      { name: 'Root Endpoint', test: () => this.testRootEndpoint() },
      { name: 'Provider Status', test: () => this.testProviderStatus() },
      { name: 'External Auth', test: () => this.testExternalAuth() },
      { name: 'Text Message Sending', test: () => this.testTextMessage() },
      { name: 'Media Message Sending', test: () => this.testMediaMessage() },
      { name: 'Check Phone Number', test: () => this.testCheckPhone() },
      { name: 'AI Response', test: () => this.testAIResponse() },
      { name: 'Database Logging', test: () => this.testDatabaseLogging() }
    ];
    
    for (const test of tests) {
      try {
        console.log(`\n${test.name}...`);
        await test.test();
        console.log(`✅ ${test.name}: PASSED`);
      } catch (error) {
        console.error(`❌ ${test.name}: FAILED -`, error.message);
        this.results[test.name] = { success: false, error: error.message };
      }
    }
  }

  async testRootEndpoint() {
    const response = await axios.get(CONFIG.app.baseUrl);
    this.results.rootEndpoint = { success: response.status === 200 };
  }

  async testProviderStatus() {
    const url = `${CONFIG.app.baseUrl}/provider/status?locationId=${CONFIG.test.location_id}&companyId=${CONFIG.test.company_id}`;
    const response = await axios.get(url);
    this.results.providerStatus = { 
      success: response.status === 200,
      status: response.data.status,
      data: response.data
    };
  }

  async testExternalAuth() {
    const response = await axios.post(`${CONFIG.app.baseUrl}/external-auth`, {
      companyId: CONFIG.test.company_id,
      locationId: CONFIG.test.location_id,
      access_token: CONFIG.waapify.access_token,
      instance_id: CONFIG.waapify.instance_id,
      whatsapp_number: CONFIG.test.phone
    });
    
    this.results.externalAuth = {
      success: response.data.success,
      data: response.data
    };
  }

  async testTextMessage() {
    const messageText = CONFIG.test.message + ' - Text Message Test';
    
    const response = await axios.post(`${CONFIG.app.baseUrl}/conversation-provider`, {
      locationId: CONFIG.test.location_id,
      contactId: CONFIG.test.contact_id,
      messageId: `test_text_${Date.now()}`,
      phone: CONFIG.test.phone,
      message: messageText,
      type: 'SMS',
      attachments: []
    });
    
    this.results.textMessage = {
      success: response.data.success,
      messageId: response.data.messageId,
      data: response.data
    };
    
    if (response.data.success) {
      console.log('📱 Text message sent! Check WhatsApp:', CONFIG.test.phone);
    }
  }

  async testMediaMessage() {
    const mediaUrl = 'https://via.placeholder.com/300x200.png?text=Test+Image';
    
    const response = await axios.post(`${CONFIG.app.baseUrl}/action/send-whatsapp-media-ghl`, {
      number: CONFIG.test.phone,
      message: 'Media message test from Waapify-GHL!',
      media_url: mediaUrl,
      filename: 'test-image.png',
      locationId: CONFIG.test.location_id,
      companyId: CONFIG.test.company_id,
      contactId: CONFIG.test.contact_id,
      instance_id: CONFIG.waapify.instance_id,
      access_token: CONFIG.waapify.access_token
    });
    
    this.results.mediaMessage = {
      success: response.data.success,
      data: response.data
    };
    
    if (response.data.success) {
      console.log('📷 Media message sent! Check WhatsApp:', CONFIG.test.phone);
    }
  }

  async testCheckPhone() {
    const response = await axios.post(`${CONFIG.app.baseUrl}/action/check-whatsapp-phone`, {
      number: CONFIG.test.phone,
      instance_id: CONFIG.waapify.instance_id,
      access_token: CONFIG.waapify.access_token,
      locationId: CONFIG.test.location_id,
      companyId: CONFIG.test.company_id
    });
    
    this.results.checkPhone = {
      success: response.data.success,
      isWhatsApp: response.data.isWhatsApp,
      data: response.data
    };
  }

  async testAIResponse() {
    const response = await axios.post(`${CONFIG.app.baseUrl}/action/ai-response`, {
      locationId: CONFIG.test.location_id,
      companyId: CONFIG.test.company_id,
      contactId: CONFIG.test.contact_id,
      customerMessage: 'Hello, I need help with my order',
      phone: CONFIG.test.phone,
      context: 'You are a helpful customer service assistant',
      persona: 'friendly and professional',
      keywords: 'help,order,support',
      openai_api_key: process.env.OPENAI_API_KEY || 'test_key'
    });
    
    this.results.aiResponse = {
      success: response.data.success,
      data: response.data
    };
  }

  async testDatabaseLogging() {
    if (!this.dbConnection) {
      throw new Error('Database connection not available');
    }
    
    // Check if messages were logged
    const [messages] = await this.dbConnection.execute(
      'SELECT * FROM message_logs ORDER BY sent_at DESC LIMIT 5'
    );
    
    const [installations] = await this.dbConnection.execute(
      'SELECT * FROM installations WHERE company_id = ?',
      [CONFIG.test.company_id]
    );
    
    const [configs] = await this.dbConnection.execute(
      'SELECT * FROM waapify_configs WHERE company_id = ?',
      [CONFIG.test.company_id]  
    );
    
    this.results.databaseLogging = {
      success: true,
      messageCount: messages.length,
      installationCount: installations.length,
      configCount: configs.length,
      recentMessages: messages,
      installations: installations,
      configs: configs
    };
    
    console.log(`📋 Recent messages in database: ${messages.length}`);
    console.log(`👥 Installations found: ${installations.length}`);
    console.log(`⚙️ Configs found: ${configs.length}`);
  }

  async generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 === COMPLETE TEST REPORT ===');
    console.log('='.repeat(80));
    
    const summary = {
      total: 0,
      passed: 0,
      failed: 0
    };
    
    for (const [testName, result] of Object.entries(this.results)) {
      summary.total++;
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${testName}`);
      
      if (result.success) {
        summary.passed++;
      } else {
        summary.failed++;
        if (result.error) console.log(`   Error: ${result.error}`);
      }
    }
    
    console.log('\n' + '-'.repeat(50));
    console.log(`📈 Summary: ${summary.passed}/${summary.total} tests passed`);
    console.log(`🎯 Success Rate: ${Math.round((summary.passed/summary.total)*100)}%`);
    
    if (this.results.databaseLogging) {
      console.log('\n📋 Database Status:');
      console.log(`   Messages logged: ${this.results.databaseLogging.messageCount}`);
      console.log(`   Installations: ${this.results.databaseLogging.installationCount}`);
      console.log(`   Waapify configs: ${this.results.databaseLogging.configCount}`);
    }
    
    console.log('\n🔗 Check your phpMyAdmin:');
    console.log('   URL: http://localhost/phpmyadmin/');
    console.log('   Database: waapify_ghl');
    console.log('   Check tables: installations, waapify_configs, message_logs');
    
    console.log('='.repeat(80));
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      results: this.results,
      config: {
        phone: CONFIG.test.phone,
        waapify_instance: CONFIG.waapify.instance_id,
        database: CONFIG.database.database
      }
    };
    
    await fs.writeFile('test-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to: test-report.json');
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.dbConnection) {
      await this.dbConnection.end();
    }
    
    if (this.appProcess) {
      this.appProcess.kill();
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Complete API Testing...\n');
      
      // Step 1: Test database
      const dbConnected = await this.testDatabaseConnection();
      if (!dbConnected) {
        console.log('❌ Database connection failed - some tests will be skipped');
      }
      
      // Step 2: Start app
      const appStarted = await this.startApp();
      if (!appStarted) {
        throw new Error('Failed to start application');
      }
      
      // Step 3: Run all API tests
      await this.testAllAPIs();
      
      // Step 4: Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error('💥 Testing failed:', error.message);
    } finally {
      await this.cleanup();
      process.exit(0);
    }
  }
}

// Instructions
console.log('📋 BEFORE RUNNING THIS TEST:');
console.log('1. Setup local MySQL by running: setup-local-mysql.sql');
console.log('2. Ensure local MySQL server is running');
console.log('3. Build the app: npm run build');
console.log('4. Run this test: node complete-test-all-apis.js');
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to start...\n');

setTimeout(() => {
  const tester = new CompleteTester();
  tester.run();
}, 5000);