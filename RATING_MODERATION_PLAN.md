# Rating Moderation System - Implementation Plan

## Overview
Add an admin moderation system where user ratings and comments must be approved before appearing publicly on places. This adds a quality control layer to prevent spam, inappropriate content, or fake reviews.

---

## Database Changes

### 1. Add Moderation Fields to `ratings` Table

**Migration: `add_rating_moderation_fields.sql`**

```sql
-- Add moderation status and admin fields to ratings table
ALTER TABLE ratings
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN reviewed_by VARCHAR(255) DEFAULT NULL,
ADD COLUMN reviewed_at TIMESTAMP DEFAULT NULL,
ADD COLUMN rejection_reason TEXT DEFAULT NULL;

-- Add index for faster filtering
CREATE INDEX idx_ratings_status ON ratings(status);
CREATE INDEX idx_ratings_reviewed_at ON ratings(reviewed_at);

-- Create a view for approved ratings only (for public API)
CREATE OR REPLACE VIEW approved_ratings AS
SELECT * FROM ratings WHERE status = 'approved';
```

**Key Points:**
- `status`: 'pending' (default), 'approved', or 'rejected'
- `reviewed_by`: Admin username who reviewed it
- `reviewed_at`: Timestamp of review
- `rejection_reason`: Optional note if rejected
- View `approved_ratings` for easy public access

---

## Backend API Changes

### 2. Update Existing Rating Endpoints

**Modify `src/services/RatingService.js`:**

```javascript
// When creating a new rating, set status to 'pending'
async addOrUpdateRating(placeId, userId, rating, comment = null) {
  // ... existing validation

  const ratingData = {
    place_id: placeId,
    user_id: userId,
    rating: rating,
    comment: comment,
    status: 'pending' // NEW: Always start as pending
  };

  // Note: Only approved ratings should update place average_rating
  // Need to modify triggers to only count approved ratings
}

// Public endpoint should only return approved ratings
async getPlaceRatings(placeId, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT * FROM ratings
    WHERE place_id = ? AND status = 'approved'
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  // ...
}
```

### 3. New Admin Endpoints

**Add to `backend/src/routes/adminRoutes.js`:**

```javascript
// Get all pending ratings for moderation
router.get('/ratings/pending', async (req, res, next) => {
  // Return all ratings with status='pending'
  // Include place name and user info
  // Support pagination
});

// Get all ratings (all statuses) with filters
router.get('/ratings', async (req, res, next) => {
  // Query params: status, placeId, page, limit
  // Return ratings with place and user details
});

// Approve a rating
router.post('/ratings/:ratingId/approve', async (req, res, next) => {
  // Set status='approved'
  // Set reviewed_by=admin.username
  // Set reviewed_at=NOW()
  // Recalculate place average_rating
});

// Reject a rating
router.post('/ratings/:ratingId/reject', async (req, res, next) => {
  // Set status='rejected'
  // Set reviewed_by, reviewed_at
  // Set rejection_reason from body
  // Do NOT count in place average_rating
});

// Bulk approve ratings
router.post('/ratings/bulk-approve', async (req, res, next) => {
  // Accept array of rating IDs
  // Approve all in one transaction
  // Recalculate affected places
});

// Bulk reject ratings
router.post('/ratings/bulk-reject', async (req, res, next) => {
  // Accept array of rating IDs and optional reason
  // Reject all in one transaction
});
```

**Add `backend/src/services/RatingModerationService.js`:**

```javascript
class RatingModerationService {
  async getPendingRatings(page = 1, limit = 50) {
    // Get ratings with status='pending'
    // Include place name, user info, created date
    // Order by created_at ASC (oldest first)
  }

  async getAllRatings(filters = {}) {
    // filters: { status, placeId, userId, page, limit }
    // Return all ratings based on filters
  }

  async approveRating(ratingId, adminUsername) {
    // Update status to 'approved'
    // Set reviewed_by and reviewed_at
    // Recalculate place average_rating and count
    // Return updated rating
  }

  async rejectRating(ratingId, adminUsername, reason = null) {
    // Update status to 'rejected'
    // Set reviewed_by, reviewed_at, rejection_reason
    // Return updated rating
  }

  async bulkApprove(ratingIds, adminUsername) {
    // Approve multiple ratings
    // Recalculate all affected places
    // Return count of approved ratings
  }

  async bulkReject(ratingIds, adminUsername, reason = null) {
    // Reject multiple ratings
    // Return count of rejected ratings
  }

  async recalculatePlaceRatings(placeId) {
    // Count only approved ratings
    // Calculate average of approved ratings only
    // Update places table
  }
}
```

---

## Frontend Admin Panel Changes

### 4. New Ratings Moderation Page

**Create `src/components/RatingsModerationPage.tsx`:**

**Features:**
- Tab navigation: "Pending" | "All Ratings" | "Approved" | "Rejected"
- Default view: Pending ratings
- For each rating, show:
  - User info (name/phone/email)
  - Place name (with link to place)
  - Star rating (visual stars)
  - Comment text (full text, expandable if long)
  - Date submitted
  - Action buttons: Approve | Reject
- Bulk selection checkboxes
- Bulk actions: Approve Selected | Reject Selected
- Filter/search by place name or user
- Pagination

**UI Layout:**

```
┌─────────────────────────────────────────────────┐
│  Ratings Moderation                    [Stats] │
│  Pending: 12 | Approved: 245 | Rejected: 8     │
├─────────────────────────────────────────────────┤
│  [Pending] [All] [Approved] [Rejected]         │
├─────────────────────────────────────────────────┤
│  Search: [___________]  Filter: [Place ▼]      │
├─────────────────────────────────────────────────┤
│  □ Select All     [✓ Approve Selected]         │
│                   [✗ Reject Selected]           │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │ □  ⭐⭐⭐⭐⭐ 5 stars                      │  │
│  │    User: John Doe (09123456789)          │  │
│  │    Place: Cafe Paradise                   │  │
│  │    Comment: "Best coffee in town! The     │  │
│  │    atmosphere is amazing..."              │  │
│  │    Date: 2025-11-09 14:30                 │  │
│  │    [✓ Approve] [✗ Reject]                 │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │ □  ⭐⭐⭐⭐ 4 stars                        │  │
│  │    User: Jane Smith (jane@example.com)    │  │
│  │    Place: Downtown Gym                    │  │
│  │    Comment: "Great equipment and..."      │  │
│  │    Date: 2025-11-09 12:15                 │  │
│  │    [✓ Approve] [✗ Reject]                 │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Key Components:**

```typescript
interface Rating {
  id: number;
  place_id: number;
  place_name: string;
  user_id: string;
  user_name: string;
  user_contact: string; // phone or email
  rating: number; // 1-5
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

// Show star rating visually
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

// Reject modal with reason
function RejectModal({ onReject, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <Modal>
      <h3>Reject Rating</h3>
      <textarea
        placeholder="Reason for rejection (optional)..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={() => onReject(reason)}>Reject</button>
      <button onClick={onCancel}>Cancel</button>
    </Modal>
  );
}
```

### 5. Update Navigation

**Modify `src/components/Layout.tsx`:**

Add new navigation item:
```typescript
{ path: '/ratings', label: 'بررسی امتیازات', icon: Star }
```

**Update Router:**

Add route in `src/components/Router.tsx`:
```typescript
{currentPath === '/ratings' && <RatingsModerationPage />}
```

### 6. Dashboard Widget

**Modify `src/components/DashboardPage.tsx`:**

Add a widget showing pending ratings count:

```typescript
<div className="bg-amber-600 rounded-xl shadow-lg p-6 text-white">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-amber-100 text-sm font-medium mb-1">نیاز به بررسی</p>
      <p className="text-4xl font-bold">{stats?.pendingRatingsCount || 0}</p>
    </div>
    <div className="bg-white bg-opacity-20 p-4 rounded-xl">
      <AlertCircle className="w-8 h-8" />
    </div>
  </div>
  <button onClick={() => navigate('/ratings')} className="mt-4 text-sm">
    مشاهده امتیازات منتظر →
  </button>
</div>
```

---

## Database Trigger Changes

### 7. Update Rating Calculation Triggers

**Modify triggers in `backend/migrations/005_add_ratings_table.sql`:**

```sql
-- Update trigger to only count APPROVED ratings
DROP TRIGGER IF EXISTS after_rating_insert;
DROP TRIGGER IF EXISTS after_rating_update;
DROP TRIGGER IF EXISTS after_rating_delete;

DELIMITER //

CREATE TRIGGER after_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE places
    SET
      rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved'),
      average_rating = (SELECT AVG(rating) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved')
    WHERE id = NEW.place_id;
  END IF;
END//

CREATE TRIGGER after_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
  UPDATE places
  SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved'),
    average_rating = (SELECT AVG(rating) FROM ratings WHERE place_id = NEW.place_id AND status = 'approved')
  WHERE id = NEW.place_id;
END//

CREATE TRIGGER after_rating_delete
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
  IF OLD.status = 'approved' THEN
    UPDATE places
    SET
      rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = OLD.place_id AND status = 'approved'),
      average_rating = COALESCE((SELECT AVG(rating) FROM ratings WHERE place_id = OLD.place_id AND status = 'approved'), 0)
    WHERE id = OLD.place_id;
  END IF;
END//

DELIMITER ;
```

---

## API Response Changes

### 8. Update Public API Documentation

**Modify `RATING_SYSTEM_API.md`:**

Add section explaining the moderation system:

```markdown
## Moderation System

All new ratings and comments are subject to admin approval before appearing publicly.

### Rating Status Flow:
1. User submits rating → Status: `pending`
2. Admin reviews → Status: `approved` or `rejected`
3. Only `approved` ratings appear in public API responses
4. Only `approved` ratings count toward place average_rating

### For End Users:
- After submitting a rating, users see: "Your rating is pending approval"
- Users can check their rating status via GET /ratings/user/:userId
- Response includes `status` field: 'pending', 'approved', or 'rejected'

### Example Response with Status:
```json
{
  "id": 1,
  "place_id": 5,
  "user_id": "user123",
  "rating": 5,
  "comment": "Great place!",
  "status": "pending",
  "created_at": "2025-11-10T12:00:00.000Z",
  "updated_at": "2025-11-10T12:00:00.000Z"
}
```
```

---

## Mobile App Changes (Flutter)

### 9. Update Rating Submission Flow

**Considerations for Flutter app:**

1. **After Submission:**
   - Show success message: "امتیاز شما ثبت شد و پس از بررسی نمایش داده می‌شود"
   - Display rating with "در انتظار تایید" badge

2. **User's Ratings List:**
   - Show status badge for each rating:
     - Pending: Yellow badge "در انتظار بررسی"
     - Approved: Green badge "تایید شده"
     - Rejected: Red badge "رد شده"

3. **API Integration:**
   ```dart
   // When submitting a rating, inform user about moderation
   Future<void> submitRating() async {
     final result = await ratingService.addRating(...);

     if (result.status == 'pending') {
       showSnackbar('امتیاز شما ثبت شد و پس از بررسی توسط ادمین نمایش داده خواهد شد');
     }
   }

   // Filter user's own ratings by status
   Future<List<Rating>> getMyRatings() async {
     final ratings = await ratingService.getUserRatings(userId);
     // ratings contain 'status' field
     return ratings;
   }
   ```

---

## Testing Checklist

### 10. Test Cases

**Backend:**
- [ ] New rating defaults to 'pending' status
- [ ] Pending ratings don't affect place average_rating
- [ ] Approving rating updates place statistics
- [ ] Rejecting rating doesn't update place statistics
- [ ] Public API only returns approved ratings
- [ ] Admin API returns all ratings with filters
- [ ] Bulk operations work correctly
- [ ] Triggers recalculate ratings properly

**Frontend Admin:**
- [ ] Pending ratings page loads correctly
- [ ] Can approve individual rating
- [ ] Can reject individual rating with reason
- [ ] Can bulk approve multiple ratings
- [ ] Can bulk reject multiple ratings
- [ ] Filters work (by status, place, user)
- [ ] Pagination works correctly
- [ ] Dashboard shows pending count
- [ ] Real-time updates after actions

**Mobile App:**
- [ ] User sees pending status after submission
- [ ] My Ratings shows status badges
- [ ] Approved ratings appear in place details
- [ ] Pending/rejected ratings don't appear in place details

---

## Migration Steps

### 11. Deployment Order

1. **Run Database Migration:**
   ```bash
   mysql -u root -p kojast < backend/migrations/007_add_rating_moderation.sql
   ```

2. **Deploy Backend Changes:**
   - Update RatingService to use status field
   - Add RatingModerationService
   - Add admin routes for moderation
   - Update triggers for approved-only calculations

3. **Deploy Frontend Admin Panel:**
   - Add RatingsModerationPage
   - Update navigation and router
   - Update dashboard stats

4. **Update Mobile App:**
   - Handle pending status in UI
   - Show status badges
   - Update user messaging

5. **Migrate Existing Data:**
   ```sql
   -- Set all existing ratings to 'approved' (grandfather clause)
   UPDATE ratings SET status = 'approved' WHERE status IS NULL OR status = '';

   -- Recalculate all places
   UPDATE places p
   SET
     rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = p.id AND status = 'approved'),
     average_rating = (SELECT AVG(rating) FROM ratings WHERE place_id = p.id AND status = 'approved')
   WHERE id IN (SELECT DISTINCT place_id FROM ratings);
   ```

---

## Optional Enhancements

### 12. Future Improvements

1. **Email Notifications:**
   - Notify users when their rating is approved/rejected
   - Send email to user with rejection reason

2. **Auto-Approval Rules:**
   - Auto-approve ratings from trusted users
   - Auto-approve if user has X approved ratings
   - Auto-reject if rating contains banned words

3. **Moderation History:**
   - Log all moderation actions
   - Show who approved/rejected what and when
   - Audit trail for accountability

4. **Reporting System:**
   - Allow users to report inappropriate reviews
   - Flagged reviews go to moderation queue

5. **Review Appeals:**
   - Users can appeal rejected ratings
   - Admin can reconsider decisions

6. **Analytics:**
   - Track approval rates
   - Average time to approve
   - Most active moderators

---

## Files to Create/Modify

### New Files:
- `backend/migrations/007_add_rating_moderation.sql`
- `backend/src/services/RatingModerationService.js`
- `backend/src/repositories/RatingModerationRepository.js`
- `src/components/RatingsModerationPage.tsx`
- `RATING_MODERATION_SYSTEM.md` (admin documentation)

### Modified Files:
- `backend/src/services/RatingService.js` (add status handling)
- `backend/src/routes/adminRoutes.js` (add moderation routes)
- `backend/migrations/005_add_ratings_table.sql` (update triggers)
- `src/components/Layout.tsx` (add navigation)
- `src/components/Router.tsx` (add route)
- `src/components/DashboardPage.tsx` (add widget)
- `src/lib/api.ts` (add moderation endpoints)
- `RATING_SYSTEM_API.md` (document moderation)

---

## Summary

This moderation system adds quality control to user-generated ratings and comments. By requiring admin approval before ratings go live, you can:

- Prevent spam and fake reviews
- Filter inappropriate content
- Ensure review quality
- Build trust with legitimate reviews
- Maintain platform integrity

The system is designed to be efficient for admins (bulk actions, filters, quick approve/reject) while keeping users informed about their rating status.
