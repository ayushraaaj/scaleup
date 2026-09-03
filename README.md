# ScaleUp

> **A modern mentorship platform that connects mentors and learners through seamless online consultation, real-time communication, and intelligent scheduling.**

---

## Project Status

🚧 **Actively Under Development**

ScaleUp is currently under active development. The core mentorship workflow has been implemented, and the project is continuously evolving with new features, performance improvements, and production-ready enhancements.

---

# The Problem

Finding the right mentor and managing online consultation sessions often requires using multiple platforms for scheduling, communication, file sharing, and video meetings.

This fragmented experience makes mentorship less efficient for both mentors and learners.

---

# The Solution

ScaleUp brings the entire mentorship experience into a single platform.

Mentors can build professional profiles, define consultation pricing, configure their availability, and conduct online consultation sessions.

Learners can discover mentors, schedule appointments, communicate through integrated messaging, exchange files, receive real-time notifications, and participate in secure real-time video consultations.

---

# Core Workflow

```text
User
 │
 ▼
Discover Mentor
 │
 ▼
View Mentor Profile
 │
 ▼
Book Consultation
 │
 ▼
Join Video Session
 │
 ▼
Real-Time Chat & File Sharing
 │
 ▼
Session Management
 │
 ├── End Session Request
 │
 ├── Continue Session
 │
 ├── Mutual Session Completion
 │
 └── Automatic Session Expiration
 │
 ▼
Session Completion
 │
 ▼
Review & Rate Mentor
```

---

# Why ScaleUp?

ScaleUp was built to explore engineering challenges commonly found in production-grade applications rather than focusing solely on CRUD functionality.

Some of the challenges addressed include:

- Authentication using JWT and Refresh Tokens
- Role-Based Authorization
- Dynamic Mentor Availability
- Booking Conflict Prevention
- Transactional Booking Creation
- Transactional Outbox Pattern
- Real-Time Communication
- WebRTC Video Consultation
- Secure File Uploads
- Modular Backend Architecture
- Video Session Lifecycle Management
- Background Recovery Using Cron Jobs
- Event-Driven Background Workers
- Cross-Process Communication Using Redis Pub/Sub

---

# Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Axios
- Socket.IO Client
- Tiptap (Rich Text Editor)

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Socket.IO
- Cloudinary
- Redis
- BullMQ
- Node-Cron
- Brevo (Transactional Email)
- React Email

---

# Project Structure

```text
ScaleUp

├── frontend
│   ├── app
│   ├── components
│   ├── hooks
│   ├── services
│   └── utils
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routers
│   │   ├── services
│   │   ├── subscribers
│   │   ├── workers
│   │   ├── queues
│   │   ├── jobs
│   │   ├── emails
│   │   ├── validators
│   │   └── utils
│   │
│   └── uploads
│
├── FEATURES.md
├── ARCHITECTURE.md
└── API.md
```

---

# Getting Started

## Prerequisites

- Node.js
- MongoDB
- Redis
- A Cloudinary account
- A Brevo account (transactional email)

---

## Clone the Repository

```bash
git clone <repository-url>
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Backend

The backend runs as two separate processes: the API server and the worker process.

### API Server

```bash
cd backend
npm install
npm run dev
```

### Worker Process

```bash
cd backend
npm run worker
```

### Or Run Both Together

```bash
cd backend
npm run dev:all
```

---

From the repository root, you can also use:

```bash
npm run dev:frontend   # Frontend only
npm run dev:backend    # Backend API only
npm run worker         # Backend worker only
npm run dev:all:backend # Backend API + worker
```

---

# Environment Variables

Create a `.env` file inside both the frontend and backend projects.

## Frontend

```env
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_CLIENT_URL=
```

## Backend

```env
PORT=

NODE_ENV=

MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLIENT_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_URL=

BREVO_API_KEY=
BREVO_SMTP_HOST=
BREVO_SMTP_PASS=
BREVO_SMTP_PORT=
BREVO_SMTP_USER=

EMAIL_FROM=
EMAIL_FROM_NAME=
```

---

# Documentation

For more detailed information about the project:

- 📘 **FEATURES.md** — Complete list of implemented features.
- 🏗️ **ARCHITECTURE.md** — Design decisions and system architecture.
- 🔗 **API.md** — API documentation.

---

# Roadmap

## Product

- Landing Page
- Search & Filtering
- Session Notes
- Mentor Analytics
- Calendar Integration
- Admin Dashboard

## Engineering

- Docker
- CI/CD Pipeline
- Monitoring & Logging

---

# Screenshots

Screenshots will be added as the project approaches production readiness.

---

# Live Demo

A live deployment link and walkthrough video will be added once the remaining core features are completed.

---

# What I Learned

Building ScaleUp has provided hands-on experience with several software engineering concepts, including:

- JWT Authentication & Refresh Tokens
- Role-Based Authorization
- REST API Design
- Real-Time Communication with Socket.IO
- WebRTC Peer-to-Peer Video Calling
- Cloudinary File Management
- Dynamic Availability Scheduling
- Booking Workflow Design
- Race Condition Prevention
- MongoDB Transactions
- Transactional Outbox Pattern
- Event-Driven Background Workers
- Redis Pub/Sub
- Cron-Based Background Jobs
- Modular Backend Architecture
- WebRTC Session Lifecycle Management
- Designing Recovery Mechanisms for Distributed Systems

---

# About

ScaleUp is a personal full-stack project built to explore real-world software engineering concepts such as authentication, scheduling, booking systems, real-time communication, and scalable backend architecture.

The project is actively maintained and will continue to evolve with additional product features and engineering improvements.

---

# License

This project is developed for learning, portfolio demonstration, and continuous improvement.
