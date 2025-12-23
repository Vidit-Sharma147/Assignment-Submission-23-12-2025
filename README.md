(After the creating of the project and readme, AI has beed used to convert README and TESTING into a presentable and easy to read format)


# OTP Auth Challenge — Fullstack Solution

A minimal OTP-based authentication app with a Node/Express backend and a React (Vite) frontend.

## High-Level Design

- Architecture: Express REST API (`/auth/request-otp`, `/auth/verify-otp`, `/auth/me`) with in-memory OTP store, attempt tracking, and JWT sessions. React + Vite SPA with three routes (Login, Verify, Welcome) using `localStorage` for identifier/token and calling the API via fetch helpers.
- OTP generation & validation: Backend creates a random 6-digit OTP, stores it with `expiresAt`, resets tries, and mock-logs it to the console. Verification checks identifier validity, block status, expiry window, and max tries (3 wrong → 10-minute block). On success, it returns a 24h JWT and clears the OTP record.
- Tech stack & assumptions: Chosen for speed and simplicity (Express, JWT, React/Vite). Assumptions: 2-minute OTP expiry; HS256 JWT with `sub = identifier`; 30s resend cooldown (no global rate limiter); users auto-created (no user DB); OTP delivery mocked to console; CORS enabled; env overrides for timings/ports/secrets.

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

## Project Structure (key files)

- README.md — Overview, setup, and flow.
- TESTING.md — Step-by-step run/verify guide (VS Code friendly).
- .gitignore — Ignores node_modules, env files, build outputs.
- server/
   - index.js — Express API for request-otp, verify-otp, me; OTP storage/expiry/blocking.
   - package.json / package-lock.json — Backend dependencies and scripts.
   - .env (optional) — Override port/secret/OTP timings.
- frontend/
   - src/
      - pages/LoginPage.jsx — Identifier input, validation, send OTP call.
      - pages/VerifyPage.jsx — OTP input, validation, verification call, error states.
      - pages/WelcomePage.jsx — Token check and user info fetch.
      - services.js — API base, validation helper, fetch wrappers.
      - styles.css — Minimal styling for the SPA.
      - App.jsx / main.jsx — Route wiring and app bootstrap.
   - index.html — Vite entry HTML.
   - package.json / package-lock.json — Frontend dependencies and scripts.
   - .env (optional) — Set VITE_API_BASE if backend port changes.

## Local Setup

Requirements: Node 18+ and npm.

1) Clone or unzip this project.
2) In VS Code, open the folder and use two terminals (or two shells):
    - Backend (run in first terminal):
       ```bash
       cd server
       npm install
       npm run start
       # Server at http://localhost:4000 (OTPs log here)
       ```
    - Frontend (open a new terminal, then run):
       ```bash
       cd frontend
       npm install
       npm run dev
       # Open the printed URL (typically http://localhost:5173)
       ```

Backend config via `server/.env` (optional):
```
PORT=4000
JWT_SECRET=super_secret_dev_key_change_me
OTP_EXP_MINUTES=5
BLOCK_MINUTES=10
MAX_TRIES=3
RESEND_COOLDOWN_SEC=30
```

Frontend config via `frontend/.env` (optional):
```
VITE_API_BASE=http://localhost:4000
```

OTP codes are mock-logged in the backend terminal; copy them to verify.

## Frontend Pages

- Login: enter email/phone; calls `/auth/request-otp`, stores identifier.
- Verify: enter OTP; calls `/auth/verify-otp`, stores token; redirects to Welcome. Shows remaining tries, block window, or resend cooldown when the API returns them.
- Welcome: calls `/auth/me` with token; shows user info; Logout clears storage.

### Basic Flow 

1) Run backend on port 4000 and frontend on 5173.
2) Open the Login page, enter an email/phone, click “Send OTP”.
3) Check the backend console for the OTP, go to Verify, enter the 6-digit code.
4) On success you land on Welcome and see mock user info; refresh persists the token.
5) Logout clears token + identifier.

## Notes & Next Steps

- Persistence: In-memory OTP store resets on server restart.
- Security: For production, add HTTPS, CSRF strategies, IP/device rate limits, Redis-backed OTP store, and audit logging.
- Resend: Added a simple 30s cooldown per identifier.
