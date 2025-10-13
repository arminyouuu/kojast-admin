-- Migration: Add expiration date and settings table
-- This migration adds expiration date tracking for places and a settings table for configuration

-- Add expiration_date column to places table if it doesn't exist
ALTER TABLE places ADD COLUMN IF NOT EXISTS expiration_date DATE;
ALTER TABLE places ADD INDEX IF NOT EXISTS idx_expiration (expiration_date);

-- Create settings table for storing configuration
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
);
