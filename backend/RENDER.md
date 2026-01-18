# Render Configuration for Backend

# Build Command (Render will run this automatically)
npm install && npx prisma generate && npx prisma migrate deploy

# Start Command for API Server
npm start

# Start Command for Worker (separate Background Worker service)
npm run worker

# Environment Variables Required:
# - NODE_ENV=production
# - PORT=4000
# - DATABASE_URL=<Internal Database URL from Render>
# - REDIS_URL=<Internal Redis URL from Render>
# - JWT_SECRET=<generate with: openssl rand -base64 32>
# - GOOGLE_CLIENT_ID=<your Google OAuth Client ID>
# - FRONTEND_URL=<Vercel URL after frontend is deployed>
# - RATE_LIMIT_PER_HOUR=100
# - WORKER_CONCURRENCY=3
# - MIN_DELAY_MS=1000
