# Backend README

## Overview

Express.js + TypeScript backend with BullMQ + Redis job queue, Prisma ORM, and Ethereal Email SMTP integration.

## Environment Variables

Create `.env` from `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reachinbox"
REDIS_URL="redis://localhost:6379"
PORT=4000
JWT_SECRET="your-secret-key-change-this"
FRONTEND_ORIGIN="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
SMTP_MIN_DELAY_MS=2000
SMTP_MAX_EMAILS_PER_HOUR=200
WORKER_CONCURRENCY=5
```

## Installation

```bash
npm install
```

## Database Setup

Run Prisma migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This creates tables: `User`, `Sender`, `EmailJob`.

## Running

### API Server

```bash
npm run dev
```

Listens on `http://localhost:4000`.

### Worker (Separate Process)

```bash
npm run worker
```

Processes email jobs from the queue.

### Production Build

```bash
npm run build
npm start
npm start:worker
```

## Architecture

### Job Flow

1. API receives `/api/email/schedule` request
2. EmailJob records created in PostgreSQL
3. BullMQ jobs added to Redis queue with calculated delays
4. QueueScheduler keeps track of delayed jobs persistently
5. Worker picks up jobs, checks rate limits, sends emails, updates status
6. On restart, QueueScheduler resumes pending jobs automatically

### Rate Limiting

- Redis counter keyed by `email:rate:{senderId}:{hourWindow}`
- Checked before each send
- If exceeded, job rescheduled to next hour
- Safe across multiple instances (atomic Redis ops)

### Concurrency

- Worker concurrency configured via `WORKER_CONCURRENCY`
- Delay between sends configured via `SMTP_MIN_DELAY_MS`
- Both can be overridden per scheduling request

## API Endpoints

See main README for full endpoint documentation.

## Key Files

- `src/index.ts` - Express server
- `src/worker.ts` - BullMQ worker
- `src/queue.ts` - Queue & scheduler setup
- `src/emailSender.ts` - SMTP logic
- `src/rateLimiter.ts` - Rate limiting
- `src/auth.ts` - JWT middleware
- `src/routes/` - API routes
- `prisma/schema.prisma` - Database schema

## Testing

### Schedule emails manually

```bash
curl -X POST http://localhost:4000/api/email/schedule \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Test",
    "body": "<p>Hello</p>",
    "emails": ["user@example.com"]
  }'
```

### Check Redis queue

```bash
redis-cli
> keys email:*
> llen email-queue:*
```

### Check database

```bash
psql -U postgres -d reachinbox
> SELECT * FROM "EmailJob";
```

---

Refer to main README for full setup instructions.
