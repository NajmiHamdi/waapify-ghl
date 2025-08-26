-- Complete local MySQL setup for testing
-- Run this in your local MySQL/phpMyAdmin

-- 1. Create database
DROP DATABASE IF EXISTS waapify_ghl;
CREATE DATABASE waapify_ghl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE waapify_ghl;

-- 2. Create user with proper permissions for all hosts
DROP USER IF EXISTS 'waapify_user'@'localhost';
DROP USER IF EXISTS 'waapify_user'@'127.0.0.1'; 
DROP USER IF EXISTS 'waapify_user'@'%';

CREATE USER 'waapify_user'@'localhost' IDENTIFIED BY 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++';
CREATE USER 'waapify_user'@'127.0.0.1' IDENTIFIED BY 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++';
CREATE USER 'waapify_user'@'%' IDENTIFIED BY 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++';

-- 3. Grant all privileges 
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'localhost';
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'%';
FLUSH PRIVILEGES;

-- 4. Create all production tables
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
    INDEX idx_location_id (location_id),
    INDEX idx_expires_at (expires_at)
);

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
    INDEX idx_whatsapp_number (whatsapp_number),
    INDEX idx_is_active (is_active)
);

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
    INDEX idx_message_type (message_type),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_waapify_message_id (waapify_message_id)
);

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
    UNIQUE KEY unique_ai_config (company_id, location_id),
    INDEX idx_enabled (enabled)
);

CREATE TABLE rate_limits (
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

-- 5. Insert test data with real Waapify credentials
INSERT INTO installations (company_id, location_id, access_token, refresh_token, expires_in) VALUES
('REAL_TEST_COMPANY', 'REAL_TEST_LOCATION', 'test_ghl_access_token', 'test_ghl_refresh_token', 3600);

SET @installation_id = LAST_INSERT_ID();

INSERT INTO waapify_configs (installation_id, company_id, location_id, access_token, instance_id, whatsapp_number, is_active) VALUES
(@installation_id, 'REAL_TEST_COMPANY', 'REAL_TEST_LOCATION', '1740aed492830374b432091211a6628d', '673F5A50E7194', '+60168970072', TRUE);

-- 6. Test queries
SELECT 'Database setup completed successfully!' as status;

SELECT 'Users created:' as info;
SELECT User, Host FROM mysql.user WHERE User = 'waapify_user';

SELECT 'Tables created:' as info;
SHOW TABLES;

SELECT 'Test data inserted:' as info;
SELECT i.id, i.company_id, i.location_id, w.instance_id, w.whatsapp_number 
FROM installations i 
JOIN waapify_configs w ON i.id = w.installation_id;

SELECT 'Setup complete - ready for testing!' as final_status;