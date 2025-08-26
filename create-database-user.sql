-- Create database and user for Waapify-GHL
-- Run this as MySQL root user

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS waapify_ghl;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'waapify_user'@'localhost' IDENTIFIED BY '5IYUhdp:+i~}nYpbEPt5OlLM7d4^*6D';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON waapify_ghl.* TO 'waapify_user'@'localhost';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Show created user
SELECT user, host FROM mysql.user WHERE user = 'waapify_user';

-- Show databases
SHOW DATABASES;

-- Use the database
USE waapify_ghl;