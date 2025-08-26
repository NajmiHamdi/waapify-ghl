-- ========================================
-- WAAPIFY-GHL FRESH INSTALL DATABASE SCHEMA
-- MySQL Schema for Production Deployment
-- ========================================

-- Create database
CREATE DATABASE IF NOT EXISTS waapify_ghl_fresh;
USE waapify_ghl_fresh;

-- ========================================
-- 1. INSTALLATIONS TABLE
-- Stores GHL OAuth installation data
-- ========================================
CREATE TABLE installations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(100) NOT NULL,
    location_id VARCHAR(100) DEFAULT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_in INT NOT NULL DEFAULT 3600,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for fast lookups
    UNIQUE KEY unique_installation (company_id, location_id),
    INDEX idx_company_id (company_id),
    INDEX idx_location_id (location_id),
    INDEX idx_expires_at (expires_at)
);

-- ========================================
-- 2. WAAPIFY CONFIGURATIONS TABLE  
-- Stores user Waapify API credentials
-- ========================================
CREATE TABLE waapify_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    installation_id INT NOT NULL,
    company_id VARCHAR(100) NOT NULL,
    location_id VARCHAR(100) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    instance_id VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_tested_at TIMESTAMP NULL DEFAULT NULL,
    test_status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (installation_id) REFERENCES installations(id) ON DELETE CASCADE,
    
    -- Indexes for fast lookups  
    UNIQUE KEY unique_waapify_config (company_id, location_id),
    INDEX idx_instance_id (instance_id),
    INDEX idx_whatsapp_number (whatsapp_number),
    INDEX idx_is_active (is_active)
);

-- ========================================
-- 3. MESSAGE LOGS TABLE
-- Tracks all WhatsApp messages sent
-- ========================================
CREATE TABLE message_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    installation_id INT NOT NULL,
    company_id VARCHAR(100) NOT NULL,
    location_id VARCHAR(100) NOT NULL,
    ghl_message_id VARCHAR(100) DEFAULT NULL,
    waapify_message_id VARCHAR(100) DEFAULT NULL,
    recipient VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'media', 'ai_response') NOT NULL DEFAULT 'text',
    media_url TEXT DEFAULT NULL,
    filename VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed') NOT NULL DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Foreign key relationship
    FOREIGN KEY (installation_id) REFERENCES installations(id) ON DELETE CASCADE,
    
    -- Indexes for analytics and filtering
    INDEX idx_company_location (company_id, location_id),
    INDEX idx_recipient (recipient),
    INDEX idx_message_type (message_type),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_waapify_message_id (waapify_message_id)
);

-- ========================================
-- 4. AI CHATBOT CONFIGURATIONS TABLE
-- Stores AI chatbot settings per location
-- ========================================
CREATE TABLE ai_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    installation_id INT NOT NULL,
    company_id VARCHAR(100) NOT NULL,
    location_id VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    keywords TEXT DEFAULT NULL,
    context TEXT DEFAULT NULL,
    persona VARCHAR(500) DEFAULT NULL,
    openai_api_key TEXT DEFAULT NULL,
    model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    max_tokens INT DEFAULT 150,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (installation_id) REFERENCES installations(id) ON DELETE CASCADE,
    
    -- Indexes
    UNIQUE KEY unique_ai_config (company_id, location_id),
    INDEX idx_enabled (enabled)
);

-- ========================================
-- 5. RATE LIMITS TABLE
-- Track API usage per location
-- ========================================
CREATE TABLE rate_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(100) NOT NULL,
    location_id VARCHAR(100) NOT NULL,
    last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INT DEFAULT 0,
    limit_per_minute INT DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    UNIQUE KEY unique_rate_limit (company_id, location_id),
    INDEX idx_updated_at (updated_at)
);

-- ========================================
-- CREATE DATABASE USER FOR FRESH INSTALL
-- ========================================

-- Create user for fresh database
CREATE USER IF NOT EXISTS 'waapify_fresh'@'localhost' IDENTIFIED BY 'WaapifyFresh2024!@#';

-- Grant privileges on fresh database
GRANT ALL PRIVILEGES ON waapify_ghl_fresh.* TO 'waapify_fresh'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- ========================================
-- VERIFY SETUP
-- ========================================
SHOW TABLES;
SELECT 'Fresh database setup completed successfully!' as status;
SELECT USER() as current_user;
SELECT DATABASE() as current_database;