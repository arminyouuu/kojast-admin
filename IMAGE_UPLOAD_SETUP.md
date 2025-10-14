# Image Upload Setup Guide

## Overview
Image upload functionality has been added to allow admins to upload images directly from their device instead of only using URLs.

## Backend Changes

### 1. New Dependencies
- `multer` - for handling multipart/form-data file uploads

### 2. File Structure
```
backend/
├── uploads/               # Directory where uploaded images are stored
└── src/
    └── middleware/
        └── upload.js      # Multer configuration for file uploads
```

### 3. New Endpoint
**POST** `/api/admin/places/upload`
- Accepts multipart form data with files under the field name `images`
- Supports up to 10 images per request
- Allowed formats: JPEG, JPG, PNG, GIF, WebP
- Max file size: 10MB per image
- Returns: `{ urls: string[] }` with full URLs to uploaded images

## Nginx Configuration

Add this location block to your nginx configuration file:

```nginx
location /api/uploads/ {
    alias /path/to/kojast/backend/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
}
```

**Important:** Replace `/path/to/kojast/backend/uploads/` with the actual absolute path to your uploads directory.

For example, if your backend is at `/var/www/kojast/backend/`, use:
```nginx
location /api/uploads/ {
    alias /var/www/kojast/backend/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
}
```

After adding this configuration:
1. Test nginx config: `sudo nginx -t`
2. Reload nginx: `sudo systemctl reload nginx`

## Frontend Changes

### New Features
1. **File Upload Button** - Click "بارگذاری تصویر" to select images from device
2. **Multiple Upload** - Select multiple images at once
3. **Image Preview** - Uploaded images show a preview
4. **Mixed Input** - Can use both uploaded images and URL links in the same place

### How It Works
1. Admin clicks the upload button
2. Selects one or more image files
3. Images are uploaded to `/api/admin/places/upload`
4. Server returns URLs which are automatically added to the image list
5. When saving the place, these URLs are stored in the database

## File Storage

### Location
Uploaded files are stored in: `backend/uploads/`

### Naming Convention
Files are renamed to: `place-{timestamp}-{random}.{extension}`

Example: `place-1697123456789-987654321.jpg`

### Permissions
Make sure the uploads directory has proper write permissions:
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

## Security Notes

1. **File Type Validation** - Only image files (JPEG, PNG, GIF, WebP) are allowed
2. **File Size Limit** - Maximum 10MB per image
3. **Authentication Required** - Upload endpoint requires valid API key with write permission
4. **Safe Filenames** - Uploaded files are renamed to prevent security issues

## Usage

### In Admin Panel
1. Go to Places page
2. Click "افزودن مکان جدید" or edit an existing place
3. In the images section, click "بارگذاری تصویر"
4. Select image files from your device
5. Wait for upload to complete
6. Images will appear with preview
7. Save the place

### API Usage
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const response = await fetch('/api/admin/places/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic your-credentials'
  },
  body: formData
});

const { urls } = await response.json();
```

## Troubleshooting

### Images not accessible
- Check nginx configuration and reload nginx
- Verify the uploads directory path in nginx config
- Check directory permissions

### Upload fails
- Check file size (max 10MB)
- Verify file format (JPEG, PNG, GIF, WebP only)
- Check API key has write permission
- Check server disk space

### 404 on image URLs
- Verify nginx `/api/uploads/` location is configured correctly
- Make sure the path in nginx matches your actual uploads directory
- Check that nginx was reloaded after config changes
