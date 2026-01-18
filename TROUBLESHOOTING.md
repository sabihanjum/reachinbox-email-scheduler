# TROUBLESHOOTING & DEBUGGING

## Prerequisites Check

### Docker Containers Not Running
```bash
docker-compose ps
```

**Fix:** Start containers
```bash
docker-compose up -d
```

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Check:**
```bash
docker-compose logs postgres
psql -U postgres -h localhost
```

**Fix:**
- Restart Postgres: `docker-compose restart postgres`
- Check `DATABASE_URL` in `.env` is correct

### Redis Connection Error
```
Error: Redis connection refused
```

**Check:**
```bash
redis-cli ping
```

**Fix:**
- Restart Redis: `docker-compose restart redis`
- Check `REDIS_URL` in `.env` is correct

---

## Backend Issues

### Port 4000 Already in Use
```
Error: listen EADDRINUSE :::4000
```

**Fix:**
```bash
# Kill process on port 4000
lsof -i :4000
kill -9 <PID>

# Or use different port
PORT=4001 npm run dev
```

### Prisma Migrations Failed
```
Error: Migrations table not found
```

**Fix:**
```bash
cd backend
npx prisma migrate reset
npm run prisma:generate
```

### Jobs Not Processing
**Check if worker is running:**
```bash
# In separate terminal
npm run worker
```

**Check Redis queue:**
```bash
redis-cli
> keys email-queue:*
> llen email-queue:jobs:*
```

**Check database:**
```bash
psql -U postgres -d reachinbox
> SELECT * FROM "EmailJob" LIMIT 5;
```

### Rate Limit Not Working
**Check Redis counter:**
```bash
redis-cli
> keys email:rate:*
> ttl email:rate:senderId:hourWindow
```

**Fix:**
- Verify `SMTP_MAX_EMAILS_PER_HOUR` is set
- Check worker concurrency isn't causing race conditions
- Restart worker: `npm run worker`

### Google OAuth Token Not Verified
```
Error: Invalid Google token
```

**Check:**
1. `GOOGLE_CLIENT_ID` matches frontend `.env.local`
2. Token not expired (JWT 7-day expiry)
3. Google Cloud Console: OAuth app authorized for `http://localhost:3000`

**Fix:**
```bash
# In backend .env
GOOGLE_CLIENT_ID=your-actual-client-id-here
```

### Emails Not Sending
**Check worker logs:**
```bash
# Worker terminal should show:
✅ Job 123 completed
```

**Check database status:**
```sql
SELECT toEmail, status, error FROM "EmailJob" WHERE status = 'failed';
```

**If all failed:**
- Check Ethereal account is valid: `testAccount.user`
- Check nodemailer transporter: `node -e "require('nodemailer').createTestAccount()"`
- Check SMTP credentials in Sender table

---

## Frontend Issues

### Port 3000 Already in Use
```bash
PORT=3001 npm run dev
```

### Google OAuth Button Not Showing
**Check:**
1. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
2. ID is not empty (check: `console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)`)

**Fix:**
```bash
# frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=paste-real-id-here
```

### Login Redirects Back to `/`
**Means:** Auth token not saved or validation failed

**Check:**
1. Console for errors: `F12` → Console tab
2. Network tab: Check `/api/auth/google` response
3. Cookies: Check `token` cookie is set

**Fix:**
```bash
# Backend: Check JWT_SECRET is consistent
JWT_SECRET=same-value-everywhere
```

### Dashboard Shows "Loading..." Forever
**Means:** Auth check is failing silently

**Check console:** `F12` → Console for errors

**Fix:**
1. Login again (clear old cookie)
2. Check backend `/api/health` is responding
3. Check `NEXT_PUBLIC_API_URL` is correct

### File Upload Not Parsing Emails
**Check:**
1. File is `.csv` or `.txt`
2. Format: One email per line (or comma-separated)
3. Valid email format: `user@domain.com`

**Example valid CSV:**
```
user1@example.com
user2@example.com
user3@example.com
```

**Example valid TXT:**
```
user1@example.com, user2@example.com, user3@example.com
```

### Scheduled Emails Not Appearing in Table
**Check:**
1. Wait a moment for API response
2. Click "Scheduled Emails" tab (might still be on Sent)
3. Check browser console for API errors

**Fix:**
```bash
# Check database
SELECT * FROM "EmailJob" WHERE status IN ('queued', 'scheduled', 'sending');
```

---

## Testing Email Delivery

### Manual Test with Curl
```bash
# Get auth token first (login via frontend), then:
curl -X POST http://localhost:4000/api/email/schedule \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Test",
    "body": "<p>Hello</p>",
    "emails": ["test@example.com"]
  }'
```

### Check Ethereal Preview
```bash
# In worker logs, look for:
📧 Preview URL: https://ethereal.email/message/...
```

Click the URL to see rendered email.

---

## Debug Mode

### Enable Verbose Logging

**Backend:**
```typescript
// In worker.ts
console.log('🔍 Processing job:', job.id, job.data);
```

**Frontend:**
```typescript
// In components
console.log('Auth state:', useAuthStore.getState());
```

### Check Environment Variables
```bash
# Backend
node -e "console.log(process.env)"

# Frontend
echo $NEXT_PUBLIC_API_URL
```

### Monitor Redis in Real-Time
```bash
redis-cli MONITOR
# Shows all Redis commands as they happen
```

### Monitor Postgres Logs
```bash
docker-compose logs -f postgres
```

---

## Performance Debugging

### Slow Email Processing?
1. Check network latency: `ping ethereal.email`
2. Check worker CPU: `top` or Task Manager
3. Check database: `SELECT COUNT(*) FROM "EmailJob"` (large table?)
4. Reduce `minDelayMs` or increase `WORKER_CONCURRENCY`

### Memory Leak?
```bash
# Backend memory usage
node --expose-gc src/index.ts
# Then: global.gc() periodically

# Monitor with: watch 'ps aux | grep node'
```

---

## Docker Debugging

### See Container Logs
```bash
docker-compose logs postgres
docker-compose logs redis
docker-compose logs -f  # Follow all
```

### Enter Container Shell
```bash
docker exec -it reachinbox_postgres_1 psql -U postgres
docker exec -it reachinbox_redis_1 redis-cli
```

### Rebuild Containers
```bash
docker-compose down
docker-compose up -d --build
```

---

## Database Issues

### Migration Out of Sync
```bash
cd backend
npx prisma migrate status
npx prisma migrate resolve --rolled-back initial
npx prisma migrate deploy
```

### Data Corruption
```bash
# Full reset (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOENT: no such file` | Missing `.env` file | `cp .env.example .env` |
| `ETIMEDOUT` | Network unreachable | Check Docker is running |
| `auth token invalid` | JWT expired or wrong secret | Re-login |
| `rate limit exceeded` | Too many requests | Wait 1 hour or increase limit |
| `job failed` | Email send error | Check Ethereal account |
| `CORS error` | Frontend/backend origin mismatch | Check `FRONTEND_ORIGIN` & `NEXT_PUBLIC_API_URL` |

---

## Getting Help

1. **Check README.md** for setup instructions
2. **Check ARCHITECTURE.md** for design decisions
3. **Check backend/src/** for code comments
4. **Enable console.log** in problematic code
5. **Check docker-compose logs** for infrastructure issues

---

**If issue persists:** Review the code in `backend/src/worker.ts` and `frontend/lib/api.ts` - they contain the core logic.
