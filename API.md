# ScaleUp - API Documentation

## Base URL

```
http://localhost:8000/api/v1
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

Most list endpoints support pagination via query parameters:

```
GET /api/v1/mentor/all?page=1&limit=10
```

Response includes:

```json
{
  "data": {
    "mentors": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

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
  "message": "Server is running",
  "data": null
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

- `fullname`: Required, 2-50 characters
- `username`: Required, 3-20 characters, alphanumeric + underscore, unique
- `email`: Required, valid email format, unique
- `password`: Required, 8-128 characters

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Errors:**

- `409` — Username or email already exists
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
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Set Cookie:**

```
refreshToken: <token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Note:** `role` is `"mentor"` if the user has a mentor profile, otherwise `"user"`.

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
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Set Cookie:**

```
refreshToken: <new_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
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
  "message": "Logged out successfully",
  "data": null
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
  "message": "User fetched successfully",
  "data": {
    "user": {
      "_id": "...",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "mentor",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

## Mentors

### GET `/mentor/all`

List all mentors with pagination.

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
  "message": "Mentors fetched successfully",
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
        "pricing": {
          "audio": 50,
          "video": 75
        },
        "ratings": {
          "average": 4.5,
          "total": 12
        },
        "totalSessions": 25
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

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
  "message": "Mentor fetched successfully",
  "data": {
    "mentor": {
      "_id": "...",
      "userId": {
        "_id": "...",
        "fullname": "Jane Smith",
        "username": "janesmith",
        "email": "jane@example.com"
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
      "ratings": {
        "average": 4.5,
        "total": 12
      },
      "totalSessions": 25,
      "totalReviews": 12,
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

- `bio`: Required, 10-500 characters
- `expertise`: Required, array of 1-10 strings
- `consultationTypes`: Required, at least one type must be true
- `pricing`: Required, positive numbers for enabled consultation types

**Response (201):**

```json
{
  "success": true,
  "message": "Mentor profile created successfully",
  "data": {
    "mentor": { ... }
  }
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
  "message": "Mentor profile updated successfully",
  "data": {
    "mentor": { ... }
  }
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
  "message": "Availability fetched successfully",
  "data": {
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

- `availability`: Required, array of date objects
- Each date must be unique
- `slots`: Required, array of 1-10 time slots
- `startTime` must be before `endTime`
- Minimum slot duration: 30 minutes

**Response (200):**

```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": {
    "availability": [ ... ]
  }
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
  "message": "Available slots fetched successfully",
  "data": {
    "availableSlots": [
      { "startTime": "10:00", "endTime": "11:00" },
      { "startTime": "14:00", "endTime": "15:00" }
    ]
  }
}
```

**Note:** This returns slots **after** subtracting active bookings (dynamic availability).

---

### GET `/mentor/my-sessions`

Get the mentor's upcoming and past sessions.

**Auth Required:** Yes (Mentor only)

**Response (200):**

```json
{
  "success": true,
  "message": "Sessions fetched successfully",
  "data": {
    "upcomingSessions": [
      {
        "_id": "...",
        "bookingId": {
          "_id": "...",
          "userId": { "fullname": "John Doe", "username": "johndoe" },
          "sessionType": "video",
          "date": "2024-01-15",
          "startTime": "10:00",
          "endTime": "11:00",
          "status": "confirmed"
        },
        "sessionStatus": "ongoing"
      }
    ],
    "pastSessions": [ ... ]
  }
}
```

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
  "message": "Session details fetched successfully",
  "data": {
    "session": {
      "_id": "...",
      "bookingId": {
        "_id": "...",
        "userId": {
          "_id": "...",
          "fullname": "John Doe",
          "username": "johndoe",
          "email": "john@example.com"
        },
        "sessionType": "video",
        "date": "2024-01-15",
        "startTime": "10:00",
        "endTime": "11:00",
        "totalPrice": 75,
        "status": "confirmed"
      },
      "sessionType": "video",
      "sessionStatus": "completed",
      "completionReason": "mutual_agreement",
      "completedAt": "..."
    }
  }
}
```

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
  "message": "Posts fetched successfully",
  "data": {
    "posts": [ ... ],
    "pagination": { ... }
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
  "message": "Posts fetched successfully",
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
    "pagination": { ... }
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

- `title`: Required, 1-200 characters
- `content`: Required, TipTap JSON format
- `preview`: Optional, max 500 characters
- `tags`: Optional, array of 1-10 strings
- `visibility`: Optional, `"free"` or `"premium"` (default: `"free"`)

**Response (201):**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": { ... }
  }
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
  "message": "Post updated successfully",
  "data": {
    "post": { ... }
  }
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
  "data": null
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
  "message": "Reaction added successfully",
  "data": {
    "likesCount": 16
  }
}
```

**Note:** Calling again with the same type removes the reaction (toggle behavior).

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

- `content`: Required, 1-1000 characters

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
  "message": "Comments fetched successfully",
  "data": {
    "comments": [ ... ],
    "pagination": { ... }
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
  "data": null
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
- `date`: Required, YYYY-MM-DD format, must be today or future
- `startTime`: Required, HH:MM format
- `endTime`: Required, HH:MM format, must be after startTime
- Minimum duration: 30 minutes

**Response (201):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
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
      "createdAt": "..."
    }
  }
}
```

**Side Effects:**

- Creates outbox event for booking confirmation email
- Email sent asynchronously via worker process

**Errors:**

- `404` — Mentor not found
- `409` — Slot already booked
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
  "message": "Bookings fetched successfully",
  "data": {
    "upcomingBookings": [
      {
        "_id": "...",
        "mentorId": {
          "_id": "...",
          "userId": {
            "fullname": "Jane Smith",
            "username": "janesmith"
          },
          "pricing": { "video": 75 }
        },
        "sessionType": "video",
        "date": "2024-01-15",
        "startTime": "10:00",
        "endTime": "11:00",
        "totalPrice": 75,
        "status": "confirmed",
        "sessionStatus": "ongoing"
      }
    ],
    "pastBookings": [ ... ]
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
  "message": "Booking details fetched successfully",
  "data": {
    "booking": {
      "_id": "...",
      "mentorId": {
        "_id": "...",
        "userId": {
          "fullname": "Jane Smith",
          "username": "janesmith"
        },
        "bio": "Senior software engineer...",
        "expertise": ["JavaScript", "React"],
        "pricing": { "video": 75 }
      },
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
      "status": "confirmed",
      "sessionStatus": "ongoing",
      "isReviewed": false,
      "createdAt": "..."
    }
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
| `content` | string | Yes\*    | Message text (\*can be empty if file attached) |
| `file`    | file   | No       | Image, PDF, or ZIP (max 10MB)                  |

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
      "fileType": "pdf",
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

- Supported types: Images (jpg, png, gif), PDF, ZIP
- Maximum size: 10MB
- Files uploaded to Cloudinary
- Local temp file deleted after upload

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
  "message": "Messages fetched successfully",
  "data": {
    "messages": [
      {
        "_id": "...",
        "senderId": {
          "_id": "...",
          "fullname": "John Doe",
          "username": "johndoe"
        },
        "content": "Hello!",
        "delivered": true,
        "seen": true,
        "createdAt": "..."
      },
      {
        "_id": "...",
        "senderId": {
          "_id": "...",
          "fullname": "Jane Smith",
          "username": "janesmith"
        },
        "content": "Here's the file",
        "fileType": "pdf",
        "fileName": "document.pdf",
        "fileUrl": "https://res.cloudinary.com/...",
        "delivered": true,
        "seen": true,
        "createdAt": "..."
      }
    ]
  }
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
- `review`: Required, 10-1000 characters

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
    "review": {
      "_id": "...",
      "bookingId": "...",
      "mentorId": "...",
      "userId": {
        "_id": "...",
        "fullname": "John Doe",
        "username": "johndoe"
      },
      "rating": 5,
      "review": "Excellent session! Very helpful and knowledgeable mentor.",
      "createdAt": "..."
    }
  }
}
```

**Side Effects:**

- Updates mentor's average rating and total reviews

**Errors:**

- `404` — Booking not found
- `403` — Not authorized to review this booking
- `409` — Review already exists for this booking
- `422` — Review window expired (7 days)

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
| `limit`   | number | 10      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "reviews": [
      {
        "_id": "...",
        "userId": {
          "fullname": "John Doe",
          "username": "johndoe"
        },
        "rating": 5,
        "review": "Excellent session!",
        "createdAt": "..."
      }
    ],
    "pagination": { ... }
  }
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
  "message": "Reviews fetched successfully",
  "data": {
    "reviews": [ ... ]
  }
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
  "message": "Review fetched successfully",
  "data": {
    "review": {
      "_id": "...",
      "bookingId": "...",
      "mentorId": "...",
      "userId": {
        "fullname": "John Doe",
        "username": "johndoe"
      },
      "rating": 5,
      "review": "Excellent session!",
      "createdAt": "..."
    }
  }
}
```

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
  "message": "Review updated successfully",
  "data": {
    "review": { ... }
  }
}
```

**Errors:**

- `403` — Not authorized
- `422` — Edit window expired (48 hours)

---

### DELETE `/review/:bookingId`

Delete a review.

**Auth Required:** Yes (Review owner)

**Response (200):**

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null
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
| `limit`   | number | 20      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [
      {
        "_id": "...",
        "recipientId": "...",
        "bookingId": {
          "_id": "...",
          "userId": {
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
    "unreadCount": 5,
    "pagination": { ... }
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
  "message": "All notifications marked as read",
  "data": null
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
const socket = io("http://localhost:8000", {
  auth: {
    token: "Bearer <access_token>",
  },
});
```

## Client → Server Events

| Event                  | Data                       | Description                          |
| ---------------------- | -------------------------- | ------------------------------------ |
| `join-room`            | `{ bookingId }`            | Join a booking's room (chat + video) |
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
| `user-typing`                | `{ name }`                | User is typing                          |
| `receive-message`            | `{ ... }`                 | New message received                    |
| `incoming-call`              | `{ ... }`                 | Incoming call notification              |
| `user-joined-call`           | `{ fullname }`            | User joined the call                    |
| `call-declined`              | `{ fullname }`            | Call was declined                       |
| `participant-rejoined`       | `{ fullname }`            | Participant rejoined                    |
| `receive-offer`              | `{ id, offer, fullname }` | WebRTC offer received                   |
| `receive-answer`             | `{ id, answer }`          | WebRTC answer received                  |
| `receive-ice-candidate`      | `{ id, candidate }`       | ICE candidate received                  |
| `call-ended`                 | `{ fullname }`            | Call has ended                          |
| `end-session-requested`      | `{ fullname }`            | End session request received            |
| `session-continued`          | `{ fullname }`            | Session continued                       |
| `remote-camera-status`       | `{ enabled }`             | Remote camera status                    |
| `remote-mic-status`          | `{ enabled }`             | Remote mic status                       |
| `remote-screen-share-status` | `{ enabled }`             | Remote screen share status              |
| `new-booking-notification`   | `{ unreadCount }`         | New booking notification (unread count) |
| `new-detail-notification`    | `{ notification }`        | New notification with full details      |

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
