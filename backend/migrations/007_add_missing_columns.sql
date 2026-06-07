-- ============================================================
-- MIGRATION: Add missing columns to existing tables
-- Run this if you have an existing database missing new columns
-- Safe to run multiple times - uses procedure to check column existence
-- ============================================================

DELIMITER //

-- Create procedure to add column if not exists
DROP PROCEDURE IF EXISTS add_column_if_not_exists//
CREATE PROCEDURE add_column_if_not_exists(
  IN table_name_param VARCHAR(100),
  IN column_name_param VARCHAR(100),
  IN column_definition VARCHAR(500)
)
BEGIN
  DECLARE column_exists INT DEFAULT 0;

  SELECT COUNT(*) INTO column_exists
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = table_name_param
    AND column_name = column_name_param;

  IF column_exists = 0 THEN
    SET @sql = CONCAT('ALTER TABLE ', table_name_param, ' ADD COLUMN ', column_name_param, ' ', column_definition);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//

-- Create procedure to add index if not exists
DROP PROCEDURE IF EXISTS add_index_if_not_exists//
CREATE PROCEDURE add_index_if_not_exists(
  IN table_name_param VARCHAR(100),
  IN index_name_param VARCHAR(100),
  IN column_name_param VARCHAR(100)
)
BEGIN
  DECLARE index_exists INT DEFAULT 0;

  SELECT COUNT(*) INTO index_exists
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = table_name_param
    AND index_name = index_name_param;

  IF index_exists = 0 THEN
    SET @sql = CONCAT('ALTER TABLE ', table_name_param, ' ADD INDEX ', index_name_param, ' (', column_name_param, ')');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//

DELIMITER ;

-- Add contact info columns to places table
CALL add_column_if_not_exists('places', 'website', 'VARCHAR(500) DEFAULT NULL AFTER longitude');
CALL add_column_if_not_exists('places', 'instagram', 'VARCHAR(255) DEFAULT NULL AFTER website');
CALL add_column_if_not_exists('places', 'phone_number', 'VARCHAR(50) DEFAULT NULL AFTER instagram');

-- Add expiration_date column if missing
CALL add_column_if_not_exists('places', 'expiration_date', 'DATE');

-- Add rating columns to places table
CALL add_column_if_not_exists('places', 'average_rating', 'DECIMAL(2,1) DEFAULT 0');
CALL add_column_if_not_exists('places', 'rating_count', 'INT DEFAULT 0');

-- Add indexes
CALL add_index_if_not_exists('places', 'idx_rating', 'average_rating');
CALL add_index_if_not_exists('places', 'idx_expiration', 'expiration_date');

-- Clean up procedures
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

-- ============================================================
-- DONE! Missing columns added.
-- ============================================================
