# How to check the working of the project
Follow these steps to verify the OTP login flow locally.

## Start from a zip
1. Download and extract the project zip.
2. Open the extracted folder in VS Code.
3. Use two terminals (integrated terminals recommended).

## Prerequisites
- Node.js 18+ and npm installed
- VS Code Installed (other IDE's could also be used)
- Two terminals (one for backend, one for frontend)

## Run in VS Code (recommended)
1. Open this folder in VS Code.
2. Open an integrated terminal (Ctrl+`):
	 - Backend: `cd server && npm install && npm run start`
		 - Runs at http://localhost:4000; OTPs print here.
	 - Open a second integrated terminal:
		 - Frontend: `cd frontend && npm install && npm run dev`
		 - Open the printed URL (typically http://localhost:5173).

## 1) Start the Backend (any terminal)
```bash
cd server
npm install
npm run start
```
- Server listens on http://localhost:4000
- OTP codes are mock-logged to this terminal

## 2) Start the Frontend (any terminal)
```bash
cd frontend
npm install
npm run dev
```
- Open URL (usually http://localhost:5173)

## 3) Path Check
1. Go to **Login** page (dev server): http://localhost:5173/login
2. Enter a valid email/phone (e.g., `demo@example.com` or `+11234567890`)
3. Click **Send OTP**
4. Look at the backend terminal; copy the 6-digit OTP
5. You are redirected to **Verify**: http://localhost:5173/verify — paste the OTP and submit
6. On success you land on **Welcome**: http://localhost:5173/welcome and see mock user info
7. Refresh; you should stay logged in (token persisted)
8. Click **Logout**; you return to Login and local storage clears

## 4) Failure/Limit Cases
- Enter a wrong OTP: error shows remaining tries
- After 3 wrong attempts: identifier blocked for 10 minutes (message shown)
- Requesting OTP repeatedly within 30s: frontend shows cooldown from server

## 5) Token Check
- On Welcome, open devtools Network and refresh the page; `GET /auth/me` should return 200 with user info
- Delete `auth:token` from localStorage and refresh; you should be sent back to Login


## 6) Cleanup
- Stop both terminals when done
- No data persists; OTP store is in-memory
