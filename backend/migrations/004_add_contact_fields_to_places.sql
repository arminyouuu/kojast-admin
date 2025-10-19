-- Add contact information fields to places table

-- Add website column
ALTER TABLE places
ADD COLUMN website VARCHAR(500) DEFAULT NULL AFTER longitude;

-- Add instagram column
ALTER TABLE places
ADD COLUMN instagram VARCHAR(255) DEFAULT NULL AFTER website;

-- Add phone_number column
ALTER TABLE places
ADD COLUMN phone_number VARCHAR(50) DEFAULT NULL AFTER instagram;
