const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// In-memory store for OTP and attempt tracking
// Structure: {
//   [identifier]: { otp: string, expiresAt: number, tries: number, blockedUntil?: number, lastSentAt?: number }
// }
const store = Object.create(null);

// Helpers
const now = () => Date.now();
const minutes = (n) => n * 60 * 1000;
const OTP_EXP_MINUTES = parseInt(process.env.OTP_EXP_MINUTES || '2', 10);
const BLOCK_MINUTES = parseInt(process.env.BLOCK_MINUTES || '10', 10);
const MAX_TRIES = parseInt(process.env.MAX_TRIES || '3', 10);
const RESEND_COOLDOWN_SEC = parseInt(process.env.RESEND_COOLDOWN_SEC || '30', 10);

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function isBlocked(rec) {
  return rec && rec.blockedUntil && rec.blockedUntil > now();
}

function validateIdentifier(id) {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (!trimmed) return false;
  // Accept either simple email or phone (digits + optional +, -, spaces)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[- 0-9]{6,15}$/;
  return emailRegex.test(trimmed) || phoneRegex.test(trimmed);
}

// Routes
app.post('/auth/request-otp', (req, res) => {
  const { identifier } = req.body || {};
  if (!validateIdentifier(identifier)) {
    return res.status(400).json({ error: 'Invalid email or phone number' });
  }
  const key = identifier.trim().toLowerCase();
  const rec = store[key] || {};

  if (isBlocked(rec)) {
    const waitMs = rec.blockedUntil - now();
    return res.status(429).json({ error: 'Too many invalid attempts. Try later.', retryAfterMs: waitMs });
  }

  // Optional resend cooldown
  if (rec.lastSentAt && now() - rec.lastSentAt < RESEND_COOLDOWN_SEC * 1000) {
    const wait = RESEND_COOLDOWN_SEC * 1000 - (now() - rec.lastSentAt);
    return res.status(429).json({ error: 'OTP recently sent. Please wait before retrying.', retryAfterMs: wait });
  }

  const otp = generateOtp();
  const expiresAt = now() + minutes(OTP_EXP_MINUTES);
  store[key] = { otp, expiresAt, tries: 0, lastSentAt: now() };

  // Mock sending - log to server console
  console.log(`[Mock OTP] Sending OTP to ${identifier}: ${otp} (expires in ${OTP_EXP_MINUTES}m)`);

  return res.json({ message: 'OTP sent successfully (mock).', expiresInMinutes: OTP_EXP_MINUTES });
});

app.post('/auth/verify-otp', (req, res) => {
  const { identifier, otp } = req.body || {};
  if (!validateIdentifier(identifier) || typeof otp !== 'string') {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const key = identifier.trim().toLowerCase();
  const rec = store[key];

  if (!rec) {
    return res.status(400).json({ error: 'No OTP requested for this identifier' });
  }

  if (isBlocked(rec)) {
    const waitMs = rec.blockedUntil - now();
    return res.status(429).json({ error: 'Identifier blocked due to invalid attempts. Try later.', retryAfterMs: waitMs });
  }

  if (now() > rec.expiresAt) {
    delete store[key];
    return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
  }

  if (otp.trim() !== rec.otp) {
    rec.tries = (rec.tries || 0) + 1;
    if (rec.tries >= MAX_TRIES) {
      rec.blockedUntil = now() + minutes(BLOCK_MINUTES);
      // Clear OTP after block
      rec.otp = undefined;
      rec.expiresAt = 0;
      return res.status(429).json({ error: 'Maximum attempts exceeded. Identifier blocked temporarily.', blockMinutes: BLOCK_MINUTES });
    }
    return res.status(401).json({ error: 'Invalid OTP', remainingTries: MAX_TRIES - rec.tries });
  }

  // Success
  const token = jwt.sign({ sub: key, iat: Math.floor(now() / 1000) }, JWT_SECRET, { expiresIn: `${24}h` });
  delete store[key];
  return res.json({ token });
});

app.get('/auth/me', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      user: {
        id: decoded.sub,
        displayName: `User ${decoded.sub}`,
      },
      tokenValid: true,
    });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'otp-auth' });
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
