# API Endpoints Documentation

Base URL: `http://localhost:3000` (or your configured PORT)

---

## Public Categories API
**Base Path:** `/categories`
**Authentication:** API Key required via `x-api-key` header

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| GET | `/` | read | Get all categories |
| GET | `/:id` | read | Get category by ID |
| POST | `/` | write | Create new category |
| PUT | `/:id` | write | Update category |
| DELETE | `/:id` | delete | Delete category |
| POST | `/bulk-delete` | delete | Delete multiple categories |

---

## Public Places API
**Base Path:** `/places`
**Authentication:** API Key required via `x-api-key` header

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| GET | `/` | read | Get all places (with pagination & filters) |
| GET | `/:id` | read | Get place by ID |
| POST | `/` | write | Create new place |
| PUT | `/:id` | write | Update place |
| DELETE | `/:id` | delete | Delete place |
| POST | `/bulk-delete` | delete | Delete multiple places |
| POST | `/upload` | write | Upload place images (multipart/form-data) |

**Query Parameters for GET /:**
- `categoryId` - Filter by category
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

---

## User Authentication API
**Base Path:** `/auth`
**Authentication:** JWT Token (where indicated)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | User login |
| POST | `/logout` | Yes | User logout |
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update user profile |
| POST | `/change-password` | Yes | Change user password |

**Request Body Examples:**

**Register:**
```json
{
  "phone_number": "09123456789",
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "password123"
}
```

**Login:**
```json
{
  "phone_number": "09123456789",
  "password": "password123"
}
```

---

## User Favorites API
**Base Path:** `/favorites`
**Authentication:** JWT Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's favorite places |
| POST | `/` | Add place to favorites |
| DELETE | `/:placeId` | Remove place from favorites |
| GET | `/check/:placeId` | Check if place is favorited |

**Request Body for POST /:**
```json
{
  "place_id": 1
}
```

---

## Admin Panel API
**Base Path:** `/admin`
**Authentication:** Basic Auth (username/password)

### Admin Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin login |

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Admin Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create new category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| POST | `/categories/bulk-delete` | Delete multiple categories |

### Admin Places
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/places` | Get all places |
| GET | `/places/:id` | Get place by ID |
| POST | `/places` | Create new place |
| PUT | `/places/:id` | Update place |
| DELETE | `/places/:id` | Delete place |
| POST | `/places/bulk-delete` | Delete multiple places |
| POST | `/places/upload` | Upload images (multipart/form-data) |

### Admin Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |

**Response:**
```json
{
  "totalPlaces": 100,
  "totalCategories": 10,
  "placesCreatedThisMonth": 15,
  "recentPlaces": [...],
  "placesExpiringSoon": [...],
  "categoriesWithPlaceCounts": [...]
}
```

### Admin API Keys Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api-keys` | Get all API keys |
| POST | `/api-keys` | Create new API key |
| PUT | `/api-keys/:id` | Update API key |
| DELETE | `/api-keys/:id` | Delete API key |

**Request Body for POST /api-keys:**
```json
{
  "name": "My App",
  "permissions": {
    "read": true,
    "write": true
  }
}
```

### Admin Users Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (paginated) |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| PUT | `/users/:id/toggle-status` | Toggle user active status |
| POST | `/users/:id/reset-password` | Reset user password |

**Query Parameters for GET /users:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Request Body for POST /users:**
```json
{
  "full_name": "John Doe",
  "email": "user@example.com",
  "phone_number": "09123456789",
  "password": "password123",
  "is_active": true
}
```

### Admin Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get all settings |
| GET | `/settings/:key` | Get setting by key |
| POST | `/settings` | Create/update setting |
| DELETE | `/settings/:key` | Delete setting |

**Request Body for POST /settings:**
```json
{
  "key": "app_name",
  "value": "Kojast"
}
```

---

## Authentication Methods

### API Key Authentication
Used for public API endpoints (`/categories`, `/places`)

**Header:**
```
x-api-key: your-api-key-here
```

### JWT Token Authentication
Used for user endpoints (`/auth`, `/favorites`)

**Header:**
```
Authorization: Bearer your-jwt-token-here
```

### Basic Authentication
Used for admin panel endpoints (`/admin`)

**Header:**
```
Authorization: Basic base64(username:password)
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## Environment Variables

Required environment variables for the backend:

```env
PORT=3000
NODE_ENV=development

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# JWT Secret
JWT_SECRET=your-jwt-secret-here

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=kojast
DB_PORT=3306
```
