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
);
