# Frontend README

## Overview

Next.js 14 + React 18 + TypeScript frontend with Google OAuth login, Zustand state management, and Tailwind CSS styling.

## Environment Variables

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

**Important:** The Google Client ID must be the same as the backend and authorized for `http://localhost:3000`.

## Installation

```bash
npm install
```

## Running

### Development

```bash
npm run dev
```

Listens on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Pages & Components

### Pages

- `app/page.tsx` - Login page with Google OAuth
- `app/dashboard/page.tsx` - Main dashboard with tabs and compose button

### Components

- `components/Header.tsx` - Top header with user info & logout
- `components/ComposeModal.tsx` - Modal to schedule new emails
- `components/EmailTable.tsx` - Reusable table for email lists

## State Management

### Auth Store (Zustand)

```typescript
const { user, token, login, logout } = useAuthStore();
```

Stores user info and JWT token.

## API Integration

```typescript
import { scheduleEmails, getScheduledEmails, getSentEmails } from '@/lib/api';
```

All requests include JWT token from cookies (via axios interceptor).

## Key Features

- **Google OAuth**: Real OAuth login, not mock
- **Protected Routes**: Auth middleware redirects to login if not authenticated
- **File Upload**: CSV/TXT email parsing for bulk scheduling
- **Real-time Tables**: Load and display scheduled/sent emails
- **Empty States**: User-friendly messages when no data
- **Loading States**: Spinner feedback during API calls
- **Responsive Design**: Tailwind CSS responsive grid layout

## Testing

1. Open `http://localhost:3000`
2. Click "Sign in with Google"
3. After login, you're redirected to dashboard
4. Click "Compose New Email" button
5. Fill in subject, body, upload emails
6. Click "Schedule Emails"
7. Check "Scheduled Emails" tab to see jobs

---

Refer to main README for full setup instructions.
