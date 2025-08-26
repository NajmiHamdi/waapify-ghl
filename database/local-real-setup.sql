-- ========================================
-- LOCAL TESTING WITH REAL CREDENTIALS
-- Complete database setup for local testing
-- ========================================

-- Create fresh local database
DROP DATABASE IF EXISTS waapify_local_test;
CREATE DATABASE waapify_local_test;
USE waapify_local_test;

-- Create user for local testing (works with both localhost and 127.0.0.1)
DROP USER IF EXISTS 'waapify_local'@'localhost';
DROP USER IF EXISTS 'waapify_local'@'127.0.0.1';
DROP USER IF EXISTS 'waapify_local'@'%';

CREATE USER 'waapify_local'@'localhost' IDENTIFIED BY 'LocalTest2024!';
CREATE USER 'waapify_local'@'127.0.0.1' IDENTIFIED BY 'LocalTest2024!';
CREATE USER 'waapify_local'@'%' IDENTIFIED BY 'LocalTest2024!';

-- Grant all privileges
GRANT ALL PRIVILEGES ON waapify_local_test.* TO 'waapify_local'@'localhost';
GRANT ALL PRIVILEGES ON waapify_local_test.* TO 'waapify_local'@'127.0.0.1';
GRANT ALL PRIVILEGES ON waapify_local_test.* TO 'waapify_local'@'%';

FLUSH PRIVILEGES;

-- ========================================
-- CREATE TABLES
-- ========================================

-- 1. Installations table
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
    
    UNIQUE KEY unique_installation (company_id, location_id),
    INDEX idx_company_id (company_id),
    INDEX idx_location_id (location_id)
);

-- 2. Waapify configurations table
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
    
    FOREIGN KEY (installation_id) REFERENCES installations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_waapify_config (company_id, location_id),
    INDEX idx_instance_id (instance_id),
    INDEX idx_is_active (is_active)
);

-- 3. Message logs table
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
    
    FOREIGN KEY (installation_id) REFERENCES installations(id) ON DELETE CASCADE,
    INDEX idx_company_location (company_id, location_id),
    INDEX idx_recipient (recipient),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);

-- 4. AI configs table
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
    
    FOREIGN KEY (installation_id) REFERENCES installations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ai_config (company_id, location_id)
);

-- 5. Rate limits table
CREATE TABLE rate_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(100) NOT NULL,
    location_id VARCHAR(100) NOT NULL,
    last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INT DEFAULT 0,
    limit_per_minute INT DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_rate_limit (company_id, location_id)
);

-- ========================================
-- VERIFICATION
-- ========================================
SHOW TABLES;
SELECT 'Local test database created successfully!' as status;
SELECT USER() as current_user;
SELECT DATABASE() as current_database;

-- Show user accounts created
SELECT user, host FROM mysql.user WHERE user = 'waapify_local';