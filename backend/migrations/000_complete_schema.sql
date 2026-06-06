-- ============================================================
-- COMPLETE DATABASE SCHEMA FOR KOJAST
-- Run this to create all tables from scratch or refresh
-- ============================================================

-- Create the database (run separately if needed)
-- CREATE DATABASE IF NOT EXISTS kojast CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE kojast;

-- ============================================================
-- 1. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. PLACES TABLE (with all columns including contact info and ratings)
-- ============================================================
CREATE TABLE IF NOT EXISTS places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  category_id INT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  website VARCHAR(500) DEFAULT NULL,
  instagram VARCHAR(255) DEFAULT NULL,
  phone_number VARCHAR(50) DEFAULT NULL,
  expiration_date DATE,
  average_rating DECIMAL(2,1) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_expiration (expiration_date),
  INDEX idx_rating (average_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. PLACE_IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS place_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  INDEX idx_place (place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. API_KEYS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  permissions JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  INDEX idx_api_key (api_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT check_contact CHECK (phone_number IS NOT NULL OR email IS NOT NULL),
  INDEX idx_users_phone (phone_number),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. USER_FAVORITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  place_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_place (user_id, place_id),
  INDEX idx_favorites_user (user_id),
  INDEX idx_favorites_place (place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. USER_SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  device_info TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. RATINGS TABLE (with moderation)
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_place_rating (place_id, user_id),
  INDEX idx_place (place_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  CONSTRAINT chk_rating_value CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. APP_BANNERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS app_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_display_order (display_order),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. TRIGGERS FOR RATINGS (auto-update place stats)
-- ============================================================
DELIMITER //

DROP TRIGGER IF EXISTS after_rating_insert//
DROP TRIGGER IF EXISTS after_rating_update//
DROP TRIGGER IF EXISTS after_rating_delete//

CREATE TRIGGER after_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
  UPDATE places
  SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved'),
    average_rating = COALESCE((SELECT AVG(rating) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved'), 0)
  WHERE id = NEW.place_id;
END//

CREATE TRIGGER after_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
  UPDATE places
  SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved'),
    average_rating = COALESCE((SELECT AVG(rating) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved'), 0)
  WHERE id = NEW.place_id;
END//

CREATE TRIGGER after_rating_delete
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
  UPDATE places
  SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = OLD.place_id AND status = 'approved'),
    average_rating = COALESCE((SELECT AVG(rating) FROM ratings WHERE place_id = OLD.place_id AND status = 'approved'), 0)
  WHERE id = OLD.place_id;
END//

DELIMITER ;

-- ============================================================
-- 12. SAMPLE DATA (optional - remove for production)
-- ============================================================

-- Sample categories
INSERT INTO categories (name) VALUES
  ('Food & Dining'),
  ('Fitness & Sports'),
  ('Nature & Parks'),
  ('Shopping'),
  ('Entertainment')
ON DUPLICATE KEY UPDATE name=name;

-- Sample places
INSERT INTO places (name, description, address, category_id, latitude, longitude) VALUES
  ('Central Park Cafe', 'Cozy cafe in the heart of the city with fresh pastries and coffee', '123 Main Street', 1, 40.7829, -73.9654),
  ('Downtown Gym', 'Modern fitness center with state-of-the-art equipment', '456 Fitness Ave', 2, 40.7589, -73.9851),
  ('City Botanical Garden', 'Beautiful garden with exotic plants and peaceful walking paths', '789 Garden Blvd', 3, 40.7614, -73.9776)
ON DUPLICATE KEY UPDATE name=name;

-- Sample images for places
INSERT INTO place_images (place_id, image_url, display_order) VALUES
  (1, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 0),
  (1, 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg', 1),
  (2, 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg', 0),
  (2, 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg', 1),
  (3, 'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg', 0),
  (3, 'https://images.pexels.com/photos/1061623/pexels-photo-1061623.jpeg', 1)
ON DUPLICATE KEY UPDATE image_url=image_url;

-- ============================================================
-- DONE! All tables created successfully.
-- ============================================================
