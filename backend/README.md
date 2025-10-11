# CityPlace Backend API

A RESTful API for managing city places with categories, built with Node.js, Express, and MySQL.

## Features

- Three-layer architecture (Presentation, Application, Data)
- Category and Place management
- Multi-image support for places
- Pagination and filtering
- Basic authentication for admin operations
- MySQL database with proper indexing

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cityplace

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

4. Initialize the database:
```bash
npm run init-db
```

This will:
- Create the required tables (categories, places, place_images)
- Add sample categories

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints

#### Categories

**GET /categories**
- Returns all categories
- Response:
```json
[
  {
    "id": 1,
    "name": "Food & Dining",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**GET /categories/:id**
- Returns a single category
- Response: Category object or 404

#### Places

**GET /places**
- Returns paginated places with images
- Query parameters:
  - `categoryId` (optional): Filter by category
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 10, max: 100): Items per page
- Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Central Park Cafe",
      "description": "Cozy cafe in the heart of the city",
      "address": "123 Main St",
      "category_id": 1,
      "category_name": "Food & Dining",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

**GET /places/:id**
- Returns a single place with all images
- Response: Place object or 404

### Admin Endpoints

All admin endpoints require Basic Authentication:
- Header: `Authorization: Basic <base64-encoded-credentials>`
- Credentials format: `username:password`

#### Categories

**POST /admin/categories**
- Create a new category
- Body:
```json
{
  "name": "Museums"
}
```

**PUT /admin/categories/:id**
- Update a category
- Body:
```json
{
  "name": "Art Museums"
}
```

**DELETE /admin/categories/:id**
- Delete a category (cascade deletes related places)

#### Places

**POST /admin/places**
- Create a new place
- Body:
```json
{
  "name": "City Museum",
  "description": "Historic museum with modern exhibits",
  "address": "456 Museum Ave",
  "categoryId": 2,
  "latitude": 40.7589,
  "longitude": -73.9851,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**PUT /admin/places/:id**
- Update a place
- Body: Same as POST

**DELETE /admin/places/:id**
- Delete a place (cascade deletes related images)

## Database Schema

### categories
- `id` INT PRIMARY KEY AUTO_INCREMENT
- `name` VARCHAR(255) UNIQUE NOT NULL
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### places
- `id` INT PRIMARY KEY AUTO_INCREMENT
- `name` VARCHAR(255) NOT NULL
- `description` TEXT
- `address` VARCHAR(500)
- `category_id` INT FOREIGN KEY
- `latitude` FLOAT
- `longitude` FLOAT
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### place_images
- `id` INT PRIMARY KEY AUTO_INCREMENT
- `place_id` INT FOREIGN KEY
- `image_url` TEXT NOT NULL
- `display_order` INT
- `created_at` TIMESTAMP

## Architecture

### Three-Layer Structure

1. **Presentation Layer** (`controllers/`, `routes/`, `middleware/`)
   - HTTP request handling
   - Input validation
   - Authentication
   - Response formatting

2. **Application Layer** (`services/`)
   - Business logic
   - Validation
   - Pagination
   - Data transformation

3. **Data Layer** (`repositories/`, `database/`)
   - Database queries
   - Entity models
   - Data persistence

## Error Handling

All errors return JSON with the following format:
```json
{
  "status": 404,
  "message": "Place not found"
}
```

Common status codes:
- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict (duplicate entry)
- 500: Internal Server Error

## Development

### Running Tests
(Tests not implemented in MVP)

### Code Structure
```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access
│   ├── routes/            # Route definitions
│   ├── middleware/        # Auth, error handling
│   ├── database/          # Connection, schema
│   └── server.js          # App entry point
├── .env.example
├── package.json
└── README.md
```

## Security Notes

- Always use HTTPS in production
- Change default admin credentials
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add input sanitization for user-generated content

## Future Enhancements

- JWT-based authentication
- File upload support
- Geolocation filtering
- Full-text search
- Caching layer
- API documentation (Swagger/OpenAPI)
