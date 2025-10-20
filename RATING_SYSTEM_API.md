# Rating System API Documentation

## Overview
The rating system allows users to rate places from 1-5 stars with optional comments. Each user can only rate a place once (subsequent ratings update the previous one). The system automatically calculates average ratings and counts for each place.

## Database Setup
Run the migration file: `backend/migrations/005_add_ratings_table.sql`

This creates:
- `ratings` table with user ratings and comments
- Database trigger to automatically update `average_rating` and `rating_count` on places table
- Unique constraint on (user_id, place_id) to prevent duplicate ratings

---

## API Endpoints

### 1. Add or Update Rating
Create a new rating or update an existing one for a place.

**Endpoint:** `POST /ratings`

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "place_id": 1,
  "user_id": "user123",
  "rating": 5,
  "comment": "Great place!"
}
```

**Fields:**
- `place_id` (number, required): The ID of the place being rated
- `user_id` (string, required): Unique identifier for the user (from your app)
- `rating` (number, required): Rating value between 1-5
- `comment` (string, optional): User's comment/review

**Success Response:** `200 OK`
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

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid rating value
- `401 Unauthorized`: Invalid or missing API key

**cURL Example:**
```bash
curl -X POST https://your-server.com/ratings \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": 1,
    "user_id": "user123",
    "rating": 5,
    "comment": "Great place!"
  }'
```

---

### 2. Get User's Rating for a Place
Check if a specific user has rated a specific place.

**Endpoint:** `GET /ratings/user/:userId/place/:placeId`

**Headers:**
```
X-API-Key: your-api-key
```

**URL Parameters:**
- `userId` (string): The user's unique identifier
- `placeId` (number): The place ID

**Success Response:** `200 OK`
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

**Response when no rating exists:** `200 OK`
```json
null
```

**cURL Example:**
```bash
curl https://your-server.com/ratings/user/user123/place/1 \
  -H "X-API-Key: your-api-key"
```

---

### 3. Get All Ratings for a Place
Retrieve all user ratings for a specific place, ordered by most recent first.

**Endpoint:** `GET /ratings/place/:placeId`

**Headers:**
```
X-API-Key: your-api-key
```

**URL Parameters:**
- `placeId` (number): The place ID

**Success Response:** `200 OK`
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
  },
  {
    "id": 2,
    "place_id": 1,
    "user_id": "user456",
    "rating": 4,
    "comment": "Pretty good",
    "created_at": "2024-01-02T10:30:00.000Z",
    "updated_at": "2024-01-02T10:30:00.000Z"
  }
]
```

**Empty Response:** `200 OK`
```json
[]
```

**cURL Example:**
```bash
curl https://your-server.com/ratings/place/1 \
  -H "X-API-Key: your-api-key"
```

---

### 4. Get Rating Statistics for a Place
Get aggregated rating statistics including average rating and distribution.

**Endpoint:** `GET /ratings/place/:placeId/stats`

**Headers:**
```
X-API-Key: your-api-key
```

**URL Parameters:**
- `placeId` (number): The place ID

**Success Response:** `200 OK`
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

**Fields:**
- `average_rating` (number): Average of all ratings (1-5)
- `rating_count` (number): Total number of ratings
- `five_star` (number): Count of 5-star ratings
- `four_star` (number): Count of 4-star ratings
- `three_star` (number): Count of 3-star ratings
- `two_star` (number): Count of 2-star ratings
- `one_star` (number): Count of 1-star ratings

**cURL Example:**
```bash
curl https://your-server.com/ratings/place/1/stats \
  -H "X-API-Key: your-api-key"
```

---

### 5. Get All Ratings by User
Get all ratings submitted by a specific user, including place information.

**Endpoint:** `GET /ratings/user/:userId`

**Headers:**
```
X-API-Key: your-api-key
```

**URL Parameters:**
- `userId` (string): The user's unique identifier

**Success Response:** `200 OK`
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
  },
  {
    "id": 2,
    "place_id": 5,
    "user_id": "user123",
    "rating": 4,
    "comment": "Nice atmosphere",
    "place_name": "Book Store",
    "address": "456 Oak Ave",
    "created_at": "2024-01-03T15:20:00.000Z",
    "updated_at": "2024-01-03T15:20:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl https://your-server.com/ratings/user/user123 \
  -H "X-API-Key: your-api-key"
```

---

### 6. Delete Rating
Remove a user's rating for a specific place.

**Endpoint:** `DELETE /ratings`

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "place_id": 1,
  "user_id": "user123"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `404 Not Found`: Rating not found
- `401 Unauthorized`: Invalid or missing API key

**cURL Example:**
```bash
curl -X DELETE https://your-server.com/ratings \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": 1,
    "user_id": "user123"
  }'
```

---

## Places API Integration

When fetching places using the Places API (`GET /places` or `GET /places/:id`), the response now includes rating information:

```json
{
  "id": 1,
  "name": "Coffee Shop",
  "address": "123 Main St",
  "latitude": 35.6892,
  "longitude": 51.3890,
  "average_rating": 4.5,
  "rating_count": 10,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

The `average_rating` and `rating_count` fields are automatically updated whenever a rating is added, updated, or deleted.

---

## Common Use Cases

### Use Case 1: Display Place with Ratings
Show a place with its average rating and allow users to rate it.

**Steps:**
1. Fetch place details: `GET /places/:placeId`
2. Check if current user has rated: `GET /ratings/user/:userId/place/:placeId`
3. Show rating UI based on whether user has already rated

### Use Case 2: Submit a Rating
User rates a place with a star rating and comment.

**Steps:**
1. Submit rating: `POST /ratings` with place_id, user_id, rating, and comment
2. Place's average_rating and rating_count are automatically updated
3. Fetch updated place: `GET /places/:placeId` to show new averages

### Use Case 3: Show Rating Distribution
Display a breakdown of ratings (e.g., rating histogram).

**Steps:**
1. Fetch rating stats: `GET /ratings/place/:placeId/stats`
2. Display distribution using five_star, four_star, etc. counts
3. Show average_rating and total rating_count

### Use Case 4: User Profile - My Ratings
Show all places a user has rated.

**Steps:**
1. Fetch user's ratings: `GET /ratings/user/:userId`
2. Display list with place names, ratings, and comments
3. Allow user to edit (POST to update) or delete (DELETE) their ratings

---

## Implementation Examples

### JavaScript/Fetch

```javascript
const API_URL = 'https://your-server.com';
const API_KEY = 'your-api-key';

// Add or update a rating
async function addRating(placeId, userId, rating, comment = null) {
  const response = await fetch(`${API_URL}/ratings`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      place_id: placeId,
      user_id: userId,
      rating: rating,
      comment: comment,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add rating');
  }

  return await response.json();
}

// Get user's rating for a place
async function getUserRating(userId, placeId) {
  const response = await fetch(
    `${API_URL}/ratings/user/${userId}/place/${placeId}`,
    {
      headers: { 'X-API-Key': API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch rating');
  }

  return await response.json();
}

// Get rating statistics
async function getRatingStats(placeId) {
  const response = await fetch(
    `${API_URL}/ratings/place/${placeId}/stats`,
    {
      headers: { 'X-API-Key': API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return await response.json();
}

// Get all ratings for a place
async function getPlaceRatings(placeId) {
  const response = await fetch(
    `${API_URL}/ratings/place/${placeId}`,
    {
      headers: { 'X-API-Key': API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch ratings');
  }

  return await response.json();
}

// Get all ratings by a user
async function getUserRatings(userId) {
  const response = await fetch(
    `${API_URL}/ratings/user/${userId}`,
    {
      headers: { 'X-API-Key': API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user ratings');
  }

  return await response.json();
}

// Delete a rating
async function deleteRating(userId, placeId) {
  const response = await fetch(`${API_URL}/ratings`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      place_id: placeId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete rating');
  }

  return await response.json();
}

// Example usage
async function exampleUsage() {
  const userId = 'user123';
  const placeId = 1;

  // Add a 5-star rating
  const newRating = await addRating(placeId, userId, 5, 'Excellent service!');
  console.log('Rating added:', newRating);

  // Get rating stats
  const stats = await getRatingStats(placeId);
  console.log('Rating stats:', stats);
  // Output: { average_rating: 4.5, rating_count: 10, five_star: 6, ... }

  // Get user's rating
  const userRating = await getUserRating(userId, placeId);
  console.log('User rating:', userRating);

  // Get all ratings for the place
  const allRatings = await getPlaceRatings(placeId);
  console.log('All ratings:', allRatings);

  // Get all ratings by user
  const myRatings = await getUserRatings(userId);
  console.log('My ratings:', myRatings);

  // Delete rating
  await deleteRating(userId, placeId);
  console.log('Rating deleted');
}
```

---

### Flutter/Dart

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class RatingService {
  final String baseUrl = 'https://your-server.com';
  final String apiKey = 'your-api-key';

  // Add or update a rating
  Future<Map<String, dynamic>> addRating({
    required int placeId,
    required String userId,
    required int rating,
    String? comment,
  }) async {
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

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to add rating: ${response.statusCode}');
    }
  }

  // Get user's rating for a place
  Future<Map<String, dynamic>?> getUserRating(
    String userId,
    int placeId,
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl/ratings/user/$userId/place/$placeId'),
      headers: {'X-API-Key': apiKey},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data; // Returns null if no rating exists
    } else {
      throw Exception('Failed to fetch rating: ${response.statusCode}');
    }
  }

  // Get rating statistics
  Future<Map<String, dynamic>> getRatingStats(int placeId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/ratings/place/$placeId/stats'),
      headers: {'X-API-Key': apiKey},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load stats: ${response.statusCode}');
    }
  }

  // Get all ratings for a place
  Future<List<dynamic>> getPlaceRatings(int placeId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/ratings/place/$placeId'),
      headers: {'X-API-Key': apiKey},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load ratings: ${response.statusCode}');
    }
  }

  // Get all ratings by a user
  Future<List<dynamic>> getUserRatings(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/ratings/user/$userId'),
      headers: {'X-API-Key': apiKey},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load user ratings: ${response.statusCode}');
    }
  }

  // Delete a rating
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
      throw Exception('Failed to delete rating: ${response.statusCode}');
    }
  }
}

// Example usage in a Flutter widget
class PlaceRatingWidget extends StatefulWidget {
  final int placeId;
  final String userId;

  PlaceRatingWidget({required this.placeId, required this.userId});

  @override
  _PlaceRatingWidgetState createState() => _PlaceRatingWidgetState();
}

class _PlaceRatingWidgetState extends State<PlaceRatingWidget> {
  final RatingService _ratingService = RatingService();
  Map<String, dynamic>? _stats;
  Map<String, dynamic>? _userRating;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final stats = await _ratingService.getRatingStats(widget.placeId);
      final userRating = await _ratingService.getUserRating(
        widget.userId,
        widget.placeId,
      );

      setState(() {
        _stats = stats;
        _userRating = userRating;
        _loading = false;
      });
    } catch (e) {
      print('Error loading ratings: $e');
      setState(() => _loading = false);
    }
  }

  Future<void> _submitRating(int rating, String comment) async {
    try {
      await _ratingService.addRating(
        placeId: widget.placeId,
        userId: widget.userId,
        rating: rating,
        comment: comment,
      );

      // Reload data
      await _loadData();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Rating submitted successfully!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit rating: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return CircularProgressIndicator();
    }

    return Column(
      children: [
        // Display average rating
        Text(
          'Average: ${_stats?['average_rating']?.toStringAsFixed(1) ?? 'N/A'}',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        Text('${_stats?['rating_count'] ?? 0} ratings'),

        // Display rating distribution
        _buildRatingBar('5 stars', _stats?['five_star'] ?? 0),
        _buildRatingBar('4 stars', _stats?['four_star'] ?? 0),
        _buildRatingBar('3 stars', _stats?['three_star'] ?? 0),
        _buildRatingBar('2 stars', _stats?['two_star'] ?? 0),
        _buildRatingBar('1 star', _stats?['one_star'] ?? 0),

        // Show user's rating or rating form
        if (_userRating != null)
          Text('Your rating: ${_userRating!['rating']} stars')
        else
          ElevatedButton(
            onPressed: () => _showRatingDialog(),
            child: Text('Rate this place'),
          ),
      ],
    );
  }

  Widget _buildRatingBar(String label, int count) {
    final total = _stats?['rating_count'] ?? 1;
    final percentage = (count / total * 100).round();

    return Row(
      children: [
        Text(label, style: TextStyle(width: 80)),
        Expanded(
          child: LinearProgressIndicator(value: count / total),
        ),
        Text('$count ($percentage%)'),
      ],
    );
  }

  void _showRatingDialog() {
    int selectedRating = 5;
    String comment = '';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Rate this place'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Star rating widget would go here
            TextField(
              decoration: InputDecoration(labelText: 'Comment (optional)'),
              onChanged: (value) => comment = value,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _submitRating(selectedRating, comment);
            },
            child: Text('Submit'),
          ),
        ],
      ),
    );
  }
}
```

---

### Python

```python
import requests

class RatingService:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {'X-API-Key': api_key}

    def add_rating(self, place_id, user_id, rating, comment=None):
        """Add or update a rating"""
        url = f"{self.base_url}/ratings"
        data = {
            'place_id': place_id,
            'user_id': user_id,
            'rating': rating,
            'comment': comment
        }
        response = requests.post(url, json=data, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_user_rating(self, user_id, place_id):
        """Get user's rating for a place"""
        url = f"{self.base_url}/ratings/user/{user_id}/place/{place_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_rating_stats(self, place_id):
        """Get rating statistics for a place"""
        url = f"{self.base_url}/ratings/place/{place_id}/stats"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_place_ratings(self, place_id):
        """Get all ratings for a place"""
        url = f"{self.base_url}/ratings/place/{place_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_user_ratings(self, user_id):
        """Get all ratings by a user"""
        url = f"{self.base_url}/ratings/user/{user_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def delete_rating(self, user_id, place_id):
        """Delete a rating"""
        url = f"{self.base_url}/ratings"
        data = {'user_id': user_id, 'place_id': place_id}
        response = requests.delete(url, json=data, headers=self.headers)
        response.raise_for_status()
        return response.json()

# Example usage
if __name__ == '__main__':
    service = RatingService('https://your-server.com', 'your-api-key')

    # Add a rating
    rating = service.add_rating(1, 'user123', 5, 'Excellent!')
    print('Added rating:', rating)

    # Get stats
    stats = service.get_rating_stats(1)
    print(f"Average: {stats['average_rating']}, Total: {stats['rating_count']}")

    # Get all ratings for place
    ratings = service.get_place_ratings(1)
    print(f"Found {len(ratings)} ratings")

    # Get user's ratings
    my_ratings = service.get_user_ratings('user123')
    print(f"User has {len(my_ratings)} ratings")
```

---

## Important Notes

1. **One Rating Per User Per Place**: Each user can only rate a place once. Submitting a new rating will update the existing one.

2. **Rating Constraints**: Rating value must be between 1 and 5 (inclusive). The API will return an error for values outside this range.

3. **Automatic Updates**: When a rating is added, updated, or deleted, the place's `average_rating` and `rating_count` are automatically updated via database triggers.

4. **User ID Format**: The `user_id` is a string field that should contain your application's user identifier (e.g., Firebase UID, custom user ID, etc.).

5. **Authentication**: All endpoints require API key authentication via the `X-API-Key` header.

6. **Comments are Optional**: Users can rate without providing a comment. Set comment to `null` or omit it from the request.

7. **Date Fields**: All timestamps are in ISO 8601 format (UTC timezone).

8. **No Pagination**: All listing endpoints return complete results without pagination.

---

## Error Handling

Common error codes:
- `400 Bad Request`: Invalid input (missing fields, invalid rating value)
- `401 Unauthorized`: Missing or invalid API key
- `404 Not Found`: Resource not found (when deleting non-existent rating)
- `500 Internal Server Error`: Server-side error

Error response format:
```json
{
  "error": "Error message describing what went wrong"
}
```
