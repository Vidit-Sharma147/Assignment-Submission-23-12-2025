# How to Check the Project Works

Follow these steps to verify the OTP login flow locally.

## Prerequisites
- Node.js 18+ and npm installed
- Two terminals (one for backend, one for frontend)

## 1) Start the Backend
```bash
cd server
npm install
npm run start
```
- Server listens on http://localhost:4000
Remember ---  OTP codes are mock-logged to this terminal

## 2) Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open URL (usually http://localhost:5173)

## 3) Happy-Path Check
1. Go to **Login** page
2. Enter a valid email/phone (e.g., `demo@example.com` or `+11234567890`)
3. Click **Send OTP**
4. Look at the backend terminal; copy the 6-digit OTP
5. You are redirected to **Verify**; paste the OTP and submit
6. On success you land on **Welcome** and see mock user info
7. Refresh; you should stay logged in (token persisted)
8. Click **Logout**; you return to Login and local storage clears

## 4) Failure/Limit Cases
- Enter a wrong OTP: error shows remaining tries
- After 3 wrong attempts: identifier blocked for 10 minutes (message shown)
- Requesting OTP repeatedly within 30s: frontend shows cooldown from server

## 5) Token Check
- On Welcome, open devtools Network and refresh the page; `GET /auth/me` should return 200 with user info
- Delete `auth:token` from localStorage and refresh; you should be sent back to Login

## 6) Optional Env Overrides
Create `server/.env` to tweak limits:
```
PORT=4000
JWT_SECRET=change_me
OTP_EXP_MINUTES=5
BLOCK_MINUTES=10
MAX_TRIES=3
RESEND_COOLDOWN_SEC=30
```
Create `frontend/.env` to point at a different API:
```
VITE_API_BASE=http://localhost:4000
```

## 7) Cleanup
- Stop both terminals when done
- No data persists; OTP store is in-memory
