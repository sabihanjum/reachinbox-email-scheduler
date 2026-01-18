# 📝 Assignment Form Submission Template

Copy and paste these into the assignment form:

---

## Question 1: Project built using NodeJS (Hosted Link) *

**Your Answer:**
```
https://reachinbox-api.onrender.com
```

**Note**: This is your backend API server with BullMQ worker

---

## Question 2: Video Explanation Link (Loom or Google Drive) *

**Your Answer:**
```
https://www.loom.com/share/YOUR_VIDEO_ID_HERE
```

**How to get this link:**
1. Record screen with Loom ([loom.com](https://loom.com))
2. OR record with Game Bar (Win + G) and upload to Google Drive
3. Copy the shareable link
4. Replace `YOUR_VIDEO_ID_HERE` with actual video ID

**Video Requirements:**
- Length: 5-10 minutes
- Content: Dashboard demo, code walkthrough, features explanation
- Sharing: "Anyone with the link can view"

---

## Question 3: Private GitHub Repository Link *

**Your Answer:**
```
https://github.com/YOUR_USERNAME/reachinbox-email-scheduler
```

**Important Checklist:**
- ✅ Repository is **Private**
- ✅ "Mitrajit" added as collaborator (Settings → Collaborators)
- ✅ All code pushed successfully
- ✅ Replace `YOUR_USERNAME` with your actual GitHub username

**To add collaborator:**
1. Go to repo Settings
2. Click "Collaborators" in sidebar
3. Click "Add people"
4. Search: `Mitrajit` (or email provided by recruiter)
5. Click "Add Mitrajit to this repository"

---

## Question 4: Hosted Dashboard Link *

**Your Answer:**
```
https://reachinbox-email-scheduler.vercel.app
```

**Note**: This is your Next.js frontend deployed on Vercel

---

## Pre-Submission Checklist

Before submitting the form, verify:

### GitHub Repository
- [ ] Repository is private (not public)
- [ ] "Mitrajit" has been added as collaborator
- [ ] Latest code is pushed
- [ ] .env files are NOT committed (in .gitignore)

### Backend (Render)
- [ ] API service deployed successfully
- [ ] Worker service deployed successfully
- [ ] PostgreSQL database created
- [ ] Redis instance created
- [ ] All environment variables configured
- [ ] API responds to health check: `https://YOUR-API.onrender.com/api/health`

### Frontend (Vercel)
- [ ] Dashboard deployed successfully
- [ ] Environment variables configured (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID)
- [ ] Can open dashboard in browser without errors

### Google OAuth
- [ ] Authorized JavaScript origins added (localhost + production URLs)
- [ ] Authorized redirect URIs added (localhost + production URLs)
- [ ] Login works on deployed dashboard

### End-to-End Test
- [ ] Can login with Google on deployed dashboard
- [ ] Can compose and schedule an email
- [ ] Email appears in "Scheduled" tab
- [ ] Worker processes email and moves to "Sent" tab
- [ ] No errors in browser console or Render logs

### Video
- [ ] Video recorded (5-10 minutes)
- [ ] Video uploaded to Loom or Google Drive
- [ ] Sharing set to "Anyone with the link can view"
- [ ] Video link works (test in incognito browser)
- [ ] Video covers: demo, code walkthrough, features, tech stack

---

## After Submission

### Expected Turnaround
- Usually 1-2 weeks for evaluation
- Check email for updates from recruiter

### Keep Services Active
- Render free tier: Services sleep after 15 min inactivity
- Visit your dashboard every few hours to keep it warm
- First request after sleep takes 30-60 sec to wake up

### If Asked for Changes
- Make updates to code
- Push to GitHub (repo is private, evaluator has access)
- Redeploy on Render/Vercel if needed
- Update form submission if links change

---

## Sample Completed Form

Here's what your completed form should look like:

**1. Project built using NodeJS (Hosted Link):**
```
https://reachinbox-api-abcd123.onrender.com
```

**2. Video Explanation Link:**
```
https://www.loom.com/share/abc123def456
```

**3. Private GitHub Repository Link:**
```
https://github.com/sabihaanjum/reachinbox-email-scheduler
```

**4. Hosted Dashboard Link:**
```
https://reachinbox-email-scheduler-xyz.vercel.app
```

---

## Troubleshooting Common Issues

### "Repository is private, evaluator can't access it"
- You must add "Mitrajit" (or recruiter's username) as collaborator
- Go to repo Settings → Collaborators → Add people

### "Backend link doesn't work"
- Check Render dashboard → Logs for errors
- Verify DATABASE_URL and REDIS_URL are correct (Internal URLs)
- Test health endpoint: `https://YOUR-API.onrender.com/api/health`

### "Dashboard shows connection error"
- Check Vercel environment variables (NEXT_PUBLIC_API_URL must be correct)
- Check browser console for CORS errors
- Verify backend allows frontend origin in CORS settings

### "Google login fails"
- Check Google Cloud Console → OAuth Client ID
- Verify all origins and redirect URIs are added
- Both localhost and production URLs must be present

### "Video link is private"
- Loom: Click "Share" → "Anyone with the link"
- Google Drive: Right-click → Share → "Anyone with the link can view"

---

## Good Luck! 🚀

You've built a production-grade email scheduler with:
- ✅ Queue-based scheduling (BullMQ + Redis)
- ✅ Rate limiting (100 emails/hour)
- ✅ Concurrency control (3 workers)
- ✅ Persistence on restart
- ✅ Full-stack with OAuth
- ✅ Deployed to cloud (Render + Vercel)

All assignment requirements are met. Present it confidently!
