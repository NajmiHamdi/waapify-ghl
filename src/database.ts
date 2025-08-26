// ========================================
// DATABASE CONNECTION AND QUERIES
// MySQL implementation for RunCloud deployment
// ========================================

import mysql from 'mysql2/promise';

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'waapify_ghl_fresh',
  connectionLimit: 10
};

// Create connection pool
const pool = mysql.createPool(DB_CONFIG);

// ========================================
// DATABASE INTERFACES
// ========================================

export interface Installation {
  id?: number;
  company_id: string;
  location_id?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: Date;
  installed_at?: Date;
  updated_at?: Date;
}

export interface WaapifyConfig {
  id?: number;
  installation_id: number;
  company_id: string;
  location_id: string;
  access_token: string;
  instance_id: string;
  whatsapp_number: string;
  is_active?: boolean;
  last_tested_at?: Date;
  test_status?: 'success' | 'failed' | 'pending';
  created_at?: Date;
  updated_at?: Date;
}

export interface MessageLog {
  id?: number;
  installation_id: number;
  company_id: string;
  location_id: string;
  ghl_message_id?: string;
  waapify_message_id?: string;
  recipient: string;
  message: string;
  message_type: 'text' | 'media' | 'ai_response';
  media_url?: string;
  filename?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
  sent_at?: Date;
  delivered_at?: Date;
}

export interface AIConfig {
  id?: number;
  installation_id: number;
  company_id: string;
  location_id: string;
  enabled: boolean;
  keywords?: string;
  context?: string;
  persona?: string;
  openai_api_key?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface RateLimit {
  id?: number;
  company_id: string;
  location_id: string;
  last_reset_at: Date;
  message_count: number;
  limit_per_minute: number;
  updated_at?: Date;
}

// ========================================
// DATABASE OPERATIONS CLASS
// ========================================

export class Database {
  
  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  // ========================================
  // INSTALLATION OPERATIONS
  // ========================================

  // Save or update installation
  static async saveInstallation(installation: Installation): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const expiresAt = new Date(Date.now() + installation.expires_in * 1000);
      
      const [result] = await connection.execute(`
        INSERT INTO installations (company_id, location_id, access_token, refresh_token, expires_in, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          access_token = VALUES(access_token),
          refresh_token = VALUES(refresh_token),
          expires_in = VALUES(expires_in),
          expires_at = VALUES(expires_at),
          updated_at = CURRENT_TIMESTAMP
      `, [
        installation.company_id,
        installation.location_id,
        installation.access_token,
        installation.refresh_token,
        installation.expires_in,
        expiresAt
      ]);
      
      const insertResult = result as mysql.ResultSetHeader;
      return insertResult.insertId || await this.getInstallationId(installation.company_id, installation.location_id);
    } finally {
      connection.release();
    }
  }

  // Get installation by company and location
  static async getInstallation(companyId: string, locationId?: string): Promise<Installation | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM installations 
        WHERE company_id = ? ${locationId ? 'AND location_id = ?' : ''}
        LIMIT 1
      `, locationId ? [companyId, locationId] : [companyId]);
      
      const installations = rows as Installation[];
      return installations.length > 0 ? installations[0] : null;
    } finally {
      connection.release();
    }
  }

  // Get installation ID
  static async getInstallationId(companyId: string, locationId?: string): Promise<number> {
    const installation = await this.getInstallation(companyId, locationId);
    if (!installation || !installation.id) {
      throw new Error(`Installation not found for company: ${companyId}, location: ${locationId}`);
    }
    return installation.id;
  }

  // Get all installations
  static async getAllInstallations(): Promise<Installation[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM installations ORDER BY installed_at DESC');
      return rows as Installation[];
    } finally {
      connection.release();
    }
  }

  // ========================================
  // WAAPIFY CONFIG OPERATIONS
  // ========================================

  // Save Waapify configuration
  static async saveWaapifyConfig(config: WaapifyConfig): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        INSERT INTO waapify_configs (installation_id, company_id, location_id, access_token, instance_id, whatsapp_number, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          access_token = VALUES(access_token),
          instance_id = VALUES(instance_id),
          whatsapp_number = VALUES(whatsapp_number),
          is_active = VALUES(is_active),
          updated_at = CURRENT_TIMESTAMP
      `, [
        config.installation_id,
        config.company_id,
        config.location_id,
        config.access_token,
        config.instance_id,
        config.whatsapp_number,
        config.is_active !== false
      ]);
    } finally {
      connection.release();
    }
  }

  // Get Waapify configuration
  static async getWaapifyConfig(companyId: string, locationId: string): Promise<WaapifyConfig | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM waapify_configs 
        WHERE company_id = ? AND location_id = ? AND is_active = TRUE
        LIMIT 1
      `, [companyId, locationId]);
      
      const configs = rows as WaapifyConfig[];
      return configs.length > 0 ? configs[0] : null;
    } finally {
      connection.release();
    }
  }

  // ========================================
  // MESSAGE LOG OPERATIONS
  // ========================================

  // Log message
  static async logMessage(messageLog: MessageLog): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        INSERT INTO message_logs (installation_id, company_id, location_id, ghl_message_id, waapify_message_id, 
                                 recipient, message, message_type, media_url, filename, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        messageLog.installation_id,
        messageLog.company_id,
        messageLog.location_id,
        messageLog.ghl_message_id,
        messageLog.waapify_message_id,
        messageLog.recipient,
        messageLog.message,
        messageLog.message_type,
        messageLog.media_url,
        messageLog.filename,
        messageLog.status,
        messageLog.error_message
      ]);
    } finally {
      connection.release();
    }
  }

  // Get message logs
  static async getMessageLogs(companyId: string, locationId: string, limit: number = 100): Promise<MessageLog[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM message_logs 
        WHERE company_id = ? AND location_id = ?
        ORDER BY sent_at DESC
        LIMIT ?
      `, [companyId, locationId, limit]);
      
      return rows as MessageLog[];
    } finally {
      connection.release();
    }
  }

  // ========================================
  // RATE LIMIT OPERATIONS
  // ========================================

  // Check and update rate limit
  static async checkRateLimit(companyId: string, locationId: string): Promise<{allowed: boolean; retryAfter?: number}> {
    const connection = await pool.getConnection();
    try {
      // Get current rate limit
      const [rows] = await connection.execute(`
        SELECT * FROM rate_limits 
        WHERE company_id = ? AND location_id = ?
      `, [companyId, locationId]);
      
      const rateLimits = rows as RateLimit[];
      
      if (rateLimits.length === 0) {
        // Create new rate limit record
        await connection.execute(`
          INSERT INTO rate_limits (company_id, location_id, message_count, limit_per_minute)
          VALUES (?, ?, 1, 10)
        `, [companyId, locationId]);
        return { allowed: true };
      }
      
      const rateLimit = rateLimits[0];
      const now = new Date();
      const resetTime = new Date(rateLimit.last_reset_at);
      const minutesElapsed = (now.getTime() - resetTime.getTime()) / (1000 * 60);
      
      if (minutesElapsed >= 1) {
        // Reset counter
        await connection.execute(`
          UPDATE rate_limits 
          SET message_count = 1, last_reset_at = CURRENT_TIMESTAMP
          WHERE company_id = ? AND location_id = ?
        `, [companyId, locationId]);
        return { allowed: true };
      }
      
      if (rateLimit.message_count >= rateLimit.limit_per_minute) {
        const retryAfter = Math.ceil((60 - (minutesElapsed * 60)));
        return { allowed: false, retryAfter };
      }
      
      // Increment counter
      await connection.execute(`
        UPDATE rate_limits 
        SET message_count = message_count + 1
        WHERE company_id = ? AND location_id = ?
      `, [companyId, locationId]);
      
      return { allowed: true };
    } finally {
      connection.release();
    }
  }

  // ========================================
  // AI CONFIG OPERATIONS
  // ========================================

  // Save AI configuration
  static async saveAIConfig(config: AIConfig): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        INSERT INTO ai_configs (installation_id, company_id, location_id, enabled, keywords, context, persona, openai_api_key, model, max_tokens, temperature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          enabled = VALUES(enabled),
          keywords = VALUES(keywords),
          context = VALUES(context),
          persona = VALUES(persona),
          openai_api_key = VALUES(openai_api_key),
          model = VALUES(model),
          max_tokens = VALUES(max_tokens),
          temperature = VALUES(temperature),
          updated_at = CURRENT_TIMESTAMP
      `, [
        config.installation_id,
        config.company_id,
        config.location_id,
        config.enabled,
        config.keywords,
        config.context,
        config.persona,
        config.openai_api_key,
        config.model || 'gpt-3.5-turbo',
        config.max_tokens || 150,
        config.temperature || 0.7
      ]);
    } finally {
      connection.release();
    }
  }

  // Get AI configuration
  static async getAIConfig(companyId: string, locationId: string): Promise<AIConfig | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM ai_configs 
        WHERE company_id = ? AND location_id = ?
        LIMIT 1
      `, [companyId, locationId]);
      
      const configs = rows as AIConfig[];
      return configs.length > 0 ? configs[0] : null;
    } finally {
      connection.release();
    }
  }

  // ========================================
  // TOKEN OPERATIONS (LEGACY COMPATIBILITY)
  // ========================================

  // Get token for location (for backward compatibility)
  static async getTokenForLocation(locationId: string): Promise<string | null> {
    const installations = await this.getAllInstallations();
    const installation = installations.find(inst => inst.location_id === locationId);
    return installation ? installation.access_token : null;
  }

  // ========================================
  // ANALYTICS & REPORTING
  // ========================================

  // Get usage statistics
  static async getUsageStats(companyId?: string): Promise<any> {
    const connection = await pool.getConnection();
    try {
      let whereClause = '';
      let params: any[] = [];
      
      if (companyId) {
        whereClause = 'WHERE company_id = ?';
        params = [companyId];
      }
      
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT company_id) as total_companies,
          COUNT(DISTINCT location_id) as total_locations,
          SUM(CASE WHEN message_type = 'text' THEN 1 ELSE 0 END) as text_messages,
          SUM(CASE WHEN message_type = 'media' THEN 1 ELSE 0 END) as media_messages,
          SUM(CASE WHEN message_type = 'ai_response' THEN 1 ELSE 0 END) as ai_messages,
          SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful_messages,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_messages
        FROM message_logs
        ${whereClause}
      `, params);
      
      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }
}

// Initialize database connection on module load
Database.testConnection().then(success => {
  if (!success) {
    console.error('❌ Failed to connect to database - app may not function properly');
  }
});