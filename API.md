# ScaleUp - API Documentation

## Base URL

```
http://localhost:8001/api/v1
```

---

## Authentication

Most endpoints require authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The refresh token is stored as an **HTTP-only cookie** and is used automatically by the frontend to refresh expired access tokens.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Description of what happened",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [],
  "stack": "Error stack (development only)"
}
```

### HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request                          |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 409  | Conflict (duplicate resource)        |
| 422  | Validation Error                     |
| 500  | Internal Server Error                |

---

## Pagination

List endpoints support pagination via `page` and `limit` values. The default `page` is `1`; the default `limit` varies per endpoint and is listed with each endpoint. Pagination metadata is returned as **flat fields** inside the `data` object (for example `totalPages`, `totalMentors`, `totalComments`) — there is no nested `pagination` object. See each endpoint's response example for its exact shape.

---

# Endpoints

---

## Healthcheck

### GET `/healthcheck/`

Check if the server is running.

**Auth Required:** No

**Response:**

```json
{
  "success": true,
  "message": "OK",
  "data": "Server is running fine"
}
```

---

## Authentication

### POST `/auth/signup`

Register a new user account.

**Auth Required:** No

**Request Body:**

```json
{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**

- `fullname`: Required, minimum 3 characters
- `username`: Required, minimum 3 characters, lowercase only, unique
- `email`: Required, valid email format, lowercase, unique
- `password`: Required, minimum 5 characters

**Response (201):**

```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "_id": "...",
    "fullname": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**

- `409` — User with username or email already exists
- `422` — Validation failed

---

### POST `/auth/login`

Login with email/username and password.

**Auth Required:** No

**Request Body:**

```json
{
  "username_email": "johndoe",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "fullname": "John Doe",
      "username": "johndoe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Set Cookie:**

```
refreshToken: <token>; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth/refresh-token; Max-Age=604800
```

**Note:** `role` is `"mentor"` if the user has a mentor profile, otherwise `"user"`. The refresh cookie is scoped to the refresh-token endpoint only.

**Errors:**

- `401` — Invalid credentials
- `422` — Validation failed

---

### POST `/auth/refresh-token`

Refresh an expired access token using the refresh token cookie.

**Auth Required:** No (uses cookie)

**Response (200):**

```json
{
  "success": true,
  "message": "Access token refreshed",
  "data": {
    "newAccessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "...",
      "fullname": "John Doe",
      "username": "johndoe",
      "role": "user"
    }
  }
}
```

**Set Cookie:**

```
refreshToken: <new_token>; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth/refresh-token; Max-Age=604800
```

**Errors:**

- `401` — Invalid or missing refresh token
- `401` — Refresh token does not match stored token

---

### POST `/auth/logout`

Logout and revoke refresh token.

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": {}
}
```

**Side Effects:**

- Removes refresh token from database
- Clears refresh token cookie

---

### GET `/auth/me`

Get the currently authenticated user.

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "User Authenticated",
  "data": {
    "_id": "...",
    "fullname": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "mentor",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Mentors

### GET `/mentor/all`

List all mentors.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type   | Default | Description                                                    |
| --------- | ------ | ------- | -------------------------------------------------------------- |
| `page`    | number | 1       | Page number (read from route params; not currently wired to the query string) |
| `limit`   | number | 10      | Items per page (read from route params; not currently wired to the query string) |

**Response (200):**

```json
{
  "success": true,
  "message": "Mentors fetched",
  "data": {
    "mentors": [
      {
        "_id": "...",
        "userId": {
          "_id": "...",
          "fullname": "Jane Smith",
          "username": "janesmith"
        },
        "bio": "Senior software engineer...",
        "expertise": ["JavaScript", "React", "Node.js"],
        "consultationTypes": {
          "audio": true,
          "video": true
        },
        "pricing": {
          "audio": 50,
          "video": 75
        },
        "ratings": 4.5,
        "totalRating": 54,
        "totalReviews": 12,
        "totalSessions": 25
      }
    ],
    "totalMentors": 50,
    "totalPages": 5
  }
}
```

**Note:** `page`/`limit` are read from `req.params` rather than the query string, so they currently always fall back to their defaults (`page=1`, `limit=10`).

---

### GET `/mentor/:username`

Get a mentor's profile by username.

**Auth Required:** Yes

**Path Parameters:**

| Parameter  | Type   | Description       |
| ---------- | ------ | ----------------- |
| `username` | string | Mentor's username |

**Response (200):**

```json
{
  "success": true,
  "message": "Mentor detail fetched",
  "data": {
    "_id": "...",
    "userId": {
      "_id": "...",
      "fullname": "Jane Smith",
      "username": "janesmith"
    },
    "bio": "Senior software engineer with 10+ years...",
    "expertise": ["JavaScript", "React", "Node.js"],
    "consultationTypes": {
      "audio": true,
      "video": true
    },
    "pricing": {
      "audio": 50,
      "video": 75
    },
    "ratings": 4.5,
    "totalRating": 54,
    "totalReviews": 12,
    "totalSessions": 25,
    "availability": [
      {
        "date": "2024-01-15",
        "slots": [
          { "startTime": "10:00", "endTime": "11:00" },
          { "startTime": "14:00", "endTime": "15:00" }
        ]
      }
    ]
  }
}
```

**Errors:**

- `404` — Mentor not found

---

### POST `/mentor/profile`

Create a mentor profile.

**Auth Required:** Yes

**Request Body:**

```json
{
  "bio": "Senior software engineer with 10+ years...",
  "expertise": ["JavaScript", "React", "Node.js"],
  "consultationTypes": {
    "audio": true,
    "video": true
  },
  "pricing": {
    "audio": 50,
    "video": 75
  }
}
```

**Validation Rules:**

- `bio`: Required, minimum 10 characters
- `expertise`: Required, array with at least one non-empty string
- `pricing.audio`: Required, numeric, non-negative
- `pricing.video`: Required, numeric, non-negative

`consultationTypes` is not validated by the API.

**Response (201):**

```json
{
  "success": true,
  "message": "Mentor profile created",
  "data": { ... }
}
```

**Errors:**

- `409` — Mentor profile already exists
- `422` — Validation failed

---

### PATCH `/mentor/profile`

Update an existing mentor profile.

**Auth Required:** Yes

**Request Body:** Same as POST `/mentor/profile`

**Response (200):**

```json
{
  "success": true,
  "message": "Mentor profile updated",
  "data": { ... }
}
```

---

### GET `/mentor/availability`

Get the current user's mentor availability.

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Mentor availability fetched",
  "data": [
    {
      "date": "2024-01-15",
      "slots": [
        { "startTime": "10:00", "endTime": "11:00" },
        { "startTime": "14:00", "endTime": "15:00" }
      ]
    }
  ]
}
```

---

### PATCH `/mentor/availability`

Update mentor availability.

**Auth Required:** Yes

**Request Body:**

```json
{
  "availability": [
    {
      "date": "2024-01-15",
      "slots": [
        { "startTime": "10:00", "endTime": "11:00" },
        { "startTime": "14:00", "endTime": "15:00" }
      ]
    },
    {
      "date": "2024-01-16",
      "slots": [{ "startTime": "09:00", "endTime": "12:00" }]
    }
  ]
}
```

**Validation Rules:**

- `availability`: Required array of date objects
- Each `date`: Valid ISO date
- `slots`: Required non-empty array
- Each `slots.*.startTime` / `slots.*.endTime`: Required, `HH:mm` format

Additional checks in the controller:

- `startTime` must be before `endTime`
- Slots for the same date must not overlap

**Response (200):**

```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": [ ... ]
}
```

---

### GET `/mentor/:mentorId/availability`

Get available slots for a specific mentor on a specific date.

**Auth Required:** Yes

**Path Parameters:**

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `mentorId` | string | Mentor's ID |

**Query Parameters:**

| Parameter | Type   | Description               |
| --------- | ------ | ------------------------- |
| `date`    | string | Date in YYYY-MM-DD format |

**Response (200):**

```json
{
  "success": true,
  "message": "Available slots",
  "data": [
    { "startTime": "10:00", "endTime": "11:00" },
    { "startTime": "14:00", "endTime": "15:00" }
  ]
}
```

**Note:** 

- Slot availability is computed dynamically by splitting each declared slot into 1-hour intervals and subtracting active bookings.
- Past dates are rejected with `400` — "Cannot book past dates".
- Booking is allowed only within the next 30 days; beyond that the API returns `400` — "Booking allowed only within next 30 days".
- If the mentor has no availability on the requested date, an empty object is returned with the message `"Mentor is not available"`.

---

### GET `/mentor/my-sessions`

Get the mentor's upcoming and past sessions.

**Auth Required:** Yes (Mentor only)

**Response (200):**

```json
{
  "success": true,
  "message": "Sessions are fetched",
  "data": {
    "upcoming": [
      {
        "_id": "...",
        "mentorId": "...",
        "userId": {
          "_id": "...",
          "fullname": "John Doe",
          "username": "johndoe"
        },
        "sessionType": "video",
        "date": "2024-01-15",
        "startTime": "10:00",
        "endTime": "11:00",
        "status": "confirmed"
      }
    ],
    "past": [ ... ]
  }
}
```

**Note:** Each item is a **Booking** document (populated with the learner's `fullname`/`username`), split by whether the session start time is in the future or the past.

---

### GET `/mentor/my-sessions/:sessionId`

Get detailed information about a specific session.

**Auth Required:** Yes (Mentor only)

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `sessionId` | string | Session ID  |

**Response (200):**

```json
{
  "success": true,
  "message": "Session fetched",
  "data": {
    "_id": "...",
    "mentorId": "...",
    "userId": {
      "_id": "...",
      "fullname": "John Doe",
      "username": "johndoe"
    },
    "sessionType": "video",
    "date": "2024-01-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "hourlyRate": 75,
    "totalPrice": 75,
    "status": "confirmed"
  }
}
```

**Note:** This returns the underlying **Booking** document, not a Session document.

---

### GET `/mentor/my-posts`

Get posts created by the current mentor.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 10      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "message": "Post fetched",
  "data": {
    "page": 1,
    "totalPages": 2,
    "totalPosts": 15,
    "posts": [ ... ]
  }
}
```

---

## Posts

### GET `/post/all`

List all posts with pagination.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 10      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "message": "Posts fetched",
  "data": {
    "posts": [
      {
        "_id": "...",
        "mentorId": {
          "_id": "...",
          "fullname": "Jane Smith",
          "username": "janesmith"
        },
        "title": "Understanding React Hooks",
        "content": { ... },
        "preview": "A deep dive into React Hooks...",
        "tags": ["react", "javascript", "hooks"],
        "visibility": "free",
        "likesCount": 15,
        "commentsCount": 8,
        "createdAt": "..."
      }
    ],
    "totalPages": 5
  }
}
```

---

### GET `/post/:postId`

Get a single post with like status.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `postId`  | string | Post ID     |

**Response (200):**

```json
{
  "success": true,
  "message": "Post fetched successfully",
  "data": {
    "post": {
      "_id": "...",
      "mentorId": {
        "_id": "...",
        "fullname": "Jane Smith",
        "username": "janesmith"
      },
      "title": "Understanding React Hooks",
      "content": { ... },
      "preview": "A deep dive into React Hooks...",
      "tags": ["react", "javascript", "hooks"],
      "visibility": "free",
      "likesCount": 15,
      "commentsCount": 8,
      "isLiked": true,
      "createdAt": "..."
    }
  }
}
```

---

### POST `/post/create`

Create a new post (mentors only).

**Auth Required:** Yes (Mentor only)

**Request Body:**

```json
{
  "title": "Understanding React Hooks",
  "content": {
    "type": "doc",
    "content": [ ... ]
  },
  "preview": "A deep dive into React Hooks...",
  "tags": ["react", "javascript", "hooks"],
  "visibility": "free"
}
```

**Validation Rules:**

- `title`: Required, minimum 5 characters
- `content`: Required, TipTap JSON format

Notes:

- `tags`: Optional array
- `visibility`: Optional, `"free"` or `"premium"` (default: `"free"`)
- `preview` is auto-generated from the first 120 characters of the post text

**Response (201):**

```json
{
  "success": true,
  "message": "Comment added",
  "data": { ... }
}
```

---

### PATCH `/post/:postId`

Edit a post (owner only).

**Auth Required:** Yes (Mentor only, post owner)

**Request Body:** Same as POST `/post/create`

**Response (200):**

```json
{
  "success": true,
  "message": "Post details updated successfully",
  "data": { ... }
}
```

---

### DELETE `/post/:postId`

Delete a post (owner only).

**Auth Required:** Yes (Mentor only, post owner)

**Response (200):**

```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": {}
}
```

---

### POST `/post/:postId/react`

Toggle like/dislike on a post.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `postId`  | string | Post ID     |

**Request Body:**

```json
{
  "type": "like"
}
```

**Validation Rules:**

- `type`: Required, `"like"` or `"dislike"`

**Response (200):**

```json
{
  "success": true,
  "message": "Reaction added",
  "data": {}
}
```

**Note:** Calling again with the same type removes the reaction (message: `"Reaction removed"`). Switching between `like` and `dislike` updates the reaction (message: `"Reaction updated"`).

---

### POST `/post/:postId/comment`

Add a comment to a post.

**Auth Required:** Yes

**Request Body:**

```json
{
  "content": "Great article! Very helpful."
}
```

**Validation Rules:**

- `content`: Required, minimum 4 characters

**Response (201):**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "_id": "...",
      "postId": "...",
      "userId": {
        "_id": "...",
        "fullname": "John Doe",
        "username": "johndoe"
      },
      "content": "Great article! Very helpful.",
      "createdAt": "..."
    }
  }
}
```

---

### GET `/post/:postId/comments`

Get comments for a post with pagination.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 10      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "message": "Comments fetched",
  "data": {
    "page": 1,
    "totalPages": 1,
    "totalComments": 8,
    "comments": [ ... ]
  }
}
```

---

### PATCH `/post/:postId/comment/:commentId`

Edit a comment (owner only).

**Auth Required:** Yes (Comment owner)

**Request Body:**

```json
{
  "content": "Updated comment text"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "comment": { ... }
  }
}
```

---

### DELETE `/post/:postId/comment/:commentId`

Delete a comment (owner only).

**Auth Required:** Yes (Comment owner)

**Response (200):**

```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": {}
}
```

---

## Bookings

### POST `/booking/:mentorId`

Create a new booking with a mentor.

**Auth Required:** Yes

**Path Parameters:**

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `mentorId` | string | Mentor's ID |

**Request Body:**

```json
{
  "sessionType": "video",
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

**Validation Rules:**

- `sessionType`: Required, `"audio"` or `"video"`
- `startTime`: Required

`date` and `endTime` are not directly validated by `express-validator`; they are checked against the mentor's declared availability by the controller.

**Response (201):**

```json
{
  "success": true,
  "message": "Slot reserved",
  "data": {
    "_id": "...",
    "mentorId": "...",
    "userId": "...",
    "sessionType": "video",
    "date": "2024-01-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "hourlyRate": 75,
    "totalPrice": 75,
    "status": "confirmed",
    "expiresAt": "...",
    "createdAt": "..."
  }
}
```

**Side Effects:**

- Creates outbox event for booking confirmation email
- Email sent asynchronously via worker process
- Sends a real-time notification to the mentor

**Errors:**

- `404` — Mentor not found
- `400` — Mentor is not available
- `400` — Mentor not available on this day
- `400` — Selected time is outside mentors availability
- `409` — Time slot is not available (double booking)
- `422` — Validation failed
- `500` — Booking creation failed

---

### GET `/booking/my-bookings`

Get the current user's bookings (upcoming and past).

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Bookings are fetched",
  "data": {
    "upcoming": [
      {
        "_id": "...",
        "mentorId": {
          "_id": "...",
          "userId": {
            "_id": "...",
            "fullname": "Jane Smith",
            "username": "janesmith"
          }
        },
        "userId": "...",
        "sessionType": "video",
        "date": "2024-01-15",
        "startTime": "10:00",
        "endTime": "11:00",
        "totalPrice": 75,
        "status": "confirmed"
      }
    ],
    "past": [ ... ]
  }
}
```

---

### GET `/booking/my-bookings/:bookingId`

Get detailed information about a specific booking.

**Auth Required:** Yes

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `bookingId` | string | Booking ID  |

**Response (200):**

```json
{
  "success": true,
  "message": "Booking fetched",
  "data": {
    "_id": "...",
    "mentorId": {
      "_id": "...",
      "userId": {
        "_id": "...",
        "fullname": "Jane Smith",
        "username": "janesmith"
      }
    },
    "userId": "...",
    "sessionType": "video",
    "date": "2024-01-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "hourlyRate": 75,
    "totalPrice": 75,
    "status": "confirmed",
    "createdAt": "..."
  }
}
```

---

## Messages

### POST `/message/create/:bookingId`

Send a message in a booking's chat (with optional file upload).

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Form Data:**

| Field     | Type   | Required | Description                                    |
| --------- | ------ | -------- | ---------------------------------------------- |
| `content` | string | Yes      | Message text                                   |
| `file`    | file   | No       | Optional file attachment                       |

**Response (201):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "...",
      "bookingId": "...",
      "senderId": {
        "_id": "...",
        "fullname": "John Doe",
        "username": "johndoe"
      },
      "content": "Here's the file you requested",
      "fileType": "application/pdf",
      "fileName": "document.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "delivered": true,
      "seen": false,
      "createdAt": "..."
    }
  }
}
```

**File Upload Rules:**

- `content` is always required (validated via `express-validator`), even when a file is attached
- `multer` accepts any file — no file type or size restriction is enforced by the server
- Files are uploaded to Cloudinary
- The local temp file is deleted after upload
- `fileType` stores the MIME type of the uploaded file

---

### GET `/message/show/:bookingId`

Get all messages in a booking's chat.

**Auth Required:** Yes

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `bookingId` | string | Booking ID  |

**Response (200):**

```json
{
  "success": true,
  "message": "Messages fetched",
  "data": [ ... ]
}
```

---

## Reviews

### POST `/review/create`

Create a review for a completed session.

**Auth Required:** Yes

**Request Body:**

```json
{
  "bookingId": "...",
  "rating": 5,
  "review": "Excellent session! Very helpful and knowledgeable mentor."
}
```

**Validation Rules:**

- `bookingId`: Required, valid MongoDB ObjectId
- `rating`: Required, integer between 1 and 5
- `review`: Optional, minimum 5 characters

**Constraints:**

- Booking must be completed
- Only the user who booked can review
- One review per booking
- Must be within 7 days of session completion

**Response (201):**

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "_id": "...",
    "bookingId": "...",
    "mentorId": "...",
    "userId": "...",
    "rating": 5,
    "review": "Excellent session! Very helpful and knowledgeable mentor.",
    "createdAt": "..."
  }
}
```

**Side Effects:**

- Updates mentor's average rating and total reviews

**Errors:**

- `400` — You have already reviewed this session
- `400` — Reviews can only be submitted after a completed session
- `400` — Rating and review is not available after 7 days of session
- `404` — Booking not found
- `404` — Session not found
- `422` — Validation failed

---

### GET `/review/mentor/:mentorId`

Get reviews for a specific mentor.

**Auth Required:** Yes

**Path Parameters:**

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `mentorId` | string | Mentor's ID |

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 5       | Items per page |

**Response (200):**

```json
{
  "success": true,
  "message": "Mentor reviews fetched",
  "data": [
    {
      "_id": "...",
      "userId": {
        "_id": "...",
        "fullname": "John Doe",
        "username": "johndoe"
      },
      "rating": 5,
      "review": "Excellent session!",
      "createdAt": "..."
    }
  ]
}
```

---

### GET `/review/my`

Get reviews written by the current user.

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "User reviews fetched",
  "data": [ ... ]
}
```

---

### GET `/review/view`

Get a single review by booking ID.

**Auth Required:** Yes

**Query Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `bookingId` | string | Booking ID  |

**Response (200):**

```json
{
  "success": true,
  "message": "Review fetched",
  "data": {
    "canEdit": true,
    "review": {
      "_id": "...",
      "bookingId": "...",
      "mentorId": "...",
      "userId": "...",
      "rating": 5,
      "review": "Excellent session!",
      "createdAt": "..."
    }
  }
}
```

**Note:** `canEdit` is `true` while the review falls within the 48-hour edit window.

---

### PATCH `/review/:bookingId`

Edit a review (within 48-hour window).

**Auth Required:** Yes (Review owner)

**Request Body:**

```json
{
  "rating": 4,
  "review": "Updated review text"
}
```

**Constraints:**

- Must be within 48 hours of creation

**Response (200):**

```json
{
  "success": true,
  "message": "Review edited successfully",
  "data": { ... }
}
```

**Errors:**

- `404` — Review not found
- `400` — Review and rating can't be edited after 48 hours of its creation

---

### DELETE `/review/:bookingId`

Delete a review.

**Auth Required:** Yes (Review owner)

**Response (200):**

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {}
}
```

**Side Effects:**

- Updates mentor's average rating and total reviews

---

## Notifications

### GET `/notification/`

Get notifications for the current user.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 5       | Items per page |

**Response (200):**

```json
{
  "success": true,
  "message": "Notifications fetched",
  "data": {
    "notifications": [
      {
        "_id": "...",
        "recipientId": "...",
        "bookingId": {
          "_id": "...",
          "userId": {
            "_id": "...",
            "fullname": "John Doe",
            "username": "johndoe"
          },
          "sessionType": "video",
          "date": "2024-01-15",
          "startTime": "10:00"
        },
        "isRead": false,
        "createdAt": "..."
      }
    ],
    "totalNotificationCount": 20,
    "unreadNotificationCount": 5
  }
}
```

---

### PATCH `/notification/read-all`

Mark all notifications as read.

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Notifications marked as read",
  "data": {
    "modifiedCount": 5
  }
}
```

---

### GET `/notification/unread-count`

Get the count of unread notifications.

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Unread count fetched successfully",
  "data": {
    "unreadCount": 5
  }
}
```

---

# Socket.IO Events

## Connection

```javascript
const socket = io("http://localhost:8001", {
  auth: {
    token: "Bearer <access_token>",
  },
});
```

## Client → Server Events

| Event                  | Data                       | Description                          |
| ---------------------- | -------------------------- | ------------------------------------ |
| `join-room`            | `bookingId` (string)      | Join a booking's room (chat + video) |
| `typing`               | `{ bookingId, name }`      | Broadcast typing indicator           |
| `send-message`         | `{ bookingId, ... }`       | Broadcast new message                |
| `call-request`         | `{ id }`                   | Initiate a video call                |
| `user-joined-call`     | `{ id, fullname }`         | User joined the call                 |
| `call-declined`        | `{ id, fullname }`         | User declined the call               |
| `rejoin-call`          | `{ id, fullname }`         | User rejoined the call               |
| `offer`                | `{ id, offer, fullname }`  | WebRTC SDP offer                     |
| `answer`               | `{ id, answer }`           | WebRTC SDP answer                    |
| `ice-candidate`        | `{ id, candidate }`        | WebRTC ICE candidate                 |
| `end-call`             | `{ id, fullname }`         | End the call (mutual agreement)      |
| `request-end-session`  | `{ id, fullname, userId }` | Request to end session               |
| `continue-session`     | `{ id, fullname, userId }` | Continue after end request           |
| `session-time-expired` | `{ id }`                   | Session timer expired                |
| `camera-status`        | `{ id, enabled }`          | Camera toggle status                 |
| `mic-status`           | `{ id, enabled }`          | Microphone toggle status             |
| `screen-share-status`  | `{ id, enabled }`          | Screen share toggle status           |

## Server → Client Events

| Event                        | Data                      | Description                             |
| ---------------------------- | ------------------------- | --------------------------------------- |
| `join-room-error`            | `{ message }`             | Failed to join room                     |
| `user-typing`                | `name` (string)           | User is typing                          |
| `receive-message`            | `{ ... }`                 | New message received                    |
| `incoming-call`              | *(no payload)*            | Incoming call notification              |
| `user-joined-call`           | `{ fullname }`            | User joined the call                    |
| `call-declined`              | `{ fullname }`            | Call was declined                       |
| `participant-rejoined`       | `{ fullname }`            | Participant rejoined                    |
| `receive-offer`              | `{ offer, fullname }`     | WebRTC offer received                   |
| `receive-answer`             | `answer` (SDP)            | WebRTC answer received                  |
| `receive-ice-candidate`      | `candidate` (ICE)         | ICE candidate received                  |
| `call-ended`                 | *(no payload)*            | Call has ended                          |
| `end-session-requested`      | `{ fullname }`            | End session request received            |
| `session-continued`          | `{ fullname }`            | Session continued                       |
| `remote-camera-status`       | `{ enabled }`             | Remote camera status                    |
| `remote-mic-status`          | `{ enabled }`             | Remote mic status                       |
| `remote-screen-share-status` | `{ enabled }`             | Remote screen share status              |
| `new-booking-notification`   | `{ unreadCount }`         | New booking notification (unread count) |
| `new-detail-notification`    | `{ newNotification }`     | New notification with full details      |

---

# Error Examples

### Validation Error (422)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "type": "field",
      "msg": "Email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Unauthorized request",
  "errors": []
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Mentor not found",
  "errors": []
}
```

### Conflict (409)

```json
{
  "success": false,
  "message": "Username already exists",
  "errors": []
}
```
