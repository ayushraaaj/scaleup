# ScaleUp - Features

## Overview

ScaleUp is a full-stack mentorship platform that connects users with mentors through audio and video consultation sessions. The platform enables mentors to manage their professional profiles, configure their availability, and conduct sessions using real-time communication tools such as video calls, messaging, and file sharing.

---

# Core Capabilities

- Discover mentors based on their expertise.
- Become a mentor by creating a professional profile.
- Configure consultation types and pricing.
- Manage mentor availability across multiple dates and time slots.
- Book audio and video consultation sessions.
- Conduct real-time WebRTC video consultations.
- Exchange real-time messages and files during active bookings.
- Prevent double bookings through dynamic availability calculation.
- Receive real-time notifications for new bookings.
- Rate and review mentors after completed sessions.

---

# Table of Contents

- Authentication & Authorization
- Feed Module
- Mentor Module
- Booking System
- Video Consultation
- Real-Time Chat
- File Upload
- Notifications
- Ratings & Reviews
- Email Delivery
- Event-Driven Background Workers
- Dashboard
- User Experience
- Engineering Highlights
- Design Decisions
- Future Enhancements
- Tech Stack
- Project Status

---

# Authentication & Authorization

## Authentication

- ✅ User Registration
- ✅ User Login
- ✅ JWT Access Token Authentication
- ✅ Refresh Token Authentication
- ✅ Automatic Access Token Refresh
- ✅ Automatic Session Restoration on Page Load
- ✅ Secure HTTP-only Refresh Token Cookies
- ✅ Logout

## Authorization

- ✅ Role Based Access Control
- ✅ User Account
- ✅ Mentor Account
- ✅ Protected Routes

---

# Feed Module

## Feed

- ✅ View Feed
- ✅ Feed Pagination
- ✅ Like Posts
- ✅ Comment on Posts

## Post Management

- ✅ Create Posts
- ✅ View Individual Post
- ✅ My Posts
- ✅ Edit Posts
- ✅ Delete Posts
- ✅ Rich Text Editor (Tiptap)
- ✅ Code Block Highlighting

---

# Mentor Module

## Become a Mentor

- ✅ Mentor Registration
- ✅ Mentor Profile Creation
- ✅ Bio Configuration
- ✅ Expertise Configuration
- ✅ Consultation Type Selection
- ✅ Pricing Configuration

---

## Mentor Profile

- ✅ Update Bio
- ✅ Update Expertise
- ✅ Update Consultation Types
- ✅ Update Pricing
- ✅ Auto-filled Existing Profile Information

---

## Availability Management

### Availability

- ✅ Add Multiple Available Dates
- ✅ Add Multiple Time Slots Per Date
- ✅ Edit Existing Availability
- ✅ Remove Individual Slots
- ✅ Remove Entire Dates
- ✅ Auto-fill Existing Availability
- ✅ Update Availability

### Availability Validation

- ✅ Empty Field Validation
- ✅ Duplicate Date Prevention
- ✅ Minimum Session Duration Validation
- ✅ End Time Validation
- ✅ Multiple Slot Support Per Day

---

# Booking System

## Booking

- ✅ Browse Mentor Availability
- ✅ Audio Consultation Booking
- ✅ Video Consultation Booking
- ✅ Booking Confirmation
- ✅ My Bookings
- ✅ Upcoming & Past Bookings Split
- ✅ Booking Email Notification

## Booking Protection

- ✅ Dynamic Time Slot Generation
- ✅ Slot Reservation
- ✅ Double Booking Prevention
- ✅ Conflict Detection Against Active Bookings

---

# Video Consultation

## WebRTC

- ✅ Peer-to-Peer Video Calls
- ✅ Camera Toggle
- ✅ Microphone Toggle
- ✅ Screen Sharing
- ✅ Incoming Call Handling
- ✅ Call Decline Flow
- ✅ Mentor to User Calls
- ✅ Mentor to Mentor Calls

## Session Management

- ✅ Booking Based Video Sessions
- ✅ Session Lifecycle Tracking
- ✅ End Session Request Workflow
- ✅ Mutual Session Completion
- ✅ Continue Session Flow
- ✅ Automatic Session Expiration
- ✅ Frontend Timer Based Session End
- ✅ Cron-Based Session Recovery
- ✅ Persistent Video Session State
- ✅ Cross-Process Session End Signaling (Redis Pub/Sub)

---

# Real-Time Chat

## Messaging

- ✅ Booking Specific Chat
- ✅ Real-Time Messaging
- ✅ Typing Indicator
- ✅ Message Validation

## File Sharing

- ✅ Image Sharing
- ✅ PDF Sharing
- ✅ ZIP Sharing
- ✅ Browser Preview for Supported Files
- ✅ Automatic Download for Unsupported Files

---

# File Upload

## Cloudinary Integration

- ✅ Image Upload
- ✅ PDF Upload
- ✅ ZIP Upload
- ✅ Secure Cloud Storage
- ✅ File Preview Support

---

# Notifications

- ✅ Real-Time Booking Notifications via WebSocket
- ✅ Unread Notification Count Badge
- ✅ Notification List with Pagination
- ✅ Mark All Notifications as Read
- ✅ Per-User Notification Rooms

---

# Ratings & Reviews

- ✅ Submit Review After Completed Session
- ✅ Star Rating (1-5)
- ✅ One Review Per Booking
- ✅ 7-Day Review Window
- ✅ 48-Hour Review Edit Window
- ✅ Edit Review
- ✅ Delete Review
- ✅ Mentor Rating Aggregation
- ✅ Mentor Total Reviews & Completed Sessions Tracking

---

# Email Delivery

- ✅ Booking Confirmation Email (Brevo)
- ✅ HTML Email Template (React Email)
- ✅ Transactional Email Sending

---

# Event-Driven Background Workers

- ✅ Transactional Outbox Pattern
- ✅ Queue-Based Email Jobs (BullMQ)
- ✅ Change Stream Worker for New Outbox Events
- ✅ Background Reconciliation Worker
- ✅ Stale Event Recovery & Crash Recovery
- ✅ Exponential Backoff Retry for Failed Events
- ✅ Redis Based Pub/Sub Communication
- ✅ Separate Worker Process

---

# Dashboard

## User Dashboard

- ✅ Feed
- ✅ Mentor Listing
- ✅ My Bookings
- ✅ My Reviews
- ✅ Settings

## Mentor Dashboard

- ✅ Create Posts
- ✅ My Sessions
- ✅ Profile Details
- ✅ Availability Management
- ✅ My Posts

---

# User Experience

- ✅ Responsive Dashboard
- ✅ Toast Notifications
- ✅ Form Validation
- ✅ Auto-filled Forms
- ✅ Loading States

---

# Engineering Highlights

## Backend

- ✅ RESTful API Design
- ✅ Modular Project Structure
- ✅ JWT Authentication
- ✅ MongoDB
- ✅ Mongoose
- ✅ Cloudinary Integration
- ✅ Socket.IO Signaling
- ✅ WebRTC Integration
- ✅ Background Cron Jobs
- ✅ Session Lifecycle Management
- ✅ Redis Pub/Sub
- ✅ BullMQ Queue

## Booking Architecture

- ✅ Dynamic Availability Calculation
- ✅ Booking Conflict Detection
- ✅ Availability and Booking Separation
- ✅ Automatic Time Slot Generation
- ✅ Transactional Booking Creation (Mongo Transactions)

## Event-Driven Architecture

- ✅ Transactional Outbox
- ✅ MongoDB Change Streams
- ✅ Background Reconciliation
- ✅ Atomic Event Claiming
- ✅ Crash Recovery & Retry with Backoff

## Security

- ✅ Protected APIs
- ✅ Authentication Middleware
- ✅ Authorization Middleware
- ✅ Request Validation
- ✅ Secure File Uploads
- ✅ Password Hashing (bcrypt)
- ✅ Refresh Token Revocation (Server-Side)

---

# Design Decisions

## Availability

- Mentor availability is never modified after a booking.
- Available slots are computed dynamically by comparing mentor availability with active bookings.
- This preserves the mentor's original schedule and simplifies booking cancellation or expiration.

## Booking

- Bookings reserve a slot at the time of creation.
- Slot availability is validated before confirming a booking to prevent double booking.
- Active bookings determine visible availability.
- Booking creation is wrapped in a Mongo transaction together with the outbox event.

## Pricing

- Consultation pricing belongs to the mentor profile rather than availability.
- Pricing remains independent of scheduling and can be updated without affecting existing availability.

## Communication

- Chat is isolated per booking to keep conversations organized.
- WebRTC is used for peer-to-peer media transmission.
- Socket.IO is responsible for signaling and real-time events.
- Every consultation creates a dedicated Video Session.
- Session state is persisted independently from the booking.
- Automatic session completion is handled through frontend timers with cron-based recovery.

## Reliability

- Side effects (emails) are written to an outbox in the same transaction as the state change.
- A dedicated worker process consumes outbox events, guaranteeing delivery even if the API crashes.
- Session expiry is detected by a cron job in the worker process and bridged to the API via Redis pub/sub.

---

# Future Enhancements

## Product Features

- ⏳ Landing Page
- ⏳ Session Notes
- ⏳ Search & Filtering
- ⏳ Mentor Analytics
- ⏳ Calendar Integration
- ⏳ Admin Dashboard
- ⏳ Email Verification
- ⏳ Forgot Password / Password Reset
- ⏳ Pending Booking Flow with Expiry

## Engineering Improvements

- ⏳ Docker
- ⏳ CI/CD Pipeline
- ⏳ Monitoring & Logging
- ⏳ Horizontal Worker Scaling

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Axios
- Socket.IO Client
- Tiptap (Rich Text Editor)
- Lowlight / Highlight.js

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
- bcryptjs
- express-validator
- Multer

---

# Project Status

**Current Status:** Actively Under Development

## Completed

- ✅ Authentication & Authorization
- ✅ Feed Module
- ✅ Mentor Module
- ✅ Availability Management
- ✅ Booking System
- ✅ Video Consultation
- ✅ Real-Time Chat
- ✅ File Sharing
- ✅ Notifications
- ✅ Ratings & Reviews
- ✅ Email Delivery
- ✅ Queue-Based Background Workers

## In Progress

- 🚧 User Experience Improvements
- 🚧 Platform Enhancements

## Planned

- ⏳ Landing Page
- ⏳ Session Notes
- ⏳ Search & Filtering
- ⏳ Mentor Analytics
- ⏳ Calendar Integration
- ⏳ Admin Dashboard
- ⏳ Email Verification
- ⏳ Forgot Password
- ⏳ Docker
- ⏳ CI/CD Pipeline
- ⏳ Production Optimizations
