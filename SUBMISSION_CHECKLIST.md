# 📋 Assignment Submission Checklist

## Before You Start
- [ ] All code is working locally without errors
- [ ] Backend API + Worker running successfully
- [ ] Frontend dashboard functional with Google OAuth
- [ ] Docker containers (PostgreSQL + Redis) running

---

## Step 1: GitHub Repository (15 minutes)

### Commands to Run:
```bash
# Navigate to project folder
cd "C:\Users\Sabiha Anjum\Documents\ReachInbox Hiring Assignment – Full-stack Email Job Scheduler"

# Initialize git
git init

# Stage all files
git add .

# First commit
git commit -m "Initial commit: ReachInbox email scheduler"

# Create repo on GitHub (https://github.com/new)
# Name: reachinbox-email-scheduler
# Visibility: Private ✅

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/reachinbox-email-scheduler.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Grant Access:
1. Go to repo Settings → Collaborators
2. Add username: **Mitrajit** (or email provided by recruiter)

### ✅ Checklist:
- [ ] Repository created as **Private**
- [ ] Code pushed successfully
- [ ] "Mitrajit" added as collaborator
- [ ] Repository link ready: `https://github.com/YOUR_USERNAME/reachinbox-email-scheduler`

---

## Step 2: Deploy Backend to Render (30 minutes)

### 2A: Create Database & Redis
1. Sign up at [render.com](https://render.com) with GitHub
2. New → PostgreSQL (name: `reachinbox-db`, plan: Free)
3. Copy **Internal Database URL**
4. New → Redis (name: `reachinbox-redis`, plan: Free)
5. Copy **Internal Redis URL**

### 2B: Deploy API Server
1. New → Web Service
2. Connect repo: `reachinbox-email-scheduler`
3. Root Directory: `backend`
4. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Start Command: `npm start`
6. Add environment variables (see DEPLOYMENT.md)

### 2C: Deploy Worker
1. New → Background Worker
2. Same repo, Root Directory: `backend`
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `npm run worker`
5. Add same environment variables

### ✅ Checklist:
- [ ] PostgreSQL database created
- [ ] Redis instance created
- [ ] API web service deployed
- [ ] Worker background service deployed
- [ ] All environment variables configured
- [ ] API URL ready: `https://reachinbox-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (15 minutes)

### Steps:
1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. New Project → Import `reachinbox-email-scheduler`
3. Root Directory: `frontend`
4. Framework: Next.js (auto-detected)
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://reachinbox-api.onrender.com`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>`
6. Deploy

### Update Backend:
1. Go to Render → reachinbox-api → Environment
2. Add: `FRONTEND_URL=https://reachinbox-email-scheduler.vercel.app`
3. Save (triggers redeploy)

### ✅ Checklist:
- [ ] Frontend deployed successfully
- [ ] Environment variables configured
- [ ] Backend updated with frontend URL
- [ ] Dashboard URL ready: `https://reachinbox-email-scheduler.vercel.app`

---

## Step 4: Update Google OAuth (10 minutes)

### Google Cloud Console:
1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Add **Authorized JavaScript origins**:
   - `https://reachinbox-api.onrender.com`
   - `https://reachinbox-email-scheduler.vercel.app`
4. Add **Authorized redirect URIs**:
   - `https://reachinbox-api.onrender.com/api/auth/google/callback`
   - `https://reachinbox-email-scheduler.vercel.app/api/auth/google/callback`
5. Save

### ✅ Checklist:
- [ ] OAuth origins updated
- [ ] OAuth redirect URIs updated
- [ ] Tested login on deployed dashboard
- [ ] OAuth working without errors

---

## Step 5: Create Video Walkthrough (20 minutes)

### Recording Options:
- **Option A**: Loom ([loom.com](https://loom.com)) - Chrome extension or desktop app
- **Option B**: Windows Game Bar (Win + G) → upload to Google Drive

### Video Content (5-10 minutes):
1. **Introduction** (30 sec)
   - Introduce project and assignment
   
2. **Dashboard Demo** (2 min)
   - Login with Google OAuth
   - Show dashboard tabs (Scheduled, Sent)
   - Schedule a new email via Compose modal
   - Show email appears in Scheduled tab

3. **Code Walkthrough** (3 min)
   - GitHub repo structure
   - Backend: API routes, BullMQ queue, worker, email sender
   - Frontend: Login page, dashboard, compose modal
   - Database schema (Prisma)

4. **Key Features** (2 min)
   - BullMQ + Redis (persistent queue, no cron)
   - Rate limiting (100 emails/hour)
   - Concurrency control (3 workers)
   - Persistence on restart
   - Ethereal Email SMTP

5. **Tech Stack** (1 min)
   - Backend: TypeScript, Express, BullMQ, Prisma, PostgreSQL
   - Frontend: Next.js, React, Tailwind
   - Deployed: Render + Vercel

6. **Conclusion** (30 sec)
   - All requirements met
   - Thank you

### ✅ Checklist:
- [ ] Video recorded (5-10 minutes)
- [ ] Uploaded to Loom or Google Drive
- [ ] Sharing set to "Anyone with the link"
- [ ] Video link ready: `https://www.loom.com/share/...`

---

## Step 6: Test Everything (15 minutes)

### End-to-End Testing:
1. **Open Dashboard**: `https://reachinbox-email-scheduler.vercel.app`
2. **Login** with Google account
3. **Schedule Email**:
   - Click "Compose"
   - Fill form: recipient, subject, body, future date/time
   - Submit
4. **Verify in Dashboard**:
   - Check "Scheduled" tab → email should appear
   - Wait for send time (or schedule for 1 min from now)
   - Check "Sent" tab → email should move here
5. **Check Backend Logs**:
   - Render dashboard → Worker logs
   - Should see "Email sent successfully"

### ✅ Checklist:
- [ ] Login works (no OAuth errors)
- [ ] Can schedule emails
- [ ] Emails appear in Scheduled tab
- [ ] Worker processes and sends emails
- [ ] Emails appear in Sent tab after sending
- [ ] No console errors in browser DevTools
- [ ] No errors in Render logs

---

## Step 7: Submit Assignment

### Form Fields:
1. **Project built using NodeJS (Hosted Link)**
   ```
   https://reachinbox-api.onrender.com
   ```

2. **Video Explanation Link (Loom or Google Drive)**
   ```
   https://www.loom.com/share/YOUR_VIDEO_ID
   ```

3. **Private GitHub Repository Link**
   ```
   https://github.com/YOUR_USERNAME/reachinbox-email-scheduler
   ```
   *(Make sure "Mitrajit" has access)*

4. **Hosted Dashboard Link**
   ```
   https://reachinbox-email-scheduler.vercel.app
   ```

### ✅ Final Checklist:
- [ ] All 4 links ready
- [ ] All links tested and working
- [ ] GitHub repo is private with collaborator added
- [ ] Video is shareable (not private)
- [ ] Dashboard login works
- [ ] Form submitted successfully

---

## 🎉 You're Done!

**Total Time Estimate**: 1.5 - 2 hours

### What to Expect:
- Render free tier: API might sleep after 15 min inactivity (takes 30-60 sec to wake up)
- Vercel: Frontend is always fast (edge network)
- First API request might be slow due to cold start

### Support:
- If any issues, check TROUBLESHOOTING.md
- Review Render logs for backend errors
- Check browser DevTools console for frontend errors

Good luck! 🚀
