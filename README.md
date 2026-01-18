# ReachInbox Email Scheduler - Full-Stack Assignment

A production-grade email scheduler service that accepts requests via API, persists jobs in a database, uses **BullMQ + Redis** for reliable job scheduling, and sends emails via **Ethereal Email** (fake SMTP for testing).

## 🎯 Features Implemented

### Backend
- ✅ **API Endpoint** for scheduling emails with configurable parameters
- ✅ **BullMQ Queue** with Redis for persistent job scheduling (no cron jobs)
- ✅ **Ethereal Email** integration for fake SMTP testing
- ✅ **Rate Limiting** - configurable max emails per hour (global, respects hourly windows)
- ✅ **Concurrency Control** - configurable worker concurrency (safe across multiple instances)
- ✅ **Delay Between Sends** - configurable minimum delay between individual email sends
- ✅ **Persistence on Restart** - future emails continue sending after server restart
- ✅ **Idempotency** - no duplicate sends, safe job tracking in database
- ✅ **Google OAuth** authentication
- ✅ **Prisma ORM** with PostgreSQL

### Frontend
- ✅ **Google OAuth Login** with JWT token auth
- ✅ **Dashboard** with tabs for Scheduled and Sent emails
- ✅ **Compose Modal** to schedule new emails with CSV/TXT file upload
- ✅ **Email Tables** showing status, recipient, subject, and timestamps
- ✅ **Loading & Empty States** for better UX
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling

## 📋 Tech Stack

### Backend
- **TypeScript** + **Express.js**
- **BullMQ** (backed by Redis) for job scheduling
- **Prisma** ORM with **PostgreSQL**
- **Nodemailer** + **Ethereal Email** for SMTP
- **Google Auth Library** for OAuth
- **JWT** for session tokens

### Frontend
- **Next.js 14** + **TypeScript**
- **React 18** + **React OAuth (Google)**
- **Axios** for API calls
- **Zustand** for state management
- **Tailwind CSS** for styling
- **date-fns** for date formatting

### Infrastructure
- **Docker** & **Docker Compose** (Postgres + Redis)

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm/yarn**
- **Docker** & **Docker Compose**
- **Google OAuth Client ID** (from [Google Cloud Console](https://console.cloud.google.com/))

### 1. Setup Environment Variables

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit .env and update:
# - DATABASE_URL: PostgreSQL connection string
# - REDIS_URL: Redis URL
# - GOOGLE_CLIENT_ID: Your Google OAuth Client ID
# - JWT_SECRET: Random secret for signing JWTs
# - SMTP_MIN_DELAY_MS: Delay between sends (default 2000ms)
# - SMTP_MAX_EMAILS_PER_HOUR: Rate limit (default 200)
# - WORKER_CONCURRENCY: Worker threads (default 5)
```

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.example frontend/.env.local
# Edit and update:
# - NEXT_PUBLIC_GOOGLE_CLIENT_ID: Same as backend
# - NEXT_PUBLIC_API_URL: http://localhost:4000
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

Verifies Postgres and Redis are running on `localhost:5432` and `localhost:6379`.

### 3. Setup Backend

```bash
cd backend
npm install

# Run Prisma migrations
npm run prisma:migrate

# Start the API server (listens on :4000)
npm run dev
```

In another terminal, start the worker:
```bash
cd backend
npm run worker
```

### 4. Setup Frontend

```bash
cd frontend
npm install

# Start Next.js dev server (listens on :3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔍 Architecture Overview

### Scheduling & Persistence

1. **User schedules emails** via frontend → API `/api/email/schedule`
2. **Backend creates database records** (EmailJob) with status `queued`
3. **BullMQ jobs are added** to Redis queue with calculated delays
4. **QueueScheduler** (BullMQ) keeps track of delayed jobs persistently
5. **On restart**, delayed jobs remain in Redis queue and are processed at their scheduled time
6. **Worker** processes jobs concurrently, sending emails and updating database status

**Key:** Jobs are stored in both Redis (queue) and Postgres (audit trail). If server restarts, Redis scheduler resumes pending jobs automatically.

### Rate Limiting

- **Per-hour window** tracked via Redis counters keyed by `email:rate:{senderId}:{hourWindow}`
- **Check before send**: If limit exceeded, job is rescheduled to next hour
- **Safe across instances**: Uses Redis atomic operations
- **Configurable**: `SMTP_MAX_EMAILS_PER_HOUR` environment variable

### Concurrency & Delay

- **Worker concurrency**: Process multiple jobs in parallel (configurable via `WORKER_CONCURRENCY`)
- **Delay between sends**: `SMTP_MIN_DELAY_MS` (default 2000ms) ensures email provider throttling
- **Both are configurable per scheduling request** or via environment defaults

### Idempotency

- Jobs are tracked by ID in Postgres with status field
- Completed jobs are marked `sent` and won't be reprocessed
- If job fails, status is marked `failed` with error message

## 📝 API Endpoints

### Auth

**POST `/api/auth/google`**
- Login with Google ID token
- Returns JWT token in HttpOnly cookie

**POST `/api/auth/logout`**
- Clears auth cookie

### Email Scheduling

**POST `/api/email/schedule`** (Protected)
```json
{
  "subject": "Hello",
  "body": "<p>This is a test</p>",
  "emails": ["user@example.com", "another@example.com"],
  "sendAt": "2025-01-20T10:00:00Z",
  "minDelayMs": 2000,
  "maxEmailsPerHour": 200
}
```
- Returns: `{ count: number, sender: Sender }`

**GET `/api/email/scheduled`** (Protected)
- Returns: `EmailJob[]` with status in `['queued', 'scheduled', 'sending']`

**GET `/api/email/sent`** (Protected)
- Returns: `EmailJob[]` with status in `['sent', 'failed']`

**GET `/api/email/senders`** (Protected)
- Returns: `Sender[]` (available email senders for the user)

## 🧪 Testing Scenario: Restart & Persistence

1. **Open frontend**, login, compose and schedule 5 emails for ~1 minute from now
2. **Check dashboard** → Scheduled Emails tab shows them as `queued`
3. **Stop API server** (`Ctrl+C`)
4. **Wait** 10 seconds, **restart server**:
   ```bash
   npm run dev
   ```
5. **Worker continues** processing → emails are sent at the right time
6. **Dashboard Sent Emails** tab now shows them as `sent`

✅ **Proof:** Jobs persist through restart without loss or duplication.

## 🔧 Behavior Under Load

### 1000+ emails scheduled for ~same time:
- Jobs are queued in Redis
- Worker processes with configured concurrency (e.g., 5 jobs in parallel)
- Rate limit `maxEmailsPerHour` is checked before each send
- If limit exceeded, job is delayed to the next hour window (automatically rescheduled)
- No jobs are dropped or permanently lost

### Example:
```
- 1000 emails scheduled for 10:00 AM
- sendAt: 10:00 AM, minDelayMs: 2000, maxEmailsPerHour: 200
- Hour 1 (10:00–11:00): 200 emails sent
- Jobs 201–1000 are rescheduled for 11:00+ automatically
```

## 📊 Database Schema (Prisma)

### User
- `id` (PK)
- `googleId` (unique)
- `email`, `name`, `avatar`

### Sender
- `id` (PK)
- `userId` (FK)
- `name`, `fromEmail`, `host`, `port`, `secure`, `username`, `password`

### EmailJob
- `id` (PK)
- `userId`, `senderId` (FKs)
- `toEmail`, `subject`, `body`
- `sendAt`, `status` (enum: scheduled | queued | sending | sent | failed)
- `error`, `providerMessageId`, `sentAt`

## 🌐 Frontend Pages

### `/` (Login)
- Google OAuth login button
- Redirects to `/dashboard` after successful login

### `/dashboard`
- **Header**: User info + logout button
- **Tabs**: Scheduled Emails | Sent Emails
- **Table**: Email, Subject, Date, Status
- **Button**: "Compose New Email" → opens modal

### Modal (Compose)
- Subject input
- Body textarea (HTML)
- CSV/TXT file upload (parses emails)
- Send time picker (optional)
- minDelayMs & maxEmailsPerHour inputs
- Schedule button

## 🔐 Security Notes

- **JWT tokens** signed with `JWT_SECRET` (httpOnly cookie)
- **CORS** restricted to `FRONTEND_ORIGIN`
- **Auth middleware** validates token on protected routes
- **Google OAuth** token verified server-side
- **Database passwords** stored securely (Prisma + PostgreSQL)

## 📝 Configuration Summary

| Variable | Default | Purpose |
|----------|---------|---------|
| `SMTP_MIN_DELAY_MS` | 2000 | Delay between email sends (ms) |
| `SMTP_MAX_EMAILS_PER_HOUR` | 200 | Global hourly rate limit |
| `WORKER_CONCURRENCY` | 5 | Parallel job processing threads |
| `PORT` | 4000 | API server port |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `JWT_SECRET` | (required) | JWT signing secret |
| `GOOGLE_CLIENT_ID` | (required) | Google OAuth Client ID |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | CORS origin |

## 🐛 Troubleshooting

### Jobs not processing?
- Check Redis is running: `redis-cli ping`
- Check Postgres is running: `psql -U postgres`
- Check worker is running in separate terminal

### Google OAuth not working?
- Verify `GOOGLE_CLIENT_ID` is correct and authorized for `http://localhost:3000`

### Emails not sending?
- Ethereal Email is fake SMTP, emails are captured in test account
- Check logs in worker terminal for errors

### Rate limit not working?
- Verify `REDIS_URL` points to running Redis instance
- Check `redis-cli` and inspect `email:rate:*` keys

## 📦 Demo / Submission

Include a **short video (max 5 min)** showing:
1. ✅ Login with Google
2. ✅ Schedule emails (from frontend compose)
3. ✅ Dashboard with Scheduled & Sent tabs
4. ✅ **Restart scenario**: Stop server → wait → restart → jobs still send
5. ✅ (Optional) Rate limiting behavior under load

## 📄 Notes

- **No cron jobs used** – only BullMQ + Redis scheduler
- **Ethereal Email** is used for safe testing (no real emails sent)
- **Idempotency** ensured via database status tracking
- **Rate limiting** is global; can be extended to per-sender limits
- **All code is from scratch** – no plagiarism

## 📞 Support

For questions or issues, refer to the architecture section above or check the backend/frontend README files.

---

**Good luck! 🚀**
