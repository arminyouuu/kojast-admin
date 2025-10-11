-- Create the database
CREATE DATABASE IF NOT EXISTS kojast CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE kojast; 

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  category_id INT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create place_images table
CREATE TABLE IF NOT EXISTS place_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  INDEX idx_place (place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample categories
INSERT INTO categories (name) VALUES
  ('Food & Dining'),
  ('Fitness & Sports'),
  ('Nature & Parks'),
  ('Shopping'),
  ('Entertainment')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample places
INSERT INTO places (name, description, address, category_id, latitude, longitude) VALUES
  ('Central Park Cafe', 'Cozy cafe in the heart of the city with fresh pastries and coffee', '123 Main Street', 1, 40.7829, -73.9654),
  ('Downtown Gym', 'Modern fitness center with state-of-the-art equipment', '456 Fitness Ave', 2, 40.7589, -73.9851),
  ('City Botanical Garden', 'Beautiful garden with exotic plants and peaceful walking paths', '789 Garden Blvd', 3, 40.7614, -73.9776)
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample images for places
INSERT INTO place_images (place_id, image_url, display_order) VALUES
  (1, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 0),
  (1, 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg', 1),
  (2, 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg', 0),
  (2, 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg', 1),
  (3, 'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg', 0),
  (3, 'https://images.pexels.com/photos/1061623/pexels-photo-1061623.jpeg', 1)
ON DUPLICATE KEY UPDATE image_url=image_url;
