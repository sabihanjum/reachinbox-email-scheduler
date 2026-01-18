# QUICK START GUIDE

## Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Google OAuth Client ID (from Google Cloud Console)

## 5-Minute Setup

### 1. Start Docker containers
```bash
docker-compose up -d
```
✅ Postgres and Redis are now running.

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env: Update GOOGLE_CLIENT_ID and JWT_SECRET
npm install
npm run prisma:migrate
```

In one terminal:
```bash
npm run dev
```

In another:
```bash
npm run worker
```

✅ Backend API running on http://localhost:4000

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local: Update NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm install
npm run dev
```

✅ Frontend running on http://localhost:3000

## Test It

1. Open http://localhost:3000
2. Login with Google
3. Click "Compose New Email"
4. Add subject, body, upload CSV of emails
5. Click "Schedule Emails"
6. See them in "Scheduled Emails" tab

## Key Features Working

✅ Google OAuth login
✅ Email scheduling with BullMQ + Redis
✅ Rate limiting (configurable per hour)
✅ Worker concurrency control
✅ Persistence on server restart
✅ Ethereal Email SMTP integration
✅ Dashboard with scheduled & sent tabs

## Test Persistence

1. Schedule 3 emails for 1 minute from now
2. Stop API server (Ctrl+C)
3. Wait 10 sec, restart: `npm run dev` + `npm run worker`
4. Watch them send in the next minute
✅ Jobs persisted through restart!

See [README.md](./README.md) for full documentation.
