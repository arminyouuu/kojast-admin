-- Run this SQL script on your MySQL server to ensure all tables exist

-- Create place_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS place_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  INDEX idx_place (place_id)
);

-- Verify the tables exist
SHOW TABLES;

-- Check the structure of place_images
DESCRIBE place_images;
