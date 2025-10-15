# Mobile App Authentication & User Features Setup

## Overview

This document explains how to integrate user authentication and favorites functionality into your Flutter mobile app for the Kojast MVP.

## Authentication System

The mobile app uses **Supabase Authentication** with email/password login. This is separate from the admin dashboard authentication (which uses basic auth).

### Database Schema

A migration file has been created at: `supabase/migrations/20251015000000_create_user_favorites.sql`

**To apply this migration**, you need to run it in your Supabase dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of the migration file
4. Execute it

This creates the `user_favorites` table with proper Row Level Security (RLS) policies.

## Features Available

### 1. User Authentication

Users can:
- **Sign up** with email and password
- **Sign in** with their credentials
- **Sign out**
- **Reset password** via email
- **Update password**

### 2. User Favorites

Authenticated users can:
- **Add places to favorites**
- **View all their favorited places**
- **Remove places from favorites**
- **Add personal notes** to each favorite
- **Update notes** on saved favorites
- **Check if a place is favorited**

All favorites are private and only visible to the user who created them.

## API Integration for Flutter

### Setup Supabase Client

Install the Supabase Flutter package:

```bash
flutter pub add supabase_flutter
```

Initialize Supabase in your Flutter app:

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://0ec90b57d6e95fcbda19832f.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw',
  );

  runApp(MyApp());
}

final supabase = Supabase.instance.client;
```

### Authentication Examples

#### Sign Up

```dart
Future<void> signUp(String email, String password) async {
  try {
    final response = await supabase.auth.signUp(
      email: email,
      password: password,
    );

    if (response.user != null) {
      // User created successfully
      print('User ID: ${response.user!.id}');
    }
  } catch (e) {
    print('Sign up error: $e');
  }
}
```

#### Sign In

```dart
Future<void> signIn(String email, String password) async {
  try {
    final response = await supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );

    if (response.user != null) {
      // User signed in successfully
      print('Welcome ${response.user!.email}');
    }
  } catch (e) {
    print('Sign in error: $e');
  }
}
```

#### Sign Out

```dart
Future<void> signOut() async {
  await supabase.auth.signOut();
}
```

#### Get Current User

```dart
User? getCurrentUser() {
  return supabase.auth.currentUser;
}

// Listen to auth state changes
void listenToAuthChanges() {
  supabase.auth.onAuthStateChange.listen((data) {
    final user = data.session?.user;
    if (user != null) {
      print('User is signed in: ${user.email}');
    } else {
      print('User is signed out');
    }
  });
}
```

#### Reset Password

```dart
Future<void> resetPassword(String email) async {
  try {
    await supabase.auth.resetPasswordForEmail(email);
    print('Password reset email sent');
  } catch (e) {
    print('Reset password error: $e');
  }
}
```

### Favorites Examples

#### Add to Favorites

```dart
Future<void> addFavorite(String placeId, {String? notes}) async {
  try {
    await supabase.from('user_favorites').insert({
      'place_id': placeId,
      'notes': notes ?? '',
    });
    print('Place added to favorites');
  } catch (e) {
    print('Add favorite error: $e');
  }
}
```

#### Get All Favorites

```dart
Future<List<Map<String, dynamic>>> getFavorites() async {
  try {
    final response = await supabase
        .from('user_favorites')
        .select('''
          *,
          place:places(
            *,
            category:categories(id, name),
            images:place_images(id, image_url, display_order)
          )
        ''')
        .order('created_at', ascending: false);

    return List<Map<String, dynamic>>.from(response);
  } catch (e) {
    print('Get favorites error: $e');
    return [];
  }
}
```

#### Remove from Favorites

```dart
Future<void> removeFavorite(String placeId) async {
  try {
    await supabase
        .from('user_favorites')
        .delete()
        .eq('place_id', placeId);
    print('Removed from favorites');
  } catch (e) {
    print('Remove favorite error: $e');
  }
}
```

#### Update Notes

```dart
Future<void> updateFavoriteNotes(String placeId, String notes) async {
  try {
    await supabase
        .from('user_favorites')
        .update({'notes': notes})
        .eq('place_id', placeId);
    print('Notes updated');
  } catch (e) {
    print('Update notes error: $e');
  }
}
```

#### Check if Favorited

```dart
Future<bool> isFavorite(String placeId) async {
  try {
    final response = await supabase
        .from('user_favorites')
        .select('id')
        .eq('place_id', placeId)
        .maybeSingle();

    return response != null;
  } catch (e) {
    return false;
  }
}
```

### Fetching Places (Public Access)

Users don't need to be authenticated to browse places:

```dart
// Get all categories
Future<List<Map<String, dynamic>>> getCategories() async {
  final response = await supabase
      .from('categories')
      .select('*')
      .order('name', ascending: true);

  return List<Map<String, dynamic>>.from(response);
}

// Get places with pagination
Future<Map<String, dynamic>> getPlaces({
  String? categoryId,
  int page = 1,
  int limit = 10,
}) async {
  var query = supabase
      .from('places')
      .select('''
        *,
        category:categories(id, name),
        images:place_images(id, image_url, display_order)
      ''', const FetchOptions(count: CountOption.exact))
      .order('created_at', ascending: false);

  if (categoryId != null) {
    query = query.eq('category_id', categoryId);
  }

  final from = (page - 1) * limit;
  final to = from + limit - 1;

  query = query.range(from, to);

  final response = await query;

  return {
    'data': response.data,
    'count': response.count,
    'page': page,
    'limit': limit,
  };
}

// Get single place by ID
Future<Map<String, dynamic>?> getPlaceById(String placeId) async {
  final response = await supabase
      .from('places')
      .select('''
        *,
        category:categories(id, name),
        images:place_images(id, image_url, display_order)
      ''')
      .eq('id', placeId)
      .single();

  return response;
}

// Search places
Future<List<Map<String, dynamic>>> searchPlaces(String searchTerm) async {
  final response = await supabase
      .from('places')
      .select('''
        *,
        category:categories(id, name),
        images:place_images(id, image_url, display_order)
      ''')
      .or('name.ilike.%$searchTerm%,address.ilike.%$searchTerm%,description.ilike.%$searchTerm%')
      .limit(20);

  return List<Map<String, dynamic>>.from(response);
}
```

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Public read access** is allowed for categories, places, and place_images (anyone can browse)
3. **Authenticated write access** for favorites - users can only manage their own favorites
4. **Passwords are securely hashed** by Supabase
5. **API keys are NOT required** for mobile app users (only for admin dashboard)

## User Flow Example

1. User opens app → Browses places without login
2. User tries to favorite a place → Prompted to sign up/sign in
3. User creates account → Email/password stored securely in Supabase
4. User signs in → Can now add/remove favorites and add personal notes
5. User closes app → Session persists automatically
6. User reopens app → Automatically signed in

## Important Notes

- **Admin dashboard** uses separate authentication (basic auth with username/password)
- **Mobile users** use Supabase auth (email/password)
- These are two different systems serving different purposes
- Mobile users cannot access the admin dashboard
- Admins can create an account as a mobile user if they want to test the app

## Testing

Before building the full Flutter app, you can test the API calls using the provided TypeScript client at `src/lib/mobileApi.ts`.

## Next Steps

1. Apply the migration in your Supabase dashboard
2. Build your Flutter app authentication screens (login, signup, profile)
3. Implement favorites UI (heart icon on places, favorites list screen)
4. Add user profile management
5. Test thoroughly with multiple users

## Support

If you encounter any issues:
- Check Supabase dashboard logs
- Verify RLS policies are applied correctly
- Ensure API keys are properly configured in your Flutter app
- Check that the migration was applied successfully
