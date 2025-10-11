# MySQL Database Setup Instructions

## Option 1: Using MySQL Command Line

### Step 1: Login to MySQL
```bash
mysql -u root -p
```
Enter your MySQL root password when prompted.

### Step 2: Run the setup script
```sql
source /path/to/backend/setup.sql
```

Or copy-paste the SQL commands from `setup.sql` directly into the MySQL prompt.

### Step 3: Verify the setup
```sql
USE cityplace;
SHOW TABLES;
SELECT * FROM categories;
SELECT * FROM places;
```

### Step 4: Exit MySQL
```sql
EXIT;
```

---

## Option 2: Using MySQL Workbench (GUI)

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click "File" → "Open SQL Script"
4. Select the `setup.sql` file
5. Click the lightning bolt icon to execute
6. Verify tables were created in the left sidebar

---

## Option 3: Using a Single Command

From your terminal (not in MySQL):

```bash
mysql -u root -p < /path/to/backend/setup.sql
```

---

## Option 4: Using the Node.js initialization script

### Step 1: Configure environment
Create a `.env` file in the backend directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cityplace
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create the database first
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cityplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 4: Run initialization
```bash
npm run init-db
```

---

## Manual SQL Commands (Copy-Paste)

If you prefer to run commands one by one:

```sql
-- 1. Create database
CREATE DATABASE IF NOT EXISTS cityplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Use database
USE cityplace;

-- 3. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create places table
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

-- 5. Create place_images table
CREATE TABLE IF NOT EXISTS place_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  INDEX idx_place (place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Insert sample categories
INSERT INTO categories (name) VALUES
  ('Food & Dining'),
  ('Fitness & Sports'),
  ('Nature & Parks'),
  ('Shopping'),
  ('Entertainment');

-- 7. Insert sample places
INSERT INTO places (name, description, address, category_id, latitude, longitude) VALUES
  ('Central Park Cafe', 'Cozy cafe in the heart of the city with fresh pastries and coffee', '123 Main Street', 1, 40.7829, -73.9654),
  ('Downtown Gym', 'Modern fitness center with state-of-the-art equipment', '456 Fitness Ave', 2, 40.7589, -73.9851),
  ('City Botanical Garden', 'Beautiful garden with exotic plants and peaceful walking paths', '789 Garden Blvd', 3, 40.7614, -73.9776);

-- 8. Insert sample images
INSERT INTO place_images (place_id, image_url, display_order) VALUES
  (1, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 0),
  (1, 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg', 1),
  (2, 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg', 0),
  (2, 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg', 1),
  (3, 'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg', 0),
  (3, 'https://images.pexels.com/photos/1061623/pexels-photo-1061623.jpeg', 1);
```

---

## Verification Commands

After setup, verify everything worked:

```sql
USE cityplace;

-- Check tables exist
SHOW TABLES;

-- Check categories
SELECT * FROM categories;

-- Check places
SELECT * FROM places;

-- Check images
SELECT * FROM place_images;

-- Check relationships work
SELECT
  p.name as place_name,
  c.name as category_name,
  COUNT(pi.id) as image_count
FROM places p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN place_images pi ON p.id = pi.place_id
GROUP BY p.id;
```

Expected output: 3 places with 2 images each across 3 different categories.

---

## Troubleshooting

### Error: Access denied
- Check your MySQL username and password
- Make sure MySQL service is running: `sudo systemctl status mysql` (Linux) or check Services (Windows)

### Error: Database already exists
- That's fine! The script uses `IF NOT EXISTS` so it won't break anything

### Error: Foreign key constraint fails
- Make sure you run the commands in order (categories before places, places before images)

### Can't connect to MySQL server
- Verify MySQL is running
- Check the host and port in your `.env` file
- Try `mysql -u root -p` to test connection

---

## Quick Start Commands

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cityplace;"

# 2. Run setup script
mysql -u root -p cityplace < backend/setup.sql

# 3. Verify
mysql -u root -p -e "USE cityplace; SELECT COUNT(*) FROM categories; SELECT COUNT(*) FROM places;"
```

You should see 5 categories and 3 places.
