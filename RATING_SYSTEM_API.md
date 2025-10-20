# Rating System API Documentation

## Overview
Users can rate places from 1-5 stars. Each user can only rate a place once (updates replace previous rating). Average ratings and counts are automatically calculated.

## Database Setup
Run migration file: `backend/migrations/005_add_ratings_table.sql`

## API Endpoints

### 1. Add or Update Rating
**POST** `/ratings`

**Headers:**
- `X-API-Key`: Your API key

**Body:**
```json
{
  "place_id": 1,
  "user_id": "user123",
  "rating": 5,
  "comment": "Great place!"
}
```

**Response:**
```json
{
  "id": 1,
  "place_id": 1,
  "user_id": "user123",
  "rating": 5,
  "comment": "Great place!",
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. Get User's Rating for a Place
**GET** `/ratings/user/:userId/place/:placeId`

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "id": 1,
  "place_id": 1,
  "user_id": "user123",
  "rating": 5,
  "comment": "Great place!",
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

---

### 3. Get All Ratings for a Place
**GET** `/ratings/place/:placeId?page=1&limit=50`

**Headers:**
- `X-API-Key`: Your API key

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
[
  {
    "id": 1,
    "place_id": 1,
    "user_id": "user123",
    "rating": 5,
    "comment": "Great place!",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
]
```

---

### 4. Get Rating Statistics for a Place
**GET** `/ratings/place/:placeId/stats`

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "average_rating": 4.5,
  "rating_count": 10,
  "five_star": 6,
  "four_star": 3,
  "three_star": 1,
  "two_star": 0,
  "one_star": 0
}
```

---

### 5. Get All Ratings by User
**GET** `/ratings/user/:userId?page=1&limit=50`

**Headers:**
- `X-API-Key`: Your API key

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
[
  {
    "id": 1,
    "place_id": 1,
    "user_id": "user123",
    "rating": 5,
    "comment": "Great place!",
    "place_name": "Coffee Shop",
    "address": "123 Main St",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
]
```

---

### 6. Delete Rating
**DELETE** `/ratings`

**Headers:**
- `X-API-Key`: Your API key

**Body:**
```json
{
  "place_id": 1,
  "user_id": "user123"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Places API Updates

When fetching places (GET `/places` or GET `/places/:id`), the response now includes:

```json
{
  "id": 1,
  "name": "Coffee Shop",
  "average_rating": 4.5,
  "rating_count": 10,
  ...
}
```

---

## Flutter Implementation Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class RatingService {
  final String baseUrl = 'https://your-server.com';
  final String apiKey = 'your-api-key';

  Future<void> addRating(int placeId, String userId, int rating, String? comment) async {
    final response = await http.post(
      Uri.parse('$baseUrl/ratings'),
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'place_id': placeId,
        'user_id': userId,
        'rating': rating,
        'comment': comment,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to add rating');
    }
  }

  Future<Map<String, dynamic>?> getUserRating(String userId, int placeId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/ratings/user/$userId/place/$placeId'),
      headers: {'X-API-Key': apiKey},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  Future<Map<String, dynamic>> getRatingStats(int placeId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/ratings/place/$placeId/stats'),
      headers: {'X-API-Key': apiKey},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load stats');
  }

  Future<List<dynamic>> getPlaceRatings(int placeId, {int page = 1}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/ratings/place/$placeId?page=$page&limit=50'),
      headers: {'X-API-Key': apiKey},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load ratings');
  }

  Future<void> deleteRating(String userId, int placeId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/ratings'),
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'user_id': userId,
        'place_id': placeId,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete rating');
    }
  }
}
```

---

## Notes

- Each user can rate a place only once (subsequent ratings update the previous one)
- Rating must be between 1-5 (inclusive)
- `average_rating` and `rating_count` on places table are automatically updated via database triggers
- `user_id` is a string (use your Flutter app's user identifier)
- All endpoints require API key authentication via `X-API-Key` header
