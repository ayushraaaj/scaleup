# ScaleUp - Architecture

## System Overview

```
                          ┌─────────────────────────────────────┐
                          │           CLIENT (Browser)          │
                          │   Next.js 16 · React 19 · Tailwind  │
                          └──────────────┬──────────────────────┘
                                         │
                          ┌──────────────▼──────────────────────┐
                          │         REST API (HTTPS)            │
                          │      Socket.IO (WebSocket)          │
                          └──────────────┬──────────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
   ┌────────▼────────┐       ┌──────────▼──────────┐      ┌─────────▼─────────┐
   │   API Process   │       │   Worker Process     │      │                   │
   │                 │       │                      │      │                   │
   │  Express 5      │       │  Outbox Worker       │      │   MongoDB         │
   │  Socket.IO      │◄─────►│  Email Worker        │◄────►│   (Primary DB)    │
   │  Redis Sub      │ Redis │  Session Cleanup     │      │                   │
   │                 │ PubSub│  Outbox Reconcile    │      └───────────────────┘
   └────────┬────────┘       └──────────┬──────────┘
            │                           │
   ┌────────▼────────┐       ┌──────────▼──────────┐
   │  Cloudinary     │       │  Redis               │
   │  (File Storage) │       │  (Queue + Pub/Sub)   │
   └─────────────────┘       └─────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │  Brevo (Email)       │
                              └─────────────────────┘
```

---

## High-Level Architecture

ScaleUp runs as **two separate Node.js processes** that communicate through **Redis Pub/Sub**.

### API Process (`src/index.ts`)

Handles all incoming client requests:

- **Express 5** — REST API with JSON responses
- **Socket.IO** — Real-time WebSocket connections for chat and WebRTC signaling
- **Redis Subscriber** — Listens for events from the worker process (e.g., session expired)

### Worker Process (`src/workers/index.ts`)

Runs background tasks independently:

- **Outbox Worker** — Watches MongoDB Change Streams for new outbox events
- **Email Worker** — BullMQ worker that sends transactional emails via Brevo
- **Session Cleanup** — Cron job that expires overdue sessions every minute
- **Outbox Reconciliation** — Recovers stale or crashed events every 60 seconds

### Why Two Processes?

The API process must stay responsive to client requests. Background tasks like watching change streams, processing email queues, and running cron jobs could block or slow down the API. Separating them ensures:

1. API latency stays low
2. Background tasks can crash without affecting the API
3. Workers can be scaled independently

---

## Request Lifecycle

Every HTTP request follows this path:

```
Client Request
     │
     ▼
┌─────────────┐
│    CORS     │  Validate origin against CLIENT_URL
└──────┬──────┘
       ▼
┌─────────────┐
│ JSON Parser │  Parse request body
└──────┬──────┘
       ▼
┌─────────────┐
│CookieParser │  Parse cookies (refresh token)
└──────┬──────┘
       ▼
┌─────────────┐
│   Router    │  Match route + method
└──────┬──────┘
       ▼
┌─────────────┐
│  verifyJWT  │  Decode access token, attach user to req
└──────┬──────┘
       ▼
┌─────────────┐
│  Validator  │  express-validator chain
└──────┬──────┘
       ▼
┌─────────────┐
│  checkIfMentor │  (mentor-only routes) Verify mentor role
└──────┬──────┘
       ▼
┌─────────────┐
│ Controller  │  Business logic + Mongoose queries
└──────┬──────┘
       ▼
┌─────────────┐
│ ApiResponse │  { success: true, message, data }
└─────────────┘
```

### Error Handling

Any error in the chain is caught by `asyncHandler` and forwarded to `errorHandler`:

```
ApiError (custom)     → Uses its statusCode + message
Mongoose Error        → 400 Bad Request
Unknown Error         → 500 Internal Server Error
```

Response format: `{ success: false, message, errors, stack? (dev only) }`

---

## Authentication Flow

### Signup

```
POST /api/v1/auth/signup
     │
     ▼
Validate input (name, username, email, password)
     │
     ▼
Check duplicate username/email → 409 Conflict if exists
     │
     ▼
User.create() → Mongoose pre("save") hook hashes password with bcrypt
     │
     ▼
Return user (without password/refreshToken)
```

### Login

```
POST /api/v1/auth/login
     │
     ▼
Find user by email or username
     │
     ▼
Compare password with bcrypt
     │
     ▼
Generate Access Token (JWT, short-lived)
Generate Refresh Token (JWT, stored in DB + HTTP-only cookie)
     │
     ▼
Return: { user, accessToken } + Set-Cookie: refreshToken
```

### Auto-Refresh (Frontend)

```
Axios interceptor catches 401 response
     │
     ▼
POST /api/v1/auth/refresh-token (with cookie)
     │
     ▼
Verify refresh token from cookie
Match against stored token in DB
     │
     ▼
Issue new access token + rotate refresh token
     │
     ▼
Retry original request with new token
```

### Socket.IO Authentication

```
Client connects with: { auth: { token: "Bearer <accessToken>" } }
     │
     ▼
Socket middleware decodes JWT
     │
     ▼
Attach decoded user to socket.user
     │
     ▼
Socket joins personal notification room (userId)
```

---

## Booking Flow

Booking creation is the most complex operation — it uses a **MongoDB transaction** and the **Transactional Outbox Pattern** to guarantee consistency.

```
POST /api/v1/booking/:mentorId
     │
     ▼
┌─────────────────────────────────────────────┐
│           MongoDB Transaction               │
│                                             │
│  1. Validate mentor exists                  │
│  2. Fetch mentor availability               │
│  3. Check slot not already booked           │
│  4. Create Booking (status: confirmed)      │
│  5. Create OutboxEvent (type: BOOKING_      │
│     CONFIRMATION_EMAIL, payload: booking)   │
│                                             │
│  If any step fails → Transaction aborts     │
└─────────────────────────────────────────────┘
     │
     ▼
Booking confirmed to client
     │
     ▼
Outbox Worker picks up event (Change Stream)
     │
     ▼
Adds job to BullMQ email queue
     │
     ▼
Email Worker processes job → Sends via Brevo
```

### Why Outbox Pattern?

Without it, if the email send fails after booking creation, the user never gets confirmation. The outbox guarantees:

- Booking + email event are written atomically (same transaction)
- Even if the API crashes, the worker will process the event later
- Failed events retry with exponential backoff (up to 5 attempts)
- Dead events are moved to a dead-letter state for manual inspection

### Dynamic Availability

Mentor availability is **never mutated** after a booking. Instead:

```
Available Slots = Mentor Declared Slots - Active Bookings

Example:
  Mentor declares: 10:00-11:00, 14:00-15:00
  Active bookings: 10:00-11:00
  Available to book: 14:00-15:00
```

This preserves the mentor's original schedule and simplifies cancellation logic.

---

## Real-Time Architecture

### Socket.IO Setup

```
Client connects → Auth middleware (JWT) → Join notification room
                                          │
                    ┌─────────────────────┤
                    │                     │
              Booking Room          Personal Room
             (per-booking)          (per-user)
                    │                     │
          ┌─────────┴─────────┐    Notifications
          │                   │
     Chat Messages      WebRTC Signaling
```

### Chat Flow

```
User A sends message
     │
     ▼
REST: POST /message/create/:bookingId (persist to DB)
     │
     ▼
Socket: emit("send-message", { bookingId, content })
     │
     ▼
Server broadcasts to booking room
     │
     ▼
User B receives "receive-message" event
```

### WebRTC Signaling

```
Mentor initiates call
     │
     ▼
emit("call-request", { id }) → Server emits "incoming-call" to room
     │
     ▼
User accepts → emit("user-joined-call") → Both join room
     │
     ▼
Exchange SDP offers/answers via Socket.IO:
  - emit("offer") → receive-offer
  - emit("answer") → receive-answer
  - emit("ice-candidate") → receive-ice-candidate
     │
     ▼
Peer-to-peer media stream established
(Socket.IO no longer involved in media flow)
```

### Session Lifecycle (Socket.IO)

```
Call Requested    → emit("call-request")      → Session created (ongoing)
End Requested     → emit("request-end-session") → Session (end_requested)
Continue Session  → emit("continue-session")    → Session (ongoing)
Mutual End        → emit("end-call")            → Session (completed)
Time Expired      → emit("session-time-expired") → Session (completed)
```

### Redis Pub/Sub (Cross-Process)

```
Worker Process                          API Process
     │                                      │
     │  Session Cleanup Cron                │
     │  detects expired session             │
     │                                      │
     │  publisher.publish(                  │
     │    "session-ended",                  │
     │    { bookingId }                     │
     │  )                                  │
     │──────────────────────────────────────►│
     │                                      │  subscriber.on("session-ended")
     │                                      │
     │                                      │  getIO().to(bookingId)
     │                                      │    .emit("call-ended")
     │                                      │
     │                                      │  Connected clients
     │                                      │  receive "call-ended"
```

---

## Background Processing

### Outbox Worker

```
MongoDB Change Stream (OutboxEvent collection)
     │
     ▼
New event detected → processOutboxEvents(eventId)
     │
     ▼
Atomic claim: findOneAndUpdate(
  status: "pending" OR (stale "processing") OR (due retry "failed")
  → set status: "processing", increment attempts
)
     │
     ▼
Event type: BOOKING_CONFIRMATION_EMAIL
     │
     ▼
addEmailJob(payload) → BullMQ queue
     │
     ▼
On success → status: "published"
On failure → status: "failed" + exponential backoff
If attempts >= 5 → status: "dead"
```

### Outbox Reconciliation

Runs every 60 seconds as a safety net:

```
Find events where:
  - status: "processing" AND processingAt > 5 min ago (stale)
  - OR status: "failed" AND nextRetryAt <= now
     │
     ▼
Re-process each event (same flow as above)
```

### Email Worker

```
BullMQ Worker (concurrency: 1)
     │
     ▼
Job: "booking-confirmation"
     │
     ▼
Render React Email template → Brevo API → Send email
     │
     ▼
On success → Remove job
On failure → Retry (exponential backoff, max 3 attempts)
```

### Session Cleanup

```
Cron: every minute (* * * * *)
     │
     ▼
Find sessions: status IN ("ongoing", "end_requested")
     │
     ▼
For each session:
  If currentTime > booking.endTime:
    session.status = "completed"
    session.completionReason = "scheduled_end"
    │
    ▼
  publisher.publish("session-ended", { bookingId })
    │
    ▼
  API subscriber receives → emits "call-ended" via Socket.IO
```

---

## Database Design

### Entity Relationship

```
┌──────────┐       ┌──────────┐
│   User   │───────│  Mentor  │  1:1 (optional)
└────┬─────┘       └────┬─────┘
     │                   │
     │                   │
     │              ┌────▼─────┐
     │              │ Booking  │  1:N from Mentor
     │              └────┬─────┘
     │                   │
     │         ┌─────────┼─────────┐
     │         │         │         │
     │    ┌────▼───┐ ┌───▼────┐ ┌──▼──────┐
     │    │Session │ │Message │ │ Review  │  1:1, 1:N, 1:1
     │    └────────┘ └────────┘ └─────────┘
     │
     ├──────────────────┐
     │                  │
┌────▼─────┐     ┌─────▼──────┐
│  Post    │     │Notification│
└────┬─────┘     └────────────┘
     │
┌────▼─────┐
│ Comment  │
└──────────┘
     │
┌────▼──────┐
│ Reaction  │
└───────────┘
```

### Key Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Mentor | 1:1 | A user optionally becomes a mentor |
| Mentor → Booking | 1:N | A mentor has many bookings |
| Booking → Session | 1:1 | Each booking has one video session |
| Booking → Message | 1:N | Chat messages per booking |
| Booking → Review | 1:1 | One review per booking |
| User → Notification | 1:N | Notifications per user |
| Mentor → Post | 1:N | Posts by mentors |
| Post → Comment | 1:N | Comments on posts |
| Post → Reaction | 1:N | Likes/dislikes on posts |

### Denormalized Counters

To avoid expensive COUNT queries, several counters are maintained incrementally:

| Field | Location | Updated When |
|-------|----------|--------------|
| `likesCount` | Post | Reaction added/removed |
| `commentsCount` | Post | Comment added/removed |
| `unreadNotificationCount` | User | Notification created/read |
| `totalRating` | Mentor | Review created/edited/deleted |
| `totalReviews` | Mentor | Review created/deleted |
| `totalSessions` | Mentor | Session completed |

---

## State Machines

### Booking Status

```
                    ┌──────────┐
                    │ pending  │ (future enhancement)
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
            ┌──────│confirmed │◄─────────────┐
            │      └────┬─────┘              │
            │           │                    │
            ▼           ▼                    │
     ┌──────────┐  ┌──────────┐       ┌─────┴──────┐
     │cancelled │  │expired   │       │ no_show_by │
     └──────────┘  └──────────┘       │ _mentor    │
                                      └────────────┘
```

### Session Status

```
     ┌──────────┐
     │ ongoing  │◄──────────────┐
     └────┬─────┘               │
          │                     │
          ▼                     │
     ┌──────────────┐     ┌─────┴────────┐
     │end_requested │────►│  continued   │
     └──────┬───────┘     └──────────────┘
            │
            ▼
     ┌──────────────┐
     │  completed   │
     │              │
     │ Reasons:     │
     │ - mutual     │
     │ - scheduled  │
     │ - cancelled  │
     └──────────────┘
```

### Outbox Event Lifecycle

```
     ┌─────────┐
     │ pending  │
     └────┬────┘
          │ Change Stream picks up
          ▼
     ┌────────────┐
     │ processing │◄─────────────────┐
     └─────┬──────┘                  │
           │                         │
     ┌─────┴──────┐                  │
     │            │                  │
     ▼            ▼                  │
┌─────────┐  ┌────────┐    ┌────────┴───┐
│published│  │ failed │───►│  (retry)   │
└─────────┘  └───┬────┘    └────────────┘
                 │ attempts >= 5
                 ▼
            ┌────────┐
            │  dead  │
            └────────┘
```

---

## Frontend Architecture

### App Router Structure

```
app/
├── layout.tsx              Root layout (fonts, Toaster, ClientWrapper)
├── page.tsx                Landing page
├── login/page.tsx          Login
├── signup/page.tsx         Signup
├── call/[bookingId]/       Video call page (dynamic route)
└── dashboard/
    ├── layout.tsx          Dashboard shell (Sidebar + AppHeader)
    ├── feed/               Post feed with pagination
    ├── mentors/            Mentor listing + profile
    ├── become-mentor/      Mentor registration
    ├── create-post/        Post creation (Tiptap editor)
    ├── mentor/             Mentor settings
    ├── my-bookings/        User bookings
    ├── my-posts/           Mentor's posts
    ├── my-reviews/         User reviews
    ├── my-sessions/        Session history
    ├── settings/           User settings
    └── videos/             Video session listing
```

### Authentication State

```
ClientWrapper (wraps entire app)
     │
     ▼
On page load → attemptRefreshToken()
     │
     ├─ Success → Set in-memory user/token state
     │
     └─ Failure → Clear state, redirect to login

Axios Interceptor:
  Request → Attach Bearer token
  401 Response → Try refresh → Retry request
```

### Component Communication

```
Parent Component
     │
     ▼
API Call (Axios) → Backend → Response
     │
     ▼
State Update (useState)
     │
     ▼
Child Components Re-render

Real-time Updates:
Socket.IO Event → Handler → State Update → Re-render
```

---

## Design Decisions

### Why Transactional Outbox Pattern?

**Problem**: If we send an email after creating a booking, and the email fails, the user never gets confirmation. If we send first and booking fails, we sent a fake confirmation.

**Solution**: Write both the booking and the email event to the database in the same transaction. A separate worker processes events asynchronously. This guarantees at-least-once delivery.

### Why Dual-Process Architecture?

**Problem**: Background tasks (change streams, cron jobs, email workers) can block the event loop, increasing API latency.

**Solution**: Run them in a separate process. The API stays responsive. If a worker crashes, the API continues serving requests.

### Why Redis Pub/Sub for Session Expiry?

**Problem**: The session cleanup cron runs in the worker process, but Socket.IO lives in the API process. How does the worker tell the API to emit "call-ended"?

**Solution**: Redis Pub/Sub bridges the two processes. The worker publishes "session-ended", the API subscribes and emits via Socket.IO. This also supports multiple API instances in the future.

### Why Dynamic Availability?

**Problem**: If we mutate availability when a booking is created, cancellation logic becomes complex. What if we need to restore the slot?

**Solution**: Never mutate availability. Compute available slots by subtracting active bookings from declared availability. Cancellation just means the booking is no longer "active".

### Why In-Memory Auth State?

**Problem**: We need to store the current user and access token for API calls.

**Solution**: Module-scoped variables in `utils/auth.ts`. Simple, no localStorage complexity, and tokens are never persisted to disk (more secure than localStorage).

---

## Infrastructure Dependencies

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| MongoDB | Primary database | MongoDB Atlas (512MB) |
| Redis | Queue backend + Pub/Sub | Redis Cloud (30MB) |
| Cloudinary | File storage (images, PDFs, ZIPs) | 25GB storage, 25GB bandwidth |
| Brevo | Transactional email | 300 emails/day |
| Vercel | Frontend hosting | Unlimited deployments |
| Railway/Render | Backend hosting | $5 credit/month |

---

## Scalability Considerations

### Current State (Single Instance)

```
1 API Process + 1 Worker Process + 1 MongoDB + 1 Redis
```

### Horizontal Scaling (Future)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ API #1   │  │ API #2   │  │ API #3   │  ← Multiple API instances
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
            ┌───────▼───────┐
            │ Load Balancer │
            └───────────────┘

Worker processes can also scale independently.
Redis Pub/Sub ensures all API instances receive session-ended events.
```

### What Would Need to Change?

1. **Sticky sessions** for Socket.IO (or use Redis adapter)
2. **MongoDB replica set** for transactions
3. **Redis Cluster** for high availability
4. **Worker scaling** with BullMQ concurrency settings
