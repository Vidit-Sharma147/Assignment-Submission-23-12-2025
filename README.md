# OTP Auth Challenge — Fullstack Solution

A minimal OTP-based authentication app with a Node/Express backend and a React (Vite) frontend.

## Architecture Overview

- Backend: Express REST API with in-memory store for OTPs and attempt tracking. JWT for session token.
- Frontend: React + Vite SPA with three routes: Login, Verify, Welcome. Uses `localStorage` for token persistence and identifier.
- Communication: Frontend calls API at `http://localhost:4000`. CORS is enabled on the server.

## API Endpoints

1. `POST /auth/request-otp`
   - Body: `{ identifier: string }` (email or phone)
   - Generates a 6-digit OTP, stores with expiry and resets tries. Mock sends by logging OTP to server console.
2. `POST /auth/verify-otp`
   - Body: `{ identifier: string, otp: string }`
   - Validates OTP. On success, clears record and returns `{ token }` (JWT).
   - On invalid attempts: increments tries, blocks identifier for 10 minutes after 3 failed attempts.
3. `GET /auth/me`
   - Header: `Authorization: Bearer <token>`
   - Returns mock user info if token is valid.

## OTP Strategy

- Generation: Random 6-digit numeric string.
- Expiry: Default 2 minutes (configurable via env).
- Attempts: Max 3 wrong tries; then identifier is blocked for 10 minutes.
- Storage: In-memory object (suitable for demo). For production, use Redis.

## Assumptions

- OTP expiry: 2 minutes (`OTP_EXP_MINUTES`).
- Token format: JWT (HS256) with 24h expiry; payload has `sub = identifier`.
- Rate limiting: Per-identifier resend cooldown (30s) on `/auth/request-otp`; no global/IP rate limiter.
- User existence: Auto-created on first login; no user DB.
- Delivery: OTP is mock-logged in server console (no SMS/email service).

## Tech Stack Choices

- Node + Express: Lightweight, fast to prototype REST endpoints.
- JWT: Simple stateless session demo; easy to verify via `/auth/me`.
- React + Vite: Fast dev server, simple setup, minimal dependencies.

## Local Setup

Requirements: Node 18+ and npm.

### Backend

```bash
cd server
npm install
npm run start
# Server at http://localhost:4000
```

Config via `.env` in `server/`:

```
PORT=4000
JWT_SECRET=super_secret_dev_key_change_me
OTP_EXP_MINUTES=5
BLOCK_MINUTES=10
MAX_TRIES=3
RESEND_COOLDOWN_SEC=30
```

Check the terminal for lines like: `[Mock OTP] Sending OTP to <identifier>: <code>`

### Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

Optional: set an API base URL with `VITE_API_BASE` in a `.env` file under `frontend/`.

## Frontend Pages

- Login: enter email/phone; calls `/auth/request-otp`, stores identifier.
- Verify: enter OTP; calls `/auth/verify-otp`, stores token; redirects to Welcome. Shows remaining tries, block window, or resend cooldown when the API returns them.
- Welcome: calls `/auth/me` with token; shows user info; Logout clears storage.

### Basic Flow (happy path)

1) Run backend on port 4000 and frontend on 5173.
2) Open the Login page, enter an email/phone, click “Send OTP”.
3) Check the backend console for the OTP, go to Verify, enter the 6-digit code.
4) On success you land on Welcome and see mock user info; refresh persists the token.
5) Logout clears token + identifier.

## Notes & Next Steps

- Persistence: In-memory OTP store resets on server restart.
- Security: For production, add HTTPS, CSRF strategies, IP/device rate limits, Redis-backed OTP store, and audit logging.
- Resend: Added a simple 30s cooldown per identifier.
