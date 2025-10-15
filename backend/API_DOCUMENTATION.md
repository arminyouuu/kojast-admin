# User Authentication & Favorites API Documentation

## Overview
This API provides user authentication and favorites management for the Kojast mobile app.

## Base URL
```
http://your-server:3000
```

---

## Authentication Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Notes:**
- Either `phone_number` OR `email` is required (can provide both)
- Password must be at least 6 characters
- Phone numbers should be unique
- Emails should be unique

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "phone_number": "09123456789",
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2025-10-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or validation errors
- `409`: Phone number or email already exists

---

### 2. Login
Authenticate user and get access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "password": "securepassword123"
}
```

OR

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "a1b2c3d4e5f6...",
    "expiresAt": "2025-11-15T10:30:00.000Z",
    "user": {
      "id": 1,
      "phone_number": "09123456789",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2025-10-15T10:30:00.000Z",
      "last_login": "2025-10-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Missing credentials
- `401`: Invalid credentials
- `403`: Account is inactive

---

### 3. Logout
Invalidate the current session token.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Get Profile
Get current user profile information.

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "phone_number": "09123456789",
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2025-10-15T10:30:00.000Z",
    "last_login": "2025-10-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token

---

### 5. Update Profile
Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "full_name": "Jane Doe",
  "email": "newemail@example.com",
  "phone_number": "09987654321"
}
```

**Notes:**
- All fields are optional
- Only provided fields will be updated

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "phone_number": "09987654321",
    "email": "newemail@example.com",
    "full_name": "Jane Doe",
    "created_at": "2025-10-15T10:30:00.000Z",
    "last_login": "2025-10-15T10:30:00.000Z"
  }
}
```

---

### 6. Change Password
Change user password.

**Endpoint:** `POST /auth/change-password`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "old_password": "currentpassword123",
  "new_password": "newpassword456"
}
```

**Notes:**
- New password must be at least 6 characters
- All sessions will be invalidated after password change
- User must login again after changing password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

**Error Responses:**
- `400`: Missing fields or validation errors
- `401`: Current password is incorrect

---

## Favorites Endpoints

All favorites endpoints require authentication.

### 7. Get User Favorites
Retrieve user's favorite places with pagination.

**Endpoint:** `GET /favorites`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example:**
```
GET /favorites?page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Cafe Paradise",
      "description": "Best coffee in town",
      "address": "123 Main Street",
      "category_id": 2,
      "category_name": "Cafes",
      "latitude": 35.7219,
      "longitude": 51.3347,
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "created_at": "2025-10-10T10:00:00.000Z",
      "updated_at": "2025-10-10T10:00:00.000Z",
      "favorited_at": "2025-10-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  }
}
```

---

### 8. Add Place to Favorites
Add a place to user's favorites.

**Endpoint:** `POST /favorites`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "place_id": 5
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Place added to favorites"
}
```

**Error Responses:**
- `400`: Missing place_id or place already in favorites
- `404`: Place not found

---

### 9. Remove Place from Favorites
Remove a place from user's favorites.

**Endpoint:** `DELETE /favorites/:placeId`

**Headers:**
```
Authorization: Bearer {token}
```

**Example:**
```
DELETE /favorites/5
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Place removed from favorites"
}
```

**Error Responses:**
- `404`: Favorite not found

---

### 10. Check if Place is Favorited
Check if a specific place is in user's favorites.

**Endpoint:** `GET /favorites/check/:placeId`

**Headers:**
```
Authorization: Bearer {token}
```

**Example:**
```
GET /favorites/check/5
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "is_favorite": true
  }
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (inactive account)
- `404`: Not Found
- `500`: Internal Server Error

---

## Authentication Flow

1. **Register**: User creates account with phone/email and password
2. **Login**: User receives authentication token (valid for 30 days)
3. **Use Token**: Include token in Authorization header for all protected endpoints
4. **Logout**: Invalidate token when user logs out

**Token Usage:**
```
Authorization: Bearer {your_token_here}
```

---

## Database Schema

### users table
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- phone_number (VARCHAR(20), UNIQUE)
- email (VARCHAR(255), UNIQUE)
- password_hash (VARCHAR(255))
- full_name (VARCHAR(255))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
- is_active (BOOLEAN)
```

### user_favorites table
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY -> users.id)
- place_id (INT, FOREIGN KEY -> places.id)
- created_at (TIMESTAMP)
- UNIQUE(user_id, place_id)
```

### user_sessions table
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY -> users.id)
- token (VARCHAR(500), UNIQUE)
- device_info (TEXT)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## Setup Instructions

1. Run the migration script to create tables:
```bash
mysql -u your_user -p your_database < backend/migrations/003_create_users_table.sql
```

2. Install bcryptjs dependency:
```bash
cd backend
npm install
```

3. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`
