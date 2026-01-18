# 🚀 Quick Start: Deploy & Submit in 90 Minutes

## Overview

You need 4 things to submit:
1. ✅ **GitHub Repo** (private, with "Mitrajit" access)
2. ✅ **Hosted Backend** (Node.js API + Worker on Render)
3. ✅ **Hosted Frontend** (Dashboard on Vercel)
4. ✅ **Video** (5-10 min Loom walkthrough)

---

## Step 1: Push to GitHub (10 minutes)

```bash
# Navigate to project
cd "C:\Users\Sabiha Anjum\Documents\ReachInbox Hiring Assignment – Full-stack Email Job Scheduler"

# Initialize and commit
git init
git add .
git commit -m "Initial commit: ReachInbox email scheduler"

# Create repo on GitHub
# Go to: https://github.com/new
# Name: reachinbox-email-scheduler
# Visibility: Private ✅
# Click "Create repository"

# Push (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/reachinbox-email-scheduler.git
git branch -M main
git push -u origin main

# Grant access to "Mitrajit"
# Repo Settings → Collaborators → Add people → Search "Mitrajit"
```

**Result**: `https://github.com/YOUR_USERNAME/reachinbox-email-scheduler` ✅

---

## Step 2: Deploy Backend to Render (30 minutes)

### 2.1 Sign Up
- Go to [render.com](https://render.com)
- Sign up with GitHub account

### 2.2 Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `reachinbox-db`
3. Database: `reachinbox`
4. Region: Oregon (or closest)
5. Plan: **Free**
6. Click "Create Database"
7. **Copy Internal Database URL** (starts with `postgresql://`)

### 2.3 Create Redis
1. Click "New +" → "Redis"
2. Name: `reachinbox-redis`
3. Region: Same as database
4. Plan: **Free**
5. Click "Create Redis"
6. **Copy Internal Redis URL** (starts with `redis://`)

### 2.4 Deploy API Server
1. Click "New +" → "Web Service"
2. Connect repository: `reachinbox-email-scheduler`
3. Settings:
   - Name: `reachinbox-api`
   - Root Directory: `backend`
   - Environment: **Node**
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
   - Plan: **Free**

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<paste Internal Database URL from step 2.2>
REDIS_URL=<paste Internal Redis URL from step 2.3>
JWT_SECRET=super-secret-jwt-key-change-in-production
GOOGLE_CLIENT_ID=377690627185-mf4k19ivc62e3sbt5f34tem56u0c1bv1.apps.googleusercontent.com
FRONTEND_URL=<leave empty for now>
RATE_LIMIT_PER_HOUR=100
WORKER_CONCURRENCY=3
MIN_DELAY_MS=1000
```

5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment
7. **Copy API URL** (e.g., `https://reachinbox-api.onrender.com`)

### 2.5 Deploy Worker
1. Click "New +" → "Background Worker"
2. Connect same repository
3. Settings:
   - Name: `reachinbox-worker`
   - Root Directory: `backend`
   - Environment: **Node**
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm run worker`
   - Plan: **Free**

4. **Environment Variables** (same as API):

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

5. Click "Create Background Worker"

**Result**: `https://reachinbox-api.onrender.com` ✅

---

## Step 3: Deploy Frontend to Vercel (15 minutes)

### 3.1 Sign Up
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub account

### 3.2 Deploy
1. Click "Add New" → "Project"
2. Import repository: `reachinbox-email-scheduler`
3. Settings:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://reachinbox-api.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=377690627185-mf4k19ivc62e3sbt5f34tem56u0c1bv1.apps.googleusercontent.com
```

5. Click "Deploy"
6. Wait 2-3 minutes
7. **Copy Dashboard URL** (e.g., `https://reachinbox-email-scheduler.vercel.app`)

### 3.3 Update Backend with Frontend URL
1. Go back to Render dashboard
2. Open `reachinbox-api` service
3. Click "Environment" tab
4. Find `FRONTEND_URL` variable
5. Set value: `https://reachinbox-email-scheduler.vercel.app`
6. Click "Save Changes" (will trigger redeploy)

**Result**: `https://reachinbox-email-scheduler.vercel.app` ✅

---

## Step 4: Update Google OAuth (10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local testing)
   - `https://reachinbox-api.onrender.com`
   - `https://reachinbox-email-scheduler.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://reachinbox-api.onrender.com/api/auth/google/callback`
   - `https://reachinbox-email-scheduler.vercel.app/api/auth/google/callback`
5. Click "Save"

---

## Step 5: Test Everything (10 minutes)

1. Open: `https://reachinbox-email-scheduler.vercel.app`
2. Click "Sign in with Google"
3. Login with your Google account
4. Click "Compose" button
5. Fill form:
   - Recipient: any email
   - Subject: "Test Email"
   - Body: "This is a test"
   - Send date: 2 minutes from now
6. Click "Schedule Email"
7. Check "Scheduled" tab → should see your email
8. Wait 2 minutes
9. Refresh page
10. Check "Sent" tab → should see email moved there

### Check Logs:
- Render → reachinbox-worker → Logs tab
- Should see: "✅ Email sent successfully"

---

## Step 6: Record Video (20 minutes)

### Option A: Loom (Recommended)
1. Install Loom: [loom.com](https://loom.com)
2. Click "New Video" → "Screen + Camera"
3. Record following script
4. Share link

### Option B: Windows Game Bar
1. Press Win + G
2. Click "Record" button
3. Record screen
4. Upload to Google Drive
5. Share with "Anyone with the link"

### Video Script (5-10 min):

**1. Introduction (30 sec)**
- "Hi, this is my ReachInbox email scheduler assignment"

**2. Dashboard Demo (2 min)**
- Show login with Google OAuth
- Show Scheduled and Sent tabs
- Schedule a new email
- Show it appears in table

**3. Code Walkthrough (3 min)**
- Show GitHub repo structure
- Explain backend architecture (BullMQ, Redis, Prisma)
- Show key files: queue.ts, worker.ts, emailSender.ts
- Explain frontend (Next.js, React, OAuth)

**4. Key Features (2 min)**
- BullMQ + Redis (no cron jobs)
- Rate limiting (100 emails/hour)
- Concurrency (3 workers)
- Persistence on restart

**5. Tech Stack (1 min)**
- Backend: TypeScript, Express, BullMQ, PostgreSQL
- Frontend: Next.js, React, Tailwind
- Deployed: Render + Vercel

**6. Conclusion (30 sec)**
- "All assignment requirements implemented"
- "Thank you!"

**Result**: `https://www.loom.com/share/YOUR_VIDEO_ID` ✅

---

## Step 7: Submit Form

Fill out the assignment form with these 4 links:

1. **Project built using NodeJS (Hosted Link)**
   ```
   https://reachinbox-api.onrender.com
   ```

2. **Video Explanation Link**
   ```
   https://www.loom.com/share/YOUR_VIDEO_ID
   ```

3. **Private GitHub Repository Link**
   ```
   https://github.com/YOUR_USERNAME/reachinbox-email-scheduler
   ```

4. **Hosted Dashboard Link**
   ```
   https://reachinbox-email-scheduler.vercel.app
   ```

✅ **Done!**

---

## Troubleshooting

### Backend won't deploy on Render
- Check logs: Dashboard → Service → Logs tab
- Common issues:
  - DATABASE_URL or REDIS_URL incorrect (use **Internal** URLs)
  - Missing environment variables
  - Prisma migration failed

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check CORS: backend must allow Vercel domain
- Open browser DevTools → Network tab to see errors

### Google OAuth not working
- Verify all origins and redirect URIs in Google Console
- Must include both http://localhost:3000 and production URLs
- Clear browser cookies and try again

### Worker not processing emails
- Check Render → reachinbox-worker → Logs
- Verify REDIS_URL is correct
- Should see "Email worker started with concurrency=3"

### First request is slow
- Render free tier: Services sleep after 15 min inactivity
- First request wakes up service (30-60 sec)
- Subsequent requests are fast

---

## Important Notes

- **Render Free Tier**: Services sleep after 15 min inactivity
- **Vercel**: Frontend is always fast (edge network)
- **PostgreSQL**: Max 256 MB on free tier
- **Redis**: Max 25 MB on free tier
- **Keep services active**: Visit dashboard every few hours during evaluation

---

## Total Time: 90 minutes

- GitHub: 10 min
- Backend deployment: 30 min
- Frontend deployment: 15 min
- OAuth setup: 10 min
- Testing: 10 min
- Video: 20 min

Good luck! 🚀
