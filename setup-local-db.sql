-- Setup local MySQL with production credentials
-- Run this in your local MySQL/phpMyAdmin

-- Create database
CREATE DATABASE IF NOT EXISTS waapify_ghl;
USE waapify_ghl;

-- Create user with production credentials
CREATE USER IF NOT EXISTS 'waapify_user'@'localhost' IDENTIFIED BY 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++';
CREATE USER IF NOT EXISTS 'waapify_user'@'127.0.0.1' IDENTIFIED BY 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++';
CREATE USER IF NOT EXISTS 'waapify_user'@'%' IDENTIFIED BY 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++';

-- Grant permissions
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'localhost';
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'%';
FLUSH PRIVILEGES;

-- Create all production tables
CREATE TABLE IF NOT EXISTS installations (
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
    INDEX idx_location_id (location_id),
    INDEX idx_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS waapify_configs (
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
    INDEX idx_whatsapp_number (whatsapp_number),
    INDEX idx_is_active (is_active)
);

CREATE TABLE IF NOT EXISTS message_logs (
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
    INDEX idx_message_type (message_type),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_waapify_message_id (waapify_message_id)
);

CREATE TABLE IF NOT EXISTS ai_configs (
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
    UNIQUE KEY unique_ai_config (company_id, location_id),
    INDEX idx_enabled (enabled)
);

CREATE TABLE IF NOT EXISTS rate_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(100) NOT NULL,
    location_id VARCHAR(100) NOT NULL,
    last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INT DEFAULT 0,
    limit_per_minute INT DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_rate_limit (company_id, location_id),
    INDEX idx_updated_at (updated_at)
);

-- Insert test data with real credentials
INSERT INTO installations (company_id, location_id, access_token, refresh_token, expires_in) VALUES
('TEST_COMPANY_001', 'TEST_LOCATION_001', 'test_access_token_001', 'test_refresh_token_001', 3600);

-- Get the installation ID for foreign key
SET @installation_id = LAST_INSERT_ID();

-- Insert test Waapify config (you'll need to update with real credentials)
INSERT INTO waapify_configs (installation_id, company_id, location_id, access_token, instance_id, whatsapp_number, is_active) VALUES
(@installation_id, 'TEST_COMPANY_001', 'TEST_LOCATION_001', 'YOUR_REAL_WAAPIFY_ACCESS_TOKEN', 'YOUR_REAL_INSTANCE_ID', '+60168970072', TRUE);

-- Verification queries
SELECT 'Database setup completed!' as status;
SELECT 'Tables created:' as info;
SHOW TABLES;

SELECT 'Test installation created:' as info;
SELECT * FROM installations;

SELECT 'Test Waapify config created (update with real credentials):' as info;
SELECT * FROM waapify_configs;