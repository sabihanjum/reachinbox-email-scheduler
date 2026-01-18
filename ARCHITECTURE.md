# ARCHITECTURE & DESIGN DECISIONS

## Scheduling Architecture

### Why BullMQ + Redis (Not Cron)

**Problem:** Need persistent, reliable job scheduling without OS-level cron.

**Solution:** BullMQ on top of Redis
- ✅ Delayed jobs built-in
- ✅ Persistent to Redis (survives restarts)
- ✅ QueueScheduler monitors delayed jobs reliably
- ✅ Distributed (multi-instance safe)
- ✅ Atomic operations (no race conditions)

**How it works:**
1. Jobs added to queue with `delay` property
2. QueueScheduler periodically checks for jobs ready to process
3. On restart, Redis data persists → jobs resume
4. No cron needed, no in-memory state lost

### Alternative Considered (Not Used)
- Custom Redis scheduler with intervals ❌ (complex, less proven)
- node-cron ❌ (violates requirement, in-memory only)
- Agenda.js ❌ (violates requirement)

---

## Rate Limiting Strategy

### Implementation: Redis Counters

**Problem:** Need to enforce hourly limits across multiple workers.

**Solution:** Redis counters keyed by hour window
```
Key: email:rate:{senderId}:{hourWindow}
Value: count of emails sent in that hour
TTL: 3600 seconds (1 hour)
```

**Why Redis (not database)?**
- ✅ Atomic increments (safe for concurrent workers)
- ✅ TTL support (auto-cleanup after hour)
- ✅ Sub-millisecond latency
- ✅ Avoids database locks

**How it works:**
1. Before sending, increment counter for current hour window
2. If count > limit → delay job to next hour
3. Rescheduled jobs maintain order
4. Counter auto-expires after 1 hour

### Alternative Considered (Not Used)
- Database-only counters ❌ (slower, needs locks)
- In-memory counters ❌ (lost on restart, not distributed)
- Token bucket ❌ (overkill for this use case)

---

## Concurrency Model

### Multiple Workers in Parallel

**Problem:** Single worker can't handle 1000+ concurrent emails efficiently.

**Solution:** BullMQ concurrency setting
```typescript
new Worker(queueName, processor, {
  concurrency: 5  // Process 5 jobs in parallel
})
```

**Why this works:**
- ✅ Async operations (email sending is I/O bound)
- ✅ Node.js handles multiple concurrent requests
- ✅ No locking needed (each job has own transaction)
- ✅ Configurable based on resources

**Concurrency = 5 means:**
- 5 emails can be sending simultaneously
- 6th waits for one to complete
- Scales linearly (more workers = more concurrency)

### Alternative Considered (Not Used)
- Thread pool ❌ (Node.js single-threaded)
- Worker threads ❌ (overkill, adds complexity)
- Sequential processing ❌ (too slow)

---

## Database Choice: PostgreSQL + Prisma

### Why PostgreSQL?
- ✅ ACID transactions
- ✅ Enum types (for status field)
- ✅ Reliable, production-tested
- ✅ Works perfectly with Prisma

### Why Prisma (not raw SQL)?
- ✅ Type-safe queries
- ✅ Auto migrations
- ✅ Intuitive ORM (not overly complex)
- ✅ Great with TypeScript

**Schema Design:**
```
User → Sender → EmailJob
```
- User owns multiple senders (email addresses)
- Each job belongs to one sender
- Status field tracks job lifecycle

---

## Frontend State Management

### Why Zustand (not Redux/Context)?

**Problem:** Need simple, lightweight state for auth + UI state.

**Solution:** Zustand
- ✅ Minimal boilerplate (2KB)
- ✅ Simple hooks API
- ✅ No provider hell (Context Provider still used for OAuth)
- ✅ Reactive updates

```typescript
const { user, token, login, logout } = useAuthStore();
```

### Alternative Considered (Not Used)
- Redux ❌ (overkill for this project)
- Context API ❌ (provider nesting, re-render overhead)
- MobX ❌ (unnecessary complexity)

---

## Email Delivery: Ethereal

### Why Ethereal Email?

**Problem:** Can't send real emails during dev/testing, need to verify functionality.

**Solution:** Ethereal (fake SMTP)
- ✅ No rate limits
- ✅ No real email delivery (safe for testing)
- ✅ Preview links to see rendered email
- ✅ Auto-generates test account

**In Production:**
Replace with SendGrid, Mailgun, AWS SES by updating `Sender` table credentials.

---

## Error Handling Strategy

### Job Failures

**Problem:** What if email send fails?

**Solution:** BullMQ built-in retry logic
```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
}
```

**Flow:**
1. Send attempt fails → logged in DB (status: failed)
2. Retries 2 more times with exponential backoff
3. Final failure → status marked `failed`, error stored

**Alternative:** Could implement dead-letter queue for critical failures.

---

## Idempotency Design

### Problem: Prevent duplicate sends if job processes twice

### Solution: Database status tracking
```sql
UPDATE EmailJob SET status = 'sent' WHERE id = ?
```

1. Job added with status `queued`
2. Before send, change to `sending`
3. After successful send, change to `sent`
4. Check before processing: if already `sent`, skip

**Why this works:**
- ✅ Atomic database updates
- ✅ Single source of truth (Postgres)
- ✅ Safe across restarts

---

## Scaling Considerations

### Horizontal Scaling

**To add more workers:**
```bash
# Worker 1
npm run worker

# Worker 2 (different machine)
npm run worker

# Both connect to same Redis + Postgres
```

**What works:**
- ✅ Rate limiting (Redis global counters)
- ✅ Job locking (BullMQ handles this)
- ✅ Database consistency (Postgres locks)

### Vertical Scaling
- Increase `WORKER_CONCURRENCY` for more parallel processing
- Increase `SMTP_MAX_EMAILS_PER_HOUR` for higher throughput
- Add database replicas for read scaling

---

## Trade-offs Made

### 1. **Global vs Per-Sender Rate Limits**
**Decision:** Global limit (simpler, meets requirements)
**Trade-off:** All senders share the 200/hour limit
**If needed:** Can add per-sender limit by keying on `{senderId}:{hour}`

### 2. **Ethereal Email vs Real SMTP**
**Decision:** Ethereal for safety
**Trade-off:** Emails don't actually deliver
**Production:** Switch `Sender` credentials to SendGrid/Mailgun

### 3. **Single Database for Everything**
**Decision:** One Postgres instance
**Trade-off:** Single point of failure
**If needed:** Add replication/failover cluster

### 4. **Delay Between All Emails (vs Only Some)**
**Decision:** All emails get minimum delay
**Trade-off:** Slightly slower throughput
**Benefit:** Fair, predictable behavior

### 5. **No Message Queue for Email Delivery**
**Decision:** Nodemailer async directly in worker
**Trade-off:** If SMTP slow, worker blocks
**Benefit:** Simpler, good enough (SMTP usually fast)

---

## Security Notes

- ✅ JWT tokens signed with secret
- ✅ Tokens in HttpOnly cookies (CSRF safe)
- ✅ CORS restricted to frontend origin
- ✅ Google OAuth verified server-side
- ✅ Database passwords never in frontend
- ✅ Environment variables for secrets (no hardcoding)

---

## Future Improvements (Out of Scope)

1. **WebSockets** for real-time email status updates
2. **Email templates** with dynamic variables
3. **Attachment support** in email composition
4. **Scheduled campaigns** (recurring emails)
5. **Analytics dashboard** (delivery rates, opens, clicks)
6. **Multi-tenant isolation** (per-organization rate limits)
7. **Failure webhook** (notify client of failures)
8. **Email verification** (bounce handling)

---

**All decisions prioritize simplicity, reliability, and meeting the assignment requirements.**
