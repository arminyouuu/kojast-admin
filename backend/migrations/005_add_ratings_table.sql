/*
  # Add Ratings System

  This migration creates a ratings table for places where users can rate places from 1-5 stars.

  ## New Tables
    - `ratings`
      - `id` (INT, primary key, auto increment)
      - `place_id` (INT, foreign key to places)
      - `user_id` (VARCHAR, stores user identifier from mobile app)
      - `rating` (TINYINT, 1-5 stars)
      - `comment` (TEXT, optional user comment)
      - `created_at` (TIMESTAMP, when rating was created)
      - `updated_at` (TIMESTAMP, when rating was last updated)

  ## Indexes
    - Index on place_id for fast lookups by place
    - Index on user_id for fast lookups by user
    - Unique constraint on (place_id, user_id) to ensure one rating per user per place

  ## Changes to Existing Tables
    - Adds `average_rating` (DECIMAL 2,1) to places table
    - Adds `rating_count` (INT) to places table
    - These fields are denormalized for performance (cached from ratings table)

  ## Notes
    - Users can only rate a place once (enforced by unique constraint)
    - Rating value must be between 1 and 5 (enforced by CHECK constraint)
    - Average rating and count are automatically updated via triggers
    - All ratings are preserved even if user deletes their account (no cascade delete)
*/

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_place_rating (place_id, user_id),
  INDEX idx_place (place_id),
  INDEX idx_user (user_id),
  CONSTRAINT chk_rating_value CHECK (rating >= 1 AND rating <= 5)
);

-- Add rating columns to places table
ALTER TABLE places
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0,
ADD INDEX idx_rating (average_rating);

-- Trigger to update place rating stats after insert
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
  UPDATE places
  SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = NEW.place_id),
    average_rating = (SELECT AVG(rating) FROM ratings WHERE place_id = NEW.place_id)
  WHERE id = NEW.place_id;
END//
DELIMITER ;

-- Trigger to update place rating stats after update
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
  UPDATE places
  SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = NEW.place_id),
    average_rating = (SELECT AVG(rating) FROM ratings WHERE place_id = NEW.place_id)
  WHERE id = NEW.place_id;
END//
DELIMITER ;

-- Trigger to update place rating stats after delete
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_rating_delete
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
  UPDATE places
  SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = OLD.place_id),
    average_rating = COALESCE((SELECT AVG(rating) FROM ratings WHERE place_id = OLD.place_id), 0)
  WHERE id = OLD.place_id;
END//
DELIMITER ;
