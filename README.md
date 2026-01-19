# Movie API Backend

Backend service for the Movie Web Application.  
Provides authentication, role-based authorization, movie management APIs, and a distributed queue for bulk (lazy) insertion.

---

## Tech Stack

- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Redis + BullMQ** (queue & worker)
- **Zod** (request validation)
- **Helmet, CORS, Rate Limiting**

---

## Features

### Authentication
- User **Signup** with validation
- User/Admin **Login**
- JWT-based authentication
- Role-based access control (`user`, `admin`)

### Movies API
- List movies with pagination
- Sort movies by:
  - `title`
  - `rating`
  - `releaseDate`
  - `durationMinutes`
- Search movies by `title` or `description`
- Admin-only:
  - Add movie
  - Edit movie
  - Delete movie
  - Bulk upload (queued)

### Queue / Worker
- Bulk upload endpoint queues jobs
- Worker processes jobs asynchronously
- Safe concurrent upserts into MongoDB
- Supports horizontal scaling (multiple workers)

---

## Requirements

- Node.js **18+**
- MongoDB (Atlas or local)
- Redis (Railway / Upstash / local)

---

## Project Setup

### 1. Install dependencies
```bash
cd backend
npm install
```
### 2. Environment variables

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/moviesdb
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d
```
### 3.Start API server

```
npm run dev

```
