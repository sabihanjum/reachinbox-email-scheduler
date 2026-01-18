# 🚀 Deployment Guide - ReachInbox Email Scheduler

## Submission Checklist

- [ ] **Private GitHub Repository** - Code pushed with proper .gitignore
- [ ] **Hosted Backend (Node.js)** - API + Worker deployed on Render/Railway
- [ ] **Hosted Frontend Dashboard** - Next.js app on Vercel/Netlify
- [ ] **Video Explanation** - Loom or Google Drive link (5-10 min walkthrough)
- [ ] **Form Submission** - All links submitted to assignment form

---

## Part 1: Create GitHub Repository (15 minutes)

### Step 1: Initialize Git Repository

```bash
cd "C:\Users\Sabiha Anjum\Documents\ReachInbox Hiring Assignment – Full-stack Email Job Scheduler"

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: ReachInbox email scheduler with BullMQ + Redis"
```

### Step 2: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `reachinbox-email-scheduler`
3. Description: `Full-stack email scheduler with BullMQ, Redis, and Google OAuth`
4. **Select: Private** ✅
5. **Do NOT initialize with README** (we already have one)
6. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/reachinbox-email-scheduler.git

# Push code
git branch -M main
git push -u origin main
```

### Step 4: Grant Access to "Mitrajit"

1. Go to your repo: `https://github.com/YOUR_USERNAME/reachinbox-email-scheduler`
2. Click "Settings" tab
3. Click "Collaborators" in left sidebar
4. Click "Add people"
5. Search for username: `Mitrajit` (or the email they provided)
6. Click "Add Mitrajit to this repository"

✅ **GitHub Repository Link:** `https://github.com/YOUR_USERNAME/reachinbox-email-scheduler`

---

## Part 2: Deploy Backend to Render (30 minutes)

Render provides free PostgreSQL + Redis + Node.js hosting.

### Step 1: Sign Up for Render

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `reachinbox-db`
3. Database: `reachinbox`
4. User: `reachinbox_user`
5. Region: Choose closest to you
6. Plan: **Free** (max 256 MB)
7. Click "Create Database"
8. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 3: Create Redis Instance

1. Click "New +" → "Redis"
2. Name: `reachinbox-redis`
3. Region: Same as database
4. Plan: **Free** (max 25 MB)
5. Click "Create Redis"
6. **Copy the Internal Redis URL** (starts with `redis://`)

### Step 4: Deploy Backend API (Web Service)

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `reachinbox-email-scheduler`
3. Name: `reachinbox-api`
4. Region: Same as database/redis
5. Root Directory: `backend`
6. Environment: **Node**
7. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
8. Start Command: `npm start`
9. Plan: **Free**

**Environment Variables** (click "Add Environment Variable"):

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<paste Internal Database URL from Step 2>
REDIS_URL=<paste Internal Redis URL from Step 3>
JWT_SECRET=<generate random string, e.g., openssl rand -base64 32>
GOOGLE_CLIENT_ID=377690627185-mf4k19ivc62e3sbt5f34tem56u0c1bv1.apps.googleusercontent.com
FRONTEND_URL=<leave blank for now, will add after frontend deployed>
ETHEREAL_USER=<leave blank or use existing>
ETHEREAL_PASS=<leave blank or use existing>
RATE_LIMIT_PER_HOUR=100
WORKER_CONCURRENCY=3
MIN_DELAY_MS=1000
```

10. Click "Create Web Service"
11. Wait for deployment (5-10 minutes)
12. **Copy the API URL** (e.g., `https://reachinbox-api.onrender.com`)

### Step 5: Deploy Worker (Background Worker)

1. Click "New +" → "Background Worker"
2. Connect same repository: `reachinbox-email-scheduler`
3. Name: `reachinbox-worker`
4. Region: Same as API
5. Root Directory: `backend`
6. Environment: **Node**
7. Build Command: `npm install && npx prisma generate`
8. Start Command: `npm run worker`
9. Plan: **Free**

**Environment Variables** (same as API):

```
NODE_ENV=production
DATABASE_URL=<same as API>
REDIS_URL=<same as API>
JWT_SECRET=<same as API>
GOOGLE_CLIENT_ID=<same as API>
RATE_LIMIT_PER_HOUR=100
WORKER_CONCURRENCY=3
MIN_DELAY_MS=1000
```

10. Click "Create Background Worker"

### Step 6: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://reachinbox-api.onrender.com`
4. Add to **Authorized redirect URIs**:
   - `https://reachinbox-api.onrender.com/api/auth/google/callback`
5. Click "Save"

✅ **Hosted Backend Link:** `https://reachinbox-api.onrender.com`

---

## Part 3: Deploy Frontend to Vercel (15 minutes)

Vercel is the best platform for Next.js apps (made by the same team).

### Step 1: Sign Up for Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Deploy Frontend

1. Click "Add New" → "Project"
2. Import your repository: `reachinbox-email-scheduler`
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: `frontend`
5. Build Command: `npm run build` (default)
6. Output Directory: `.next` (default)

**Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://reachinbox-api.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=377690627185-mf4k19ivc62e3sbt5f34tem56u0c1bv1.apps.googleusercontent.com
```

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. **Copy the Dashboard URL** (e.g., `https://reachinbox-email-scheduler.vercel.app`)

### Step 3: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Open your `reachinbox-api` web service
3. Go to "Environment" tab
4. Add/Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://reachinbox-email-scheduler.vercel.app
   ```
5. Click "Save Changes" (this will redeploy the API)

### Step 4: Update Google Cloud Console (Again)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://reachinbox-email-scheduler.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `https://reachinbox-email-scheduler.vercel.app/api/auth/google/callback`
5. Click "Save"

✅ **Hosted Dashboard Link:** `https://reachinbox-email-scheduler.vercel.app`

---

## Part 4: Create Video Walkthrough (20 minutes)

### Option A: Loom (Recommended)

1. Install Loom Chrome Extension or Desktop App: [https://www.loom.com](https://www.loom.com)
2. Click "Record" → "Screen + Camera" (or just Screen)
3. Record 5-10 minute walkthrough (see script below)
4. Click "Stop Recording"
5. Copy the Loom link (e.g., `https://www.loom.com/share/abc123...`)

### Option B: Google Drive

1. Record screen using Windows Game Bar (Win + G) or OBS Studio
2. Upload video to Google Drive
3. Right-click → "Share" → "Anyone with the link can view"
4. Copy the shareable link

### Video Script (5-10 minutes)

**Introduction (30 sec)**
- "Hi, this is my ReachInbox email scheduler assignment"
- "It's a full-stack app with Node.js backend and Next.js frontend"

**1. Dashboard Overview (1 min)**
- Open: `https://reachinbox-email-scheduler.vercel.app`
- Show Google OAuth login
- Login and show dashboard with tabs (Scheduled, Sent)

**2. Schedule an Email (2 min)**
- Click "Compose" button
- Fill out form: recipient, subject, body, send date/time
- Click "Schedule Email"
- Show it appears in "Scheduled" tab

**3. Backend Architecture (2 min)**
- Open GitHub repository
- Show backend folder structure:
  - `src/routes/emailRoutes.ts` - API endpoints
  - `src/queue.ts` - BullMQ job scheduling
  - `src/worker.ts` - Email worker with concurrency control
  - `src/emailSender.ts` - Rate limiting + SMTP logic
- Explain: "Uses BullMQ + Redis for persistent queue, not cron jobs"

**4. Key Features (2 min)**
- Rate limiting: "Maximum 100 emails per hour per sender"
- Concurrency: "3 workers process jobs simultaneously"
- Persistence: "Jobs survive server restarts"
- Show Prisma schema: User, Sender, EmailJob models

**5. Technology Stack (1 min)**
- Backend: TypeScript, Express, BullMQ, Redis, PostgreSQL, Prisma
- Frontend: Next.js, React, Tailwind CSS, Google OAuth
- Deployed: Render (backend) + Vercel (frontend)

**Conclusion (30 sec)**
- "All requirements implemented: queue-based scheduling, rate limiting, concurrency, persistence"
- "Thank you!"

✅ **Video Link:** `https://www.loom.com/share/...` or Google Drive link

---

## Part 5: Submit Assignment

### Form Submission

Fill out the assignment form with:

1. **Project built using NodeJS (Hosted Link)**
   - Backend API: `https://reachinbox-api.onrender.com`

2. **Video Explanation Link**
   - Loom or Google Drive: `https://www.loom.com/share/...`

3. **Private GitHub Repository Link**
   - `https://github.com/YOUR_USERNAME/reachinbox-email-scheduler`
   - (Make sure "Mitrajit" has access)

4. **Hosted Dashboard Link**
   - Frontend: `https://reachinbox-email-scheduler.vercel.app`

---

## Troubleshooting

### Backend won't start on Render
- Check logs: Dashboard → reachinbox-api → Logs tab
- Verify DATABASE_URL and REDIS_URL are correct (use Internal URLs)
- Make sure `npm start` script exists in backend/package.json

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_URL in Vercel environment variables
- Check CORS: backend should allow your Vercel domain
- Open browser DevTools → Network tab to see API errors

### Google OAuth not working
- Double-check all authorized origins and redirect URIs in Google Console
- Make sure GOOGLE_CLIENT_ID matches in all environments
- Clear browser cookies and try again

### Worker not processing jobs
- Check worker logs in Render dashboard
- Verify REDIS_URL is correct
- Make sure worker is running (should see "Email worker started with concurrency=3")

---

## Alternative Deployment Options

### Railway (Similar to Render)
- All-in-one: [https://railway.app](https://railway.app)
- Provides Postgres, Redis, and Node.js hosting
- $5 free credit per month

### Netlify (Alternative to Vercel for Frontend)
- [https://www.netlify.com](https://www.netlify.com)
- Great for Next.js apps
- Drag-and-drop deployment option

### Heroku (Classic option)
- [https://www.heroku.com](https://www.heroku.com)
- No longer has free tier (starts at $5/month)

---

## Estimated Total Time: 1.5 - 2 hours

- GitHub setup: 15 min
- Backend deployment: 30 min
- Frontend deployment: 15 min
- Video recording: 20 min
- Testing & fixing issues: 20-40 min

Good luck! 🚀
